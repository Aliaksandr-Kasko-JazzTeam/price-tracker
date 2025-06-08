import {HttpModule} from '@nestjs/axios';
import {Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {JwtStrategy} from '@price-tracker/shared';
import {AuthController, ProductController, SubscriptionController} from './app.controller';
import {AppService} from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
  ],
  controllers: [AuthController, SubscriptionController, ProductController],
  providers: [
    AppService,
    {
      provide: JwtStrategy,
      useFactory: (configService: ConfigService) => new JwtStrategy(configService),
      inject: [ConfigService],
    },
  ],
})
export class AppModule {}
