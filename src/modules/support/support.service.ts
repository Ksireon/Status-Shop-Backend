import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MessageSender, Prisma, SupportChatStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SupportChatFilterDto } from './dto/support-chat-filter.dto';

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

  async adminListChats(filter: SupportChatFilterDto) {
    const where: Prisma.SupportChatWhereInput = {
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.q
        ? {
            user: {
              OR: [
                { email: { contains: filter.q, mode: 'insensitive' } },
                { name: { contains: filter.q, mode: 'insensitive' } },
                { surname: { contains: filter.q, mode: 'insensitive' } },
                { phone: { contains: filter.q, mode: 'insensitive' } },
              ],
            },
          }
        : {}),
    };

    const chats = await this.prisma.supportChat.findMany({
      where,
      include: { user: { select: { id: true, email: true, name: true, surname: true, phone: true } } },
      orderBy: { updatedAt: 'desc' },
      skip: filter.skip ?? 0,
      take: filter.take ?? 50,
    });

    return chats.map((c) => ({
      id: c.id,
      status: c.status,
      assignedTo: c.assignedTo,
      user: c.user,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      closedAt: c.closedAt ? c.closedAt.toISOString() : null,
    }));
  }

  async adminListMessages(chatId: string) {
    const chat = await this.prisma.supportChat.findUnique({ where: { id: chatId }, select: { id: true } });
    if (!chat) throw new NotFoundException('Chat not found');

    const messages = await this.prisma.supportMessage.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
    });

    return messages.map((m) => ({
      id: m.id,
      chatId: m.chatId,
      sender: m.sender,
      text: m.text,
      isRead: m.isRead,
      createdAt: m.createdAt.toISOString(),
    }));
  }

  async adminSendSupportMessage(supportUserId: string, chatId: string, text: string) {
    const chat = await this.prisma.supportChat.findUnique({ where: { id: chatId } });
    if (!chat) throw new NotFoundException('Chat not found');

    const supportUser = await this.prisma.user.findUnique({
      where: { id: supportUserId },
      select: { id: true, role: true, isActive: true },
    });
    if (!supportUser || !supportUser.isActive) throw new BadRequestException('Invalid support user');
    if (supportUser.role !== UserRole.SUPPORT && supportUser.role !== UserRole.ADMIN)
      throw new BadRequestException('User is not support');

    const msg = await this.prisma.supportMessage.create({
      data: {
        chat: { connect: { id: chatId } },
        user: { connect: { id: chat.userId } },
        sender: MessageSender.SUPPORT,
        text,
      },
    });

    await this.prisma.supportChat.update({
      where: { id: chatId },
      data: { status: SupportChatStatus.IN_PROGRESS, assignedTo: chat.assignedTo ?? supportUserId },
    });

    return {
      id: msg.id,
      chatId: msg.chatId,
      sender: msg.sender,
      text: msg.text,
      createdAt: msg.createdAt.toISOString(),
    };
  }

  async adminUpdateChat(chatId: string, patch: { status?: SupportChatStatus; assignedTo?: string }) {
    const chat = await this.prisma.supportChat.findUnique({ where: { id: chatId } });
    if (!chat) throw new NotFoundException('Chat not found');

    if (patch.assignedTo !== undefined && patch.assignedTo !== null && patch.assignedTo !== '') {
      const supportUser = await this.prisma.user.findUnique({
        where: { id: patch.assignedTo },
        select: { id: true, role: true, isActive: true },
      });
      if (!supportUser || !supportUser.isActive) throw new BadRequestException('Invalid assignedTo');
      if (supportUser.role !== UserRole.SUPPORT && supportUser.role !== UserRole.ADMIN)
        throw new BadRequestException('assignedTo must be SUPPORT');
    }

    const updated = await this.prisma.supportChat.update({
      where: { id: chatId },
      data: {
        status: patch.status,
        assignedTo: patch.assignedTo,
        closedAt: patch.status === SupportChatStatus.CLOSED ? new Date() : undefined,
      },
      include: { user: { select: { id: true, email: true, name: true, surname: true, phone: true } } },
    });

    return {
      id: updated.id,
      status: updated.status,
      assignedTo: updated.assignedTo,
      user: updated.user,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      closedAt: updated.closedAt ? updated.closedAt.toISOString() : null,
    };
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
