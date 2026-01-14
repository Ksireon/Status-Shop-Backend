import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DeliveryType, OrderStatus, PaymentStatus, Prisma } from '@prisma/client';
import { decimalToNumber } from '../../common/prisma/decimal';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderFilterDto } from './dto/order-filter.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateOrderDto) {
    if (dto.deliveryType === DeliveryType.PICKUP && !dto.branchKey) {
      throw new BadRequestException('branchKey is required for pickup');
    }
    if (dto.deliveryType === DeliveryType.DELIVERY && !dto.deliveryAddress) {
      throw new BadRequestException('deliveryAddress is required for delivery');
    }

    const productIds = dto.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      include: { category: { select: { key: true } } },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('Some products not found');
    }

    const shop = dto.branchKey
      ? await this.prisma.shop.findUnique({ where: { key: dto.branchKey } })
      : null;

    if (dto.deliveryType === DeliveryType.PICKUP && (!shop || !shop.isActive)) {
      throw new BadRequestException('Invalid branchKey');
    }

    const byId = new Map(products.map((p) => [p.id, p]));

    let subtotal = new Prisma.Decimal(0);
    const itemsData: Prisma.OrderItemCreateWithoutOrderInput[] = dto.items.map((i) => {
      const product = byId.get(i.productId)!;

      const qty = new Prisma.Decimal(i.quantity);
      const metersValue = i.meters !== undefined && i.meters !== null ? Number(i.meters) : null;
      const meters = metersValue !== null ? new Prisma.Decimal(metersValue) : null;

      if (product.unit === 'METER') {
        if (metersValue === null) {
          throw new BadRequestException(`meters is required for product ${product.id}`);
        }
        if (metersValue <= 0) {
          throw new BadRequestException(`meters must be > 0 for product ${product.id}`);
        }
        if (i.quantity !== 1) {
          throw new BadRequestException(`quantity must be 1 for meter-based product ${product.id}`);
        }
      } else {
        if (metersValue !== null) {
          throw new BadRequestException(`meters is not allowed for product ${product.id}`);
        }
      }

      const units = product.unit === 'METER' ? meters! : qty;
      const pricePerUnit = product.price;
      const total = pricePerUnit.mul(units);
      subtotal = subtotal.add(total);

      const colors = product.colors;
      if (colors.length > 0 && (!i.color || !colors.includes(i.color))) {
        throw new BadRequestException(`Invalid color for product ${product.id}`);
      }

      const sizes = product.sizes;
      if (product.unit === 'PIECE' && sizes.length > 0 && (!i.size || !sizes.includes(i.size))) {
        throw new BadRequestException(`Invalid size for product ${product.id}`);
      }

      return {
        product: { connect: { id: product.id } },
        productName: { ru: product.nameRu, uz: product.nameUz, en: product.nameEn },
        productImage: product.images[0] ?? '',
        quantity: i.quantity,
        meters,
        size: i.size,
        color: i.color,
        pricePerUnit,
        total,
      };
    });

    const deliveryFee = new Prisma.Decimal(0);
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
        branchKey: dto.deliveryType === DeliveryType.PICKUP ? dto.branchKey : null,
        branchName: dto.deliveryType === DeliveryType.PICKUP ? shop?.cityRu ?? null : null,
        branchAddress: dto.deliveryType === DeliveryType.PICKUP ? shop?.addressRu ?? null : null,
        deliveryAddress: dto.deliveryType === DeliveryType.DELIVERY ? dto.deliveryAddress : null,
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

  async listMy(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((o) => this.toDto(o));
  }

  async getMy(userId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return this.toDto(order);
  }

  async adminList(filter: OrderFilterDto) {
    const where: Prisma.OrderWhereInput = {
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
      include: { items: true, user: { select: { id: true, email: true, role: true } } },
      orderBy: { createdAt: 'desc' },
      skip: filter.skip ?? 0,
      take: filter.take ?? 50,
    });

    return orders.map((o) => this.toAdminDto(o));
  }

  async adminGet(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true, user: { select: { id: true, email: true, role: true } } },
    });
    if (!order) throw new NotFoundException('Order not found');
    return this.toAdminDto(order);
  }

  async adminUpdateStatus(id: string, status: OrderStatus, adminNotes?: string) {
    const exists = await this.prisma.order.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new NotFoundException('Order not found');

    await this.prisma.order.update({
      where: { id },
      data: {
        status,
        adminNotes: adminNotes ?? undefined,
        completedAt: status === OrderStatus.COMPLETED ? new Date() : undefined,
      },
    });

    return this.adminGet(id);
  }

  async adminUpdatePaymentStatus(id: string, paymentStatus: PaymentStatus, adminNotes?: string) {
    const exists = await this.prisma.order.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new NotFoundException('Order not found');

    await this.prisma.order.update({
      where: { id },
      data: {
        paymentStatus,
        adminNotes: adminNotes ?? undefined,
      },
    });

    return this.adminGet(id);
  }

  private toDto(order: Prisma.OrderGetPayload<{ include: { items: true } }>) {
    return {
      id: order.id,
      shortId: order.shortId,
      status: order.status,
      deliveryType: order.deliveryType,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      subtotal: decimalToNumber(order.subtotal),
      deliveryFee: decimalToNumber(order.deliveryFee),
      total: decimalToNumber(order.total),
      branchKey: order.branchKey,
      branchName: order.branchName,
      branchAddress: order.branchAddress,
      deliveryAddress: order.deliveryAddress,
      items: order.items.map((i) => ({
        id: i.id,
        productId: i.productId,
        productName: i.productName as { ru: string; uz: string; en: string },
        productImage: i.productImage,
        quantity: i.quantity,
        meters: i.meters ? decimalToNumber(i.meters) : null,
        size: i.size,
        color: i.color,
        pricePerUnit: decimalToNumber(i.pricePerUnit),
        total: decimalToNumber(i.total),
      })),
      createdAt: order.createdAt.toISOString(),
    };
  }

  private toAdminDto(
    order: Prisma.OrderGetPayload<{ include: { items: true; user: { select: { id: true; email: true; role: true } } } }>,
  ) {
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

  private generateShortId() {
    const chars = 'ABCDEF0123456789';
    let id = '';
    const seed = Date.now();
    for (let i = 0; i < 6; i++) {
      id += chars[(seed + i * 997) % chars.length];
    }
    return `UZ-${id}`;
  }
}
