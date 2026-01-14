import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import type { JwtUser } from '../../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderDto } from './dto/order.dto';
import { OrdersService } from './orders.service';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  async create(
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateOrderDto,
  ): Promise<OrderDto> {
    return this.orders.create(user.sub, dto);
  }

  @Get()
  async my(@CurrentUser() user: JwtUser): Promise<OrderDto[]> {
    return this.orders.listMy(user.sub);
  }

  @Get(':id')
  async get(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
  ): Promise<OrderDto> {
    return this.orders.getMy(user.sub, id);
  }
}
