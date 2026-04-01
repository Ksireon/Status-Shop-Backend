import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class AdminUpdateProductImageDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  sort?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  label?: string | null;
}
