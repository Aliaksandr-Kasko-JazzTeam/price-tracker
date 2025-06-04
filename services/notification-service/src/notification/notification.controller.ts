import {Controller} from '@nestjs/common';
import {EventPattern, Payload} from '@nestjs/microservices';
import {IPriceChangeNotification} from "@price-tracker/shared";
import {NotificationService} from './notification.service';

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @EventPattern('price-change')
  async handlePriceChange(@Payload() data: IPriceChangeNotification) {
    await this.notificationService.handlePriceChange(data);
  }
}
