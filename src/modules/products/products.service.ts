import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { decimalToNumber } from '../../common/prisma/decimal';
import { PrismaService } from '../prisma/prisma.service';
import { ProductFilterDto } from './dto/product-filter.dto';

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
}

