'use client';

import { useState } from 'react';
import { useGetCategoriesQuery, useGetFoodItemsQuery } from '@/services/food';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { addToCart } from '@/features/cart/cartSlice';
import { toast } from 'sonner';
import type { FoodItem } from '@/types';
import { MenuHeader } from '@/components/menu/menu-header';
import { SearchBar } from '@/components/menu/search-bar';
import { CategoryFilter } from '@/components/menu/category-filter';
import { VegFilter } from '@/components/menu/veg-filter';
import { FoodCard } from '@/components/menu/food-card';
import { FoodDetailDialog } from '@/components/menu/food-detail-dialog';
import { FoodSkeletonGrid } from '@/components/menu/food-skeleton';
import { EmptyState } from '@/components/menu/empty-state';
import { PageHeader, PageHeaderMain, PageHeaderFilters } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

export default function MenuPage() {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Reset page when filters change
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleVegFilterChange = (vegOnly: boolean) => {
    setIsVegOnly(vegOnly);
    setCurrentPage(1);
  };

  // Fetch categories
  const { data: categoriesData } = useGetCategoriesQuery();
  const categories = categoriesData?.data?.categories || [];

  // Fetch food items with filters
  const { data: foodItemsData, isLoading, error } = useGetFoodItemsQuery({
    page: currentPage,
    limit: 12,
    categoryId: selectedCategory || undefined,
    search: searchQuery || undefined,
    isVeg: isVegOnly ? true : undefined,
    isAvailable: true,
  });

  const foodItems = foodItemsData?.data || [];
  const pagination = foodItemsData?.pagination;

  const handleAddToCart = (item: FoodItem) => {
    dispatch(addToCart({ foodItem: item, quantity: 1 }));
    toast.success(`${item.name} added to cart!`);
  };

  const handleItemClick = (item: FoodItem) => {
    setSelectedFood(item);
    setIsDetailOpen(true);
  };

  const getItemQuantityInCart = (itemId: string) => {
    const cartItem = cartItems.find((item) => item.foodItem.id === itemId);
    return cartItem?.quantity || 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-950">
      {/* Unified Header with Glassmorphism */}
      <PageHeader>
        <PageHeaderMain>
          <MenuHeader cartItemCount={cartItems.length} />
        </PageHeaderMain>

        <PageHeaderFilters>
          <div className="space-y-4">
            {/* Search Bar */}
            <SearchBar value={searchQuery} onChange={handleSearchChange} />

            {/* Category Filters and Veg Toggle */}
            <div className="flex items-center gap-4 overflow-x-auto">
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
              />

              <Separator orientation="vertical" className="h-8" />

              <VegFilter isVegOnly={isVegOnly} onChange={handleVegFilterChange} />
            </div>
          </div>
        </PageHeaderFilters>
      </PageHeader>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Loading State */}
        {isLoading && <FoodSkeletonGrid count={12} />}

        {/* Error State */}
        {error && (
          <Card className="p-8">
            <div className="flex flex-col items-center justify-center text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
              <p className="text-muted-foreground">
                Failed to load menu items. Please try again later.
              </p>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !error && foodItems.length === 0 && <EmptyState />}

        {/* Food Items Grid */}
        {!isLoading && !error && foodItems.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {foodItems.map((item) => (
                <FoodCard
                  key={item.id}
                  item={item}
                  quantityInCart={getItemQuantityInCart(item.id)}
                  onAddToCart={handleAddToCart}
                  onItemClick={handleItemClick}
                />
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
                  className="cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      // Show first page, last page, current page, and pages around current
                      return (
                        page === 1 ||
                        page === pagination.totalPages ||
                        Math.abs(page - currentPage) <= 1
                      );
                    })
                    .map((page, index, array) => {
                      // Add ellipsis if there's a gap
                      const showEllipsis = index > 0 && page - array[index - 1] > 1;
                      return (
                        <div key={page} className="flex items-center gap-1">
                          {showEllipsis && (
                            <span className="px-2 text-muted-foreground">...</span>
                          )}
                          <Button
                            variant={currentPage === page ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="min-w-[2.5rem] cursor-pointer"
                          >
                            {page}
                          </Button>
                        </div>
                      );
                    })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(pagination.totalPages, prev + 1))
                  }
                  disabled={currentPage === pagination.totalPages}
                  className="cursor-pointer"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Food Detail Dialog */}
      <FoodDetailDialog
        item={selectedFood}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  );
}
