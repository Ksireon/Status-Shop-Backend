"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const decimal_1 = require("../../common/prisma/decimal");
const prisma_service_1 = require("../prisma/prisma.service");
let ProductsService = class ProductsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(filter) {
        const where = {
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
                        ...(filter.minPrice !== undefined
                            ? { gte: new client_1.Prisma.Decimal(filter.minPrice) }
                            : {}),
                        ...(filter.maxPrice !== undefined
                            ? { lte: new client_1.Prisma.Decimal(filter.maxPrice) }
                            : {}),
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
            price: (0, decimal_1.decimalToNumber)(p.price),
            images: p.images,
            sizes: p.sizes,
            colors: p.colors,
            characteristics: p.characteristics,
            isFeatured: p.isFeatured,
        }));
    }
    async getById(id) {
        const p = await this.prisma.product.findFirst({
            where: { id, isActive: true },
            include: { category: { select: { key: true } } },
        });
        if (!p)
            throw new common_1.NotFoundException('Product not found');
        return {
            id: p.id,
            type: p.type,
            categoryKey: p.category.key,
            unit: p.unit,
            name: { ru: p.nameRu, uz: p.nameUz, en: p.nameEn },
            description: { ru: p.descRu, uz: p.descUz, en: p.descEn },
            price: (0, decimal_1.decimalToNumber)(p.price),
            images: p.images,
            sizes: p.sizes,
            colors: p.colors,
            characteristics: p.characteristics,
            isFeatured: p.isFeatured,
        };
    }
    async adminList(filter) {
        const where = {
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
                        ...(filter.minPrice !== undefined
                            ? { gte: new client_1.Prisma.Decimal(filter.minPrice) }
                            : {}),
                        ...(filter.maxPrice !== undefined
                            ? { lte: new client_1.Prisma.Decimal(filter.maxPrice) }
                            : {}),
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
            price: (0, decimal_1.decimalToNumber)(p.price),
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
    async adminGet(id) {
        const p = await this.prisma.product.findUnique({
            where: { id },
            include: { category: { select: { key: true } } },
        });
        if (!p)
            throw new common_1.NotFoundException('Product not found');
        return {
            id: p.id,
            type: p.type,
            unit: p.unit,
            categoryKey: p.category.key,
            name: { ru: p.nameRu, uz: p.nameUz, en: p.nameEn },
            description: { ru: p.descRu, uz: p.descUz, en: p.descEn },
            price: (0, decimal_1.decimalToNumber)(p.price),
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
    async adminCreate(dto) {
        const category = await this.prisma.category.findUnique({
            where: { key: dto.categoryKey },
        });
        if (!category)
            throw new common_1.BadRequestException('Invalid categoryKey');
        if (dto.unit === client_1.ProductUnit.METER && (dto.sizes ?? []).length > 0) {
            throw new common_1.BadRequestException('sizes is not allowed for meter-based product');
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
                price: new client_1.Prisma.Decimal(dto.price),
                images: dto.images ?? [],
                sizes: dto.sizes ?? [],
                colors: dto.colors ?? [],
                characteristics: dto.characteristics
                    ? dto.characteristics
                    : undefined,
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
    async adminUpdate(id, dto) {
        const exists = await this.prisma.product.findUnique({
            where: { id },
            select: { id: true, unit: true, sizes: true },
        });
        if (!exists)
            throw new common_1.NotFoundException('Product not found');
        const nextUnit = dto.unit ?? exists.unit;
        const nextSizes = dto.sizes ?? exists.sizes;
        if (nextUnit === client_1.ProductUnit.METER && nextSizes.length > 0) {
            throw new common_1.BadRequestException('sizes is not allowed for meter-based product');
        }
        const categoryId = dto.categoryKey
            ? (await this.prisma.category.findUnique({
                where: { key: dto.categoryKey },
                select: { id: true },
            }))?.id
            : undefined;
        if (dto.categoryKey && !categoryId)
            throw new common_1.BadRequestException('Invalid categoryKey');
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
                price: dto.price !== undefined ? new client_1.Prisma.Decimal(dto.price) : undefined,
                images: dto.images,
                sizes: dto.sizes,
                colors: dto.colors,
                characteristics: dto.characteristics
                    ? dto.characteristics
                    : undefined,
                stock: dto.stock,
                isActive: dto.isActive,
                isFeatured: dto.isFeatured,
                sortOrder: dto.sortOrder,
                categoryId,
            },
        });
        return this.adminGet(id);
    }
    async adminDelete(id) {
        const exists = await this.prisma.product.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!exists)
            throw new common_1.NotFoundException('Product not found');
        await this.prisma.product.update({
            where: { id },
            data: { isActive: false },
        });
        return { ok: true };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map