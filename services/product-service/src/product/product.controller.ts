import {Body, Controller, Post, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from '@price-tracker/shared';
import {ProductService} from './product.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('fetch')
  async fetchProduct(@Body() data: { url: string }) {
    return this.productService.fetchAndCreateProduct(data.url);
  }
}
