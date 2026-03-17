import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../common/constants/user-role';
import { AdminCatalogService } from './admin-catalog.service';
import { AdminCreateCategoryDto } from './dto/admin-create-category.dto';
import { AdminUpdateCategoryDto } from './dto/admin-update-category.dto';
import { AdminCreateProductDto } from './dto/admin-create-product.dto';
import { AdminUpdateProductDto } from './dto/admin-update-product.dto';
import { AdminCreateProductImageDto } from './dto/admin-create-product-image.dto';
import { AdminUpdateProductImageDto } from './dto/admin-update-product-image.dto';
import { AdminListProductsQuery } from './dto/admin-list-products.query';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminCatalogController {
  constructor(private readonly adminCatalog: AdminCatalogService) {}

  // ── Categories (OWNER only) ───────────────────────────────────────

  @Roles(UserRole.OWNER)
  @Get('categories')
  listCategories() {
    return this.adminCatalog.listCategories();
  }

  @Roles(UserRole.OWNER)
  @Get('categories/:id')
  getCategory(@Param('id') id: string) {
    return this.adminCatalog.getCategory(id);
  }

  @Roles(UserRole.OWNER)
  @Post('categories')
  createCategory(@Body() dto: AdminCreateCategoryDto) {
    return this.adminCatalog.createCategory(dto);
  }

  @Roles(UserRole.OWNER)
  @Patch('categories/:id')
  updateCategory(@Param('id') id: string, @Body() dto: AdminUpdateCategoryDto) {
    return this.adminCatalog.updateCategory(id, dto);
  }

  @Roles(UserRole.OWNER)
  @Delete('categories/:id')
  deleteCategory(@Param('id') id: string) {
    return this.adminCatalog.deleteCategory(id);
  }

  // ── Products (BRANCH_DIRECTOR and above) ──────────────────────────

  @Roles(UserRole.BRANCH_DIRECTOR)
  @Get('products')
  listProducts(@Query() query: AdminListProductsQuery) {
    return this.adminCatalog.listProducts(query);
  }

  @Roles(UserRole.BRANCH_DIRECTOR)
  @Get('products/:id')
  getProduct(@Param('id') id: string) {
    return this.adminCatalog.getProduct(id);
  }

  @Roles(UserRole.OWNER)
  @Post('products')
  createProduct(@Body() dto: AdminCreateProductDto) {
    return this.adminCatalog.createProduct(dto);
  }

  @Roles(UserRole.BRANCH_DIRECTOR)
  @Patch('products/:id')
  updateProduct(@Param('id') id: string, @Body() dto: AdminUpdateProductDto) {
    return this.adminCatalog.updateProduct(id, dto);
  }

  @Roles(UserRole.OWNER)
  @Delete('products/:id')
  deleteProduct(@Param('id') id: string) {
    return this.adminCatalog.softDeleteProduct(id);
  }

  // ── Product Images (BRANCH_DIRECTOR and above) ────────────────────

  @Roles(UserRole.BRANCH_DIRECTOR)
  @Post('products/:id/images')
  addProductImage(
    @Param('id') id: string,
    @Body() dto: AdminCreateProductImageDto,
  ) {
    return this.adminCatalog.addProductImage(id, dto);
  }

  @Roles(UserRole.BRANCH_DIRECTOR)
  @Patch('product-images/:id')
  updateProductImage(
    @Param('id') id: string,
    @Body() dto: AdminUpdateProductImageDto,
  ) {
    return this.adminCatalog.updateProductImage(id, dto);
  }

  @Roles(UserRole.OWNER)
  @Delete('product-images/:id')
  deleteProductImage(@Param('id') id: string) {
    return this.adminCatalog.deleteProductImage(id);
  }
}

