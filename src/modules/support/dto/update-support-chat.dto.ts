import { ApiPropertyOptional } from '@nestjs/swagger';
import { SupportChatStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateSupportChatDto {
  @ApiPropertyOptional({ enum: SupportChatStatus })
  @IsOptional()
  @IsEnum(SupportChatStatus)
  status?: SupportChatStatus;

  @ApiPropertyOptional({ description: 'Support userId' })
  @IsOptional()
  @IsString()
  assignedTo?: string;
}

