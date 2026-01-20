import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@/hooks/baseQuery';
import type {
  ApiResponse,
  PaginatedResponse,
  Review,
  CreateReviewDto,
  GetReviewsParams,
} from '@/types';

export const reviewApi = createApi({
  reducerPath: 'reviewApi',
  baseQuery,
  tagTypes: ['Reviews', 'Review'],
  endpoints: (build) => ({
    // Get reviews for a food item
    getReviewsByFoodItem: build.query<
      ApiResponse<PaginatedResponse<Review>>,
      GetReviewsParams
    >({
      query: ({ foodItemId, ...params }) => {
        const searchParams = new URLSearchParams();
        searchParams.append('foodItemId', foodItemId);

        if (params.page) searchParams.append('page', params.page.toString());
        if (params.limit) searchParams.append('limit', params.limit.toString());

        return `/reviews?${searchParams.toString()}`;
      },
      providesTags: (result, error, { foodItemId }) =>
        result?.data?.data
          ? [
              ...result.data.data.map(({ id }) => ({ type: 'Reviews' as const, id })),
              { type: 'Reviews', id: `FOOD_${foodItemId}` },
            ]
          : [{ type: 'Reviews', id: `FOOD_${foodItemId}` }],
    }),

    // Create a review
    createReview: build.mutation<ApiResponse<Review>, CreateReviewDto>({
      query: (reviewData) => ({
        url: '/reviews',
        method: 'POST',
        body: reviewData,
      }),
      invalidatesTags: (result, error, { foodItemId }) => [
        { type: 'Reviews', id: `FOOD_${foodItemId}` },
        { type: 'Reviews', id: 'LIST' },
      ],
    }),

    // Get user's reviews
    getUserReviews: build.query<
      ApiResponse<PaginatedResponse<Review>>,
      { page?: number; limit?: number } | void
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();

        if (params) {
          if (params.page) searchParams.append('page', params.page.toString());
          if (params.limit) searchParams.append('limit', params.limit.toString());
        }

        const queryString = searchParams.toString();
        return `/reviews/my-reviews${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: (result) =>
        result?.data?.data
          ? [
              ...result.data.data.map(({ id }) => ({ type: 'Reviews' as const, id })),
              { type: 'Reviews', id: 'USER_LIST' },
            ]
          : [{ type: 'Reviews', id: 'USER_LIST' }],
    }),
  }),
});

export const {
  useGetReviewsByFoodItemQuery,
  useCreateReviewMutation,
  useGetUserReviewsQuery,
} = reviewApi;
