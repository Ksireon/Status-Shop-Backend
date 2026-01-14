import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(filter: ProductFilterDto): Promise<{
        id: string;
        type: string;
        categoryKey: string;
        unit: import("@prisma/client").$Enums.ProductUnit;
        name: {
            ru: string;
            uz: string;
            en: string;
        };
        description: {
            ru: string;
            uz: string;
            en: string;
        };
        price: number;
        images: string[];
        sizes: string[];
        colors: string[];
        characteristics: Prisma.JsonValue;
        isFeatured: boolean;
    }[]>;
    getById(id: string): Promise<{
        id: string;
        type: string;
        categoryKey: string;
        unit: import("@prisma/client").$Enums.ProductUnit;
        name: {
            ru: string;
            uz: string;
            en: string;
        };
        description: {
            ru: string;
            uz: string;
            en: string;
        };
        price: number;
        images: string[];
        sizes: string[];
        colors: string[];
        characteristics: Prisma.JsonValue;
        isFeatured: boolean;
    }>;
    adminList(filter: ProductFilterDto): Promise<{
        id: string;
        type: string;
        unit: import("@prisma/client").$Enums.ProductUnit;
        categoryKey: string;
        name: {
            ru: string;
            uz: string;
            en: string;
        };
        description: {
            ru: string;
            uz: string;
            en: string;
        };
        price: number;
        images: string[];
        sizes: string[];
        colors: string[];
        characteristics: Prisma.JsonValue;
        stock: number;
        isActive: boolean;
        isFeatured: boolean;
        sortOrder: number;
        createdAt: string;
        updatedAt: string;
    }[]>;
    adminGet(id: string): Promise<{
        id: string;
        type: string;
        unit: import("@prisma/client").$Enums.ProductUnit;
        categoryKey: string;
        name: {
            ru: string;
            uz: string;
            en: string;
        };
        description: {
            ru: string;
            uz: string;
            en: string;
        };
        price: number;
        images: string[];
        sizes: string[];
        colors: string[];
        characteristics: Prisma.JsonValue;
        stock: number;
        isActive: boolean;
        isFeatured: boolean;
        sortOrder: number;
        createdAt: string;
        updatedAt: string;
    }>;
    adminCreate(dto: CreateProductDto): Promise<{
        id: string;
        type: string;
        unit: import("@prisma/client").$Enums.ProductUnit;
        categoryKey: string;
        name: {
            ru: string;
            uz: string;
            en: string;
        };
        description: {
            ru: string;
            uz: string;
            en: string;
        };
        price: number;
        images: string[];
        sizes: string[];
        colors: string[];
        characteristics: Prisma.JsonValue;
        stock: number;
        isActive: boolean;
        isFeatured: boolean;
        sortOrder: number;
        createdAt: string;
        updatedAt: string;
    }>;
    adminUpdate(id: string, dto: UpdateProductDto): Promise<{
        id: string;
        type: string;
        unit: import("@prisma/client").$Enums.ProductUnit;
        categoryKey: string;
        name: {
            ru: string;
            uz: string;
            en: string;
        };
        description: {
            ru: string;
            uz: string;
            en: string;
        };
        price: number;
        images: string[];
        sizes: string[];
        colors: string[];
        characteristics: Prisma.JsonValue;
        stock: number;
        isActive: boolean;
        isFeatured: boolean;
        sortOrder: number;
        createdAt: string;
        updatedAt: string;
    }>;
    adminDelete(id: string): Promise<{
        ok: boolean;
    }>;
}
