import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ProductsService } from './products.service'

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}
  @Get('stock')
  stock(@Query('tag') tag?: string, @Query('id') id?: string) {
    return this.service.getStock({ tag, id })
  }
  @Get()
  list(@Query('page') page?: string, @Query('limit') limit?: string, @Query('sort') sort?: string, @Query('order') order?: string) {
    const p = page ? parseInt(page) : 1
    const l = limit ? parseInt(limit) : 20
    const s = sort || 'created_at'
    const o = order === 'desc' ? 'desc' : 'asc'
    return this.service.list({ page: p, limit: l, sort: s, order: o })
  }
  @Post()
  create(@Body() body: any) {
    return this.service.create(body)
  }
}
