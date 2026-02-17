import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ShopsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.shop.findMany({
      where: { isActive: true },
      orderBy: { key: 'asc' },
      select: {
        id: true,
        key: true,
        name: true,
        city: true,
        address: true,
        phone: true,
        hours: true,
        lat: true,
        lng: true,
      },
    });
  }
}
