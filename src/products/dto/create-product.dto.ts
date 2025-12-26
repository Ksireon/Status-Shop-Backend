import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsObject, IsOptional, IsString } from 'class-validator'

export class CreateProductDto {
  @ApiProperty() @IsObject() name!: Record<string, string>
  @ApiProperty() @IsObject() description!: Record<string, string>
  @ApiProperty() @IsString() type!: string
  @ApiProperty() @IsString() image!: string
  @ApiProperty() @IsString() color!: string
  @ApiProperty() @IsNumber() price!: number
  @ApiProperty() @IsNumber() amount!: number
  @ApiProperty() @IsString() characteristic!: string
  @ApiProperty() @IsString() tag!: string
  @ApiProperty() @IsOptional() @IsNumber() category_id?: number | null
}

