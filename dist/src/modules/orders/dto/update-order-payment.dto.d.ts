import { PaymentStatus } from '@prisma/client';
export declare class UpdateOrderPaymentDto {
    paymentStatus: PaymentStatus;
    adminNotes?: string;
}
