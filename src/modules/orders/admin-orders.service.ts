import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UserRole } from '../../common/constants/user-role';
import type { JwtPayload } from '../../common/types/jwt-payload';
import { PrismaService } from '../../prisma/prisma.service';
import {
  buildPaginationMeta,
  normalizePagination,
} from '../../common/utils/pagination';
import { AdminListOrdersQuery } from './dto/admin-list-orders.query';
import { AdminUpdateOrderStatusDto } from './dto/admin-update-order-status.dto';

@Injectable()
export class AdminOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  private scopeWhere(user: JwtPayload): Prisma.OrderWhereInput {
    if (user.role === UserRole.OWNER || user.role === UserRole.ADMIN) return {};

    if (
      user.role === UserRole.BRANCH_DIRECTOR ||
      user.role === UserRole.MANAGER
    ) {
      if (!user.shopId) throw new ForbiddenException();
      return { shopId: user.shopId };
    }

    throw new ForbiddenException();
  }

  async list(user: JwtPayload, query: AdminListOrdersQuery) {
    const scope = this.scopeWhere(user);
    const { skip, take, page, limit } = normalizePagination(query);

    const where = {
      ...scope,
      ...(query.status ? { status: query.status } : {}),
      ...(query.userId ? { userId: query.userId } : {}),
      ...(query.shopId ? { shopId: query.shopId } : {}),
      ...(query.q ? { shortId: { contains: query.q } } : {}),
      ...(query.createdFrom || query.createdTo
        ? {
            createdAt: {
              ...(query.createdFrom
                ? { gte: new Date(query.createdFrom) }
                : {}),
              ...(query.createdTo ? { lte: new Date(query.createdTo) } : {}),
            },
          }
        : {}),
    };

    const [total, items] = await this.prisma.$transaction([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          items: true,
          shop: true,
          user: { select: { id: true, email: true, name: true, phone: true } },
        },
      }),
    ]);

    return { data: items, meta: buildPaginationMeta(page, limit, total) };
  }

  async get(user: JwtPayload, orderId: string) {
    const scope = this.scopeWhere(user);

    const order = await this.prisma.order.findFirst({
      where: { ...scope, id: orderId },
      include: {
        items: true,
        shop: true,
        user: { select: { id: true, email: true, name: true, phone: true } },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(
    user: JwtPayload,
    orderId: string,
    dto: AdminUpdateOrderStatusDto,
  ) {
    await this.get(user, orderId);
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: dto.status },
      include: {
        items: true,
        shop: true,
        user: { select: { id: true, email: true, name: true, phone: true } },
      },
    });
  }
}
