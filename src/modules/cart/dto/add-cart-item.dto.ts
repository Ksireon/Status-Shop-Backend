import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class AddCartItemDto {
  @ApiProperty()
  @IsUUID()
  productId!: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === null ? undefined : Number(value),
  )
  @IsInt()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional({ description: 'For vinyl (meters)' })
  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === null ? undefined : Number(value),
  )
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(0.01)
  meters?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  size?: string;

  @ApiPropertyOptional({
    description: 'Selected image url or variant image url',
  })
  @IsOptional()
  @IsString()
  selectedImageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  colorLabel?: string;
}
