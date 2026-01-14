import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import type { JwtUser } from '../../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateSupportMessageDto } from './dto/create-message.dto';
import { SupportMessageDto } from './dto/message.dto';
import { SupportService } from './support.service';

@ApiTags('support')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('support')
export class SupportController {
  constructor(private readonly support: SupportService) {}

  @Get('messages')
  async myMessages(@CurrentUser() user: JwtUser): Promise<SupportMessageDto[]> {
    return this.support.listMyMessages(user.sub);
  }

  @Post('messages')
  async send(
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateSupportMessageDto,
  ): Promise<SupportMessageDto> {
    return this.support.sendUserMessage(user.sub, dto.text);
  }
}
