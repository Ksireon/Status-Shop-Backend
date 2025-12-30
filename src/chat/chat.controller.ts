import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ChatService } from './chat.service'

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @Post('init')
  init(@Body('user_id') user_id: string) {
    return this.chat.ensureRoom(user_id)
  }

  @Get('rooms/:id/messages')
  messages(@Param('id') id: string, @Query('limit') limit?: string) {
    const l = limit ? parseInt(limit) : 100
    return this.chat.listMessages(id, l)
  }

  @Post('rooms/:id/messages')
  send(@Param('id') id: string, @Body() body: { sender_type: 'user' | 'staff', sender_id?: string, content: string }) {
    return this.chat.sendMessage(id, body)
  }
}
