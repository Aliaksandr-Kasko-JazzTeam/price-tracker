import {Module} from '@nestjs/common';
import {PriceMonitorSchedulerService} from './price-monitor-scheduler.service';
import {MessageBrokerModule} from '../message-broker/message-broker.module';

@Module({
  imports: [MessageBrokerModule],
  providers: [PriceMonitorSchedulerService],
})
export class PriceMonitorSchedulerModule {}
