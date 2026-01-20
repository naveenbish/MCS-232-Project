'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAppSelector } from '@/hooks';
import { useGetDashboardStatsQuery } from '@/services/adminReport';
import { useGetAllOrdersQuery } from '@/services/adminOrder';
import { formatPrice, formatDate } from '@/lib/utils';
import { useSocket } from '@/contexts/SocketContext';
import { StatsCard } from '@/components/admin/stats-card';
import { RevenueChart } from '@/components/charts/revenue-chart';
import { OrderChart } from '@/components/charts/order-chart';
import { PopularItemsChart } from '@/components/charts/popular-items';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  Clock,
  Bell,
  ArrowUpRight,
  Eye,
  Archive,
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const { isConnected, unreadCount } = useSocket();

  const { data: statsData, isLoading: statsLoading } = useGetDashboardStatsQuery();
  const { data: ordersData, isLoading: ordersLoading } = useGetAllOrdersQuery({
    limit: 10
  });

  const stats = statsData?.data;
  const recentOrders = ordersData?.data || [];

  // Transform data for charts
  const getRevenueChartData = () => {
    if (!stats?.revenueByDay) return [];

    // Generate last 7 days data
    const last7Days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      const dateStr = date.toISOString().split('T')[0];
      const dayData = stats.revenueByDay.find((item: any) =>
        item.date.split('T')[0] === dateStr
      );

      last7Days.push({
        date: date.toLocaleDateString('en-IN', {
          month: 'short',
          day: 'numeric'
        }),
        revenue: dayData ? parseFloat(dayData.revenue) : 0,
      });
    }

    return last7Days;
  };

  const getOrderStatusData = () => {
    if (!stats?.ordersByStatus) return [];
    const colors = {
      PENDING: '#fbbf24',
      CONFIRMED: '#3b82f6',
      PREPARING: '#8b5cf6',
      OUT_FOR_DELIVERY: '#f97316',
      DELIVERED: '#10b981',
      CANCELLED: '#ef4444',
    };

    return Object.entries(stats.ordersByStatus).map(([status, count]) => ({
      name: status,
      value: count as number,
      color: colors[status as keyof typeof colors] || '#94a3b8',
    }));
  };

  const getPopularItemsData = () => {
    if (!stats?.popularItems) return [];
    return stats.popularItems.slice(0, 5).map((item: any) => ({
      name: item.name,
      orders: item.orderCount,
    }));
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" => {
    switch (status) {
      case 'PENDING': return 'secondary';
      case 'CANCELLED': return 'destructive';
      default: return 'default';
    }
  };

  if (statsLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your admin dashboard
          </p>
        </div>
        <div className="flex items-center gap-4">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 cursor-pointer"
            >
              <Bell className="h-4 w-4" />
              {unreadCount} new notifications
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Revenue"
          value={formatPrice(stats?.totalRevenue || 0)}
          description="All time revenue"
          icon={DollarSign}
          loading={statsLoading}
        />
        <StatsCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          description="All time orders"
          icon={ShoppingBag}
          trend={stats?.orderGrowth ? {
            value: stats.orderGrowth,
            label: "from last month"
          } : undefined}
          loading={statsLoading}
        />
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          description="Registered users"
          icon={Users}
          loading={statsLoading}
        />
        <StatsCard
          title="Active Orders"
          value={stats?.activeOrders || 0}
          description="In progress"
          icon={Package}
          loading={statsLoading}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={getRevenueChartData()} loading={statsLoading} />
        <OrderChart data={getOrderStatusData()} loading={statsLoading} />
      </div>

      {/* Popular Items and Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PopularItemsChart data={getPopularItemsData()} loading={statsLoading} />

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/admin/orders')}
                className="cursor-pointer"
              >
                View all
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="flex justify-center items-center h-[300px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="flex justify-center items-center h-[300px] text-muted-foreground">
                No recent orders
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/admin/orders`)}
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium text-sm">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.user?.name || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusVariant(order.status)}>
                        {order.status.replace(/_/g, ' ')}
                      </Badge>
                      <span className="text-sm font-medium">
                        {formatPrice(parseFloat(order.totalAmount))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto flex-col items-start p-4 cursor-pointer"
              onClick={() => router.push('/admin/orders')}
            >
              <ShoppingBag className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-semibold">Manage Orders</h3>
              <p className="text-sm text-muted-foreground">View and update orders</p>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col items-start p-4 cursor-pointer"
              onClick={() => router.push('/admin/food-items')}
            >
              <Package className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-semibold">Food Items</h3>
              <p className="text-sm text-muted-foreground">Add or edit menu items</p>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col items-start p-4 cursor-pointer"
              onClick={() => router.push('/admin/categories')}
            >
              <Package className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-semibold">Categories</h3>
              <p className="text-sm text-muted-foreground">Manage food categories</p>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col items-start p-4 cursor-pointer"
              onClick={() => router.push('/admin/users')}
            >
              <Users className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-semibold">Users</h3>
              <p className="text-sm text-muted-foreground">Manage user accounts</p>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col items-start p-4 cursor-pointer"
              onClick={() => router.push('/admin/inventory')}
            >
              <Archive className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-semibold">Inventory</h3>
              <p className="text-sm text-muted-foreground">Track stock levels</p>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col items-start p-4 cursor-pointer"
              onClick={() => router.push('/admin/reports')}
            >
              <TrendingUp className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-semibold">Reports</h3>
              <p className="text-sm text-muted-foreground">View analytics & reports</p>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}