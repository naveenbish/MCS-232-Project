'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import type { FoodItem } from '@/types';
import { Circle, Plus, Minus, Heart } from 'lucide-react';
import { updateQuantity, removeFromCart } from '@/features/cart/cartSlice';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { motion, AnimatePresence } from 'framer-motion';
import { useFavorites } from '@/components/profile/favorite-items';

interface FoodCardProps {
  item: FoodItem;
  quantityInCart: number;
  onAddToCart: (item: FoodItem) => void;
  onItemClick?: (item: FoodItem) => void;
}

export function FoodCard({ item, quantityInCart, onAddToCart, onItemClick }: FoodCardProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.userDetails);
  const { isFavorite, toggleFavorite } = useFavorites(user.id);

  const handleCardClick = (e: React.MouseEvent) => {
    // Check if the click originated from an interactive element
    const target = e.target as HTMLElement;
    const isInteractive = target.closest('button') || target.closest('[role="button"]');

    if (!isInteractive && onItemClick) {
      onItemClick(item);
    }
  };

  return (
    <Card
      className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Image Section */}
      <div className="relative h-48 bg-muted">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No Image
          </div>
        )}

        {/* Veg/Non-Veg Badge */}
        {item.isVeg !== undefined && (
          <div className="absolute top-2 left-2">
            <div
              className={`w-6 h-6 border-2 flex items-center justify-center bg-card ${
                item.isVeg ? 'border-green-600' : 'border-red-600'
              }`}
            >
              <Circle
                className={`w-3 h-3 fill-current ${
                  item.isVeg ? 'text-green-600' : 'text-red-600'
                }`}
              />
            </div>
          </div>
        )}

        {/* Favorite Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => toggleFavorite(item.id, {
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            imageUrl: item.image,
            category: item.category?.name || 'Food',
            veg: item.isVeg
          })}
          className="absolute top-2 right-2 w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-card transition-colors"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              isFavorite(item.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
            }`}
          />
        </motion.button>
      </div>

      {/* Content Section */}
      <CardContent className="pt-6 pb-0">
        <h3 className="text-lg font-semibold mb-1 line-clamp-1">
          {item.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {item.description}
        </p>
      </CardContent>

      {/* Footer with Price and Action */}
      <CardFooter className="flex items-center justify-between pt-4">
        <span className="text-xl font-bold text-primary">
          {formatPrice(item.price)}
        </span>

        <AnimatePresence mode="wait">
          {quantityInCart > 0 ? (
            <motion.div
              key="controls"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  if (quantityInCart === 1) {
                    dispatch(removeFromCart(item.id));
                  } else {
                    dispatch(updateQuantity({ itemId: item.id, quantity: quantityInCart - 1 }));
                  }
                }}
                className="w-8 h-8 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors"
              >
                <Minus className="w-4 h-4" />
              </motion.button>

              <motion.span
                key={quantityInCart}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-8 text-center font-semibold"
              >
                {quantityInCart}
              </motion.span>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => dispatch(updateQuantity({ itemId: item.id, quantity: quantityInCart + 1 }))}
                className="w-8 h-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center transition-colors"
              >
                <Plus className="w-4 h-4" />
              </motion.button>

              <span className="ml-2 text-sm font-medium text-muted-foreground">
                {formatPrice(item.price * quantityInCart)}
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="add-button"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                onClick={() => onAddToCart(item)}
                className="transition-all hover:scale-105"
              >
                Add
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardFooter>
    </Card>
  );
}
