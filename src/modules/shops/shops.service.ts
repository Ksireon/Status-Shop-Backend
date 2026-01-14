import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShopsService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const shops = await this.prisma.shop.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });

    return shops.map((s) => ({
      id: s.id,
      key: s.key,
      city: { ru: s.cityRu, uz: s.cityUz, en: s.cityEn },
      address: { ru: s.addressRu, uz: s.addressUz, en: s.addressEn },
      phone: s.phone,
      cardNumber: s.cardNumber,
      workHours: s.workHours,
    }));
  }
}

