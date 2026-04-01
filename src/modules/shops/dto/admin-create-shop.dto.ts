import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class AdminCreateShopDto {
  @ApiProperty({ example: 'main' })
  @IsString()
  @MinLength(2)
  key!: string;

  @ApiPropertyOptional({
    example: { ru: 'Главный филиал', uz: 'Asosiy filial', en: 'Main branch' },
  })
  @IsOptional()
  @IsObject()
  name?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'Tashkent, Example street 1' })
  @IsString()
  address!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hours?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lat?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lng?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
