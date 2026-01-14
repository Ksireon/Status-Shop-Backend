import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../../common/auth/roles.decorator';
import { RolesGuard } from '../../common/auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@ApiTags('admin/products')
@ApiBearerAuth()
@Controller('admin/products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
export class ProductsAdminController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  async list(@Query() filter: ProductFilterDto) {
    return this.products.adminList(filter);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.products.adminGet(id);
  }

  @Post()
  async create(@Body() dto: CreateProductDto) {
    return this.products.adminCreate(dto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.products.adminUpdate(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.products.adminDelete(id);
  }
}
