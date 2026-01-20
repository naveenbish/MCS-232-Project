'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useGetOrderByIdQuery, useCancelOrderMutation } from '@/services/order';
import { formatPrice, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { socketManager } from '@/lib/socket';
import { PageHeader, PageHeaderMain } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
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
  Package,
  MapPin,
  Clock,
  CreditCard,
  ShoppingBag,
  CheckCircle,
  XCircle,
  Truck,
  ChefHat,
  Loader2,
} from 'lucide-react';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const { data, isLoading, error } = useGetOrderByIdQuery(orderId);
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();

  const order = data?.data?.order;

  // Join order room for real-time updates
  useEffect(() => {
    if (order?.id) {
      socketManager.joinOrderRoom(order.id);
      return () => {
        socketManager.leaveOrderRoom(order.id);
      };
    }
  }, [order?.id]);

  const handleCancelOrder = async () => {
    try {
      const result = await cancelOrder(orderId).unwrap();
      if (result.success) {
        toast.success('Order cancelled successfully');
        setShowCancelDialog(false);
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || 'Failed to cancel order';
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-destructive mb-4">Failed to load order details</p>
              <Button onClick={() => router.push('/orders')} className="cursor-pointer">
                Back to Orders
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getOrderProgress = () => {
    const stages = [
      { key: 'PENDING', label: 'Order Placed', icon: Package },
      { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle },
      { key: 'PREPARING', label: 'Preparing', icon: ChefHat },
      { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
      { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
    ];

    const currentIndex = stages.findIndex(stage => stage.key === order?.status);
    const progressPercentage = currentIndex >= 0 ? ((currentIndex + 1) / stages.length) * 100 : 0;

    return { stages, currentIndex, progressPercentage };
  };

  const { stages, currentIndex, progressPercentage } = getOrderProgress();

  const getStatusVariant = (status: string) => {
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

  const getPaymentStatusVariant = (status: string) => {
    switch (status) {
      case 'PENDING': return 'secondary';
      case 'COMPLETED': return 'default';
      case 'FAILED': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Glassmorphism */}
      <PageHeader>
        <PageHeaderMain>
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.push('/orders')}
              className="gap-2 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Orders
            </Button>
            <h1 className="text-2xl font-bold">
              Order #{orderId.slice(0, 8).toUpperCase()}
            </h1>
            <div className="w-28"></div>
          </div>
        </PageHeaderMain>
      </PageHeader>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Order Status</CardTitle>
                  {order?.status && (
                    <Badge variant={getStatusVariant(order.status)}>
                      {order.status.replace(/_/g, ' ')}
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  Track your order progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                {order?.status !== 'CANCELLED' && (
                  <>
                    <Progress value={progressPercentage} className="mb-6" />
                    <div className="flex justify-between">
                      {stages.map((stage, index) => {
                        const Icon = stage.icon;
                        const isActive = index <= currentIndex;
                        return (
                          <div
                            key={stage.key}
                            className={`flex flex-col items-center ${
                              isActive ? 'text-primary' : 'text-muted-foreground'
                            }`}
                          >
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                                isActive
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              <Icon className="h-5 w-5" />
                            </div>
                            <p className="text-xs text-center hidden sm:block">
                              {stage.label}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
                {order?.status === 'CANCELLED' && (
                  <div className="text-center py-4">
                    <XCircle className="h-12 w-12 text-destructive mx-auto mb-2" />
                    <p className="text-destructive font-medium">Order Cancelled</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Items Card */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
                <CardDescription>
                  {order?.orderDetails?.length || 0} items
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order?.orderDetails?.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-20 h-20 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                        {item.foodItem?.imageUrl ? (
                          <img
                            src={item.foodItem.imageUrl}
                            alt={item.foodItem.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">
                          {item.foodItem?.name || 'Unknown Item'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Price: {formatPrice(parseFloat(item.priceAtTime))} each
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">
                          {formatPrice(parseFloat(item.priceAtTime) * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Details</CardTitle>
                <CardDescription>
                  Delivery information and instructions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium mb-1">Delivery Address</p>
                    <p className="text-sm text-muted-foreground">
                      {order?.deliveryAddress}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium mb-1">Order Placed</p>
                    <p className="text-sm text-muted-foreground" suppressHydrationWarning>
                      {order?.createdAt ? formatDate(new Date(order.createdAt)) : '-'}
                    </p>
                  </div>
                </div>

                {order?.deliveryInstructions && (
                  <div className="flex gap-3">
                    <Package className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium mb-1">Delivery Instructions</p>
                      <p className="text-sm text-muted-foreground">
                        {order.deliveryInstructions}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Payment Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatPrice(parseFloat(order?.totalAmount || '0'))}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delivery Fee</span>
                      <Badge variant="secondary" className="bg-green-500/10 text-green-700 hover:bg-green-500/20">
                        FREE
                      </Badge>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary">
                        {formatPrice(parseFloat(order?.totalAmount || '0'))}
                      </span>
                    </div>
                  </div>

                  {/* Payment Status */}
                  {order?.payment && (
                    <>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Payment Status</span>
                        </div>
                        <Badge variant={getPaymentStatusVariant(order.payment.paymentStatus)}>
                          {order.payment.paymentStatus}
                        </Badge>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Actions Card */}
              <Card>
                <CardContent className="pt-6 space-y-3">
                  {order?.status === 'PENDING' && (
                    <Button
                      variant="destructive"
                      onClick={() => setShowCancelDialog(true)}
                      disabled={isCancelling}
                      className="w-full cursor-pointer"
                    >
                      {isCancelling ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Cancelling...
                        </>
                      ) : (
                        'Cancel Order'
                      )}
                    </Button>
                  )}
                  <Button
                    onClick={() => router.push('/menu')}
                    className="w-full cursor-pointer"
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Order Again
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this order? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep order</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelOrder}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, cancel order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}