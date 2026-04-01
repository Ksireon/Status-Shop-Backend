import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { JwtPayload } from '../../common/types/jwt-payload';
import { UserRole } from '../../common/constants/user-role';

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(user: JwtPayload) {
    const isOwner =
      user.role === UserRole.OWNER || user.role === UserRole.ADMIN;
    const shopScope =
      !isOwner && user.shopId ? { shopId: user.shopId } : undefined;

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalOrders,
      recentOrders,
      pendingOrders,
      totalRevenue,
      recentRevenue,
      totalCustomers,
      totalProducts,
      ordersByStatus,
      topProducts,
    ] = await this.prisma.$transaction([
      // Total orders
      this.prisma.order.count({ where: shopScope ? { shopId: shopScope.shopId } : {} }),

      // Recent orders (last 30 days)
      this.prisma.order.count({
        where: {
          ...(shopScope ? { shopId: shopScope.shopId } : {}),
          createdAt: { gte: thirtyDaysAgo },
        },
      }),

      // Pending orders
      this.prisma.order.count({
        where: {
          ...(shopScope ? { shopId: shopScope.shopId } : {}),
          status: 'PENDING',
        },
      }),

      // Total revenue
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: {
          ...(shopScope ? { shopId: shopScope.shopId } : {}),
          status: { not: 'CANCELED' },
        },
      }),

      // Recent revenue (last 30 days)
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: {
          ...(shopScope ? { shopId: shopScope.shopId } : {}),
          status: { not: 'CANCELED' },
          createdAt: { gte: thirtyDaysAgo },
        },
      }),

      // Total customers
      this.prisma.user.count({ where: { role: 'USER' } }),

      // Total active products
      this.prisma.product.count({ where: { isActive: true } }),

      // Orders grouped by status
      this.prisma.order.groupBy({
        by: ['status'],
        _count: { _all: true },
        orderBy: { status: 'asc' },
        where: shopScope ? { shopId: shopScope.shopId } : {},
      }),

      // Top 5 products by order count
      this.prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { lineTotal: true, quantity: true },
        orderBy: { _sum: { lineTotal: 'desc' } },
        take: 5,
      }),
    ]);

    // Fetch product details for top products
    const topProductDetails = await this.prisma.product.findMany({
      where: { id: { in: topProducts.map((p) => p.productId) } },
      select: { id: true, name: true, price: true },
    });

    const topProductsResult = topProducts.map((p) => {
      const product = topProductDetails.find((d) => d.id === p.productId);
      return {
        productId: p.productId,
        name: product?.name ?? {},
        totalRevenue: p._sum?.lineTotal ?? 0,
        totalQuantity: p._sum?.quantity ?? 0,
      };
    });

    // Recent 10 orders for the dashboard
    const latestOrders = await this.prisma.order.findMany({
      where: shopScope ? { shopId: shopScope.shopId } : {},
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: { select: { id: true, name: true, email: true } },
        shop: { select: { id: true, name: true } },
      },
    });

    return {
      totalOrders,
      recentOrders,
      pendingOrders,
      totalRevenue: totalRevenue._sum.total ?? 0,
      recentRevenue: recentRevenue._sum.total ?? 0,
      totalCustomers: isOwner ? totalCustomers : undefined,
      totalProducts: isOwner ? totalProducts : undefined,
      ordersByStatus: ordersByStatus.map((s) => ({
        status: s.status,
        count: (s._count as Record<string, number>)?._all ?? 0,
      })),
      topProducts: topProductsResult,
      latestOrders,
    };
  }
}
