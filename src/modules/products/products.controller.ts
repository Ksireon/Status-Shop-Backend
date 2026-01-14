import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProductDto } from './dto/product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { ProductsService } from './products.service';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  async list(@Query() filter: ProductFilterDto): Promise<ProductDto[]> {
    return this.products.list(filter);
  }

  @Get(':id')
  async get(@Param('id') id: string): Promise<ProductDto> {
    return this.products.getById(id);
  }
}

