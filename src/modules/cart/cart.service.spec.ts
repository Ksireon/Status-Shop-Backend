import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CartService } from './cart.service';

describe('CartService', () => {
  let prisma: PrismaService;
  let service: CartService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [PrismaService, CartService],
    }).compile();

    prisma = moduleRef.get(PrismaService);
    service = moduleRef.get(CartService);
  });

  it('throws when product not found', async () => {
    jest.spyOn(prisma.product, 'findFirst').mockResolvedValueOnce(null as never);

    await expect(
      service.addItem('user-1', {
        productId: 'missing',
        quantity: 1,
      } as never),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('prevents adding more units than stock', async () => {
    jest.spyOn(prisma.product, 'findFirst').mockResolvedValueOnce({
      id: 'p1',
      type: 'VINYL',
      stockQuantity: 1,
      isActive: true,
      images: [],
      category: { slug: 'vinyl' },
    } as never);

    const createSpy = jest.spyOn(prisma.cartItem, 'create');

    await expect(
      service.addItem('user-1', {
        productId: 'p1',
        quantity: 1,
        meters: 5,
      } as never),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(createSpy).not.toHaveBeenCalled();
  });
}

