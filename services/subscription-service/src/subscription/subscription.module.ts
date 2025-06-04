import {Module} from '@nestjs/common';
import {AuthModule} from '@price-tracker/shared';
import {AuthService} from "../auth/auth.service";
import {ProductClientService} from '../product/product-client.service';
import {SubscriptionController} from './subscription.controller';
import {SubscriptionService} from './subscription.service';

@Module({
  imports: [AuthModule],
  controllers: [SubscriptionController],
  providers: [SubscriptionService, ProductClientService, AuthService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
