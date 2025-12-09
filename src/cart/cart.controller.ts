import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { CartService } from './cart.service'
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard'
import { CartItemDto } from './dto/cart-item.dto'

@ApiTags('cart')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('users/:uid/cart')
export class CartController {
  constructor(private readonly service: CartService) {}

  @Get()
  list(@Param('uid') uid: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    const p = page ? parseInt(page) : 1
    const l = limit ? parseInt(limit) : 50
    return this.service.list(uid, { page: p, limit: l })
  }

  @Post()
  add(@Param('uid') uid: string, @Body() dto: CartItemDto) {
    return this.service.add(uid, dto)
  }

  @Delete(':tag')
  remove(@Param('uid') uid: string, @Param('tag') tag: string) {
    return this.service.remove(uid, tag)
  }
}
