import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { JwtPayload } from '../../common/types/jwt-payload';
import { CheckoutDto } from './dto/checkout.dto';
import { OrdersService } from './orders.service';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post('checkout')
  checkout(@CurrentUser() user: JwtPayload, @Body() dto: CheckoutDto) {
    return this.orders.checkout(user.sub, dto);
  }

  @Get('my')
  my(@CurrentUser() user: JwtPayload) {
    return this.orders.myOrders(user.sub);
  }

  @Get(':id')
  one(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.orders.getMyOrder(user.sub, id);
  }

  @Patch(':id/cancel')
  cancel(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.orders.cancelMyOrder(user.sub, id);
  }
}
