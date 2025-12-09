import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { OrdersService } from './orders.service'
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard'
import { CreateOrderDto } from './dto/create-order.dto'
import { UpdateOrderDto } from './dto/update-order.dto'

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller()
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @Get('users/:uid/orders')
  listByUser(@Param('uid') uid: string, @Query('page') page?: string, @Query('limit') limit?: string, @Query('order') order?: string) {
    const p = page ? parseInt(page) : 1
    const l = limit ? parseInt(limit) : 50
    const o = order === 'desc' ? 'desc' : 'asc'
    return this.service.listByUser(uid, { page: p, limit: l, order: o })
  }

  @Get('orders/:id')
  get(@Param('id') id: string) {
    return this.service.get(id)
  }

  @Post('orders')
  create(@Body() dto: CreateOrderDto) {
    return this.service.create(dto)
  }

  @Patch('orders/:id')
  update(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.service.update(id, dto)
  }
}
