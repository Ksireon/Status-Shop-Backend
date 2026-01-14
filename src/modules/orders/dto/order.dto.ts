import { ApiProperty } from '@nestjs/swagger';
import {
  DeliveryType,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '@prisma/client';

export class OrderItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  productName: { ru: string; uz: string; en: string };

  @ApiProperty()
  productImage: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty({ required: false })
  meters?: number | null;

  @ApiProperty({ required: false })
  size?: string | null;

  @ApiProperty({ required: false })
  color?: string | null;

  @ApiProperty()
  pricePerUnit: number;

  @ApiProperty()
  total: number;
}

export class OrderDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  shortId: string;

  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  @ApiProperty({ enum: DeliveryType })
  deliveryType: DeliveryType;

  @ApiProperty({ enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @ApiProperty({ enum: PaymentStatus })
  paymentStatus: PaymentStatus;

  @ApiProperty()
  subtotal: number;

  @ApiProperty()
  deliveryFee: number;

  @ApiProperty()
  total: number;

  @ApiProperty({ required: false })
  branchKey?: string | null;

  @ApiProperty({ required: false })
  branchName?: string | null;

  @ApiProperty({ required: false })
  branchAddress?: string | null;

  @ApiProperty({ required: false })
  deliveryAddress?: string | null;

  @ApiProperty({ type: [OrderItemDto] })
  items: OrderItemDto[];

  @ApiProperty()
  createdAt: string;
}
