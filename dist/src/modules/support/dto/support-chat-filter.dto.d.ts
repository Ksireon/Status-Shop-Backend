import { SupportChatStatus } from '@prisma/client';
export declare class SupportChatFilterDto {
    status?: SupportChatStatus;
    q?: string;
    skip?: number;
    take?: number;
}
