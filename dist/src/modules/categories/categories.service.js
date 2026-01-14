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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CategoriesService = class CategoriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list() {
        const categories = await this.prisma.category.findMany({
            where: { isActive: true },
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        });
        return categories.map((c) => ({
            id: c.id,
            key: c.key,
            name: { ru: c.nameRu, uz: c.nameUz, en: c.nameEn },
            icon: c.icon,
            sortOrder: c.sortOrder,
        }));
    }
    async adminList() {
        const categories = await this.prisma.category.findMany({
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        });
        return categories.map((c) => ({
            id: c.id,
            key: c.key,
            name: { ru: c.nameRu, uz: c.nameUz, en: c.nameEn },
            icon: c.icon,
            sortOrder: c.sortOrder,
            isActive: c.isActive,
            createdAt: c.createdAt.toISOString(),
            updatedAt: c.updatedAt.toISOString(),
        }));
    }
    async adminGet(id) {
        const c = await this.prisma.category.findUnique({ where: { id } });
        if (!c)
            throw new common_1.NotFoundException('Category not found');
        return {
            id: c.id,
            key: c.key,
            name: { ru: c.nameRu, uz: c.nameUz, en: c.nameEn },
            icon: c.icon,
            sortOrder: c.sortOrder,
            isActive: c.isActive,
            createdAt: c.createdAt.toISOString(),
            updatedAt: c.updatedAt.toISOString(),
        };
    }
    async adminCreate(dto) {
        const exists = await this.prisma.category.findUnique({
            where: { key: dto.key },
            select: { id: true },
        });
        if (exists)
            throw new common_1.ConflictException('Category key already exists');
        const c = await this.prisma.category.create({
            data: {
                key: dto.key,
                nameRu: dto.nameRu,
                nameUz: dto.nameUz,
                nameEn: dto.nameEn,
                icon: dto.icon,
                sortOrder: dto.sortOrder ?? 0,
                isActive: dto.isActive ?? true,
            },
        });
        return this.adminGet(c.id);
    }
    async adminUpdate(id, dto) {
        const c = await this.prisma.category.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!c)
            throw new common_1.NotFoundException('Category not found');
        if (dto.key) {
            const other = await this.prisma.category.findUnique({
                where: { key: dto.key },
                select: { id: true },
            });
            if (other && other.id !== id)
                throw new common_1.ConflictException('Category key already exists');
        }
        await this.prisma.category.update({
            where: { id },
            data: {
                key: dto.key,
                nameRu: dto.nameRu,
                nameUz: dto.nameUz,
                nameEn: dto.nameEn,
                icon: dto.icon,
                sortOrder: dto.sortOrder,
                isActive: dto.isActive,
            },
        });
        return this.adminGet(id);
    }
    async adminDelete(id) {
        const c = await this.prisma.category.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!c)
            throw new common_1.NotFoundException('Category not found');
        await this.prisma.category.update({
            where: { id },
            data: { isActive: false },
        });
        return { ok: true };
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map