'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/hooks';
import { useGetAllOrdersQuery, useUpdateOrderStatusMutation } from '@/services/adminOrder';
import { formatPrice, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { useSocket } from '@/contexts/SocketContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Package,
  Clock,
  DollarSign,
  TrendingUp,
  Loader2,
  Wifi,
  WifiOff,
  Bell,
} from 'lucide-react';

const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
] as const;

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PREPARING', label: 'Preparing' },
  { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function AdminOrdersPage() {
  const router = useRouter();
  const user = useAppSelector((state) => state.userDetails);
  const [statusFilter, setStatusFilter] = useState('all');
  const { isConnected, unreadCount, clearUnread } = useSocket();

  // Redirect if not admin
  useEffect(() => {
    if (user.id && user.role !== 'admin') {
      router.push('/menu');
    }
  }, [user, router]);

  const { data, isLoading, error } = useGetAllOrdersQuery({
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const [updateOrderStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();

  const orders = data?.data || [];

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const result = await updateOrderStatus({
        id: orderId,
        status: newStatus,
      }).unwrap();

      if (result.success) {
        toast.success(`Order status updated to ${newStatus.replace('_', ' ')}`);
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update order status');
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'PENDING': return 'secondary';
      case 'CONFIRMED': return 'default';
      case 'PREPARING': return 'default';
      case 'OUT_FOR_DELIVERY': return 'default';
      case 'DELIVERED': return 'default';
      case 'CANCELLED': return 'destructive';
      default: return 'secondary';
    }
  };

  const getPaymentStatusVariant = (status: string): "default" | "secondary" | "destructive" => {
    switch (status) {
      case 'PENDING': return 'secondary';
      case 'COMPLETED': return 'default';
      case 'FAILED': return 'destructive';
      default: return 'secondary';
    }
  };

  // Calculate stats
  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'PENDING').length,
    totalRevenue: orders
      .filter(o => o.payment?.paymentStatus === 'COMPLETED')
      .reduce((sum, o) => sum + parseFloat(o.totalAmount), 0),
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Orders</h1>
          <p className="text-muted-foreground">
            View and manage all customer orders
          </p>
        </div>

        {/* Connection Status & Notifications */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-sm text-muted-foreground">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-500" />
                <span className="text-sm text-muted-foreground">Disconnected</span>
              </>
            )}
          </div>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearUnread}
              className="gap-2 cursor-pointer"
            >
              <Bell className="h-4 w-4" />
              {unreadCount} new update{unreadCount > 1 ? 's' : ''}
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingOrders} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                From completed orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {orders.filter(o =>
                  ['PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY'].includes(o.status)
                ).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently processing
              </p>
            </CardContent>
          </Card>
      </div>

      {/* Orders Table with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>
            Manage and track all customer orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList className="grid grid-cols-7 w-full mb-6">
              {STATUS_TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={statusFilter} className="mt-6">
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No orders found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Payment</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-mono text-sm">
                              #{order.id.slice(0, 8).toUpperCase()}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{order.user?.name || 'Unknown'}</p>
                                <p className="text-sm text-muted-foreground">
                                  {order.user?.email}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {order.orderDetails?.length || 0} items
                            </TableCell>
                            <TableCell className="font-semibold">
                              {formatPrice(parseFloat(order.totalAmount))}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getPaymentStatusVariant(order.payment?.paymentStatus || 'PENDING')}>
                                {order.payment?.paymentStatus || 'PENDING'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm" suppressHydrationWarning>
                                  {formatDate(new Date(order.createdAt))}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusVariant(order.status)}>
                                {order.status.replace(/_/g, ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={order.status}
                                onValueChange={(value) => handleStatusUpdate(order.id, value)}
                                disabled={isUpdating || order.status === 'CANCELLED' || order.status === 'DELIVERED'}
                              >
                                <SelectTrigger className="w-36">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {ORDER_STATUSES.map((status) => (
                                    <SelectItem key={status} value={status}>
                                      {status.replace(/_/g, ' ')}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}