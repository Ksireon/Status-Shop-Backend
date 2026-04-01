import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString, MinLength } from 'class-validator';

export class AdminUpdateCategoryDto {
  @ApiPropertyOptional({ example: 'textile' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  slug?: string;

  @ApiPropertyOptional({
    example: { ru: 'Текстиль', uz: 'Tekstil', en: 'Textile' },
  })
  @IsOptional()
  @IsObject()
  name?: Record<string, unknown>;
}
