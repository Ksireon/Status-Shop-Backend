import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { ShopsService } from './shops.service';
export declare class ShopsAdminController {
    private readonly shops;
    constructor(shops: ShopsService);
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
        latitude: number | null;
        longitude: number | null;
        workHours: string;
        isActive: boolean;
        sortOrder: number;
        createdAt: string;
        updatedAt: string;
    }[]>;
    get(id: string): Promise<{
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
    create(dto: CreateShopDto): Promise<{
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
    update(id: string, dto: UpdateShopDto): Promise<{
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
    remove(id: string): Promise<{
        ok: boolean;
    }>;
}
