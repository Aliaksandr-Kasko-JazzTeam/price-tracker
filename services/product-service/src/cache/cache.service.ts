import {Injectable, Logger, OnModuleDestroy} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {Redis} from 'ioredis';

interface PriceCache {
  price: number;
  timestamp: number;
}

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private readonly memoryCache: Map<string, PriceCache> = new Map();
  private readonly redisClient: Redis;
  private readonly CACHE_TTL = 3600;

  constructor(private readonly configService: ConfigService) {
    this.redisClient = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
    });

    this.redisClient.on('error', (error) => {
      this.logger.error('Redis connection error:', error);
    });
  }

  async getPrice(productUrl: string): Promise<number | null> {
    try {
      const memoryCache = this.memoryCache.get(productUrl);
      if (memoryCache && this.isValid(memoryCache.timestamp)) {
        this.logger.debug(`Cache hit: Memory cache for ${productUrl}`);
        return memoryCache.price;
      }

      const redisCache = await this.redisClient.get(productUrl);
      if (redisCache) {
        const priceData = JSON.parse(redisCache) as PriceCache;
        if (this.isValid(priceData.timestamp)) {
          this.memoryCache.set(productUrl, priceData);
          this.logger.debug(`Cache hit: Redis cache for ${productUrl}`);
          return priceData.price;
        }
      }

      this.logger.debug(`Cache miss for ${productUrl}`);
      return null;
    } catch (error) {
      this.logger.error(`Error getting price from cache for ${productUrl}:`, error);
      return null;
    }
  }

  async setPrice(productUrl: string, price: number): Promise<void> {
    try {
      const cacheData: PriceCache = {
        price,
        timestamp: Date.now(),
      };

      this.memoryCache.set(productUrl, cacheData);

      await this.redisClient.set(
        productUrl,
        JSON.stringify(cacheData),
        'EX',
        this.CACHE_TTL
      );

      this.logger.debug(`Price cached for ${productUrl}`);
    } catch (error) {
      this.logger.error(`Error setting price in cache for ${productUrl}:`, error);
    }
  }

  private isValid(timestamp: number): boolean {
    const now = Date.now();
    const age = now - timestamp;
    return age < this.CACHE_TTL * 1000;
  }

  async onModuleDestroy() {
    await this.redisClient.quit();
  }
}
