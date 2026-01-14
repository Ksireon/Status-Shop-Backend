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
import { UserRole } from '@prisma/client';
import { Roles } from '../../common/auth/roles.decorator';
import { RolesGuard } from '../../common/auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { ShopsService } from './shops.service';

@ApiTags('admin/shops')
@ApiBearerAuth()
@Controller('admin/shops')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
export class ShopsAdminController {
  constructor(private readonly shops: ShopsService) {}

  @Get()
  async list() {
    return this.shops.adminList();
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.shops.adminGet(id);
  }

  @Post()
  async create(@Body() dto: CreateShopDto) {
    return this.shops.adminCreate(dto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateShopDto) {
    return this.shops.adminUpdate(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.shops.adminDelete(id);
  }
}
