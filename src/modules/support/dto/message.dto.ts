import { ApiProperty } from '@nestjs/swagger';
import { MessageSender } from '@prisma/client';

export class SupportMessageDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  chatId: string;

  @ApiProperty({ enum: MessageSender })
  sender: MessageSender;

  @ApiProperty()
  text: string;

  @ApiProperty()
  createdAt: string;
}
