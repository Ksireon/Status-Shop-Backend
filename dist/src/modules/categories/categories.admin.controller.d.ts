import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesAdminController {
    private readonly categories;
    constructor(categories: CategoriesService);
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
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
    }[]>;
    get(id: string): Promise<{
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
    create(dto: CreateCategoryDto): Promise<{
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
    update(id: string, dto: UpdateCategoryDto): Promise<{
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
    remove(id: string): Promise<{
        ok: boolean;
    }>;
}
