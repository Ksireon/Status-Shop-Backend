import { PrismaService } from '../prisma/prisma.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
export declare class ShopsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(): Promise<{
        id: string;
        key: string;
        city: {
            ru: string;
            uz: string;
            en: string;
        };
        address: {
            ru: string;
            uz: string;
            en: string;
        };
        phone: string;
        cardNumber: string | null;
        workHours: string;
    }[]>;
    adminList(): Promise<{
        id: string;
        key: string;
        city: {
            ru: string;
            uz: string;
            en: string;
        };
        address: {
            ru: string;
            uz: string;
            en: string;
        };
        phone: string;
        cardNumber: string | null;
        latitude: number | null;
        longitude: number | null;
        workHours: string;
        isActive: boolean;
        sortOrder: number;
        createdAt: string;
        updatedAt: string;
    }[]>;
    adminGet(id: string): Promise<{
        id: string;
        key: string;
        city: {
            ru: string;
            uz: string;
            en: string;
        };
        address: {
            ru: string;
            uz: string;
            en: string;
        };
        phone: string;
        cardNumber: string | null;
        latitude: number | null;
        longitude: number | null;
        workHours: string;
        isActive: boolean;
        sortOrder: number;
        createdAt: string;
        updatedAt: string;
    }>;
    adminCreate(dto: CreateShopDto): Promise<{
        id: string;
        key: string;
        city: {
            ru: string;
            uz: string;
            en: string;
        };
        address: {
            ru: string;
            uz: string;
            en: string;
        };
        phone: string;
        cardNumber: string | null;
        latitude: number | null;
        longitude: number | null;
        workHours: string;
        isActive: boolean;
        sortOrder: number;
        createdAt: string;
        updatedAt: string;
    }>;
    adminUpdate(id: string, dto: UpdateShopDto): Promise<{
        id: string;
        key: string;
        city: {
            ru: string;
            uz: string;
            en: string;
        };
        address: {
            ru: string;
            uz: string;
            en: string;
        };
        phone: string;
        cardNumber: string | null;
        latitude: number | null;
        longitude: number | null;
        workHours: string;
        isActive: boolean;
        sortOrder: number;
        createdAt: string;
        updatedAt: string;
    }>;
    adminDelete(id: string): Promise<{
        ok: boolean;
    }>;
}
