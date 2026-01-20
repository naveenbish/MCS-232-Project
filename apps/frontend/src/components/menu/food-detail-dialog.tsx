'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils';
import type { FoodItem } from '@/types';
import { Circle, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { addToCart, updateQuantity, removeFromCart } from '@/features/cart/cartSlice';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface FoodDetailDialogProps {
  item: FoodItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FoodDetailDialog({ item, open, onOpenChange }: FoodDetailDialogProps) {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const [localQuantity, setLocalQuantity] = useState(1);

  if (!item) return null;

  const cartItem = cartItems.find((cartItem) => cartItem.foodItem.id === item.id);
  const quantityInCart = cartItem?.quantity || 0;

  const handleAddToCart = () => {
    if (quantityInCart > 0) {
      // Update quantity if already in cart
      dispatch(updateQuantity({ itemId: item.id, quantity: quantityInCart + localQuantity }));
      toast.success(`Updated ${item.name} quantity in cart!`);
    } else {
      // Add new item to cart
      dispatch(addToCart({ foodItem: item, quantity: localQuantity }));
      toast.success(`${item.name} added to cart!`);
    }
    setLocalQuantity(1); // Reset local quantity
    onOpenChange(false); // Close dialog
  };

  const handleLocalQuantityChange = (delta: number) => {
    const newQuantity = localQuantity + delta;
    if (newQuantity >= 1) {
      setLocalQuantity(newQuantity);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Image Section */}
        <div className="relative h-64 md:h-80 -mx-6 -mt-6 mb-6">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover rounded-t-lg"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground rounded-t-lg">
              No Image Available
            </div>
          )}

          {/* Veg/Non-Veg Badge */}
          {item.isVeg !== undefined && (
            <div className="absolute top-4 left-4">
              <div
                className={`w-8 h-8 border-2 flex items-center justify-center bg-card rounded ${
                  item.isVeg ? 'border-green-600' : 'border-red-600'
                }`}
              >
                <Circle
                  className={`w-4 h-4 fill-current ${
                    item.isVeg ? 'text-green-600' : 'text-red-600'
                  }`}
                />
              </div>
            </div>
          )}

          {/* Availability Badge */}
          <div className="absolute top-4 right-4">
            <Badge variant={item.availabilityStatus ? "default" : "secondary"}>
              {item.availabilityStatus ? 'Available' : 'Out of Stock'}
            </Badge>
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-6">
          {/* Header */}
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{item.name}</DialogTitle>
            {item.category && (
              <DialogDescription className="text-base">
                Category: {item.category.name}
              </DialogDescription>
            )}
          </DialogHeader>

          {/* Price */}
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-primary">
              {formatPrice(item.price)}
            </span>
            {quantityInCart > 0 && (
              <Badge variant="secondary" className="text-sm">
                {quantityInCart} already in cart
              </Badge>
            )}
          </div>

          {/* Description */}
          {item.description && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            </>
          )}

          {/* Add to Cart Section */}
          <Separator />
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Add to Cart</h3>

            <div className="flex items-center gap-4">
              {/* Quantity Selector */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleLocalQuantityChange(-1)}
                  disabled={localQuantity <= 1}
                  className="h-10 w-10"
                >
                  <Minus className="h-4 w-4" />
                </Button>

                <motion.span
                  key={localQuantity}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-12 text-center font-semibold text-lg"
                >
                  {localQuantity}
                </motion.span>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleLocalQuantityChange(1)}
                  className="h-10 w-10"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Subtotal */}
              <div className="flex-1 text-center">
                <span className="text-sm text-muted-foreground">Subtotal: </span>
                <span className="font-semibold text-lg">
                  {formatPrice(item.price * localQuantity)}
                </span>
              </div>

              {/* Add Button */}
              <Button
                onClick={handleAddToCart}
                disabled={!item.availabilityStatus}
                className="flex items-center gap-2"
                size="lg"
              >
                <ShoppingCart className="h-5 w-5" />
                {quantityInCart > 0 ? 'Update Cart' : 'Add to Cart'}
              </Button>
            </div>
          </div>

          {/* Additional Info */}
          {(item.preparationTime || item.spicyLevel) && (
            <>
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm">
                {item.preparationTime && (
                  <div>
                    <span className="text-muted-foreground">Preparation Time: </span>
                    <span className="font-medium">{item.preparationTime} mins</span>
                  </div>
                )}
                {item.spicyLevel && (
                  <div>
                    <span className="text-muted-foreground">Spice Level: </span>
                    <span className="font-medium">{'🌶️'.repeat(item.spicyLevel)}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}