import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { JwtPayload } from '../../common/types/jwt-payload';
import { UserRole } from '../../common/constants/user-role';
import { AdminCreateShopDto } from './dto/admin-create-shop.dto';
import { AdminUpdateShopDto } from './dto/admin-update-shop.dto';
import { AdminShopsService } from './admin-shops.service';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.BRANCH_DIRECTOR)
@Controller('admin/shops')
export class AdminShopsController {
  constructor(private readonly adminShops: AdminShopsService) {}

  @Get()
  list(@CurrentUser() user: JwtPayload) {
    return this.adminShops.list(user);
  }

  @Get(':id')
  get(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.adminShops.get(user, id);
  }

  @Roles(UserRole.OWNER)
  @Post()
  create(@Body() dto: AdminCreateShopDto) {
    return this.adminShops.create(dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: AdminUpdateShopDto,
  ) {
    return this.adminShops.update(user, id, dto);
  }

  @Roles(UserRole.OWNER)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.adminShops.delete(id);
  }
}
