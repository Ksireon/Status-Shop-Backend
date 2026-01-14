import { Injectable } from '@nestjs/common';
import { MessageSender, SupportChatStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

  async sendUserMessage(userId: string, text: string) {
    const chat = await this.getOrCreateChat(userId);

    const msg = await this.prisma.supportMessage.create({
      data: {
        chat: { connect: { id: chat.id } },
        user: { connect: { id: userId } },
        sender: MessageSender.USER,
        text,
      },
    });

    return {
      id: msg.id,
      chatId: msg.chatId,
      sender: msg.sender,
      text: msg.text,
      createdAt: msg.createdAt.toISOString(),
    };
  }

  async listMyMessages(userId: string) {
    const chat = await this.prisma.supportChat.findFirst({
      where: { userId, status: { in: [SupportChatStatus.OPEN, SupportChatStatus.IN_PROGRESS] } },
      orderBy: { updatedAt: 'desc' },
    });

    if (!chat) return [];

    const messages = await this.prisma.supportMessage.findMany({
      where: { chatId: chat.id },
      orderBy: { createdAt: 'asc' },
    });

    return messages.map((m) => ({
      id: m.id,
      chatId: m.chatId,
      sender: m.sender,
      text: m.text,
      createdAt: m.createdAt.toISOString(),
    }));
  }

  private async getOrCreateChat(userId: string) {
    const existing = await this.prisma.supportChat.findFirst({
      where: {
        userId,
        status: { in: [SupportChatStatus.OPEN, SupportChatStatus.IN_PROGRESS] },
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (existing) return existing;

    return this.prisma.supportChat.create({
      data: {
        user: { connect: { id: userId } },
        status: SupportChatStatus.OPEN,
      },
    });
  }
}

