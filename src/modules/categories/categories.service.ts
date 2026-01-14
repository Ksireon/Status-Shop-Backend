import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const categories = await this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });

    return categories.map((c) => ({
      id: c.id,
      key: c.key,
      name: { ru: c.nameRu, uz: c.nameUz, en: c.nameEn },
      icon: c.icon,
      sortOrder: c.sortOrder,
    }));
  }
}

