import {HttpModule} from '@nestjs/axios';
import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
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
  providers: [AppService, JwtStrategy],
})
export class AppModule {}
