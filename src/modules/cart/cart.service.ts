import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { productInputMode } from '../../common/utils/product-input-mode';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

function lineTotal(price: number, quantity: number, meters?: number | null) {
  if (meters && meters > 0) return price * meters;
  return price * quantity;
}

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  private validateVariantByType(
    productType: string,
    data: { meters?: number | null; size?: string | null },
  ) {
    const mode = productInputMode(productType);

    if (mode.usesMeters) {
      if (data.meters === undefined || data.meters === null) {
        throw new BadRequestException('meters is required for this product');
      }
      if (data.size) {
        throw new BadRequestException('size is not allowed for this product');
      }
      return;
    }

    if (mode.usesSize) {
      if (!data.size) {
        throw new BadRequestException('size is required for this product');
      }
      if (data.meters !== undefined && data.meters !== null) {
        throw new BadRequestException('meters is not allowed for this product');
      }
      return;
    }

    if (data.meters !== undefined && data.meters !== null) {
      throw new BadRequestException('meters is not allowed for this product');
    }
    if (data.size) {
      throw new BadRequestException('size is not allowed for this product');
    }
  }

  async getCart(userId: string) {
    const items = await this.prisma.cartItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          include: {
            images: true,
            category: { select: { id: true, slug: true, name: true } },
          },
        },
      },
    });

    const normalizedItems = items.map((i) => {
      const inputMode = productInputMode(i.product.type);
      const productImages = i.product.images
        .slice()
        .sort((a, b) => a.sort - b.sort)
        .map((img) => ({ url: img.url, sort: img.sort, label: img.label }));
      const primaryImageUrl = productImages[0]?.url ?? null;
      const selectedImageUrl = i.selectedImageUrl ?? primaryImageUrl;

      const total = lineTotal(i.product.price, i.quantity, i.meters);

      return {
        id: i.id,
        quantity: i.quantity,
        meters: i.meters,
        size: i.size,
        colorLabel: i.colorLabel,
        selectedImageUrl,
        createdAt: i.createdAt,
        updatedAt: i.updatedAt,
        product: {
          id: i.product.id,
          category: i.product.category,
          name: i.product.name,
          description: i.product.description,
          characteristics: i.product.characteristics,
          type: i.product.type,
          inputMode,
          price: i.product.price,
          images: productImages,
        },
        total,
      };
    });

    const cartTotal = normalizedItems.reduce((acc, i) => acc + i.total, 0);
    return { items: normalizedItems, total: cartTotal };
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, isActive: true },
      include: { images: true },
    });
    if (!product) throw new NotFoundException('Product not found');

    this.validateVariantByType(product.type, {
      meters: dto.meters,
      size: dto.size,
    });

    const firstImageUrl =
      product.images.slice().sort((a, b) => a.sort - b.sort)[0]?.url ?? null;
    const quantity = dto.quantity ?? 1;

    await this.prisma.cartItem.create({
      data: {
        userId,
        productId: product.id,
        quantity,
        meters: dto.meters,
        size: dto.size,
        selectedImageUrl: dto.selectedImageUrl ?? firstImageUrl ?? undefined,
        colorLabel: dto.colorLabel,
      },
    });

    return this.getCart(userId);
  }

  async updateItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { product: { select: { type: true } } },
    });
    if (!item) throw new NotFoundException('Cart item not found');
    if (item.userId !== userId) throw new ForbiddenException();

    const meters = dto.meters ?? item.meters;
    const size = dto.size ?? item.size;
    this.validateVariantByType(item.product.type, { meters, size });

    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: {
        quantity: dto.quantity,
        meters: dto.meters,
        size: dto.size,
        selectedImageUrl: dto.selectedImageUrl,
        colorLabel: dto.colorLabel,
      },
    });

    return this.getCart(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
    });
    if (!item) throw new NotFoundException('Cart item not found');
    if (item.userId !== userId) throw new ForbiddenException();

    await this.prisma.cartItem.delete({ where: { id: itemId } });
    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    await this.prisma.cartItem.deleteMany({ where: { userId } });
  }
}
