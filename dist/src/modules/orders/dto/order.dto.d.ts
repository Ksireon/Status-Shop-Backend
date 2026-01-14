import { DeliveryType, OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
export declare class OrderItemDto {
    id: string;
    productId: string;
    productName: {
        ru: string;
        uz: string;
        en: string;
    };
    productImage: string;
    quantity: number;
    meters?: number | null;
    size?: string | null;
    color?: string | null;
    pricePerUnit: number;
    total: number;
}
export declare class OrderDto {
    id: string;
    shortId: string;
    status: OrderStatus;
    deliveryType: DeliveryType;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    subtotal: number;
    deliveryFee: number;
    total: number;
    branchKey?: string | null;
    branchName?: string | null;
    branchAddress?: string | null;
    deliveryAddress?: string | null;
    items: OrderItemDto[];
    createdAt: string;
}
