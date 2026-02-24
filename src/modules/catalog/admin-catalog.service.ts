import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  buildPaginationMeta,
  normalizePagination,
} from '../../common/utils/pagination';
import { AdminCreateCategoryDto } from './dto/admin-create-category.dto';
import { AdminUpdateCategoryDto } from './dto/admin-update-category.dto';
import { AdminCreateProductDto } from './dto/admin-create-product.dto';
import { AdminUpdateProductDto } from './dto/admin-update-product.dto';
import { AdminCreateProductImageDto } from './dto/admin-create-product-image.dto';
import { AdminUpdateProductImageDto } from './dto/admin-update-product-image.dto';
import { AdminListProductsQuery } from './dto/admin-list-products.query';

@Injectable()
export class AdminCatalogService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  private async bumpCatalogVersion() {
    await this.cache.set('catalog:version', Date.now());
  }

  listCategories() {
    return this.prisma.category.findMany({
      orderBy: { slug: 'asc' },
    });
  }

  async getCategory(categoryId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async createCategory(dto: AdminCreateCategoryDto) {
    const existing = await this.prisma.category.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) throw new ConflictException('Category slug already exists');

    const category = await this.prisma.category.create({
      data: {
        slug: dto.slug,
        name: dto.name as Prisma.InputJsonValue,
      },
    });
    await this.bumpCatalogVersion();
    return category;
  }

  async updateCategory(categoryId: string, dto: AdminUpdateCategoryDto) {
    await this.getCategory(categoryId);
    const category = await this.prisma.category.update({
      where: { id: categoryId },
      data: {
        ...(dto.slug !== undefined ? { slug: dto.slug } : {}),
        ...(dto.name !== undefined
          ? { name: dto.name as Prisma.InputJsonValue }
          : {}),
      },
    });
    await this.bumpCatalogVersion();
    return category;
  }

  async deleteCategory(categoryId: string) {
    await this.getCategory(categoryId);
    const category = await this.prisma.category.delete({
      where: { id: categoryId },
    });
    await this.bumpCatalogVersion();
    return category;
  }

  async listProducts(query: AdminListProductsQuery) {
    const { skip, take, page, limit } = normalizePagination(query);
    const where = {
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.type ? { type: query.type } : {}),
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
    };

    const [total, items] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: { images: true, category: true },
      }),
    ]);

    return { data: items, meta: buildPaginationMeta(page, limit, total) };
  }

  async getProduct(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { images: { orderBy: { sort: 'asc' } }, category: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async createProduct(dto: AdminCreateProductDto) {
    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category) throw new NotFoundException('Category not found');
    }

    const product = await this.prisma.product.create({
      data: {
        categoryId: dto.categoryId,
        name: dto.name as Prisma.InputJsonValue,
        description: dto.description as Prisma.InputJsonValue | undefined,
        characteristics: dto.characteristics as
          | Prisma.InputJsonValue
          | undefined,
        type: dto.type,
        price: dto.price,
        stockQuantity: dto.stockQuantity ?? 0,
        isActive: dto.isActive ?? true,
      } as Prisma.ProductCreateInput,
      include: { images: true, category: true },
    });
    await this.bumpCatalogVersion();
    return product;
  }

  async updateProduct(productId: string, dto: AdminUpdateProductDto) {
    await this.getProduct(productId);

    if (dto.categoryId !== undefined && dto.categoryId !== null) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category) throw new NotFoundException('Category not found');
    }

    const product = await this.prisma.product.update({
      where: { id: productId },
      data: {
        ...(dto.categoryId !== undefined ? { categoryId: dto.categoryId } : {}),
        ...(dto.name !== undefined
          ? { name: dto.name as Prisma.InputJsonValue }
          : {}),
        ...(dto.description !== undefined
          ? {
              description:
                dto.description === null
                  ? Prisma.DbNull
                  : (dto.description as Prisma.InputJsonValue),
            }
          : {}),
        ...(dto.characteristics !== undefined
          ? {
              characteristics:
                dto.characteristics === null
                  ? Prisma.DbNull
                  : (dto.characteristics as Prisma.InputJsonValue),
            }
          : {}),
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.price !== undefined ? { price: dto.price } : {}),
        ...(dto.stockQuantity !== undefined
          ? { stockQuantity: dto.stockQuantity }
          : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      } as Prisma.ProductUpdateInput,
      include: { images: true, category: true },
    });
    await this.bumpCatalogVersion();
    return product;
  }

  async softDeleteProduct(productId: string) {
    await this.getProduct(productId);
    const product = await this.prisma.product.update({
      where: { id: productId },
      data: { isActive: false },
    });
    await this.bumpCatalogVersion();
    return product;
  }

  async addProductImage(productId: string, dto: AdminCreateProductImageDto) {
    await this.getProduct(productId);
    const image = await this.prisma.productImage.create({
      data: {
        productId,
        url: dto.url,
        sort: dto.sort ?? 0,
        label: dto.label,
      },
    });
    await this.bumpCatalogVersion();
    return image;
  }

  async updateProductImage(imageId: string, dto: AdminUpdateProductImageDto) {
    const existing = await this.prisma.productImage.findUnique({
      where: { id: imageId },
    });
    if (!existing) throw new NotFoundException('Product image not found');

    const image = await this.prisma.productImage.update({
      where: { id: imageId },
      data: {
        ...(dto.url !== undefined ? { url: dto.url } : {}),
        ...(dto.sort !== undefined ? { sort: dto.sort } : {}),
        ...(dto.label !== undefined
          ? { label: dto.label === null ? null : dto.label }
          : {}),
      },
    });
    await this.bumpCatalogVersion();
    return image;
  }

  async deleteProductImage(imageId: string) {
    const existing = await this.prisma.productImage.findUnique({
      where: { id: imageId },
    });
    if (!existing) throw new NotFoundException('Product image not found');
    const image = await this.prisma.productImage.delete({
      where: { id: imageId },
    });
    await this.bumpCatalogVersion();
    return image;
  }
}
