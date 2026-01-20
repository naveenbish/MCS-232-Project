'use client';

import { useState, useEffect } from 'react';
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
import { PageHeader, PageHeaderMain, PageHeaderFilters } from '@/components/layout/page-header';
import { MenuHeader } from '@/components/menu/menu-header';
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
  ArrowLeft,
  ShoppingBag,
  Package,
  Clock,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  XCircle,
  Eye,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ORDER_STATUSES = [
  { value: '', label: 'All Orders' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PREPARING', label: 'Preparing' },
  { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function OrdersPage() {
  const router = useRouter();
  const cartItems = useAppSelector((state) => state.cart.items);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);

  const { data, isLoading, error } = useGetUserOrdersQuery({
    page: currentPage,
    limit: 10,
    status: statusFilter || undefined,
  });

  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();

  const orders = data?.data || [];
  const pagination = data?.pagination;

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

  const handleViewOrder = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'secondary';
      case 'CONFIRMED':
        return 'default';
      case 'PREPARING':
        return 'default';
      case 'OUT_FOR_DELIVERY':
        return 'default';
      case 'DELIVERED':
        return 'success';
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-950">
      {/* Unified Header with Glassmorphism - Same as Menu Page */}
      <PageHeader>
        <PageHeaderMain>
          <MenuHeader cartItemCount={cartItems.length} currentPage="orders" showBackButton={true} />
        </PageHeaderMain>

        <PageHeaderFilters>
          {/* Filter Pills */}
          <div className="w-full overflow-x-auto">
            <div className="inline-flex h-11 items-center justify-start gap-1 rounded-lg bg-muted p-1.5 text-muted-foreground min-w-full md:min-w-0">
              {ORDER_STATUSES.map((status) => (
                <button
                  key={status.value}
                  onClick={() => {
                    setStatusFilter(status.value);
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 min-w-fit cursor-pointer",
                    statusFilter === status.value
                      ? "bg-background text-foreground shadow-sm"
                      : "hover:bg-background/50 hover:text-foreground"
                  )}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>
        </PageHeaderFilters>
      </PageHeader>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
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
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
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
              <CardDescription>
                We couldn't fetch your orders. Please try again.
              </CardDescription>
              <Button
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !error && orders.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-muted p-4 mb-4">
                <ShoppingBag className="h-12 w-12 text-muted-foreground" />
              </div>
              <CardTitle className="mb-2">No Orders Yet</CardTitle>
              <CardDescription className="text-center mb-6">
                {statusFilter
                  ? `No ${statusFilter.toLowerCase().replace('_', ' ')} orders found`
                  : 'Start ordering to see your order history'}
              </CardDescription>
              <Button onClick={() => router.push('/menu')}>
                Browse Menu
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Orders List */}
        {!isLoading && !error && orders.length > 0 && (
          <>
            <div className="space-y-4">
              {orders.map((order) => (
                <Card
                  key={order.id}
                  className="hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => handleViewOrder(order.id)}
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

                      {/* Actions Dropdown */}
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
                              handleViewOrder(order.id);
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
                    {/* Order Items Preview */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Package className="h-4 w-4" />
                        {order.orderDetails.length} item(s)
                      </div>
                      <div className="space-y-1">
                        {order.orderDetails.slice(0, 2).map((item) => (
                          <div
                            key={item.id}
                            className="text-sm flex items-center justify-between"
                          >
                            <span className="text-foreground">
                              {item.foodItem?.name} × {item.quantity}
                            </span>
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

                    {/* Order Footer */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Amount</p>
                        <p className="text-xl font-bold text-primary">
                          {formatPrice(parseFloat(order.totalAmount))}
                        </p>
                      </div>

                      {/* Payment Status */}
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
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {pagination.totalPages}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(pagination.totalPages, prev + 1))
                  }
                  disabled={currentPage === pagination.totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Cancel Order Confirmation Dialog */}
      <AlertDialog
        open={!!cancelOrderId}
        onOpenChange={(open) => !open && setCancelOrderId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this order? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>
              Keep Order
            </AlertDialogCancel>
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