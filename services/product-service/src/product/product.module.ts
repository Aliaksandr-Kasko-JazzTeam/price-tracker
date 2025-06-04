import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {PrismaModule} from '@price-tracker/shared';
import {CacheModule} from '../cache/cache.module';
import {ProductController} from './product.controller';
import {ProductService} from './product.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    CacheModule,
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
