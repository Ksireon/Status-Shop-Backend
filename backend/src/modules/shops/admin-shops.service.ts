import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { JwtPayload } from '../../common/types/jwt-payload';
import { UserRole } from '../../common/constants/user-role';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminCreateShopDto } from './dto/admin-create-shop.dto';
import { AdminUpdateShopDto } from './dto/admin-update-shop.dto';

@Injectable()
export class AdminShopsService {
  constructor(private readonly prisma: PrismaService) {}

  private assertCanAccessShop(user: JwtPayload, shopId: string) {
    if (user.role === UserRole.OWNER || user.role === UserRole.ADMIN) return;
    if (user.role === UserRole.BRANCH_DIRECTOR && user.shopId === shopId)
      return;
    throw new ForbiddenException();
  }

  async list(user: JwtPayload) {
    if (user.role === UserRole.BRANCH_DIRECTOR) {
      if (!user.shopId) return [];
      const shop = await this.prisma.shop.findUnique({
        where: { id: user.shopId },
      });
      return shop ? [shop] : [];
    }

    return this.prisma.shop.findMany({ orderBy: { key: 'asc' } });
  }

  async get(user: JwtPayload, shopId: string) {
    this.assertCanAccessShop(user, shopId);
    const shop = await this.prisma.shop.findUnique({ where: { id: shopId } });
    if (!shop) throw new NotFoundException('Shop not found');
    return shop;
  }

  async create(dto: AdminCreateShopDto) {
    const existing = await this.prisma.shop.findUnique({
      where: { key: dto.key },
    });
    if (existing) throw new ConflictException('Shop key already exists');

    return this.prisma.shop.create({
      data: {
        key: dto.key,
        name: dto.name as Prisma.InputJsonValue | undefined,
        city: dto.city,
        address: dto.address,
        phone: dto.phone,
        hours: dto.hours,
        lat: dto.lat,
        lng: dto.lng,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(user: JwtPayload, shopId: string, dto: AdminUpdateShopDto) {
    this.assertCanAccessShop(user, shopId);
    await this.get(user, shopId);

    return this.prisma.shop.update({
      where: { id: shopId },
      data: {
        ...(dto.key !== undefined ? { key: dto.key } : {}),
        ...(dto.name !== undefined
          ? {
              name:
                dto.name === null
                  ? Prisma.DbNull
                  : (dto.name as Prisma.InputJsonValue),
            }
          : {}),
        ...(dto.city !== undefined ? { city: dto.city } : {}),
        ...(dto.address !== undefined ? { address: dto.address } : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
        ...(dto.hours !== undefined ? { hours: dto.hours } : {}),
        ...(dto.lat !== undefined ? { lat: dto.lat } : {}),
        ...(dto.lng !== undefined ? { lng: dto.lng } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });
  }

  async delete(shopId: string) {
    const shop = await this.prisma.shop.findUnique({ where: { id: shopId } });
    if (!shop) throw new NotFoundException('Shop not found');
    return this.prisma.shop.delete({ where: { id: shopId } });
  }
}
