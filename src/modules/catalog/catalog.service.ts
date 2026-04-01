import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Prisma, ProductImage } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { productInputMode } from '../../common/utils/product-input-mode';
import {
  buildPaginationMeta,
  normalizePagination,
} from '../../common/utils/pagination';
import { ListProductsQuery } from './dto/list-products.query';

function primaryImage(images: ProductImage[]) {
  if (!images.length) return null;
  const sorted = images.slice().sort((a, b) => a.sort - b.sort);
  return sorted[0]?.url ?? null;
}

@Injectable()
export class CatalogService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  private async getCatalogVersion() {
    const stored = await this.cache.get('catalog:version');
    const version = typeof stored === 'number' ? stored : Number(stored ?? 1);
    if (!version || Number.isNaN(version)) {
      await this.cache.set('catalog:version', 1);
      return 1;
    }
    return version;
  }

  async listCategories() {
    const version = await this.getCatalogVersion();
    const cacheKey = `catalog:v${version}:categories`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const categories = await this.prisma.category.findMany({
      orderBy: { slug: 'asc' },
      select: {
        id: true,
        slug: true,
        name: true,
      },
    });
    await this.cache.set(cacheKey, categories);
    return categories;
  }

  async listProducts(query: ListProductsQuery) {
    const { skip, take, page, limit } = normalizePagination(query);
    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.type ? { type: query.type } : {}),
      ...(query.minPrice !== undefined || query.maxPrice !== undefined
        ? {
            price: {
              ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
              ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
            },
          }
        : {}),
      ...(query.q
        ? {
            OR: [
              {
                name: {
                  path: ['ru'],
                  string_contains: query.q,
                  mode: 'insensitive',
                },
              },
              {
                name: {
                  path: ['uz'],
                  string_contains: query.q,
                  mode: 'insensitive',
                },
              },
              {
                name: {
                  path: ['en'],
                  string_contains: query.q,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
    };

    const version = await this.getCatalogVersion();
    const cacheKey = `catalog:v${version}:products:${JSON.stringify({
      ...query,
      page,
      limit,
    })}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const [total, products] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          images: true,
          category: { select: { id: true, slug: true, name: true } },
        },
      }),
    ]);

    const data = products.map((p) => ({
      id: p.id,
      category: p.category,
      name: p.name,
      description: p.description,
      characteristics: p.characteristics,
      type: p.type,
      inputMode: productInputMode(p.type, p.category?.slug ?? null),
      price: p.price,
      stockQuantity: p.stockQuantity,
      primaryImageUrl: primaryImage(p.images),
      images: p.images
        .slice()
        .sort((a, b) => a.sort - b.sort)
        .map((i) => ({
          url: i.url,
          sort: i.sort,
          label: i.label,
        })),
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
    const result = { data, meta: buildPaginationMeta(page, limit, total) };
    await this.cache.set(cacheKey, result);
    return result;
  }

  async getProduct(productId: string) {
    const version = await this.getCatalogVersion();
    const cacheKey = `catalog:v${version}:product:${productId}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const product = await this.prisma.product.findFirst({
      where: { id: productId, isActive: true },
      include: {
        images: true,
        category: { select: { id: true, slug: true, name: true } },
      },
    });
    if (!product) throw new NotFoundException('Product not found');

    const result = {
      id: product.id,
      category: product.category,
      name: product.name,
      description: product.description,
      characteristics: product.characteristics,
      type: product.type,
      inputMode: productInputMode(product.type, product.category?.slug ?? null),
      price: product.price,
      stockQuantity: product.stockQuantity,
      images: product.images
        .slice()
        .sort((a, b) => a.sort - b.sort)
        .map((i) => ({
          url: i.url,
          sort: i.sort,
          label: i.label,
        })),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
    await this.cache.set(cacheKey, result);
    return result;
  }
}
