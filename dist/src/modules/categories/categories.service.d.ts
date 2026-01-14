import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(): Promise<{
        id: string;
        key: string;
        name: {
            ru: string;
            uz: string;
            en: string;
        };
        icon: string | null;
        sortOrder: number;
    }[]>;
    adminList(): Promise<{
        id: string;
        key: string;
        name: {
            ru: string;
            uz: string;
            en: string;
        };
        icon: string | null;
        sortOrder: number;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
    }[]>;
    adminGet(id: string): Promise<{
        id: string;
        key: string;
        name: {
            ru: string;
            uz: string;
            en: string;
        };
        icon: string | null;
        sortOrder: number;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
    }>;
    adminCreate(dto: CreateCategoryDto): Promise<{
        id: string;
        key: string;
        name: {
            ru: string;
            uz: string;
            en: string;
        };
        icon: string | null;
        sortOrder: number;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
    }>;
    adminUpdate(id: string, dto: UpdateCategoryDto): Promise<{
        id: string;
        key: string;
        name: {
            ru: string;
            uz: string;
            en: string;
        };
        icon: string | null;
        sortOrder: number;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
    }>;
    adminDelete(id: string): Promise<{
        ok: boolean;
    }>;
}
