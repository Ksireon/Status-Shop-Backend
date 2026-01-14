import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProductFilterDto } from './dto/product-filter.dto';
export declare class ProductsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(filter: ProductFilterDto): Promise<{
        id: string;
        type: string;
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
        isFeatured: boolean;
    }[]>;
    getById(id: string): Promise<{
        id: string;
        type: string;
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
        isFeatured: boolean;
    }>;
}
