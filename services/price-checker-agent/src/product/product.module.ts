import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {ProductService} from './product.service';

@Module({
  imports: [ConfigModule],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
