"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let SupportService = class SupportService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async sendUserMessage(userId, text) {
        const chat = await this.getOrCreateChat(userId);
        const msg = await this.prisma.supportMessage.create({
            data: {
                chat: { connect: { id: chat.id } },
                user: { connect: { id: userId } },
                sender: client_1.MessageSender.USER,
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
    async listMyMessages(userId) {
        const chat = await this.prisma.supportChat.findFirst({
            where: {
                userId,
                status: { in: [client_1.SupportChatStatus.OPEN, client_1.SupportChatStatus.IN_PROGRESS] },
            },
            orderBy: { updatedAt: 'desc' },
        });
        if (!chat)
            return [];
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
    async adminListChats(filter) {
        const where = {
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
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        surname: true,
                        phone: true,
                    },
                },
            },
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
    async adminListMessages(chatId) {
        const chat = await this.prisma.supportChat.findUnique({
            where: { id: chatId },
            select: { id: true },
        });
        if (!chat)
            throw new common_1.NotFoundException('Chat not found');
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
    async adminSendSupportMessage(supportUserId, chatId, text) {
        const chat = await this.prisma.supportChat.findUnique({
            where: { id: chatId },
        });
        if (!chat)
            throw new common_1.NotFoundException('Chat not found');
        const supportUser = await this.prisma.user.findUnique({
            where: { id: supportUserId },
            select: { id: true, role: true, isActive: true },
        });
        if (!supportUser || !supportUser.isActive)
            throw new common_1.BadRequestException('Invalid support user');
        if (supportUser.role !== client_1.UserRole.SUPPORT &&
            supportUser.role !== client_1.UserRole.ADMIN)
            throw new common_1.BadRequestException('User is not support');
        const msg = await this.prisma.supportMessage.create({
            data: {
                chat: { connect: { id: chatId } },
                user: { connect: { id: chat.userId } },
                sender: client_1.MessageSender.SUPPORT,
                text,
            },
        });
        await this.prisma.supportChat.update({
            where: { id: chatId },
            data: {
                status: client_1.SupportChatStatus.IN_PROGRESS,
                assignedTo: chat.assignedTo ?? supportUserId,
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
    async adminUpdateChat(chatId, patch) {
        const chat = await this.prisma.supportChat.findUnique({
            where: { id: chatId },
        });
        if (!chat)
            throw new common_1.NotFoundException('Chat not found');
        if (patch.assignedTo !== undefined &&
            patch.assignedTo !== null &&
            patch.assignedTo !== '') {
            const supportUser = await this.prisma.user.findUnique({
                where: { id: patch.assignedTo },
                select: { id: true, role: true, isActive: true },
            });
            if (!supportUser || !supportUser.isActive)
                throw new common_1.BadRequestException('Invalid assignedTo');
            if (supportUser.role !== client_1.UserRole.SUPPORT &&
                supportUser.role !== client_1.UserRole.ADMIN)
                throw new common_1.BadRequestException('assignedTo must be SUPPORT');
        }
        const updated = await this.prisma.supportChat.update({
            where: { id: chatId },
            data: {
                status: patch.status,
                assignedTo: patch.assignedTo,
                closedAt: patch.status === client_1.SupportChatStatus.CLOSED ? new Date() : undefined,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        surname: true,
                        phone: true,
                    },
                },
            },
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
    async getOrCreateChat(userId) {
        const existing = await this.prisma.supportChat.findFirst({
            where: {
                userId,
                status: { in: [client_1.SupportChatStatus.OPEN, client_1.SupportChatStatus.IN_PROGRESS] },
            },
            orderBy: { updatedAt: 'desc' },
        });
        if (existing)
            return existing;
        return this.prisma.supportChat.create({
            data: {
                user: { connect: { id: userId } },
                status: client_1.SupportChatStatus.OPEN,
            },
        });
    }
};
exports.SupportService = SupportService;
exports.SupportService = SupportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SupportService);
//# sourceMappingURL=support.service.js.map