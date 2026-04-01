import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { JwtPayload } from '../../common/types/jwt-payload';
import { SendMessageDto } from './dto/send-message.dto';
import { SupportService } from './support.service';

@ApiTags('support')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('support')
export class SupportController {
  constructor(private readonly support: SupportService) {}

  @Get('thread')
  thread(@CurrentUser() user: JwtPayload) {
    return this.support.getOrCreateThread(user.sub);
  }

  @Get('messages')
  messages(@CurrentUser() user: JwtPayload) {
    return this.support.listMessages(user.sub);
  }

  @Post('messages')
  async send(@CurrentUser() user: JwtPayload, @Body() dto: SendMessageDto) {
    const message = await this.support.sendUserMessage(user.sub, dto.text);
    return { message };
  }
}
