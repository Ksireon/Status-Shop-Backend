import { DeliveryType, PaymentMethod } from '@prisma/client';
export declare class CreateOrderItemDto {
    productId: string;
    quantity: number;
    meters?: number;
    size?: string;
    color?: string;
}
export declare class CreateOrderDto {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    deliveryType: DeliveryType;
    branchKey?: string;
    deliveryAddress?: string;
    paymentMethod: PaymentMethod;
    notes?: string;
    items: CreateOrderItemDto[];
}
