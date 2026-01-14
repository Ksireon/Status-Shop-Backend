import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SupportChatStatus, UserRole } from '@prisma/client';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import type { JwtUser } from '../../common/auth/current-user.decorator';
import { Roles } from '../../common/auth/roles.decorator';
import { RolesGuard } from '../../common/auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateSupportMessageDto } from './dto/create-message.dto';
import { SupportChatFilterDto } from './dto/support-chat-filter.dto';
import { UpdateSupportChatDto } from './dto/update-support-chat.dto';
import { SupportService } from './support.service';

@ApiTags('admin/support')
@ApiBearerAuth()
@Controller('support/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPPORT)
export class SupportAdminController {
  constructor(private readonly support: SupportService) {}

  @Get('chats')
  async listChats(@Query() filter: SupportChatFilterDto) {
    return this.support.adminListChats(filter);
  }

  @Get('chats/:chatId/messages')
  async listMessages(@Param('chatId') chatId: string) {
    return this.support.adminListMessages(chatId);
  }

  @Post('chats/:chatId/messages')
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  async sendMessage(
    @CurrentUser() current: JwtUser,
    @Param('chatId') chatId: string,
    @Body() dto: CreateSupportMessageDto,
  ) {
    return this.support.adminSendSupportMessage(current.sub, chatId, dto.text);
  }

  @Patch('chats/:chatId')
  async updateChat(
    @Param('chatId') chatId: string,
    @Body() dto: UpdateSupportChatDto,
  ) {
    const status: SupportChatStatus | undefined = dto.status;
    return this.support.adminUpdateChat(chatId, {
      status,
      assignedTo: dto.assignedTo,
    });
  }

  @Delete('chats/:chatId')
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  async closeChat(@Param('chatId') chatId: string) {
    return this.support.adminUpdateChat(chatId, {
      status: SupportChatStatus.CLOSED,
    });
  }
}
