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
exports.ShopsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const decimal_1 = require("../../common/prisma/decimal");
const prisma_service_1 = require("../prisma/prisma.service");
let ShopsService = class ShopsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list() {
        const shops = await this.prisma.shop.findMany({
            where: { isActive: true },
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        });
        return shops.map((s) => ({
            id: s.id,
            key: s.key,
            city: { ru: s.cityRu, uz: s.cityUz, en: s.cityEn },
            address: { ru: s.addressRu, uz: s.addressUz, en: s.addressEn },
            phone: s.phone,
            cardNumber: s.cardNumber,
            workHours: s.workHours,
        }));
    }
    async adminList() {
        const shops = await this.prisma.shop.findMany({
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        });
        return shops.map((s) => ({
            id: s.id,
            key: s.key,
            city: { ru: s.cityRu, uz: s.cityUz, en: s.cityEn },
            address: { ru: s.addressRu, uz: s.addressUz, en: s.addressEn },
            phone: s.phone,
            cardNumber: s.cardNumber,
            latitude: s.latitude ? (0, decimal_1.decimalToNumber)(s.latitude) : null,
            longitude: s.longitude ? (0, decimal_1.decimalToNumber)(s.longitude) : null,
            workHours: s.workHours,
            isActive: s.isActive,
            sortOrder: s.sortOrder,
            createdAt: s.createdAt.toISOString(),
            updatedAt: s.updatedAt.toISOString(),
        }));
    }
    async adminGet(id) {
        const s = await this.prisma.shop.findUnique({ where: { id } });
        if (!s)
            throw new common_1.NotFoundException('Shop not found');
        return {
            id: s.id,
            key: s.key,
            city: { ru: s.cityRu, uz: s.cityUz, en: s.cityEn },
            address: { ru: s.addressRu, uz: s.addressUz, en: s.addressEn },
            phone: s.phone,
            cardNumber: s.cardNumber,
            latitude: s.latitude ? (0, decimal_1.decimalToNumber)(s.latitude) : null,
            longitude: s.longitude ? (0, decimal_1.decimalToNumber)(s.longitude) : null,
            workHours: s.workHours,
            isActive: s.isActive,
            sortOrder: s.sortOrder,
            createdAt: s.createdAt.toISOString(),
            updatedAt: s.updatedAt.toISOString(),
        };
    }
    async adminCreate(dto) {
        const exists = await this.prisma.shop.findUnique({
            where: { key: dto.key },
            select: { id: true },
        });
        if (exists)
            throw new common_1.ConflictException('Shop key already exists');
        const s = await this.prisma.shop.create({
            data: {
                key: dto.key,
                cityRu: dto.cityRu,
                cityUz: dto.cityUz,
                cityEn: dto.cityEn,
                addressRu: dto.addressRu,
                addressUz: dto.addressUz,
                addressEn: dto.addressEn,
                phone: dto.phone,
                cardNumber: dto.cardNumber,
                latitude: dto.latitude !== undefined
                    ? new client_1.Prisma.Decimal(dto.latitude)
                    : undefined,
                longitude: dto.longitude !== undefined
                    ? new client_1.Prisma.Decimal(dto.longitude)
                    : undefined,
                workHours: dto.workHours,
                isActive: dto.isActive ?? true,
                sortOrder: dto.sortOrder ?? 0,
            },
            select: { id: true },
        });
        return this.adminGet(s.id);
    }
    async adminUpdate(id, dto) {
        const exists = await this.prisma.shop.findUnique({
            where: { id },
            select: { id: true, key: true },
        });
        if (!exists)
            throw new common_1.NotFoundException('Shop not found');
        if (dto.key) {
            const other = await this.prisma.shop.findUnique({
                where: { key: dto.key },
                select: { id: true },
            });
            if (other && other.id !== id)
                throw new common_1.BadRequestException('Shop key already exists');
        }
        await this.prisma.shop.update({
            where: { id },
            data: {
                key: dto.key,
                cityRu: dto.cityRu,
                cityUz: dto.cityUz,
                cityEn: dto.cityEn,
                addressRu: dto.addressRu,
                addressUz: dto.addressUz,
                addressEn: dto.addressEn,
                phone: dto.phone,
                cardNumber: dto.cardNumber,
                latitude: dto.latitude !== undefined
                    ? new client_1.Prisma.Decimal(dto.latitude)
                    : undefined,
                longitude: dto.longitude !== undefined
                    ? new client_1.Prisma.Decimal(dto.longitude)
                    : undefined,
                workHours: dto.workHours,
                isActive: dto.isActive,
                sortOrder: dto.sortOrder,
            },
        });
        return this.adminGet(id);
    }
    async adminDelete(id) {
        const exists = await this.prisma.shop.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!exists)
            throw new common_1.NotFoundException('Shop not found');
        await this.prisma.shop.update({ where: { id }, data: { isActive: false } });
        return { ok: true };
    }
};
exports.ShopsService = ShopsService;
exports.ShopsService = ShopsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ShopsService);
//# sourceMappingURL=shops.service.js.map