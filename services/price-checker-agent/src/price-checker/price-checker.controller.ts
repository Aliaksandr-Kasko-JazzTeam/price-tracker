import {Controller} from "@nestjs/common";
import {Ctx, EventPattern, Payload, RmqContext} from "@nestjs/microservices";
import {IPriceCheckMessage} from "@price-tracker/shared";
import {PriceCheckerService} from "./price-checker.service";

@Controller()
export class PriceCheckerController {
  constructor(private readonly priceCheckerService: PriceCheckerService) {}

  @EventPattern('price-check')
  async handlePriceCheck(@Payload() data: IPriceCheckMessage, @Ctx() context: RmqContext) {
    return this.priceCheckerService.handlePriceCheck(data, context);
  }
}
