import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../../common/auth/roles.decorator';
import { RolesGuard } from '../../common/auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('admin/categories')
@ApiBearerAuth()
@Controller('admin/categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
export class CategoriesAdminController {
  constructor(private readonly categories: CategoriesService) {}

  @Get()
  async list() {
    return this.categories.adminList();
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.categories.adminGet(id);
  }

  @Post()
  async create(@Body() dto: CreateCategoryDto) {
    return this.categories.adminCreate(dto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categories.adminUpdate(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.categories.adminDelete(id);
  }
}
