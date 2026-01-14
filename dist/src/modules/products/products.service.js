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
                        ...(filter.minPrice !== undefined ? { gte: new client_1.Prisma.Decimal(filter.minPrice) } : {}),
                        ...(filter.maxPrice !== undefined ? { lte: new client_1.Prisma.Decimal(filter.maxPrice) } : {}),
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
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map