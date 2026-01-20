'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Heart, ShoppingCart, Star, IndianRupee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { addItem } from '@/features/cart/cartSlice';
import { itemVariants, containerVariants } from '@/lib/animations';
import Image from 'next/image';

interface FavoriteItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  rating?: number;
  veg?: boolean;
  addedAt: string;
}

interface FavoriteItemsProps {
  userId: string;
}

export function FavoriteItems({ userId }: FavoriteItemsProps) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const dispatch = useAppDispatch();
  const cart = useAppSelector(state => state.cart.items);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem(`favorites_${userId}`);
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, [userId]);

  const saveFavorites = (newFavorites: FavoriteItem[]) => {
    localStorage.setItem(`favorites_${userId}`, JSON.stringify(newFavorites));
    setFavorites(newFavorites);
  };

  const removeFavorite = (itemId: string) => {
    const newFavorites = favorites.filter(item => item.id !== itemId);
    saveFavorites(newFavorites);
    toast.success('Removed from favorites');
  };

  const handleAddToCart = (item: FavoriteItem) => {
    dispatch(addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1
    }));
    toast.success(`${item.name} added to cart`);
  };

  const isInCart = (itemId: string) => {
    return cart.some(item => item.id === itemId);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Favorite Items</CardTitle>
            <CardDescription>Your saved favorite dishes</CardDescription>
          </div>
          <Heart className="h-5 w-5 text-red-500 fill-red-500" />
        </div>
      </CardHeader>
      <CardContent>
        <AnimatePresence>
          {favorites.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-muted-foreground"
            >
              <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No favorite items yet</p>
              <p className="text-sm">Browse menu and mark items as favorite</p>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="grid gap-4"
            >
              {favorites.map((item, index) => (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  custom={index}
                  layout
                >
                  <Card className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Item Image */}
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <span className="text-2xl">🍽️</span>
                            </div>
                          )}
                          {item.veg !== undefined && (
                            <div className="absolute top-1 left-1">
                              <div className={`w-5 h-5 rounded-sm border-2 ${
                                item.veg ? 'border-green-600' : 'border-red-600'
                              } bg-white flex items-center justify-center`}>
                                <div className={`w-2.5 h-2.5 rounded-full ${
                                  item.veg ? 'bg-green-600' : 'bg-red-600'
                                }`} />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Item Details */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold">{item.name}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {item.description}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => removeFavorite(item.id)}
                            >
                              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                            </Button>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-semibold flex items-center">
                              <IndianRupee className="h-3.5 w-3.5" />
                              {item.price}
                            </span>
                            {item.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                                <span className="text-sm">{item.rating}</span>
                              </div>
                            )}
                            <Badge variant="secondary" className="text-xs">
                              {item.category}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            {isInCart(item.id) ? (
                              <Button
                                size="sm"
                                className="w-full"
                                onClick={() => window.location.href = '/cart'}
                              >
                                View in Cart
                              </Button>
                            ) : (
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full"
                              >
                                <Button
                                  size="sm"
                                  className="w-full"
                                  onClick={() => handleAddToCart(item)}
                                >
                                  <ShoppingCart className="h-4 w-4 mr-2" />
                                  Add to Cart
                                </Button>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

// Hook to manage favorites across the app
export function useFavorites(userId?: string) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const effectiveUserId = userId || 'default';

  useEffect(() => {
    const savedFavorites = localStorage.getItem(`favorite_ids_${effectiveUserId}`);
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, [effectiveUserId]);

  const toggleFavorite = (itemId: string, itemData?: any) => {
    const newFavorites = favorites.includes(itemId)
      ? favorites.filter(id => id !== itemId)
      : [...favorites, itemId];

    setFavorites(newFavorites);
    localStorage.setItem(`favorite_ids_${effectiveUserId}`, JSON.stringify(newFavorites));

    // If itemData is provided, also update the full favorites list
    if (itemData) {
      const fullFavorites = localStorage.getItem(`favorites_${effectiveUserId}`);
      let items = fullFavorites ? JSON.parse(fullFavorites) : [];

      if (favorites.includes(itemId)) {
        // Remove from favorites
        items = items.filter((item: FavoriteItem) => item.id !== itemId);
        toast.success('Removed from favorites');
      } else {
        // Add to favorites
        items.push({
          ...itemData,
          addedAt: new Date().toISOString()
        });
        toast.success('Added to favorites');
      }

      localStorage.setItem(`favorites_${effectiveUserId}`, JSON.stringify(items));
    }
  };

  const isFavorite = (itemId: string) => favorites.includes(itemId);

  return { favorites, toggleFavorite, isFavorite };
}