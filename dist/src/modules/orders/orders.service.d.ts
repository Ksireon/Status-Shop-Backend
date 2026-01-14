import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
export declare class OrdersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateOrderDto): Promise<{
        id: string;
        shortId: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        deliveryType: import("@prisma/client").$Enums.DeliveryType;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        subtotal: number;
        deliveryFee: number;
        total: number;
        branchKey: string | null;
        branchName: string | null;
        branchAddress: string | null;
        deliveryAddress: string | null;
        items: {
            id: string;
            productId: string;
            productName: {
                ru: string;
                uz: string;
                en: string;
            };
            productImage: string;
            quantity: number;
            meters: number | null;
            size: string | null;
            color: string | null;
            pricePerUnit: number;
            total: number;
        }[];
        createdAt: string;
    }>;
    listMy(userId: string): Promise<{
        id: string;
        shortId: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        deliveryType: import("@prisma/client").$Enums.DeliveryType;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        subtotal: number;
        deliveryFee: number;
        total: number;
        branchKey: string | null;
        branchName: string | null;
        branchAddress: string | null;
        deliveryAddress: string | null;
        items: {
            id: string;
            productId: string;
            productName: {
                ru: string;
                uz: string;
                en: string;
            };
            productImage: string;
            quantity: number;
            meters: number | null;
            size: string | null;
            color: string | null;
            pricePerUnit: number;
            total: number;
        }[];
        createdAt: string;
    }[]>;
    getMy(userId: string, id: string): Promise<{
        id: string;
        shortId: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        deliveryType: import("@prisma/client").$Enums.DeliveryType;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        subtotal: number;
        deliveryFee: number;
        total: number;
        branchKey: string | null;
        branchName: string | null;
        branchAddress: string | null;
        deliveryAddress: string | null;
        items: {
            id: string;
            productId: string;
            productName: {
                ru: string;
                uz: string;
                en: string;
            };
            productImage: string;
            quantity: number;
            meters: number | null;
            size: string | null;
            color: string | null;
            pricePerUnit: number;
            total: number;
        }[];
        createdAt: string;
    }>;
    private toDto;
    private generateShortId;
}
