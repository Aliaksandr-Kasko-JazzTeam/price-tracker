import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {JwtModule} from '@nestjs/jwt';
import {AuthModule, PrismaModule} from '@price-tracker/shared';
import {ProductModule} from './product/product.module';
import {QueueModule} from "./queue/queue.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {expiresIn: '1h'},
    }),
    PrismaModule,
    AuthModule,
    ProductModule,
    QueueModule,
  ],
})
export class AppModule {}
