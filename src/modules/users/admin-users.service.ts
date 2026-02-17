import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import { AdminListUsersQuery } from './dto/admin-list-users.query';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import {
  buildPaginationMeta,
  normalizePagination,
} from '../../common/utils/pagination';

const USER_SELECT = {
  id: true,
  email: true,
  role: true,
  isActive: true,
  shopId: true,
  name: true,
  phone: true,
  city: true,
  company: true,
  position: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  list(query: AdminListUsersQuery) {
    const { skip, take, page, limit } = normalizePagination(query);
    const where = {
      ...(query.role ? { role: query.role } : {}),
      ...(query.shopId ? { shopId: query.shopId } : {}),
      ...(query.q
        ? {
            OR: [
              {
                email: {
                  contains: query.q,
                  mode: 'insensitive' as Prisma.QueryMode,
                },
              },
              {
                name: {
                  contains: query.q,
                  mode: 'insensitive' as Prisma.QueryMode,
                },
              },
            ],
          }
        : {}),
    } satisfies Prisma.UserWhereInput;

    return this.prisma
      .$transaction([
        this.prisma.user.count({ where }),
        this.prisma.user.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take,
          select: USER_SELECT,
        }),
      ])
      .then(([total, items]) => ({
        data: items,
        meta: buildPaginationMeta(page, limit, total),
      }));
  }

  async get(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: USER_SELECT,
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(dto: AdminCreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already registered');

    if (dto.shopId) {
      const shop = await this.prisma.shop.findUnique({
        where: { id: dto.shopId },
      });
      if (!shop) throw new NotFoundException('Shop not found');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const data = {
      email: dto.email,
      passwordHash,
      role: dto.role,
      shopId: dto.shopId ?? undefined,
      name: dto.name,
      phone: dto.phone,
      city: dto.city,
      company: dto.company,
      position: dto.position,
    } as unknown as Prisma.UserCreateInput;

    return this.prisma.user.create({
      data,
      select: USER_SELECT,
    });
  }

  async update(userId: string, dto: AdminUpdateUserDto) {
    await this.get(userId);

    if (dto.shopId !== undefined && dto.shopId !== null) {
      const shop = await this.prisma.shop.findUnique({
        where: { id: dto.shopId },
      });
      if (!shop) throw new NotFoundException('Shop not found');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.email !== undefined ? { email: dto.email } : {}),
        ...(dto.role !== undefined ? { role: dto.role } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        ...(dto.shopId !== undefined ? { shopId: dto.shopId } : {}),
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
        ...(dto.city !== undefined ? { city: dto.city } : {}),
        ...(dto.company !== undefined ? { company: dto.company } : {}),
        ...(dto.position !== undefined ? { position: dto.position } : {}),
      },
      select: USER_SELECT,
    });
  }

  async deactivate(userId: string) {
    await this.get(userId);
    const data = { isActive: false } as unknown as Prisma.UserUpdateInput;
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: USER_SELECT,
    });
  }
}
