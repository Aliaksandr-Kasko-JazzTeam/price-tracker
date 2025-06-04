import {Injectable, Logger} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {ClientProxy, ClientProxyFactory, Transport} from '@nestjs/microservices';
import {lastValueFrom} from "rxjs";

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);
  private readonly client: ClientProxy;

  constructor(private readonly configService: ConfigService) {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [this.configService.get<string>('RABBITMQ_URL', 'amqp://localhost:5672')],
        queue: 'product-service-queue',
        queueOptions: {
          durable: true,
          messageTtl: 30 * 60 * 1000,
        },
      },
    });
  }

  async updateProductPrice(url: string, price: number): Promise<void> {
    try {
      await lastValueFrom(this.client.emit('update-product-price', {url, price}));
      this.logger.debug(`Successfully sent price update for ${url} to ${price}`);
    } catch (error) {
      this.logger.error(`Failed to send price update for ${url}:`, error);
      throw error;
    }
  }
}
