import { Injectable, NotFoundException } from '@nestjs/common';
import { SupportSender } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  buildPaginationMeta,
  normalizePagination,
} from '../../common/utils/pagination';
import { AdminListSupportThreadsQuery } from './dto/admin-list-support-threads.query';

@Injectable()
export class AdminSupportService {
  constructor(private readonly prisma: PrismaService) {}

  listThreads(query: AdminListSupportThreadsQuery) {
    const { skip, take, page, limit } = normalizePagination(query);
    const where = {
      ...(query.isClosed !== undefined ? { isClosed: query.isClosed } : {}),
    };

    return this.prisma
      .$transaction([
        this.prisma.supportThread.count({ where }),
        this.prisma.supportThread.findMany({
          where,
          orderBy: { updatedAt: 'desc' },
          skip,
          take,
          include: {
            user: {
              select: { id: true, email: true, name: true, phone: true },
            },
            messages: { orderBy: { createdAt: 'desc' }, take: 1 },
          },
        }),
      ])
      .then(([total, items]) => ({
        data: items,
        meta: buildPaginationMeta(page, limit, total),
      }));
  }

  async getThread(threadId: string) {
    const thread = await this.prisma.supportThread.findUnique({
      where: { id: threadId },
      include: {
        user: { select: { id: true, email: true, name: true, phone: true } },
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!thread) throw new NotFoundException('Support thread not found');
    return thread;
  }

  async sendSupportMessage(threadId: string, text: string) {
    await this.getThread(threadId);
    const msg = await this.prisma.supportMessage.create({
      data: {
        threadId,
        sender: SupportSender.SUPPORT,
        text,
      },
    });
    await this.prisma.supportThread.update({
      where: { id: threadId },
      data: { updatedAt: new Date() },
    });
    return msg;
  }

  async closeThread(threadId: string) {
    await this.getThread(threadId);
    return this.prisma.supportThread.update({
      where: { id: threadId },
      data: { isClosed: true },
    });
  }

  async getThreadMessages(threadId: string) {
    const thread = await this.prisma.supportThread.findUnique({
      where: { id: threadId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!thread) throw new NotFoundException('Support thread not found');
    return thread.messages;
  }
}
