import prisma from '../config/database';
import { SalesReportParams, AppError } from '../types';

/**
 * Get sales report
 */
export const getSalesReport = async (params: SalesReportParams) => {
  const { startDate, endDate } = params;

  // Validate date range
  if (startDate && endDate && startDate > endDate) {
    throw new AppError('Start date must be before end date', 400);
  }

  // Build where clause
  const where: any = {};
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  // Get orders with payments
  const orders = await prisma.order.findMany({
    where,
    include: {
      payment: true,
      orderDetails: {
        include: {
          foodItem: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  // Calculate metrics
  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter((o) => o.payment?.paymentStatus === 'COMPLETED')
    .reduce((sum, o) => sum + Number(o.totalAmount), 0);

  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const successfulPayments = orders.filter(
    (o) => o.payment?.paymentStatus === 'COMPLETED'
  ).length;

  const failedPayments = orders.filter(
    (o) => o.payment?.paymentStatus === 'FAILED'
  ).length;

  // Calculate top selling items
  const itemSales = new Map<
    string,
    { name: string; quantity: number; revenue: number }
  >();

  orders.forEach((order) => {
    order.orderDetails.forEach((detail) => {
      const itemId = detail.itemId;
      const existing = itemSales.get(itemId);

      if (existing) {
        existing.quantity += detail.quantity;
        existing.revenue += Number(detail.subtotal);
      } else {
        itemSales.set(itemId, {
          name: detail.foodItem.name,
          quantity: detail.quantity,
          revenue: Number(detail.subtotal),
        });
      }
    });
  });

  const topSellingItems = Array.from(itemSales.entries())
    .map(([itemId, data]) => ({
      itemId,
      name: data.name,
      totalQuantity: data.quantity,
      totalRevenue: data.revenue,
    }))
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, 10);

  // Order status breakdown
  const orderStatusBreakdown = await prisma.order.groupBy({
    by: ['status'],
    where,
    _count: {
      status: true,
    },
  });

  return {
    totalOrders,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    averageOrderValue: Math.round(averageOrderValue * 100) / 100,
    successfulPayments,
    failedPayments,
    topSellingItems,
    orderStatusBreakdown,
  };
};

/**
 * Get user report
 */
export const getUserReport = async () => {
  const totalUsers = await prisma.user.count();

  const usersWithOrders = await prisma.user.count({
    where: {
      orders: {
        some: {},
      },
    },
  });

  const recentUsers = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      contact: true,
      createdAt: true,
      _count: {
        select: {
          orders: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 20,
  });

  return {
    totalUsers,
    usersWithOrders,
    usersWithoutOrders: totalUsers - usersWithOrders,
    recentUsers,
  };
};

/**
 * Get order report
 */
export const getOrderReport = async () => {
  const totalOrders = await prisma.order.count();

  const ordersByStatus = await prisma.order.groupBy({
    by: ['status'],
    _count: {
      status: true,
    },
  });

  const recentOrders = await prisma.order.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      payment: {
        select: {
          paymentStatus: true,
        },
      },
      _count: {
        select: {
          orderDetails: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 50,
  });

  return {
    totalOrders,
    ordersByStatus,
    recentOrders,
  };
};

/**
 * Get payment report
 */
export const getPaymentReport = async (startDate?: Date, endDate?: Date) => {
  const where: any = {};
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  const totalPayments = await prisma.payment.count({ where });

  const paymentsByStatus = await prisma.payment.groupBy({
    by: ['paymentStatus'],
    where,
    _count: {
      paymentStatus: true,
    },
    _sum: {
      amount: true,
    },
  });

  const paymentsByMethod = await prisma.payment.groupBy({
    by: ['paymentMethod'],
    where: {
      ...where,
      paymentStatus: 'COMPLETED',
    },
    _count: {
      paymentMethod: true,
    },
  });

  const recentPayments = await prisma.payment.findMany({
    where,
    include: {
      order: {
        select: {
          id: true,
          totalAmount: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 50,
  });

  return {
    totalPayments,
    paymentsByStatus,
    paymentsByMethod,
    recentPayments,
  };
};

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async () => {
  // Get basic counts
  const [
    totalUsers,
    totalOrders,
    totalRevenue,
    totalFoodItems,
    activeOrders,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.order.count({ where: { status: { not: 'PENDING' } } }), // Only count paid orders
    prisma.payment.aggregate({
      where: { paymentStatus: 'COMPLETED' },
      _sum: { amount: true },
    }),
    prisma.foodItem.count(),
    prisma.order.count({
      where: {
        status: {
          in: ['CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY'],
        },
      },
    }),
  ]);

  // Get orders by status for pie chart
  const orderStatusData = await prisma.order.groupBy({
    by: ['status'],
    where: { status: { not: 'PENDING' } }, // Exclude unpaid orders
    _count: { status: true },
  });

  const ordersByStatus: Record<string, number> = {};
  orderStatusData.forEach((item) => {
    ordersByStatus[item.status] = item._count.status;
  });

  // Get revenue by day for last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const revenueData = await prisma.payment.findMany({
    where: {
      paymentStatus: 'COMPLETED',
      createdAt: { gte: sevenDaysAgo },
    },
    select: {
      amount: true,
      createdAt: true,
    },
  });

  // Group revenue by day
  const revenueByDayMap = new Map<string, number>();
  revenueData.forEach((payment) => {
    const dateStr = payment.createdAt.toISOString().split('T')[0];
    const existing = revenueByDayMap.get(dateStr) || 0;
    revenueByDayMap.set(dateStr, existing + Number(payment.amount));
  });

  const revenueByDay = Array.from(revenueByDayMap.entries()).map(([date, revenue]) => ({
    date,
    revenue,
  }));

  // Get popular items (top 5 most ordered)
  const popularItemsData = await prisma.orderDetail.groupBy({
    by: ['itemId'],
    _sum: { quantity: true },
    _count: { id: true },
    orderBy: {
      _sum: { quantity: 'desc' },
    },
    take: 5,
  });

  // Get item names for popular items
  const itemIds = popularItemsData.map((item) => item.itemId);
  const items = await prisma.foodItem.findMany({
    where: { id: { in: itemIds } },
    select: { id: true, name: true },
  });

  const itemNameMap = new Map(items.map((item) => [item.id, item.name]));

  const popularItems = popularItemsData.map((item) => ({
    itemId: item.itemId,
    name: itemNameMap.get(item.itemId) || 'Unknown',
    orderCount: item._count.id,
    totalQuantity: item._sum.quantity || 0,
  }));

  return {
    totalUsers,
    totalOrders,
    totalRevenue: Number(totalRevenue._sum.amount) || 0,
    totalFoodItems,
    activeOrders,
    ordersByStatus,
    revenueByDay,
    popularItems,
  };
};

export default {
  getSalesReport,
  getUserReport,
  getOrderReport,
  getPaymentReport,
  getDashboardStats,
};
