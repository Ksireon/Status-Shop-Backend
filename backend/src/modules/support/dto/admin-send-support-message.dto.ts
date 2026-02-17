import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class AdminSendSupportMessageDto {
  @ApiProperty({ example: 'Здравствуйте! Чем могу помочь?' })
  @IsString()
  @MinLength(1)
  text!: string;
}
