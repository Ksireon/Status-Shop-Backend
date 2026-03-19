import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, UseGuards } from '@nestjs/common';
import { SupportService } from './support.service';
import { AdminSupportService } from './admin-support.service';
import { WsJwtGuard } from './guards/ws-jwt.guard';

interface ChatMessage {
  threadId: string;
  text: string;
}

interface JoinThreadPayload {
  threadId: string;
}

@Injectable()
@WebSocketGateway({
  namespace: 'support',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class SupportGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly supportService: SupportService,
    private readonly adminSupportService: AdminSupportService,
  ) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('join_thread')
  async handleJoinThread(
    @MessageBody() payload: JoinThreadPayload,
    @ConnectedSocket() client: Socket,
  ) {
    const { threadId } = payload;
    client.join(`thread:${threadId}`);
    
    // Send existing messages
    const messages = await this.adminSupportService.getThreadMessages(threadId);
    client.emit('message_history', messages);
    
    return { status: 'joined', threadId };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('leave_thread')
  handleLeaveThread(
    @MessageBody() payload: JoinThreadPayload,
    @ConnectedSocket() client: Socket,
  ) {
    const { threadId } = payload;
    client.leave(`thread:${threadId}`);
    return { status: 'left', threadId };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('send_message')
  async handleSendMessage(
    @MessageBody() payload: ChatMessage,
    @ConnectedSocket() client: Socket,
  ) {
    const { threadId, text } = payload;
    const userId = client.data.user.sub;
    const userRole = client.data.user.role;
    
    let message;
    
    // Determine if it's an admin or user message
    if (userRole === 'MANAGER' || userRole === 'BRANCH_DIRECTOR' || userRole === 'OWNER') {
      // Admin message
      message = await this.adminSupportService.sendSupportMessage(threadId, text);
    } else {
      // User message
      message = await this.supportService.sendUserMessage(userId, text);
    }
    
    // Broadcast to all clients in the thread
    this.server.to(`thread:${threadId}`).emit('new_message', message);
    
    // Also broadcast to admin room for real-time updates
    this.server.to('admins').emit('new_message', { threadId, message });
    
    return { status: 'sent', message };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() payload: { threadId: string; isTyping: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    const { threadId, isTyping } = payload;
    const userName = client.data.user.name || client.data.user.email;
    
    client.to(`thread:${threadId}`).emit('typing', {
      threadId,
      userName,
      isTyping,
    });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('join_admin_room')
  handleJoinAdminRoom(@ConnectedSocket() client: Socket) {
    const userRole = client.data.user.role;
    
    if (userRole === 'MANAGER' || userRole === 'BRANCH_DIRECTOR' || userRole === 'OWNER') {
      client.join('admins');
      return { status: 'joined_admin_room' };
    }
    
    return { status: 'unauthorized' };
  }
}
