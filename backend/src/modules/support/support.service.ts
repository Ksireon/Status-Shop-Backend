import { Injectable } from '@nestjs/common';
import { SupportSender } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateThread(userId: string) {
    return this.prisma.supportThread.upsert({
      where: { userId },
      create: { userId },
      update: {},
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
  }

  async listMessages(userId: string) {
    const thread = await this.getOrCreateThread(userId);
    return thread.messages;
  }

  async sendUserMessage(userId: string, text: string) {
    const thread = await this.getOrCreateThread(userId);
    const msg = await this.prisma.supportMessage.create({
      data: {
        threadId: thread.id,
        userId,
        sender: SupportSender.USER,
        text,
      },
    });
    await this.prisma.supportThread.update({
      where: { id: thread.id },
      data: { updatedAt: new Date() },
    });
    return msg;
  }
}
