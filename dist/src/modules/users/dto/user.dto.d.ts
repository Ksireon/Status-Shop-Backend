import { UserRole } from '@prisma/client';
export declare class UserDto {
    id: string;
    email: string;
    name: string;
    surname: string;
    company?: string | null;
    position?: string | null;
    city: string;
    phone: string;
    role: UserRole;
}
