'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { useCreateOrderMutation } from '@/services/order';
import { useCreatePaymentMutation, useVerifyPaymentMutation } from '@/services/payment';
import { clearCart } from '@/features/cart/cartSlice';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { PageHeader, PageHeaderMain } from '@/components/layout/page-header';
import { ArrowLeft } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items, totalAmount } = useAppSelector((state) => state.cart);
  const user = useAppSelector((state) => state.userDetails);

  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const [createPayment] = useCreatePaymentMutation();
  const [verifyPayment] = useVerifyPaymentMutation();

  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
  });

  const [contactNumber, setContactNumber] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items.length, router]);

  // Redirect if not logged in
  useEffect(() => {
    if (!user.id) {
      router.push('/login?redirect_to=/checkout');
    }
  }, [user.id, router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!deliveryAddress.street) newErrors.street = 'Street address is required';
    if (!deliveryAddress.city) newErrors.city = 'City is required';
    if (!deliveryAddress.state) newErrors.state = 'State is required';
    if (!deliveryAddress.zipCode) {
      newErrors.zipCode = 'ZIP code is required';
    } else if (!/^\d{6}$/.test(deliveryAddress.zipCode)) {
      newErrors.zipCode = 'ZIP code must be 6 digits';
    }
    if (!contactNumber) {
      newErrors.contactNumber = 'Contact number is required';
    } else if (!/^[6-9]\d{9}$/.test(contactNumber)) {
      newErrors.contactNumber = 'Please enter a valid 10-digit mobile number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Create order
      const orderResult = await createOrder({
        items: items.map((item) => ({
          itemId: item.foodItem.id,
          quantity: item.quantity,
        })),
        deliveryAddress: `${deliveryAddress.street}, ${deliveryAddress.city}, ${deliveryAddress.state} - ${deliveryAddress.zipCode}`,
        contactNumber: contactNumber,
        deliveryInstructions: deliveryInstructions || undefined,
      }).unwrap();

      if (!orderResult.success || !orderResult.data) {
        throw new Error('Failed to create order');
      }

      const order = orderResult.data;
      toast.success('Order created successfully!');

      // Create Razorpay payment
      console.log('Creating payment with:', {
        orderId: order.id,
        amount: order.totalAmount,
      });

      const paymentResult = await createPayment({
        orderId: order.id,
        amount: parseFloat(String(order.totalAmount)),
      }).unwrap();

      if (!paymentResult.success || !paymentResult.data) {
        throw new Error('Failed to create payment');
      }

      const payment = paymentResult.data;

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway. Please try again.');
        return;
      }

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: payment.amount,
        currency: payment.currency,
        name: 'CraveCart',
        description: `Order #${order.id.slice(0, 8)}`,
        order_id: payment.razorpayOrderId,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResult = await verifyPayment({
              orderId: order.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }).unwrap();

            if (verifyResult.success) {
              // Clear cart
              dispatch(clearCart());
              toast.success('Payment successful! Your order is confirmed.');
              router.push(`/orders/${order.id}`);
            } else {
              toast.error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          email: user.email,
        },
        theme: {
          color: '#f97316', // orange-500
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error('Order error:', error);
      console.error('Request payload was:', {
        orderId: error?.data?.orderId,
        amount: error?.data?.amount
      });

      // Parse and display specific validation errors
      if (error?.data?.error) {
        try {
          const validationErrors = JSON.parse(error.data.error);
          console.error('Validation errors:', validationErrors);
          validationErrors.forEach((err: any) => {
            toast.error(`${err.field}: ${err.message}`);
          });
        } catch (parseError) {
          // If parsing fails, show the original message
          toast.error(error?.data?.message || 'Payment creation failed');
        }
      } else {
        const errorMessage =
          error?.data?.message || 'Failed to place order. Please try again.';
        toast.error(errorMessage);
      }
    }
  };

  if (items.length === 0) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-950">
      {/* Unified Header with Glassmorphism */}
      <PageHeader>
        <PageHeaderMain>
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="gap-2 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Checkout</h1>
            <div className="w-20"></div>
          </div>
        </PageHeaderMain>
      </PageHeader>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Delivery Details Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Address</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address *</Label>
                  <Input
                    id="street"
                    type="text"
                    value={deliveryAddress.street}
                    onChange={(e) =>
                      setDeliveryAddress({ ...deliveryAddress, street: e.target.value })
                    }
                    aria-invalid={!!errors.street}
                    placeholder="123 Main Street, Apt 4B"
                  />
                  {errors.street && (
                    <p className="text-sm text-destructive">{errors.street}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      type="text"
                      value={deliveryAddress.city}
                      onChange={(e) =>
                        setDeliveryAddress({ ...deliveryAddress, city: e.target.value })
                      }
                      aria-invalid={!!errors.city}
                      placeholder="City"
                    />
                    {errors.city && (
                      <p className="text-sm text-destructive">{errors.city}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      type="text"
                      value={deliveryAddress.state}
                      onChange={(e) =>
                        setDeliveryAddress({ ...deliveryAddress, state: e.target.value })
                      }
                      aria-invalid={!!errors.state}
                      placeholder="State"
                    />
                    {errors.state && (
                      <p className="text-sm text-destructive">{errors.state}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code *</Label>
                  <Input
                    id="zipCode"
                    type="text"
                    value={deliveryAddress.zipCode}
                    onChange={(e) =>
                      setDeliveryAddress({ ...deliveryAddress, zipCode: e.target.value })
                    }
                    aria-invalid={!!errors.zipCode}
                    placeholder="123456"
                  />
                  {errors.zipCode && (
                    <p className="text-sm text-destructive">{errors.zipCode}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number *</Label>
                  <Input
                    id="contactNumber"
                    type="tel"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    aria-invalid={!!errors.contactNumber}
                    placeholder="9876543210"
                    maxLength={10}
                  />
                  {errors.contactNumber && (
                    <p className="text-sm text-destructive">{errors.contactNumber}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions">Delivery Instructions (Optional)</Label>
                  <textarea
                    id="instructions"
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                    rows={3}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    placeholder="e.g., Ring the doorbell, Leave at door, etc."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.foodItem.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.foodItem.name} × {item.quantity}
                      </span>
                      <span className="font-medium">
                        {formatPrice(item.foodItem.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatPrice(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Delivery Fee</span>
                    <Badge variant="secondary" className="bg-green-500/10 text-green-700 hover:bg-green-500/20">
                      FREE
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(totalAmount)}</span>
                  </div>
                </div>

                <Button
                  onClick={handlePlaceOrder}
                  disabled={isCreatingOrder}
                  className="w-full"
                  size="lg"
                >
                  {isCreatingOrder ? 'Processing...' : 'Place Order & Pay'}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By placing this order, you agree to our terms and conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
