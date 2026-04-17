import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { JwtPayload } from '../../common/types/jwt-payload';
import { UserRole } from '../../common/constants/user-role';
import { AdminOrdersService } from './admin-orders.service';
import { AdminListOrdersQuery } from './dto/admin-list-orders.query';
import { AdminUpdateOrderStatusDto } from './dto/admin-update-order-status.dto';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MANAGER, UserRole.BRANCH_DIRECTOR)
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private readonly adminOrders: AdminOrdersService) {}

  @Get()
  list(@CurrentUser() user: JwtPayload, @Query() query: AdminListOrdersQuery) {
    return this.adminOrders.list(user, query);
  }

  @Get(':id')
  get(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.adminOrders.get(user, id);
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: AdminUpdateOrderStatusDto,
  ) {
    return this.adminOrders.updateStatus(user, id, dto);
  }
}
