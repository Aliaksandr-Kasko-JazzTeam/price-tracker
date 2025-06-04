import {Injectable, Logger, OnModuleDestroy, OnModuleInit} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {ClientProxy, ClientProxyFactory, RmqContext, Transport} from '@nestjs/microservices';
import {extractPriceFromHtml, IHandlePriceUpdateParams, IPriceChangeNotification, PrismaService, Product} from '@price-tracker/shared';
import axios from 'axios';
import * as cheerio from 'cheerio';
import {lastValueFrom} from 'rxjs';
import {CacheService} from '../cache/cache.service';

@Injectable()
export class ProductService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ProductService.name);
  private readonly notificationClient: ClientProxy;

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
    private readonly configService: ConfigService,
  ) {
    this.notificationClient = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [this.configService.get<string>('RABBITMQ_URL', 'amqp://localhost:5672')],
        queue: 'price-change-notifications',
        queueOptions: {
          durable: true,
        },
      },
    });
  }

  async onModuleInit() {
    try {
      await this.notificationClient.connect();
      this.logger.log('Connected to notification queue');
    } catch (error) {
      this.logger.error('Failed to connect to notification queue', error);
    }
  }

  async onModuleDestroy() {
    await this.notificationClient.close();
  }

  async handlePriceUpdate(data: IHandlePriceUpdateParams, context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    const {url, price} = data;
    try {
      const previousPrice = await this.getProductPrice(url);

      if (previousPrice !== price) {
        await this.updateProductPrice(url, price);
        await this.notifySubscribers(url, previousPrice, price);

        this.logger.log(`Updated price for product ${url} from ${previousPrice} to ${price}`);
        channel.ack(originalMessage);
        return price;
      }

      this.logger.debug(`Price unchanged for product ${url}: ${price}`);
      channel.ack(originalMessage);
      return price;
    } catch (error) {
      this.logger.error(`Error updating product price for ${url}:`, error);
      channel.nack(originalMessage, false, true);
      throw error;
    }
  }

  private async notifySubscribers(url: string, previousPrice: number, currentPrice: number) {
    try {
      const product = await this.prisma.product.findUniqueOrThrow({
        where: {url},
        include: {subscriptions: {include: {user: true}}},
      });

      if (product.subscriptions.length === 0) {
        this.logger.debug(`No subscribers to notify for ${url}`);
        return;
      }

      const subscriberEmails = product.subscriptions.map(sub => sub.user.email);
      const message: IPriceChangeNotification = {
        subscribers: subscriberEmails,
        productName: product.name,
        productUrl: url,
        currentPrice,
        previousPrice,
      };

      await lastValueFrom(this.notificationClient.emit('price-change', message));
      this.logger.log(`Sent price change notification to ${subscriberEmails.length} subscribers`);
    } catch (error) {
      this.logger.error(`Failed to send price change notifications for ${url}:`, error);
      throw error;
    }
  }

  async fetchAndCreateProduct(url: string): Promise<Product> {
    try {
      this.validateUrl(url);

      const cachedPrice = await this.cacheService.getPrice(url);
      const existingProduct = await this.getProductByUrl(url);

      if (cachedPrice !== null && existingProduct) {
        this.logger.debug(`Using cached price for ${url}`);
        return existingProduct;
      }

      const productInfo = await this.fetchProductInfo(url);

      if (existingProduct && existingProduct.currentPrice !== productInfo.price) {
        await this.notifySubscribers(url, existingProduct.currentPrice, productInfo.price);
        this.logger.log(`Price changed for ${url} from ${existingProduct.currentPrice} to ${productInfo.price}`);
      }

      const product: Product = await this.prisma.product.upsert({
        where: {url},
        update: {
          name: productInfo.name,
          currentPrice: productInfo.price,
        },
        create: {
          url,
          name: productInfo.name,
          currentPrice: productInfo.price,
        },
      });

      await this.prisma.priceHistory.create({
        data: {
          productId: product.id,
          price: productInfo.price,
        },
      });

      await this.cacheService.setPrice(url, productInfo.price);

      return product;
    } catch (error) {
      this.logger.error(`Error in fetchAndCreateProduct for ${url}:`, error);
      throw error;
    }
  }

  private async getProductByUrl(url: string): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: {url},
    });
  }

  private async getProductPrice(productUrl: string): Promise<number> {
    try {
      const cachedPrice = await this.cacheService.getPrice(productUrl);
      if (cachedPrice !== null) {
        return cachedPrice;
      }

      const product = await this.prisma.product.findUniqueOrThrow({
        where: {url: productUrl},
        select: {currentPrice: true},
      });
      await this.cacheService.setPrice(productUrl, product.currentPrice);
      return product.currentPrice;
    } catch (error) {
      throw new Error(`Error getting product price for ${productUrl}: ${error}`);
    }
  }

  private async updateProductPrice(productUrl: string, newPrice: number): Promise<void> {
    try {
      const product = await this.prisma.product.update({
        where: {url: productUrl},
        data: {currentPrice: newPrice},
      });

      await this.prisma.priceHistory.create({
        data: {
          productId: product.id,
          price: newPrice,
        },
      });

      await this.cacheService.setPrice(productUrl, newPrice);
    } catch (error) {
      this.logger.error(`Error updating product price for ${productUrl}:`, error);
      throw error;
    }
  }

  private async fetchProductInfo(url: string) {
    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);

      const name = $('h1').contents()
        .filter((_, node) => node.type === 'text' && $(node).prev().is('span'))
        .text().trim();
      const croppedName = name.length > 188 ? name.slice(0, 188) + '...' : name;
      const price = extractPriceFromHtml(response.data);

      this.validateProduct(croppedName, price);

      return {
        name: croppedName,
        price,
      };
    } catch (error) {
      throw new Error(`Failed to fetch product information: ${error.message}`);
    }
  }

  private validateUrl(url: string) {
    const regex = /^https?:\/\/(?:www\.)?intersport\.com\.au\/.*$/;
    if (!regex.test(url)) throw new Error('Invalid URL. The URL must be a valid InterSport item URL.');
  }

  private validateProduct(name?: string, price?: number) {
    if (!name || !price || isNaN(price)) throw new Error('Could not extract required product information');
  }
}
