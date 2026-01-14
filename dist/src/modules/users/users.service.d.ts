import { PrismaService } from '../prisma/prisma.service';
import { JwtUser } from '../../common/auth/current-user.decorator';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { UserFilterDto } from './dto/user-filter.dto';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getMe(userId: string): Promise<{
        id: string;
        email: string;
        name: string;
        surname: string;
        company: string | null;
        position: string | null;
        city: string;
        phone: string;
        role: import("@prisma/client").$Enums.UserRole;
    }>;
    updateMe(userId: string, dto: UpdateMeDto): Promise<{
        id: string;
        email: string;
        name: string;
        surname: string;
        company: string | null;
        position: string | null;
        city: string;
        phone: string;
        role: import("@prisma/client").$Enums.UserRole;
    }>;
    adminList(filter: UserFilterDto): Promise<{
        createdAt: string;
        updatedAt: string;
        id: string;
        email: string;
        name: string;
        surname: string;
        company: string | null;
        position: string | null;
        city: string;
        phone: string;
        role: import("@prisma/client").$Enums.UserRole;
        isActive: boolean;
    }[]>;
    adminGet(id: string): Promise<{
        createdAt: string;
        updatedAt: string;
        id: string;
        email: string;
        name: string;
        surname: string;
        company: string | null;
        position: string | null;
        city: string;
        phone: string;
        role: import("@prisma/client").$Enums.UserRole;
        isActive: boolean;
    }>;
    adminUpdate(current: JwtUser, id: string, dto: AdminUpdateUserDto): Promise<{
        createdAt: string;
        updatedAt: string;
        id: string;
        email: string;
        name: string;
        surname: string;
        company: string | null;
        position: string | null;
        city: string;
        phone: string;
        role: import("@prisma/client").$Enums.UserRole;
        isActive: boolean;
    }>;
    adminCreate(current: JwtUser, dto: AdminCreateUserDto): Promise<{
        createdAt: string;
        updatedAt: string;
        id: string;
        email: string;
        name: string;
        surname: string;
        company: string | null;
        position: string | null;
        city: string;
        phone: string;
        role: import("@prisma/client").$Enums.UserRole;
        isActive: boolean;
    }>;
    adminDeactivate(id: string): Promise<{
        ok: boolean;
    }>;
}
