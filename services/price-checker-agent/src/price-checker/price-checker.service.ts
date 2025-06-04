import {Injectable, Logger} from '@nestjs/common';
import {RmqContext} from '@nestjs/microservices';
import {extractPriceFromHtml} from '@price-tracker/shared';
import axios, {AxiosInstance} from 'axios';
import {ProductService} from '../product/product.service';

@Injectable()
export class PriceCheckerService {
  private readonly logger = new Logger(PriceCheckerService.name);
  private readonly REQUEST_DELAY = 1000;
  private lastRequestTime = 0;
  private readonly axiosInstance: AxiosInstance;

  constructor(
    private readonly productService: ProductService,
  ) {
    this.axiosInstance = axios.create({
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
      },
      withCredentials: true,
      maxRedirects: 0,
      validateStatus: (status) => status < 400,
    });
  }

  async handlePriceCheck(data: { url: string }, context: RmqContext) {
    this.logger.debug(`Received price check request for URL: ${data.url}`);
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    const url = data.url;

    try {
      await this.enforceRateLimit();
      const price = await this.fetchProductPrice(url);

      if (price === -1) {
        this.logger.debug(`Marked product as unavailable for ${url}`);
      } else {
        this.logger.debug(`Updated price for ${url}: ${price}`);
      }
      await this.productService.updateProductPrice(url, price);
    } catch (error) {
      this.logger.error(`Failed to process product ${url}:`, error);
    } finally {
      channel.ack(originalMessage);
    }
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.REQUEST_DELAY) {
      await new Promise(resolve =>
        setTimeout(resolve, this.REQUEST_DELAY - timeSinceLastRequest)
      );
    }

    this.lastRequestTime = Date.now();
  }

  private async fetchProductPrice(url: string): Promise<number> {
    try {
      const response = await this.axiosInstance.get(url);

      const setCookieHeader = response.headers['set-cookie'];
      if (setCookieHeader) {
        this.axiosInstance.defaults.headers.common['Cookie'] = setCookieHeader;
        this.logger.debug(`Updated cookies for ${url}`);
      }

      return extractPriceFromHtml(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        if (status === 404 || (status >= 300 && status < 400)) {
          this.logger.warn(`Product no longer available (${status}) for ${url}`);
          return -1;
        }
        this.logger.error(`Network error while fetching price for ${url}: ${error.message}`);
        throw error;
      }
      this.logger.error(`Unexpected error while fetching price for ${url}: ${error.message}`);
      throw error;
    }
  }
}
