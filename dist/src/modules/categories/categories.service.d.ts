import { PrismaService } from '../prisma/prisma.service';
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
}
