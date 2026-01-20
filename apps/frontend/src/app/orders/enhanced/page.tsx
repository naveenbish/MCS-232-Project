'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useGetUserOrdersQuery, useCancelOrderMutation } from '@/services/order';
import { useAppSelector } from '@/hooks';
import { formatPrice, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { PageHeader, PageHeaderMain } from '@/components/layout/page-header';
import { MenuHeader } from '@/components/menu/menu-header';
import { OrderFilters, OrderStatus, DateRange } from '@/components/orders/order-filters';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ShoppingBag,
  Package,
  Clock,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  XCircle,
  Eye,
  AlertCircle,
  Loader2,
  TrendingUp,
  TrendingDown,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { itemVariants } from '@/lib/animations';

export default function EnhancedOrdersPage() {
  const router = useRouter();
  const cartItems = useAppSelector((state) => state.cart.items);
  const [currentPage, setCurrentPage] = useState(1);
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus>('all');
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [customDateRange, setCustomDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [priceRange, setPriceRange] = useState<{ min?: number; max?: number }>({});

  // Map our filter status to API status
  const apiStatus = statusFilter === 'all' ? undefined : statusFilter.toUpperCase();

  const { data, isLoading, error } = useGetUserOrdersQuery({
    page: currentPage,
    limit: 10,
    status: apiStatus,
  });

  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();

  const orders = data?.data || [];
  const pagination = data?.pagination;

  // Client-side filtering for search, date range, and price
  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(search) ||
        order.orderDetails.some(item =>
          item.foodItem?.name?.toLowerCase().includes(search)
        )
      );
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);

        switch (dateRange) {
          case 'today':
            return orderDate >= today;
          case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return orderDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return orderDate >= monthAgo;
          case 'custom':
            if (customDateRange.from && orderDate < customDateRange.from) return false;
            if (customDateRange.to && orderDate > customDateRange.to) return false;
            return true;
          default:
            return true;
        }
      });
    }

    // Price range filter
    if (priceRange.min !== undefined || priceRange.max !== undefined) {
      filtered = filtered.filter(order => {
        const total = parseFloat(order.totalAmount);
        if (priceRange.min !== undefined && total < priceRange.min) return false;
        if (priceRange.max !== undefined && total > priceRange.max) return false;
        return true;
      });
    }

    return filtered;
  }, [orders, searchTerm, dateRange, customDateRange, priceRange]);

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!filteredOrders.length) return null;

    const totalSpent = filteredOrders.reduce((sum, order) =>
      sum + parseFloat(order.totalAmount), 0
    );
    const avgOrderValue = totalSpent / filteredOrders.length;
    const completedOrders = filteredOrders.filter(o => o.status === 'DELIVERED').length;

    return {
      totalOrders: filteredOrders.length,
      totalSpent,
      avgOrderValue,
      completedOrders,
      completionRate: (completedOrders / filteredOrders.length) * 100
    };
  }, [filteredOrders]);

  const handleCancelOrder = async () => {
    if (!cancelOrderId) return;

    try {
      const result = await cancelOrder(cancelOrderId).unwrap();
      if (result.success) {
        toast.success('Order cancelled successfully');
        setCancelOrderId(null);
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || 'Failed to cancel order';
      toast.error(errorMessage);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'PENDING': return 'secondary';
      case 'CONFIRMED':
      case 'PREPARING':
      case 'OUT_FOR_DELIVERY': return 'default';
      case 'DELIVERED': return 'success';
      case 'CANCELLED': return 'destructive';
      default: return 'outline';
    }
  };

  // Count active filters
  const activeFiltersCount = [
    searchTerm ? 1 : 0,
    statusFilter !== 'all' ? 1 : 0,
    dateRange !== 'all' ? 1 : 0,
    priceRange.min || priceRange.max ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <PageHeader>
        <PageHeaderMain>
          <MenuHeader
            cartItemCount={cartItems.length}
            currentPage="orders"
            showBackButton={true}
          />
        </PageHeaderMain>
      </PageHeader>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <OrderFilters
              onSearchChange={setSearchTerm}
              onStatusChange={setStatusFilter}
              onDateRangeChange={(range, dates) => {
                setDateRange(range);
                if (dates) setCustomDateRange(dates);
              }}
              onPriceRangeChange={(min, max) => setPriceRange({ min, max })}
              activeFiltersCount={activeFiltersCount}
            />

            {/* Statistics Card */}
            {statistics && !isLoading && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg">Order Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Orders</span>
                    <span className="font-semibold">{statistics.totalOrders}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Spent</span>
                    <span className="font-semibold text-primary">
                      {formatPrice(statistics.totalSpent)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Avg. Order</span>
                    <span className="font-semibold">
                      {formatPrice(statistics.avgOrderValue)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Completion Rate</span>
                    <div className="flex items-center gap-1">
                      {statistics.completionRate > 80 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <span className="font-semibold">
                        {statistics.completionRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Orders List */}
          <div className="lg:col-span-3">
            {/* Loading State */}
            {isLoading && (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-6 w-20" />
                      </div>
                      <Skeleton className="h-4 w-48" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                  <CardTitle className="mb-2">Failed to Load Orders</CardTitle>
                  <CardDescription>Please try again.</CardDescription>
                  <Button className="mt-4" onClick={() => window.location.reload()}>
                    Retry
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {!isLoading && !error && filteredOrders.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="rounded-full bg-muted p-4 mb-4">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <CardTitle className="mb-2">
                    {activeFiltersCount > 0 ? 'No Matching Orders' : 'No Orders Yet'}
                  </CardTitle>
                  <CardDescription className="text-center mb-6">
                    {activeFiltersCount > 0
                      ? 'Try adjusting your filters to see more orders'
                      : 'Start ordering to see your order history'}
                  </CardDescription>
                  {activeFiltersCount === 0 && (
                    <Button onClick={() => router.push('/menu')}>
                      Browse Menu
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Orders */}
            {!isLoading && !error && filteredOrders.length > 0 && (
              <AnimatePresence mode="popLayout">
                <motion.div className="space-y-4">
                  {filteredOrders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      custom={index}
                      layout
                    >
                      <Card
                        className="hover:shadow-lg transition-all cursor-pointer group"
                        onClick={() => router.push(`/orders/${order.id}`)}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <CardTitle className="text-lg">
                                  Order #{order.id.slice(0, 8).toUpperCase()}
                                </CardTitle>
                                <Badge variant={getStatusBadgeVariant(order.status)}>
                                  {order.status.replace('_', ' ')}
                                </Badge>
                              </div>
                              <CardDescription className="flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                <span suppressHydrationWarning>
                                  {formatDate(new Date(order.createdAt))}
                                </span>
                              </CardDescription>
                            </div>

                            {/* Actions */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/orders/${order.id}`);
                                  }}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                {order.status === 'PENDING' && (
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCancelOrderId(order.id);
                                    }}
                                    className="text-destructive"
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancel Order
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>

                        <CardContent>
                          {/* Items Preview */}
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Package className="h-4 w-4" />
                              {order.orderDetails.length} item(s)
                            </div>
                            <div className="space-y-1">
                              {order.orderDetails.slice(0, 2).map((item) => (
                                <div key={item.id} className="text-sm flex justify-between">
                                  <span>{item.foodItem?.name} × {item.quantity}</span>
                                  <span className="text-muted-foreground">
                                    {formatPrice(parseFloat(item.priceAtTime) * item.quantity)}
                                  </span>
                                </div>
                              ))}
                              {order.orderDetails.length > 2 && (
                                <p className="text-sm text-muted-foreground">
                                  +{order.orderDetails.length - 2} more items
                                </p>
                              )}
                            </div>
                          </div>

                          <Separator className="my-4" />

                          {/* Footer */}
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Total Amount</p>
                              <p className="text-xl font-bold text-primary">
                                {formatPrice(parseFloat(order.totalAmount))}
                              </p>
                            </div>

                            {order.payment && (
                              <Badge
                                variant={
                                  order.payment.paymentStatus === 'COMPLETED'
                                    ? 'success'
                                    : order.payment.paymentStatus === 'FAILED'
                                    ? 'destructive'
                                    : 'secondary'
                                }
                              >
                                Payment: {order.payment.paymentStatus}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>

                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {pagination.totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                  disabled={currentPage === pagination.totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Cancel Order Dialog */}
      <AlertDialog open={!!cancelOrderId} onOpenChange={(open) => !open && setCancelOrderId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this order? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Keep Order</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelOrder}
              disabled={isCancelling}
              className="bg-destructive text-destructive-foreground"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Cancel Order'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}