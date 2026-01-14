import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

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

  async adminList() {
    const categories = await this.prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });

    return categories.map((c) => ({
      id: c.id,
      key: c.key,
      name: { ru: c.nameRu, uz: c.nameUz, en: c.nameEn },
      icon: c.icon,
      sortOrder: c.sortOrder,
      isActive: c.isActive,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));
  }

  async adminGet(id: string) {
    const c = await this.prisma.category.findUnique({ where: { id } });
    if (!c) throw new NotFoundException('Category not found');
    return {
      id: c.id,
      key: c.key,
      name: { ru: c.nameRu, uz: c.nameUz, en: c.nameEn },
      icon: c.icon,
      sortOrder: c.sortOrder,
      isActive: c.isActive,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    };
  }

  async adminCreate(dto: CreateCategoryDto) {
    const exists = await this.prisma.category.findUnique({ where: { key: dto.key }, select: { id: true } });
    if (exists) throw new ConflictException('Category key already exists');

    const c = await this.prisma.category.create({
      data: {
        key: dto.key,
        nameRu: dto.nameRu,
        nameUz: dto.nameUz,
        nameEn: dto.nameEn,
        icon: dto.icon,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
      },
    });

    return this.adminGet(c.id);
  }

  async adminUpdate(id: string, dto: UpdateCategoryDto) {
    const c = await this.prisma.category.findUnique({ where: { id }, select: { id: true } });
    if (!c) throw new NotFoundException('Category not found');

    if (dto.key) {
      const other = await this.prisma.category.findUnique({ where: { key: dto.key }, select: { id: true } });
      if (other && other.id !== id) throw new ConflictException('Category key already exists');
    }

    await this.prisma.category.update({
      where: { id },
      data: {
        key: dto.key,
        nameRu: dto.nameRu,
        nameUz: dto.nameUz,
        nameEn: dto.nameEn,
        icon: dto.icon,
        sortOrder: dto.sortOrder,
        isActive: dto.isActive,
      },
    });

    return this.adminGet(id);
  }

  async adminDelete(id: string) {
    const c = await this.prisma.category.findUnique({ where: { id }, select: { id: true } });
    if (!c) throw new NotFoundException('Category not found');
    await this.prisma.category.update({ where: { id }, data: { isActive: false } });
    return { ok: true };
  }
}
