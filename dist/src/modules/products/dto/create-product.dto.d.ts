import { ProductUnit } from '@prisma/client';
export declare class CreateProductDto {
    type: string;
    unit: ProductUnit;
    categoryKey: string;
    nameRu: string;
    nameUz: string;
    nameEn: string;
    descRu: string;
    descUz: string;
    descEn: string;
    price: number;
    images?: string[];
    sizes?: string[];
    colors?: string[];
    characteristics?: Record<string, unknown>;
    stock?: number;
    isActive?: boolean;
    isFeatured?: boolean;
    sortOrder?: number;
}
