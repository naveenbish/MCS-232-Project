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
import { Separator } from '@/components/ui/separator';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  Eye,
  MapPin,
  Phone,
  User,
  ShoppingBag,
  CreditCard,
} from 'lucide-react';
import type { Order } from '@/types';

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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { isConnected, unreadCount, clearUnread } = useSocket();

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

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
        data: { status: newStatus },
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
                          <TableRow
                            key={order.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => handleViewOrder(order)}
                          >
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
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleViewOrder(order)}
                                  className="h-8 w-8"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
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
                              </div>
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

      {/* Order Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order #{selectedOrder?.id.slice(0, 8).toUpperCase()}
            </DialogTitle>
            <DialogDescription>
              Order details and information
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Status and Payment */}
              <div className="flex items-center gap-4">
                <Badge variant={getStatusVariant(selectedOrder.status)} className="text-sm">
                  {selectedOrder.status.replace(/_/g, ' ')}
                </Badge>
                <Badge variant={getPaymentStatusVariant(selectedOrder.payment?.paymentStatus || 'PENDING')} className="text-sm">
                  Payment: {selectedOrder.payment?.paymentStatus || 'PENDING'}
                </Badge>
              </div>

              <Separator />

              {/* Customer Info */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedOrder.user?.name || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedOrder.user?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Contact</p>
                    <p className="font-medium">{selectedOrder.contactNumber || selectedOrder.user?.contact || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Order Date</p>
                    <p className="font-medium" suppressHydrationWarning>
                      {formatDate(new Date(selectedOrder.createdAt))}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Delivery Address */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Delivery Address
                </h3>
                <p className="text-sm">{selectedOrder.deliveryAddress || 'No address provided'}</p>
              </div>

              <Separator />

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Order Items ({selectedOrder.orderDetails?.length || 0})
                </h3>
                <div className="space-y-3">
                  {selectedOrder.orderDetails?.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          {item.foodItem?.image ? (
                            <img
                              src={item.foodItem.image}
                              alt={item.foodItem.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Package className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{item.foodItem?.name || 'Unknown Item'}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatPrice(parseFloat(item.priceAtTime))} × {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold">
                        {formatPrice(parseFloat(item.subtotal || item.priceAtTime * item.quantity))}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Payment Summary */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Payment Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(parseFloat(selectedOrder.totalAmount))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span className="text-green-600">FREE</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(parseFloat(selectedOrder.totalAmount))}</span>
                  </div>
                </div>
              </div>

              {/* Update Status */}
              <Separator />
              <div className="flex items-center justify-between">
                <span className="font-medium">Update Status:</span>
                <Select
                  value={selectedOrder.status}
                  onValueChange={(value) => {
                    handleStatusUpdate(selectedOrder.id, value);
                    setSelectedOrder({ ...selectedOrder, status: value });
                  }}
                  disabled={isUpdating || selectedOrder.status === 'CANCELLED' || selectedOrder.status === 'DELIVERED'}
                >
                  <SelectTrigger className="w-48">
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
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}