import { CreateProductDto } from './dto/create-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';
export declare class ProductsAdminController {
    private readonly products;
    constructor(products: ProductsService);
    list(filter: ProductFilterDto): Promise<{
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
        characteristics: import("@prisma/client/runtime/client").JsonValue;
        stock: number;
        isActive: boolean;
        isFeatured: boolean;
        sortOrder: number;
        createdAt: string;
        updatedAt: string;
    }[]>;
    get(id: string): Promise<{
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
        characteristics: import("@prisma/client/runtime/client").JsonValue;
        stock: number;
        isActive: boolean;
        isFeatured: boolean;
        sortOrder: number;
        createdAt: string;
        updatedAt: string;
    }>;
    create(dto: CreateProductDto): Promise<{
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
        characteristics: import("@prisma/client/runtime/client").JsonValue;
        stock: number;
        isActive: boolean;
        isFeatured: boolean;
        sortOrder: number;
        createdAt: string;
        updatedAt: string;
    }>;
    update(id: string, dto: UpdateProductDto): Promise<{
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
        characteristics: import("@prisma/client/runtime/client").JsonValue;
        stock: number;
        isActive: boolean;
        isFeatured: boolean;
        sortOrder: number;
        createdAt: string;
        updatedAt: string;
    }>;
    remove(id: string): Promise<{
        ok: boolean;
    }>;
}
