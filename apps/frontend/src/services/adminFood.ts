import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@/hooks/baseQuery';
import type {
  ApiResponse,
  Category,
  FoodItem,
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateFoodItemDto,
  UpdateFoodItemDto,
} from '@/types';

export const adminFoodApi = createApi({
  reducerPath: 'adminFoodApi',
  baseQuery,
  tagTypes: ['Categories', 'FoodItems'],
  endpoints: (build) => ({
    // Category Management
    createCategory: build.mutation<ApiResponse<Category>, CreateCategoryDto>({
      query: (categoryData) => ({
        url: '/admin/categories',
        method: 'POST',
        body: categoryData,
      }),
      invalidatesTags: ['Categories'],
    }),

    updateCategory: build.mutation<
      ApiResponse<Category>,
      { id: string; data: UpdateCategoryDto }
    >({
      query: ({ id, data }) => ({
        url: `/admin/categories/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Categories'],
    }),

    deleteCategory: build.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/admin/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Categories'],
    }),

    // Food Item Management
    createFoodItem: build.mutation<ApiResponse<FoodItem>, CreateFoodItemDto>({
      query: (foodItemData) => ({
        url: '/admin/food-items',
        method: 'POST',
        body: foodItemData,
      }),
      invalidatesTags: ['FoodItems'],
    }),

    updateFoodItem: build.mutation<
      ApiResponse<FoodItem>,
      { id: string; data: UpdateFoodItemDto }
    >({
      query: ({ id, data }) => ({
        url: `/admin/food-items/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'FoodItems', id },
        { type: 'FoodItems', id: 'LIST' },
        'Categories', // Invalidate categories to update item counts
      ],
    }),

    deleteFoodItem: build.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/admin/food-items/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'FoodItems', id },
        { type: 'FoodItems', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useCreateFoodItemMutation,
  useUpdateFoodItemMutation,
  useDeleteFoodItemMutation,
} = adminFoodApi;
