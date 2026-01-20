import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@/hooks/baseQuery';
import type {
  ApiResponse,
  PaginatedResponse,
  Order,
  CreateOrderDto,
  GetOrdersParams,
} from '@/types';

export const orderApi = createApi({
  reducerPath: 'orderApi',
  baseQuery,
  tagTypes: ['Orders', 'Order'],
  endpoints: (build) => ({
    // Create a new order
    createOrder: build.mutation<ApiResponse<Order>, CreateOrderDto>({
      query: (orderData) => ({
        url: '/orders',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: [{ type: 'Orders', id: 'LIST' }],
    }),

    // Get user's orders
    getUserOrders: build.query<
      PaginatedResponse<Order>,
      GetOrdersParams | void
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();

        if (params) {
          if (params.page) searchParams.append('page', params.page.toString());
          if (params.limit) searchParams.append('limit', params.limit.toString());
          if (params.status) searchParams.append('status', params.status);
        }

        const queryString = searchParams.toString();
        return `/orders${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Orders' as const, id })),
              { type: 'Orders', id: 'LIST' },
            ]
          : [{ type: 'Orders', id: 'LIST' }],
    }),

    // Get single order by ID
    getOrderById: build.query<ApiResponse<Order>, string>({
      query: (id) => `/orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),

    // Cancel an order
    cancelOrder: build.mutation<ApiResponse<Order>, string>({
      query: (id) => ({
        url: `/orders/${id}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Order', id },
        { type: 'Orders', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetUserOrdersQuery,
  useGetOrderByIdQuery,
  useCancelOrderMutation,
} = orderApi;
