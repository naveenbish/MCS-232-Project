'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks';
import {
  removeFromCart,
  updateQuantity,
  clearCart,
} from '@/features/cart/cartSlice';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PageHeader, PageHeaderMain } from '@/components/layout/page-header';
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
import { ShoppingCart, Plus, Minus, X, ArrowLeft, Trash2, Check, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, itemVariants } from '@/lib/animations';

export default function CartPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items, totalAmount } = useAppSelector((state) => state.cart);
  const user = useAppSelector((state) => state.userDetails);
  const [showClearDialog, setShowClearDialog] = useState(false);

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId);
      return;
    }
    dispatch(updateQuantity({ itemId: itemId, quantity: newQuantity }));
  };

  const handleRemoveItem = (itemId: string) => {
    const item = items.find((i) => i.foodItem.id === itemId);
    dispatch(removeFromCart(itemId));
    if (item) {
      toast.success(`${item.foodItem.name} removed from cart`);
    }
  };

  const handleClearCart = () => {
    dispatch(clearCart());
    toast.success('Cart cleared');
    setShowClearDialog(false);
  };

  const handleProceedToCheckout = () => {
    if (!user.id) {
      toast.error('Please login to continue');
      router.push('/login?redirect_to=/checkout');
      return;
    }
    router.push('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-6">
            <ShoppingCart className="w-24 h-24 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Add some delicious items to get started!</p>
            <Button onClick={() => router.push('/menu')} size="lg" className="cursor-pointer">
              Browse Menu
            </Button>
          </CardContent>
        </Card>
      </div>
    );
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
            <h1 className="text-2xl font-bold">Your Cart</h1>
            <Button
              variant="ghost"
              onClick={() => setShowClearDialog(true)}
              className="text-destructive hover:text-destructive gap-2 cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </Button>
          </div>
        </PageHeaderMain>
      </PageHeader>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="lg:col-span-2 space-y-4"
          >
            <AnimatePresence mode="popLayout">
              {items.map((item, index) => (
                <motion.div
                  key={item.foodItem.id}
                  layout
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="w-24 h-24 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                      {item.foodItem.imageUrl ? (
                        <img
                          src={item.foodItem.imageUrl}
                          alt={item.foodItem.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {item.foodItem.name}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {item.foodItem.description}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(item.foodItem.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            className="h-8 w-8 rounded-full border border-input bg-background hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition-colors"
                            onClick={() => handleUpdateQuantity(item.foodItem.id, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </motion.button>
                          <motion.span
                            key={item.quantity}
                            initial={{ scale: 1.2 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className="text-lg font-medium w-8 text-center"
                          >
                            {item.quantity}
                          </motion.span>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            className="h-8 w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center transition-colors"
                            onClick={() => handleUpdateQuantity(item.foodItem.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </motion.button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            {formatPrice(item.foodItem.price)} × {item.quantity}
                          </p>
                          <p className="text-lg font-bold text-primary">
                            {formatPrice(item.foodItem.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Items ({items.length})</span>
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
                  onClick={handleProceedToCheckout}
                  className="w-full"
                  size="lg"
                >
                  Proceed to Checkout
                </Button>

                <Button
                  onClick={() => router.push('/menu')}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Add More Items
                </Button>

                {/* Delivery Info */}
                <Card className="bg-muted/50 border-0">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Free Delivery</p>
                        <p className="text-xs text-muted-foreground">
                          On all orders above ₹199
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Clear Cart Confirmation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Clear Shopping Cart?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All items in your cart will be removed.
              Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearCart}
              className="bg-destructive hover:bg-destructive/90 cursor-pointer"
            >
              Clear Cart
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
