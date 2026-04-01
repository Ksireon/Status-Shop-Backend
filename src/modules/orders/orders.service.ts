import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DeliveryType, OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  calcStockUnits,
  productInputMode,
} from '../../common/utils/product-input-mode';
import { calcLineTotal } from '../../common/utils/line-total';
import { CheckoutDto } from './dto/checkout.dto';

const SHORT_ID_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const SHORT_ID_LENGTH = 8;

function randomShortId(): string {
  let result = '';
  for (let i = 0; i < SHORT_ID_LENGTH; i += 1) {
    result += SHORT_ID_ALPHABET.charAt(
      Math.floor(Math.random() * SHORT_ID_ALPHABET.length),
    );
  }
  return result;
}

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  private async createUniqueShortId(tx: Prisma.TransactionClient) {
    for (let i = 0; i < 10; i += 1) {
      const shortId = randomShortId();
      const existing = await tx.order.findUnique({ where: { shortId } });
      if (!existing) return shortId;
    }
    throw new BadRequestException('Unable to generate order id');
  }

  async checkout(userId: string, dto: CheckoutDto) {
    if (dto.deliveryType === DeliveryType.DELIVERY && !dto.deliveryAddress) {
      throw new BadRequestException('deliveryAddress is required for delivery');
    }

    return this.prisma.$transaction(async (tx) => {
      const cartItems = await tx.cartItem.findMany({
        where: { userId },
        include: {
          product: { include: { images: true, category: true } },
        },
      });

      if (!cartItems.length) throw new BadRequestException('Cart is empty');

      const shortId = await this.createUniqueShortId(tx);
      const items = cartItems.map((ci) => {
        if (ci.product.name === null) {
          throw new BadRequestException('Invalid product data');
        }
        if (!ci.product.isActive) {
          throw new BadRequestException('Product is not available');
        }
        const inputMode = productInputMode(
          ci.product.type,
          ci.product.category?.slug ?? null,
        );
        if (inputMode.usesMeters && (!ci.meters || ci.meters <= 0)) {
          throw new BadRequestException('meters is required for this product');
        }
        const productStock = ci.product.stockQuantity;
        const requiredUnits = calcStockUnits(
          ci.product.type,
          ci.product.category?.slug ?? null,
          ci.quantity,
          ci.meters,
        );
        if (requiredUnits > productStock) {
          throw new BadRequestException('Not enough stock');
        }
        const productImages = ci.product.images
          .slice()
          .sort((a, b) => a.sort - b.sort);
        const primaryImageUrl = productImages[0]?.url ?? null;
        const imageSnapshot = ci.selectedImageUrl ?? primaryImageUrl;

        const unitPrice = ci.product.price;
        const quantity = inputMode.usesMeters ? 1 : ci.quantity;
        const lineTotal = calcLineTotal(unitPrice, quantity, ci.meters);

        return {
          productId: ci.productId,
          nameSnapshot: ci.product.name as Prisma.InputJsonValue,
          descriptionSnapshot: ci.product.description ?? undefined,
          typeSnapshot: ci.product.type,
          imageSnapshot: imageSnapshot ?? undefined,
          colorLabel: ci.colorLabel,
          size: ci.size,
          meters: ci.meters,
          unitPrice,
          quantity,
          lineTotal,
        };
      });

      const itemsCreate = items.map(({ productId, ...rest }) => ({
        ...rest,
        product: { connect: { id: productId } },
      }));

      const total = items.reduce((acc, it) => acc + it.lineTotal, 0);

      const order = await tx.order.create({
        data: {
          shortId,
          userId,
          status: OrderStatus.PENDING,
          deliveryType: dto.deliveryType,
          paymentMethod: dto.paymentMethod,
          shopId: dto.shopId,
          deliveryAddress: dto.deliveryAddress,
          total,
          items: {
            create: itemsCreate,
          },
        },
        include: {
          items: true,
          shop: true,
        },
      });

      await Promise.all(
        cartItems.map((ci) => {
          const requiredUnits = calcStockUnits(
            ci.product.type,
            ci.product.category?.slug ?? null,
            ci.quantity,
            ci.meters,
          );
          return tx.product.update({
            where: { id: ci.productId },
            data: { stockQuantity: { decrement: requiredUnits } },
          });
        }),
      );

      await tx.cartItem.deleteMany({ where: { userId } });

      return order;
    });
  }

  async myOrders(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { items: true, shop: true },
    });

    return orders;
  }

  async getMyOrder(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, shop: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new ForbiddenException();
    return order;
  }

  async cancelMyOrder(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: { include: { category: true } } } },
        shop: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new ForbiddenException();
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be canceled');
    }

    return this.prisma.$transaction(async (tx) => {
      await Promise.all(
        order.items.map((item) => {
          const requiredUnits = calcStockUnits(
            item.typeSnapshot,
            item.product?.category?.slug ?? null,
            item.quantity,
            item.meters,
          );
          return tx.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { increment: requiredUnits } },
          });
        }),
      );

      return tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.CANCELED },
        include: { items: true, shop: true },
      });
    });
  }
}
