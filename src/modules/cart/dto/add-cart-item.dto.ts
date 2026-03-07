import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class AddCartItemDto {
  @ApiProperty()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.toLowerCase().trim() : value,
  )
  @Matches(UUID_REGEX, { message: 'productId must be a valid UUID' })
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
  @IsNumber()
  @Min(0.1)
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
