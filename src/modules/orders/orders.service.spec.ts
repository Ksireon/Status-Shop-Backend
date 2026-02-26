import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrdersService } from './orders.service';
import { DeliveryType, OrderStatus } from '@prisma/client';

describe('OrdersService', () => {
  let prisma: PrismaService;
  let service: OrdersService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [PrismaService, OrdersService],
    }).compile();

    prisma = moduleRef.get(PrismaService);
    service = moduleRef.get(OrdersService);
  });

  it('throws when cart is empty', async () => {
    jest.spyOn(prisma, '$transaction').mockImplementation(async (cb: any) => {
      return cb({
        cartItem: { findMany: jest.fn().mockResolvedValueOnce([]) },
      });
    });

    await expect(
      service.checkout('user-1', {
        deliveryType: DeliveryType.PICKUP,
        paymentMethod: 'CASH' as never,
      } as never),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('prevents checkout when product has insufficient stock', async () => {
    jest.spyOn(prisma, '$transaction').mockImplementation(async (cb: any) => {
      const tx = {
        cartItem: {
          findMany: jest.fn().mockResolvedValueOnce([
            {
              id: 'ci1',
              userId: 'user-1',
              productId: 'p1',
              quantity: 2,
              meters: 5,
              selectedImageUrl: null,
              colorLabel: null,
              size: null,
              product: {
                id: 'p1',
                name: { ru: 'Vinyl' },
                description: null,
                type: 'VINYL',
                stockQuantity: 1,
                isActive: true,
                category: { slug: 'vinyl' },
                images: [],
              },
            },
          ]),
        },
      };

      return cb(tx);
    });

    await expect(
      service.checkout('user-1', {
        deliveryType: DeliveryType.PICKUP,
        paymentMethod: 'CASH' as never,
      } as never),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
}

