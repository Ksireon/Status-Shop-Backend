import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DeliveryType, Prisma } from '@prisma/client';
import { decimalToNumber } from '../../common/prisma/decimal';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

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
      const meters = i.meters !== undefined && i.meters !== null ? new Prisma.Decimal(i.meters) : null;
      const units = product.type === 'vinil' && meters ? meters : qty;
      const pricePerUnit = product.price;
      const total = pricePerUnit.mul(units);
      subtotal = subtotal.add(total);

      const colors = product.colors;
      if (i.color && colors.length > 0 && !colors.includes(i.color)) {
        throw new BadRequestException(`Invalid color for product ${product.id}`);
      }
      if (i.size && product.sizes.length > 0 && !product.sizes.includes(i.size)) {
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

