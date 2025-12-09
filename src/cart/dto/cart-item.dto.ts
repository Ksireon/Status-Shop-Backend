import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsObject, IsOptional, IsString } from 'class-validator'

export class CartItemDto {
  @ApiProperty() @IsObject() name!: Record<string, string>
  @ApiProperty() @IsObject() description!: Record<string, string>
  @ApiProperty() @IsString() type!: string
  @ApiProperty() @IsString() image!: string
  @ApiProperty() @IsString() color!: string
  @ApiProperty() @IsNumber() price!: number
  @ApiProperty() @IsNumber() quantity!: number
  @ApiProperty() @IsNumber() meters!: number
  @ApiProperty() @IsString() size!: string
  @ApiProperty() @IsNumber() total!: number
  @ApiProperty() @IsString() tag!: string
  @ApiProperty() @IsOptional() @IsString() createdAt?: string
}
