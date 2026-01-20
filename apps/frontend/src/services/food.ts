import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@/hooks/baseQuery';
import type {
  ApiResponse,
  PaginatedResponse,
  Category,
  FoodItem,
  GetFoodItemsParams,
} from '@/types';

export const foodApi = createApi({
  reducerPath: 'foodApi',
  baseQuery,
  tagTypes: ['Categories', 'FoodItems', 'FoodItem'],
  endpoints: (build) => ({
    // Get all categories
    getCategories: build.query<ApiResponse<Category[]>, void>({
      query: () => '/food/categories',
      providesTags: ['Categories'],
    }),

    // Get food items with filters
    getFoodItems: build.query<
      ApiResponse<FoodItem[]>,
      GetFoodItemsParams | void
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();

        if (params) {
          if (params.page) searchParams.append('page', params.page.toString());
          if (params.limit) searchParams.append('limit', params.limit.toString());
          if (params.categoryId) searchParams.append('categoryId', params.categoryId);
          if (params.search) searchParams.append('search', params.search);
          if (params.sortBy) searchParams.append('sortBy', params.sortBy);
          if (params.isVeg !== undefined) searchParams.append('isVeg', params.isVeg.toString());
          if (params.isAvailable !== undefined) searchParams.append('isAvailable', params.isAvailable.toString());
          if (params.minPrice !== undefined) searchParams.append('minPrice', params.minPrice.toString());
          if (params.maxPrice !== undefined) searchParams.append('maxPrice', params.maxPrice.toString());
        }

        const queryString = searchParams.toString();
        return `/food/items${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'FoodItems' as const, id })),
              { type: 'FoodItems', id: 'LIST' },
            ]
          : [{ type: 'FoodItems', id: 'LIST' }],
    }),

    // Get single food item by ID
    getFoodItemById: build.query<ApiResponse<FoodItem>, string>({
      query: (id) => `/food/items/${id}`,
      providesTags: (result, error, id) => [{ type: 'FoodItem', id }],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetFoodItemsQuery,
  useGetFoodItemByIdQuery,
} = foodApi;
