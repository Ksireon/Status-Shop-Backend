import { PrismaService } from '../prisma/prisma.service';
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
    private getOrCreateChat;
}
