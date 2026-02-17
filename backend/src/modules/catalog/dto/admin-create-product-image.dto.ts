import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class AdminCreateProductImageDto {
  @ApiProperty({ example: 'https://example.com/images/tshirt.png' })
  @IsString()
  url!: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sort?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  label?: string;
}
