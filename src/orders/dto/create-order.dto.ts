import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsEmail, IsNumber, IsOptional, IsString } from 'class-validator'
import { CartItemDto } from '../../cart/dto/cart-item.dto'

export class CreateOrderDto {
  @ApiProperty() @IsString() uid!: string
  @ApiProperty() @IsEmail() email!: string
  @ApiProperty() @IsString() name!: string
  @ApiProperty() @IsString() phone!: string
  @ApiProperty() @IsString() branch!: string
  @ApiProperty() @IsString() branch_key!: string
  @ApiProperty() @IsString() branch_address!: string
  @ApiProperty() @IsString() delivery_type!: string
  @ApiProperty() @IsOptional() @IsString() delivery_address?: string
  @ApiProperty() @IsString() payment_method!: string
  @ApiProperty() @IsNumber() total!: number
  @ApiProperty({ type: [CartItemDto] }) @IsArray() items!: CartItemDto[]
}
