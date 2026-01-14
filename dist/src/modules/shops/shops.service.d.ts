import { PrismaService } from '../prisma/prisma.service';
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
}
