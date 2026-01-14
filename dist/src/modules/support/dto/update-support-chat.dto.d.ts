import { SupportChatStatus } from '@prisma/client';
export declare class UpdateSupportChatDto {
    status?: SupportChatStatus;
    assignedTo?: string;
}
