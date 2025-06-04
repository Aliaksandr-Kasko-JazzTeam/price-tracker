import {Module} from "@nestjs/common";
import {ConfigModule} from "@nestjs/config";
import {CacheService} from "../cache/cache.service";
import {ProductModule} from "../product/product.module";
import {ProductService} from "../product/product.service";
import {QueueController} from "./queue.controller";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ProductModule
  ],
  controllers: [QueueController],
  providers: [
    CacheService,
    ProductService,
  ]
})
export class QueueModule {}
