import {Module} from '@nestjs/common';
import {PriceCheckerService} from './price-checker.service';
import {PriceCheckerController} from "./price-checker.controller";
import {ProductModule} from "../product/product.module";

@Module({
  imports: [ProductModule],
  controllers: [PriceCheckerController],
  providers: [
    PriceCheckerService,
  ],
})
export class PriceCheckerModule {}
