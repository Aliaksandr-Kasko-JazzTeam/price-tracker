import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {ScheduleModule} from '@nestjs/schedule';
import {PrismaModule} from '@price-tracker/shared';
import {PriceMonitorSchedulerModule} from './price-monitor-scheduler/price-monitor-scheduler.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    PriceMonitorSchedulerModule,
  ],
})
export class AppModule {}
