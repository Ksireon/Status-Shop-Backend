import { SupportChatStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SupportChatFilterDto } from './dto/support-chat-filter.dto';
export declare class SupportService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    sendUserMessage(userId: string, text: string): Promise<{
        id: string;
        chatId: string;
        sender: import("@prisma/client").$Enums.MessageSender;
        text: string;
        createdAt: string;
    }>;
    listMyMessages(userId: string): Promise<{
        id: string;
        chatId: string;
        sender: import("@prisma/client").$Enums.MessageSender;
        text: string;
        createdAt: string;
    }[]>;
    adminListChats(filter: SupportChatFilterDto): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.SupportChatStatus;
        assignedTo: string | null;
        user: {
            id: string;
            email: string;
            name: string;
            surname: string;
            phone: string;
        };
        createdAt: string;
        updatedAt: string;
        closedAt: string | null;
    }[]>;
    adminListMessages(chatId: string): Promise<{
        id: string;
        chatId: string;
        sender: import("@prisma/client").$Enums.MessageSender;
        text: string;
        isRead: boolean;
        createdAt: string;
    }[]>;
    adminSendSupportMessage(supportUserId: string, chatId: string, text: string): Promise<{
        id: string;
        chatId: string;
        sender: import("@prisma/client").$Enums.MessageSender;
        text: string;
        createdAt: string;
    }>;
    adminUpdateChat(chatId: string, patch: {
        status?: SupportChatStatus;
        assignedTo?: string;
    }): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.SupportChatStatus;
        assignedTo: string | null;
        user: {
            id: string;
            email: string;
            name: string;
            surname: string;
            phone: string;
        };
        createdAt: string;
        updatedAt: string;
        closedAt: string | null;
    }>;
    private getOrCreateChat;
}
