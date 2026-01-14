import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OrderStatus, UserRole } from '@prisma/client';
import { Roles } from '../../common/auth/roles.decorator';
import { RolesGuard } from '../../common/auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrderFilterDto } from './dto/order-filter.dto';
import { UpdateOrderPaymentDto } from './dto/update-order-payment.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersService } from './orders.service';

@ApiTags('admin/orders')
@ApiBearerAuth()
@Controller('admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPPORT)
export class OrdersAdminController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  async list(@Query() filter: OrderFilterDto) {
    return this.orders.adminList(filter);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.orders.adminGet(id);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.orders.adminUpdateStatus(id, dto.status, dto.adminNotes);
  }

  @Patch(':id/payment')
  @Roles(UserRole.ADMIN)
  async updatePayment(
    @Param('id') id: string,
    @Body() dto: UpdateOrderPaymentDto,
  ) {
    return this.orders.adminUpdatePaymentStatus(
      id,
      dto.paymentStatus,
      dto.adminNotes,
    );
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async cancel(@Param('id') id: string) {
    return this.orders.adminUpdateStatus(
      id,
      OrderStatus.CANCELLED,
      'Cancelled by admin',
    );
  }
}
