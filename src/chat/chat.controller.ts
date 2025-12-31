import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ChatService } from './chat.service'

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @Get('rooms')
  rooms(@Query('status') status?: string, @Query('assigned_role') role?: 'owner' | 'director' | 'manager', @Query('limit') limit?: string) {
    const l = limit ? parseInt(limit) : 200
    return this.chat.listRooms({ status, assigned_role: role, limit: l })
  }

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

  @Post('rooms/:id/assign')
  assign(@Param('id') id: string, @Body() body: { assigned_role: 'owner' | 'director' | 'manager', assigned_staff_id?: string | null }) {
    return this.chat.assignRoom(id, body)
  }

  @Post('rooms/:id/close')
  close(@Param('id') id: string) {
    return this.chat.closeRoom(id)
  }
}
