import { OrderStatus, PaymentStatus } from '@prisma/client';
export declare class OrderFilterDto {
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    q?: string;
    dateFrom?: string;
    dateTo?: string;
    skip?: number;
    take?: number;
}
