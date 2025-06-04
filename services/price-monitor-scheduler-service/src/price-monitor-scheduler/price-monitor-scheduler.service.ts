import {Injectable, Logger} from '@nestjs/common';
import {Cron, CronExpression} from '@nestjs/schedule';
import {Prisma, PrismaService} from '@price-tracker/shared';
import {MessageBrokerService} from '../message-broker/message-broker.service';

@Injectable()
export class PriceMonitorSchedulerService {
  private readonly logger = new Logger(PriceMonitorSchedulerService.name);
  private readonly PAGE_SIZE = 100;
  private readonly RECORDS_LIMIT = 3600;

  constructor(
    private readonly prisma: PrismaService,
    private readonly messageBroker: MessageBrokerService,
  ) {
  }

  // @Cron(CronExpression.EVERY_MINUTE)
  // @Cron(CronExpression.EVERY_5_MINUTES)
  @Cron(CronExpression.EVERY_HOUR)
  async checkPrices() {
    try {
      this.logger.log('Starting price check for all products');

      let skip = 0;
      let hasMore = true;
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      while (hasMore && skip <= this.RECORDS_LIMIT) {
        const products = await this.prisma.product.findMany({
          where: {
            updatedAt: {lt: oneHourAgo},
            subscriptions: {some: {}},
          },
          skip,
          take: this.PAGE_SIZE,
          select: {url: true},
          orderBy: {updatedAt: Prisma.SortOrder.asc},
        });

        if (products.length === 0) {
          hasMore = false;
          continue;
        }

        await Promise.all(
          products.map(product => this.messageBroker.publishPriceCheckRequest({url: product.url}))
        );

        skip += this.PAGE_SIZE;
        this.logger.debug(`Processed ${skip} products`);
      }

      this.logger.log('Price check requests published successfully');
    } catch (error) {
      this.logger.error('Error during price check:', error);
    }
  }
}
