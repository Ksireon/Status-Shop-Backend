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
            where: { userId, status: { in: [client_1.SupportChatStatus.OPEN, client_1.SupportChatStatus.IN_PROGRESS] } },
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