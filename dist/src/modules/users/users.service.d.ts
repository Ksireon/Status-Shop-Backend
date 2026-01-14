import { PrismaService } from '../prisma/prisma.service';
import { UpdateMeDto } from './dto/update-me.dto';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getMe(userId: string): Promise<{
        id: string;
        name: string;
        phone: string;
        email: string;
        surname: string;
        company: string | null;
        position: string | null;
        city: string;
        role: import("@prisma/client").$Enums.UserRole;
    }>;
    updateMe(userId: string, dto: UpdateMeDto): Promise<{
        id: string;
        name: string;
        phone: string;
        email: string;
        surname: string;
        company: string | null;
        position: string | null;
        city: string;
        role: import("@prisma/client").$Enums.UserRole;
    }>;
}
