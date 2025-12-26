import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsNumber, IsObject, IsOptional, IsString } from 'class-validator'

export class UpdateProductDto {
  @ApiPropertyOptional() @IsOptional() @IsObject() name?: Record<string, string>
  @ApiPropertyOptional() @IsOptional() @IsObject() description?: Record<string, string>
  @ApiPropertyOptional() @IsOptional() @IsString() type?: string
  @ApiPropertyOptional() @IsOptional() @IsString() image?: string
  @ApiPropertyOptional() @IsOptional() @IsString() color?: string
  @ApiPropertyOptional() @IsOptional() @IsNumber() price?: number
  @ApiPropertyOptional() @IsOptional() @IsNumber() amount?: number
  @ApiPropertyOptional() @IsOptional() @IsString() characteristic?: string
  @ApiPropertyOptional() @IsOptional() @IsString() tag?: string
  @ApiPropertyOptional() @IsOptional() @IsNumber() category_id?: number | null
}

