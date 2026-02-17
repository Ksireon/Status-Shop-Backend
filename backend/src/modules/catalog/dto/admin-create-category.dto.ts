import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString, MinLength } from 'class-validator';

export class AdminCreateCategoryDto {
  @ApiProperty({ example: 'textile' })
  @IsString()
  @MinLength(2)
  slug!: string;

  @ApiProperty({
    example: { ru: 'Текстиль', uz: 'Tekstil', en: 'Textile' },
  })
  @IsObject()
  name!: Record<string, unknown>;
}
