import { UserRole } from '@prisma/client';
export declare class AdminUpdateUserDto {
    name?: string;
    surname?: string;
    company?: string;
    position?: string;
    city?: string;
    phone?: string;
    isActive?: boolean;
    role?: UserRole;
}
