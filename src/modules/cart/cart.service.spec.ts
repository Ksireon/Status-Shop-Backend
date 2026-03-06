import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CartService } from './cart.service';

const mockPrisma = {
  product: {
    findFirst: jest.fn(),
  },
  cartItem: {
    create: jest.fn(),
  },
};

describe('CartService', () => {
  let service: CartService;

  beforeEach(async () => {
    service = new CartService(mockPrisma as never);
    jest.clearAllMocks();
  });

  it('throws when product not found', async () => {
    mockPrisma.product.findFirst.mockResolvedValueOnce(null);

    await expect(
      service.addItem('user-1', {
        productId: 'missing',
        quantity: 1,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('prevents adding more units than stock', async () => {
    mockPrisma.product.findFirst.mockResolvedValueOnce({
      id: 'p1',
      type: 'VINYL',
      stockQuantity: 1,
      isActive: true,
      images: [],
      category: { slug: 'vinyl' },
    });

    const createSpy = mockPrisma.cartItem.create;

    await expect(
      service.addItem('user-1', {
        productId: 'p1',
        quantity: 1,
        meters: 5,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(createSpy).not.toHaveBeenCalled();
  });
});
