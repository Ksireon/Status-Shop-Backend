import { BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { DeliveryType } from '@prisma/client';

const mockPrisma = {
  $transaction: jest.fn((cb) => cb(mockTx)),
};

const mockTx = {
  cartItem: {
    findMany: jest.fn(),
  },
};

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    service = new OrdersService(mockPrisma as never);
    jest.clearAllMocks();
  });

  it('throws when cart is empty', async () => {
    mockTx.cartItem.findMany.mockResolvedValueOnce([]);

    await expect(
      service.checkout('user-1', {
        deliveryType: DeliveryType.PICKUP,
        paymentMethod: 'CASH',
      } as never),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
