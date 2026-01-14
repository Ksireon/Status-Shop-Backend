import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { decimalToNumber } from '../../common/prisma/decimal';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';

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

  async adminList() {
    const shops = await this.prisma.shop.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });

    return shops.map((s) => ({
      id: s.id,
      key: s.key,
      city: { ru: s.cityRu, uz: s.cityUz, en: s.cityEn },
      address: { ru: s.addressRu, uz: s.addressUz, en: s.addressEn },
      phone: s.phone,
      cardNumber: s.cardNumber,
      latitude: s.latitude ? decimalToNumber(s.latitude) : null,
      longitude: s.longitude ? decimalToNumber(s.longitude) : null,
      workHours: s.workHours,
      isActive: s.isActive,
      sortOrder: s.sortOrder,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }));
  }

  async adminGet(id: string) {
    const s = await this.prisma.shop.findUnique({ where: { id } });
    if (!s) throw new NotFoundException('Shop not found');
    return {
      id: s.id,
      key: s.key,
      city: { ru: s.cityRu, uz: s.cityUz, en: s.cityEn },
      address: { ru: s.addressRu, uz: s.addressUz, en: s.addressEn },
      phone: s.phone,
      cardNumber: s.cardNumber,
      latitude: s.latitude ? decimalToNumber(s.latitude) : null,
      longitude: s.longitude ? decimalToNumber(s.longitude) : null,
      workHours: s.workHours,
      isActive: s.isActive,
      sortOrder: s.sortOrder,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    };
  }

  async adminCreate(dto: CreateShopDto) {
    const exists = await this.prisma.shop.findUnique({
      where: { key: dto.key },
      select: { id: true },
    });
    if (exists) throw new ConflictException('Shop key already exists');

    const s = await this.prisma.shop.create({
      data: {
        key: dto.key,
        cityRu: dto.cityRu,
        cityUz: dto.cityUz,
        cityEn: dto.cityEn,
        addressRu: dto.addressRu,
        addressUz: dto.addressUz,
        addressEn: dto.addressEn,
        phone: dto.phone,
        cardNumber: dto.cardNumber,
        latitude:
          dto.latitude !== undefined
            ? new Prisma.Decimal(dto.latitude)
            : undefined,
        longitude:
          dto.longitude !== undefined
            ? new Prisma.Decimal(dto.longitude)
            : undefined,
        workHours: dto.workHours,
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder ?? 0,
      },
      select: { id: true },
    });

    return this.adminGet(s.id);
  }

  async adminUpdate(id: string, dto: UpdateShopDto) {
    const exists = await this.prisma.shop.findUnique({
      where: { id },
      select: { id: true, key: true },
    });
    if (!exists) throw new NotFoundException('Shop not found');

    if (dto.key) {
      const other = await this.prisma.shop.findUnique({
        where: { key: dto.key },
        select: { id: true },
      });
      if (other && other.id !== id)
        throw new BadRequestException('Shop key already exists');
    }

    await this.prisma.shop.update({
      where: { id },
      data: {
        key: dto.key,
        cityRu: dto.cityRu,
        cityUz: dto.cityUz,
        cityEn: dto.cityEn,
        addressRu: dto.addressRu,
        addressUz: dto.addressUz,
        addressEn: dto.addressEn,
        phone: dto.phone,
        cardNumber: dto.cardNumber,
        latitude:
          dto.latitude !== undefined
            ? new Prisma.Decimal(dto.latitude)
            : undefined,
        longitude:
          dto.longitude !== undefined
            ? new Prisma.Decimal(dto.longitude)
            : undefined,
        workHours: dto.workHours,
        isActive: dto.isActive,
        sortOrder: dto.sortOrder,
      },
    });

    return this.adminGet(id);
  }

  async adminDelete(id: string) {
    const exists = await this.prisma.shop.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException('Shop not found');
    await this.prisma.shop.update({ where: { id }, data: { isActive: false } });
    return { ok: true };
  }
}
