import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { JwtUser } from '../../common/auth/current-user.decorator';
import * as bcrypt from 'bcrypt';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { UserFilterDto } from './dto/user-filter.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        surname: true,
        company: true,
        position: true,
        city: true,
        phone: true,
        role: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateMe(userId: string, dto: UpdateMeDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name,
        surname: dto.surname,
        company: dto.company,
        position: dto.position,
        city: dto.city,
        phone: dto.phone,
      },
      select: {
        id: true,
        email: true,
        name: true,
        surname: true,
        company: true,
        position: true,
        city: true,
        phone: true,
        role: true,
      },
    });

    return user;
  }

  async adminList(filter: UserFilterDto) {
    const where: Prisma.UserWhereInput = {
      ...(filter.role ? { role: filter.role } : {}),
      ...(filter.isActive !== undefined ? { isActive: filter.isActive } : {}),
      ...(filter.q
        ? {
            OR: [
              { email: { contains: filter.q, mode: 'insensitive' } },
              { name: { contains: filter.q, mode: 'insensitive' } },
              { surname: { contains: filter.q, mode: 'insensitive' } },
              { phone: { contains: filter.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const users = await this.prisma.user.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
      skip: filter.skip ?? 0,
      take: filter.take ?? 50,
      select: {
        id: true,
        email: true,
        name: true,
        surname: true,
        company: true,
        position: true,
        city: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return users.map((u) => ({
      ...u,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
    }));
  }

  async adminGet(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        surname: true,
        company: true,
        position: true,
        city: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return {
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  async adminUpdate(current: JwtUser, id: string, dto: AdminUpdateUserDto) {
    const exists = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException('User not found');

    if (dto.role !== undefined && current.role !== UserRole.ADMIN) {
      throw new BadRequestException('Only ADMIN can change role');
    }

    await this.prisma.user.update({
      where: { id },
      data: {
        name: dto.name,
        surname: dto.surname,
        company: dto.company,
        position: dto.position,
        city: dto.city,
        phone: dto.phone,
        isActive: dto.isActive,
        role: dto.role,
      },
    });

    return this.adminGet(id);
  }

  async adminCreate(current: JwtUser, dto: AdminCreateUserDto) {
    if (current.role !== UserRole.ADMIN)
      throw new BadRequestException('Only ADMIN can create users');

    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });
    if (exists) throw new BadRequestException('Email already exists');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: dto.role,
        name: dto.name,
        surname: dto.surname,
        company: dto.company,
        position: dto.position,
        city: dto.city,
        phone: dto.phone,
        isActive: dto.isActive ?? true,
      },
      select: { id: true },
    });

    return this.adminGet(user.id);
  }

  async adminDeactivate(id: string) {
    const exists = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException('User not found');
    await this.prisma.user.update({ where: { id }, data: { isActive: false } });
    return { ok: true };
  }
}
