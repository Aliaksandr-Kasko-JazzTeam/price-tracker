import {Controller} from "@nestjs/common";
import {Ctx, MessagePattern, Payload, RmqContext} from "@nestjs/microservices";
import {IHandlePriceUpdateParams} from "@price-tracker/shared";
import {ProductService} from "../product/product.service";

@Controller()
export class QueueController {
  constructor(private readonly productService: ProductService) {}

  @MessagePattern('update-product-price')
  async handlePriceUpdate(@Payload() data: IHandlePriceUpdateParams, @Ctx() context: RmqContext) {
    return this.productService.handlePriceUpdate(data, context);
  }
}
