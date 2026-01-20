import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@/hooks/baseQuery';
import type { ApiResponse, FoodItem } from '@/types';

export interface InventoryItem {
  id: string;
  foodItemId: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  lastRestocked?: string | null;
  supplier?: string | null;
  costPrice?: number | null;
  location?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  foodItem?: FoodItem;
  stockStatus?: string;
  stockPercentage?: number;
}

interface InventoryResponse {
  inventory: InventoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface InventoryStats {
  totalItems: number;
  lowStock: number;
  outOfStock: number;
  optimal: number;
  totalValue: number;
}

interface CreateInventoryDto {
  foodItemId: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  supplier?: string;
  costPrice?: number;
  location?: string;
  notes?: string;
}

interface UpdateInventoryDto {
  currentStock?: number;
  minStock?: number;
  maxStock?: number;
  unit?: string;
  supplier?: string;
  costPrice?: number;
  location?: string;
  notes?: string;
}

interface RestockDto {
  quantity: number;
  supplier?: string;
  costPrice?: number;
}

interface AdjustStockDto {
  adjustment: number;
  reason: string;
}

export const adminInventoryApi = createApi({
  reducerPath: 'adminInventoryApi',
  baseQuery,
  tagTypes: ['Inventory', 'InventoryStats'],
  endpoints: (build) => ({
    // Get all inventory items
    getInventory: build.query<ApiResponse<InventoryResponse>, {
      page?: number;
      limit?: number;
      search?: string;
      categoryId?: string;
      stockStatus?: 'low' | 'optimal' | 'overstocked' | 'out';
    }>({
      query: (params) => ({
        url: '/admin/inventory',
        params,
      }),
      providesTags: ['Inventory'],
    }),

    // Get inventory for specific food item
    getInventoryByFoodItemId: build.query<ApiResponse<{ inventory: InventoryItem }>, string>({
      query: (foodItemId) => `/admin/inventory/${foodItemId}`,
      providesTags: (_result, _error, foodItemId) => [{ type: 'Inventory', id: foodItemId }],
    }),

    // Create inventory record
    createInventory: build.mutation<ApiResponse<{ inventory: InventoryItem }>, CreateInventoryDto>({
      query: (data) => ({
        url: '/admin/inventory',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Inventory', 'InventoryStats'],
    }),

    // Update inventory
    updateInventory: build.mutation<ApiResponse<{ inventory: InventoryItem }>, {
      foodItemId: string;
      data: UpdateInventoryDto;
    }>({
      query: ({ foodItemId, data }) => ({
        url: `/admin/inventory/${foodItemId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { foodItemId }) => [
        { type: 'Inventory', id: foodItemId },
        'Inventory',
        'InventoryStats',
      ],
    }),

    // Restock inventory
    restockInventory: build.mutation<ApiResponse<{ inventory: InventoryItem }>, {
      foodItemId: string;
      data: RestockDto;
    }>({
      query: ({ foodItemId, data }) => ({
        url: `/admin/inventory/${foodItemId}/restock`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { foodItemId }) => [
        { type: 'Inventory', id: foodItemId },
        'Inventory',
        'InventoryStats',
      ],
    }),

    // Adjust stock
    adjustStock: build.mutation<ApiResponse<{ inventory: InventoryItem }>, {
      foodItemId: string;
      data: AdjustStockDto;
    }>({
      query: ({ foodItemId, data }) => ({
        url: `/admin/inventory/${foodItemId}/adjust`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { foodItemId }) => [
        { type: 'Inventory', id: foodItemId },
        'Inventory',
        'InventoryStats',
      ],
    }),

    // Get low stock items
    getLowStockItems: build.query<ApiResponse<{ items: InventoryItem[] }>, void>({
      query: () => '/admin/inventory/low-stock',
      providesTags: ['Inventory'],
    }),

    // Get inventory statistics
    getInventoryStats: build.query<ApiResponse<{ stats: InventoryStats }>, void>({
      query: () => '/admin/inventory/stats',
      providesTags: ['InventoryStats'],
    }),

    // Delete inventory record
    deleteInventory: build.mutation<ApiResponse<void>, string>({
      query: (foodItemId) => ({
        url: `/admin/inventory/${foodItemId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Inventory', 'InventoryStats'],
    }),

    // Initialize inventory
    initializeInventory: build.mutation<ApiResponse<{ count: number }>, void>({
      query: () => ({
        url: '/admin/inventory/initialize',
        method: 'POST',
      }),
      invalidatesTags: ['Inventory', 'InventoryStats'],
    }),
  }),
});

export const {
  useGetInventoryQuery,
  useGetInventoryByFoodItemIdQuery,
  useCreateInventoryMutation,
  useUpdateInventoryMutation,
  useRestockInventoryMutation,
  useAdjustStockMutation,
  useGetLowStockItemsQuery,
  useGetInventoryStatsQuery,
  useDeleteInventoryMutation,
  useInitializeInventoryMutation,
} = adminInventoryApi;