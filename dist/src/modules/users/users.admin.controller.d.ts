import type { JwtUser } from '../../common/auth/current-user.decorator';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { UserFilterDto } from './dto/user-filter.dto';
import { UsersService } from './users.service';
export declare class UsersAdminController {
    private readonly users;
    constructor(users: UsersService);
    list(filter: UserFilterDto): Promise<{
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
    get(id: string): Promise<{
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
    update(current: JwtUser, id: string, dto: AdminUpdateUserDto): Promise<{
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
    create(current: JwtUser, dto: AdminCreateUserDto): Promise<{
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
    deactivate(id: string): Promise<{
        ok: boolean;
    }>;
}
