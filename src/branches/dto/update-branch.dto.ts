import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class UpdateBranchDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string
  @ApiPropertyOptional() @IsOptional() @IsString() city?: string
  @ApiPropertyOptional() @IsOptional() @IsString() address?: string
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string
  @ApiPropertyOptional() @IsOptional() @IsString() card_number?: string
}

