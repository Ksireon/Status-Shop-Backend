import { ApiPropertyOptional } from '@nestjs/swagger';
import { SupportChatStatus } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class SupportChatFilterDto {
  @ApiPropertyOptional({ enum: SupportChatStatus })
  @IsOptional()
  @IsEnum(SupportChatStatus)
  status?: SupportChatStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  skip?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  take?: number;
}
