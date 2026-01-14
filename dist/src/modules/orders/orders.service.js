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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const decimal_1 = require("../../common/prisma/decimal");
const prisma_service_1 = require("../prisma/prisma.service");
let OrdersService = class OrdersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        if (dto.deliveryType === client_1.DeliveryType.PICKUP && !dto.branchKey) {
            throw new common_1.BadRequestException('branchKey is required for pickup');
        }
        if (dto.deliveryType === client_1.DeliveryType.DELIVERY && !dto.deliveryAddress) {
            throw new common_1.BadRequestException('deliveryAddress is required for delivery');
        }
        const productIds = dto.items.map((i) => i.productId);
        const products = await this.prisma.product.findMany({
            where: { id: { in: productIds }, isActive: true },
            include: { category: { select: { key: true } } },
        });
        if (products.length !== productIds.length) {
            throw new common_1.BadRequestException('Some products not found');
        }
        const shop = dto.branchKey
            ? await this.prisma.shop.findUnique({ where: { key: dto.branchKey } })
            : null;
        if (dto.deliveryType === client_1.DeliveryType.PICKUP && (!shop || !shop.isActive)) {
            throw new common_1.BadRequestException('Invalid branchKey');
        }
        const byId = new Map(products.map((p) => [p.id, p]));
        let subtotal = new client_1.Prisma.Decimal(0);
        const itemsData = dto.items.map((i) => {
            const product = byId.get(i.productId);
            const qty = new client_1.Prisma.Decimal(i.quantity);
            const metersValue = i.meters !== undefined && i.meters !== null ? Number(i.meters) : null;
            const meters = metersValue !== null ? new client_1.Prisma.Decimal(metersValue) : null;
            if (product.unit === 'METER') {
                if (metersValue === null) {
                    throw new common_1.BadRequestException(`meters is required for product ${product.id}`);
                }
                if (metersValue <= 0) {
                    throw new common_1.BadRequestException(`meters must be > 0 for product ${product.id}`);
                }
                if (i.quantity !== 1) {
                    throw new common_1.BadRequestException(`quantity must be 1 for meter-based product ${product.id}`);
                }
            }
            else {
                if (metersValue !== null) {
                    throw new common_1.BadRequestException(`meters is not allowed for product ${product.id}`);
                }
            }
            const units = product.unit === 'METER' ? meters : qty;
            const pricePerUnit = product.price;
            const total = pricePerUnit.mul(units);
            subtotal = subtotal.add(total);
            const colors = product.colors;
            if (colors.length > 0 && (!i.color || !colors.includes(i.color))) {
                throw new common_1.BadRequestException(`Invalid color for product ${product.id}`);
            }
            const sizes = product.sizes;
            if (product.unit === 'PIECE' &&
                sizes.length > 0 &&
                (!i.size || !sizes.includes(i.size))) {
                throw new common_1.BadRequestException(`Invalid size for product ${product.id}`);
            }
            return {
                product: { connect: { id: product.id } },
                productName: {
                    ru: product.nameRu,
                    uz: product.nameUz,
                    en: product.nameEn,
                },
                productImage: product.images[0] ?? '',
                quantity: i.quantity,
                meters,
                size: i.size,
                color: i.color,
                pricePerUnit,
                total,
            };
        });
        const deliveryFee = new client_1.Prisma.Decimal(0);
        const total = subtotal.add(deliveryFee);
        const shortId = this.generateShortId();
        const order = await this.prisma.order.create({
            data: {
                shortId,
                user: { connect: { id: userId } },
                customerName: dto.customerName,
                customerPhone: dto.customerPhone,
                customerEmail: dto.customerEmail,
                deliveryType: dto.deliveryType,
                branchKey: dto.deliveryType === client_1.DeliveryType.PICKUP ? dto.branchKey : null,
                branchName: dto.deliveryType === client_1.DeliveryType.PICKUP
                    ? (shop?.cityRu ?? null)
                    : null,
                branchAddress: dto.deliveryType === client_1.DeliveryType.PICKUP
                    ? (shop?.addressRu ?? null)
                    : null,
                deliveryAddress: dto.deliveryType === client_1.DeliveryType.DELIVERY
                    ? dto.deliveryAddress
                    : null,
                paymentMethod: dto.paymentMethod,
                subtotal,
                deliveryFee,
                total,
                notes: dto.notes,
                items: { create: itemsData },
            },
            include: { items: true },
        });
        return this.toDto(order);
    }
    async listMy(userId) {
        const orders = await this.prisma.order.findMany({
            where: { userId },
            include: { items: true },
            orderBy: { createdAt: 'desc' },
        });
        return orders.map((o) => this.toDto(o));
    }
    async getMy(userId, id) {
        const order = await this.prisma.order.findFirst({
            where: { id, userId },
            include: { items: true },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return this.toDto(order);
    }
    async adminList(filter) {
        const where = {
            ...(filter.status ? { status: filter.status } : {}),
            ...(filter.paymentStatus ? { paymentStatus: filter.paymentStatus } : {}),
            ...(filter.q
                ? {
                    OR: [
                        { shortId: { contains: filter.q, mode: 'insensitive' } },
                        { customerEmail: { contains: filter.q, mode: 'insensitive' } },
                        { customerPhone: { contains: filter.q, mode: 'insensitive' } },
                        { customerName: { contains: filter.q, mode: 'insensitive' } },
                    ],
                }
                : {}),
            ...(filter.dateFrom || filter.dateTo
                ? {
                    createdAt: {
                        ...(filter.dateFrom ? { gte: new Date(filter.dateFrom) } : {}),
                        ...(filter.dateTo ? { lte: new Date(filter.dateTo) } : {}),
                    },
                }
                : {}),
        };
        const orders = await this.prisma.order.findMany({
            where,
            include: {
                items: true,
                user: { select: { id: true, email: true, role: true } },
            },
            orderBy: { createdAt: 'desc' },
            skip: filter.skip ?? 0,
            take: filter.take ?? 50,
        });
        return orders.map((o) => this.toAdminDto(o));
    }
    async adminGet(id) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                items: true,
                user: { select: { id: true, email: true, role: true } },
            },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return this.toAdminDto(order);
    }
    async adminUpdateStatus(id, status, adminNotes) {
        const exists = await this.prisma.order.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!exists)
            throw new common_1.NotFoundException('Order not found');
        await this.prisma.order.update({
            where: { id },
            data: {
                status,
                adminNotes: adminNotes ?? undefined,
                completedAt: status === client_1.OrderStatus.COMPLETED ? new Date() : undefined,
            },
        });
        return this.adminGet(id);
    }
    async adminUpdatePaymentStatus(id, paymentStatus, adminNotes) {
        const exists = await this.prisma.order.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!exists)
            throw new common_1.NotFoundException('Order not found');
        await this.prisma.order.update({
            where: { id },
            data: {
                paymentStatus,
                adminNotes: adminNotes ?? undefined,
            },
        });
        return this.adminGet(id);
    }
    toDto(order) {
        return {
            id: order.id,
            shortId: order.shortId,
            status: order.status,
            deliveryType: order.deliveryType,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            subtotal: (0, decimal_1.decimalToNumber)(order.subtotal),
            deliveryFee: (0, decimal_1.decimalToNumber)(order.deliveryFee),
            total: (0, decimal_1.decimalToNumber)(order.total),
            branchKey: order.branchKey,
            branchName: order.branchName,
            branchAddress: order.branchAddress,
            deliveryAddress: order.deliveryAddress,
            items: order.items.map((i) => ({
                id: i.id,
                productId: i.productId,
                productName: i.productName,
                productImage: i.productImage,
                quantity: i.quantity,
                meters: i.meters ? (0, decimal_1.decimalToNumber)(i.meters) : null,
                size: i.size,
                color: i.color,
                pricePerUnit: (0, decimal_1.decimalToNumber)(i.pricePerUnit),
                total: (0, decimal_1.decimalToNumber)(i.total),
            })),
            createdAt: order.createdAt.toISOString(),
        };
    }
    toAdminDto(order) {
        return {
            ...this.toDto(order),
            user: order.user,
            paymentStatus: order.paymentStatus,
            status: order.status,
            notes: order.notes,
            adminNotes: order.adminNotes,
            updatedAt: order.updatedAt.toISOString(),
            completedAt: order.completedAt ? order.completedAt.toISOString() : null,
        };
    }
    generateShortId() {
        const chars = 'ABCDEF0123456789';
        let id = '';
        const seed = Date.now();
        for (let i = 0; i < 6; i++) {
            id += chars[(seed + i * 997) % chars.length];
        }
        return `UZ-${id}`;
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map