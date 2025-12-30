import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsObject, IsOptional, IsString } from 'class-validator'

export class CreateProductDto {
  @ApiProperty() @IsObject() name!: Record<string, string>
  @ApiProperty() @IsObject() description!: Record<string, string>
  @ApiProperty() @IsObject() type!: Record<string, string>
  @ApiProperty() @IsString() image!: string
  @ApiProperty() @IsObject() color!: Record<string, string>
  @ApiProperty() @IsNumber() price!: number
  @ApiProperty() @IsNumber() amount!: number
  @ApiProperty() @IsObject() characteristic!: Record<string, string>
  @ApiProperty() @IsString() tag!: string
  @ApiProperty() @IsOptional() @IsNumber() category_id?: number | null
}
