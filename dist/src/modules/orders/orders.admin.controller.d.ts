import { OrderFilterDto } from './dto/order-filter.dto';
import { UpdateOrderPaymentDto } from './dto/update-order-payment.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersService } from './orders.service';
export declare class OrdersAdminController {
    private readonly orders;
    constructor(orders: OrdersService);
    list(filter: OrderFilterDto): Promise<{
        user: {
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.UserRole;
        };
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        status: import("@prisma/client").$Enums.OrderStatus;
        notes: string | null;
        adminNotes: string | null;
        updatedAt: string;
        completedAt: string | null;
        id: string;
        shortId: string;
        deliveryType: import("@prisma/client").$Enums.DeliveryType;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
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
    get(id: string): Promise<{
        user: {
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.UserRole;
        };
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        status: import("@prisma/client").$Enums.OrderStatus;
        notes: string | null;
        adminNotes: string | null;
        updatedAt: string;
        completedAt: string | null;
        id: string;
        shortId: string;
        deliveryType: import("@prisma/client").$Enums.DeliveryType;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
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
    updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<{
        user: {
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.UserRole;
        };
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        status: import("@prisma/client").$Enums.OrderStatus;
        notes: string | null;
        adminNotes: string | null;
        updatedAt: string;
        completedAt: string | null;
        id: string;
        shortId: string;
        deliveryType: import("@prisma/client").$Enums.DeliveryType;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
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
    updatePayment(id: string, dto: UpdateOrderPaymentDto): Promise<{
        user: {
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.UserRole;
        };
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        status: import("@prisma/client").$Enums.OrderStatus;
        notes: string | null;
        adminNotes: string | null;
        updatedAt: string;
        completedAt: string | null;
        id: string;
        shortId: string;
        deliveryType: import("@prisma/client").$Enums.DeliveryType;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
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
    cancel(id: string): Promise<{
        user: {
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.UserRole;
        };
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        status: import("@prisma/client").$Enums.OrderStatus;
        notes: string | null;
        adminNotes: string | null;
        updatedAt: string;
        completedAt: string | null;
        id: string;
        shortId: string;
        deliveryType: import("@prisma/client").$Enums.DeliveryType;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
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
}
