import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true
  }
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: any
  handleConnection(client: any) {}
  handleDisconnect(client: any) {}

  @SubscribeMessage('subscribe')
  async onSubscribe(client: any, payload: { room_id: string }) {
    if (payload?.room_id) {
      client.join(payload.room_id)
      client.emit('subscribed', { room_id: payload.room_id })
    }
  }

  @SubscribeMessage('chat.send')
  async onSend(client: any, payload: { room_id: string, content: string, sender_type?: 'user' | 'staff' }) {
    const room = payload?.room_id
    const content = (payload?.content || '').trim()
    if (!room || !content) return
    const msg = { room_id: room, content, sender_type: payload?.sender_type || 'user', created_at: new Date().toISOString() }
    this.server.to(room).emit('chat.message', msg)
  }

  emitMessage(room_id: string, data: any) {
    this.server?.to(room_id).emit('chat.message', data)
  }
}
