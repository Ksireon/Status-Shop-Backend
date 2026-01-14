import { UserRole } from '@prisma/client';
export declare class UserFilterDto {
    q?: string;
    role?: UserRole;
    isActive?: boolean;
    skip?: number;
    take?: number;
}
