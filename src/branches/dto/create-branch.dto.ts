import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class CreateBranchDto {
  @ApiProperty() @IsString() name!: string
  @ApiProperty() @IsString() @IsOptional() city?: string
  @ApiProperty() @IsString() @IsOptional() address?: string
  @ApiProperty() @IsString() @IsOptional() phone?: string
  @ApiProperty() @IsString() @IsOptional() card_number?: string
}

