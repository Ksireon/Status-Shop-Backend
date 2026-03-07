import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DeliveryType, PaymentMethod } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class CheckoutDto {
  @ApiProperty({ enum: DeliveryType })
  @IsEnum(DeliveryType)
  deliveryType!: DeliveryType;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @ApiPropertyOptional({
    description: 'Required for pickup/delivery if selecting a branch',
  })
  @IsOptional()
  @IsUUID('all')
  shopId?: string;

  @ApiPropertyOptional({ description: 'Required when deliveryType=DELIVERY' })
  @IsOptional()
  @IsString()
  deliveryAddress?: string;
}
