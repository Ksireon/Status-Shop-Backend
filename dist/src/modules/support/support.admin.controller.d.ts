import type { JwtUser } from '../../common/auth/current-user.decorator';
import { CreateSupportMessageDto } from './dto/create-message.dto';
import { SupportChatFilterDto } from './dto/support-chat-filter.dto';
import { UpdateSupportChatDto } from './dto/update-support-chat.dto';
import { SupportService } from './support.service';
export declare class SupportAdminController {
    private readonly support;
    constructor(support: SupportService);
    listChats(filter: SupportChatFilterDto): Promise<{
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
    listMessages(chatId: string): Promise<{
        id: string;
        chatId: string;
        sender: import("@prisma/client").$Enums.MessageSender;
        text: string;
        isRead: boolean;
        createdAt: string;
    }[]>;
    sendMessage(current: JwtUser, chatId: string, dto: CreateSupportMessageDto): Promise<{
        id: string;
        chatId: string;
        sender: import("@prisma/client").$Enums.MessageSender;
        text: string;
        createdAt: string;
    }>;
    updateChat(chatId: string, dto: UpdateSupportChatDto): Promise<{
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
    closeChat(chatId: string): Promise<{
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
}
