import { MessageSender } from '@prisma/client';
export declare class SupportMessageDto {
    id: string;
    chatId: string;
    sender: MessageSender;
    text: string;
    createdAt: string;
}
