import {Injectable, NotFoundException} from '@nestjs/common';
import {PrismaService} from '@price-tracker/shared';
import {ProductClientService} from '../product/product-client.service';

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productClient: ProductClientService,
  ) {}

  async subscribe(userId: string, productUrl: string) {
    const user = await this.prisma.user.findUnique({where: {id: userId}});
    if (!user) throw new NotFoundException('User not found');

    const product = await this.productClient.fetchAndCreateProduct(productUrl);

    const subscription = await this.prisma.subscription.create({
      data: {
        userId,
        productId: product.id,
      },
      include: {
        product: true,
      },
    });
    return subscription.product;
  }

  async unsubscribe(userId: string, productId: string) {
    return this.prisma.subscription.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
  }

  async getUserSubscriptions(userId: string) {
    const subscriptions = await this.prisma.subscription.findMany({
      where: {userId},
      include: {
        product: true,
      },
    });
    return subscriptions.map(subscription => subscription.product);
  }
}
