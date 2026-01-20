import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@/hooks/baseQuery';
import type {
  ApiResponse,
  PaginatedResponse,
  Order,
  GetAdminOrdersParams,
  UpdateOrderStatusDto,
} from '@/types';

export const adminOrderApi = createApi({
  reducerPath: 'adminOrderApi',
  baseQuery,
  tagTypes: ['AdminOrders', 'AdminOrder'],
  endpoints: (build) => ({
    // Get all orders (admin)
    getAllOrders: build.query<
      ApiResponse<PaginatedResponse<Order>>,
      GetAdminOrdersParams | void
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();

        if (params) {
          if (params.page) searchParams.append('page', params.page.toString());
          if (params.limit) searchParams.append('limit', params.limit.toString());
          if (params.status) searchParams.append('status', params.status);
          if (params.userId) searchParams.append('userId', params.userId);
          if (params.startDate) searchParams.append('startDate', params.startDate);
          if (params.endDate) searchParams.append('endDate', params.endDate);
        }

        const queryString = searchParams.toString();
        return `/admin/orders${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: (result) =>
        result?.data?.data
          ? [
              ...result.data.data.map(({ id }) => ({ type: 'AdminOrders' as const, id })),
              { type: 'AdminOrders', id: 'LIST' },
            ]
          : [{ type: 'AdminOrders', id: 'LIST' }],
    }),

    // Update order status
    updateOrderStatus: build.mutation<
      ApiResponse<Order>,
      { id: string; data: UpdateOrderStatusDto }
    >({
      query: ({ id, data }) => ({
        url: `/admin/orders/${id}/status`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'AdminOrder', id },
        { type: 'AdminOrders', id: 'LIST' },
        // Also invalidate user's order cache
        { type: 'Order', id },
        { type: 'Orders', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
} = adminOrderApi;
