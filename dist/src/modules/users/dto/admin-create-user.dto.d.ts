import { UserRole } from '@prisma/client';
export declare class AdminCreateUserDto {
    email: string;
    password: string;
    role: UserRole;
    name: string;
    surname: string;
    phone: string;
    city: string;
    company?: string;
    position?: string;
    isActive?: boolean;
}
