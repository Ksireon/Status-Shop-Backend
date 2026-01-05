import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNumber, IsObject, IsOptional, IsString, ValidateIf } from 'class-validator'

export class CartItemDto {
  @ApiProperty() @IsObject() name!: Record<string, string>
  @ApiProperty() @IsObject() description!: Record<string, string>

  @ApiProperty()
  @ValidateIf((_, v) => typeof v === 'string')
  @IsString()
  @ValidateIf((_, v) => typeof v === 'object' && v !== null)
  @IsObject()
  type!: any

  @ApiProperty() @IsString() image!: string
  @ApiProperty() @IsString() color!: string
  @ApiProperty() @IsNumber() price!: number
  @ApiProperty() @IsNumber() quantity!: number

  @ApiProperty() @IsString() product_tag!: string

  @ApiPropertyOptional() @IsOptional() @IsNumber() meters?: number
  @ApiPropertyOptional() @IsOptional() @IsString() size?: string

  @ApiPropertyOptional() @IsOptional() @IsNumber() amount?: number
  @ApiPropertyOptional() @IsOptional() @IsString() characteristic?: string

  @ApiProperty() @IsNumber() total!: number
  @ApiProperty() @IsString() tag!: string
  @ApiProperty() @IsOptional() @IsString() createdAt?: string
}
