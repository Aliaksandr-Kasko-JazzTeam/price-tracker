import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {PrismaModule} from '@price-tracker/shared';
import {PriceCheckerModule} from './price-checker/price-checker.module';
import {ProductModule} from './product/product.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    ProductModule,
    PriceCheckerModule,
  ],
})
export class AppModule {}
