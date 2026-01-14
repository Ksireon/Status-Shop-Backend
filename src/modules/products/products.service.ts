import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ProductUnit } from '@prisma/client';
import { decimalToNumber } from '../../common/prisma/decimal';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(filter: ProductFilterDto) {
    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ...(filter.type ? { type: filter.type } : {}),
      ...(filter.featured === true ? { isFeatured: true } : {}),
      ...(filter.q
        ? {
            OR: [
              { nameRu: { contains: filter.q, mode: 'insensitive' } },
              { nameUz: { contains: filter.q, mode: 'insensitive' } },
              { nameEn: { contains: filter.q, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(filter.minPrice !== undefined || filter.maxPrice !== undefined
        ? {
            price: {
              ...(filter.minPrice !== undefined ? { gte: new Prisma.Decimal(filter.minPrice) } : {}),
              ...(filter.maxPrice !== undefined ? { lte: new Prisma.Decimal(filter.maxPrice) } : {}),
            },
          }
        : {}),
      ...(filter.categoryKey
        ? {
            category: {
              key: filter.categoryKey,
            },
          }
        : {}),
    };

    const products = await this.prisma.product.findMany({
      where,
      include: { category: { select: { key: true } } },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      skip: filter.skip ?? 0,
      take: filter.take ?? 50,
    });

    return products.map((p) => ({
      id: p.id,
      type: p.type,
      categoryKey: p.category.key,
      unit: p.unit,
      name: { ru: p.nameRu, uz: p.nameUz, en: p.nameEn },
      description: { ru: p.descRu, uz: p.descUz, en: p.descEn },
      price: decimalToNumber(p.price),
      images: p.images,
      sizes: p.sizes,
      colors: p.colors,
      characteristics: p.characteristics,
      isFeatured: p.isFeatured,
    }));
  }

  async getById(id: string) {
    const p = await this.prisma.product.findFirst({
      where: { id, isActive: true },
      include: { category: { select: { key: true } } },
    });
    if (!p) throw new NotFoundException('Product not found');

    return {
      id: p.id,
      type: p.type,
      categoryKey: p.category.key,
      unit: p.unit,
      name: { ru: p.nameRu, uz: p.nameUz, en: p.nameEn },
      description: { ru: p.descRu, uz: p.descUz, en: p.descEn },
      price: decimalToNumber(p.price),
      images: p.images,
      sizes: p.sizes,
      colors: p.colors,
      characteristics: p.characteristics,
      isFeatured: p.isFeatured,
    };
  }

  async adminList(filter: ProductFilterDto) {
    const where: Prisma.ProductWhereInput = {
      ...(filter.type ? { type: filter.type } : {}),
      ...(filter.featured === true ? { isFeatured: true } : {}),
      ...(filter.q
        ? {
            OR: [
              { nameRu: { contains: filter.q, mode: 'insensitive' } },
              { nameUz: { contains: filter.q, mode: 'insensitive' } },
              { nameEn: { contains: filter.q, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(filter.minPrice !== undefined || filter.maxPrice !== undefined
        ? {
            price: {
              ...(filter.minPrice !== undefined ? { gte: new Prisma.Decimal(filter.minPrice) } : {}),
              ...(filter.maxPrice !== undefined ? { lte: new Prisma.Decimal(filter.maxPrice) } : {}),
            },
          }
        : {}),
      ...(filter.categoryKey
        ? {
            category: {
              key: filter.categoryKey,
            },
          }
        : {}),
    };

    const products = await this.prisma.product.findMany({
      where,
      include: { category: { select: { key: true } } },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      skip: filter.skip ?? 0,
      take: filter.take ?? 50,
    });

    return products.map((p) => ({
      id: p.id,
      type: p.type,
      unit: p.unit,
      categoryKey: p.category.key,
      name: { ru: p.nameRu, uz: p.nameUz, en: p.nameEn },
      description: { ru: p.descRu, uz: p.descUz, en: p.descEn },
      price: decimalToNumber(p.price),
      images: p.images,
      sizes: p.sizes,
      colors: p.colors,
      characteristics: p.characteristics,
      stock: p.stock,
      isActive: p.isActive,
      isFeatured: p.isFeatured,
      sortOrder: p.sortOrder,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));
  }

  async adminGet(id: string) {
    const p = await this.prisma.product.findUnique({
      where: { id },
      include: { category: { select: { key: true } } },
    });
    if (!p) throw new NotFoundException('Product not found');
    return {
      id: p.id,
      type: p.type,
      unit: p.unit,
      categoryKey: p.category.key,
      name: { ru: p.nameRu, uz: p.nameUz, en: p.nameEn },
      description: { ru: p.descRu, uz: p.descUz, en: p.descEn },
      price: decimalToNumber(p.price),
      images: p.images,
      sizes: p.sizes,
      colors: p.colors,
      characteristics: p.characteristics,
      stock: p.stock,
      isActive: p.isActive,
      isFeatured: p.isFeatured,
      sortOrder: p.sortOrder,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    };
  }

  async adminCreate(dto: CreateProductDto) {
    const category = await this.prisma.category.findUnique({ where: { key: dto.categoryKey } });
    if (!category) throw new BadRequestException('Invalid categoryKey');
    if (dto.unit === ProductUnit.METER && (dto.sizes ?? []).length > 0) {
      throw new BadRequestException('sizes is not allowed for meter-based product');
    }

    const p = await this.prisma.product.create({
      data: {
        type: dto.type,
        unit: dto.unit,
        nameRu: dto.nameRu,
        nameUz: dto.nameUz,
        nameEn: dto.nameEn,
        descRu: dto.descRu,
        descUz: dto.descUz,
        descEn: dto.descEn,
        price: new Prisma.Decimal(dto.price),
        images: dto.images ?? [],
        sizes: dto.sizes ?? [],
        colors: dto.colors ?? [],
        characteristics: dto.characteristics ? (dto.characteristics as Prisma.InputJsonValue) : undefined,
        stock: dto.stock ?? 0,
        isActive: dto.isActive ?? true,
        isFeatured: dto.isFeatured ?? false,
        sortOrder: dto.sortOrder ?? 0,
        category: { connect: { id: category.id } },
      },
      select: { id: true },
    });

    return this.adminGet(p.id);
  }

  async adminUpdate(id: string, dto: UpdateProductDto) {
    const exists = await this.prisma.product.findUnique({ where: { id }, select: { id: true, unit: true, sizes: true } });
    if (!exists) throw new NotFoundException('Product not found');

    const nextUnit = dto.unit ?? exists.unit;
    const nextSizes = dto.sizes ?? exists.sizes;
    if (nextUnit === ProductUnit.METER && nextSizes.length > 0) {
      throw new BadRequestException('sizes is not allowed for meter-based product');
    }

    const categoryId = dto.categoryKey
      ? (await this.prisma.category.findUnique({ where: { key: dto.categoryKey }, select: { id: true } }))?.id
      : undefined;
    if (dto.categoryKey && !categoryId) throw new BadRequestException('Invalid categoryKey');

    await this.prisma.product.update({
      where: { id },
      data: {
        type: dto.type,
        unit: dto.unit,
        nameRu: dto.nameRu,
        nameUz: dto.nameUz,
        nameEn: dto.nameEn,
        descRu: dto.descRu,
        descUz: dto.descUz,
        descEn: dto.descEn,
        price: dto.price !== undefined ? new Prisma.Decimal(dto.price) : undefined,
        images: dto.images,
        sizes: dto.sizes,
        colors: dto.colors,
        characteristics: dto.characteristics ? (dto.characteristics as Prisma.InputJsonValue) : undefined,
        stock: dto.stock,
        isActive: dto.isActive,
        isFeatured: dto.isFeatured,
        sortOrder: dto.sortOrder,
        categoryId,
      },
    });

    return this.adminGet(id);
  }

  async adminDelete(id: string) {
    const exists = await this.prisma.product.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new NotFoundException('Product not found');
    await this.prisma.product.update({ where: { id }, data: { isActive: false } });
    return { ok: true };
  }
}
