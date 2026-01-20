import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@/hooks/baseQuery';
import type {
  ApiResponse,
  SalesReport,
  UserReport,
  OrderReport,
  PaymentReport,
  DashboardStats,
  GetReportParams,
} from '@/types';

export const adminReportApi = createApi({
  reducerPath: 'adminReportApi',
  baseQuery,
  tagTypes: ['Reports', 'DashboardStats'],
  endpoints: (build) => ({
    // Get sales report
    getSalesReport: build.query<ApiResponse<SalesReport>, GetReportParams | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();

        if (params) {
          if (params.startDate) searchParams.append('startDate', params.startDate);
          if (params.endDate) searchParams.append('endDate', params.endDate);
          if (params.groupBy) searchParams.append('groupBy', params.groupBy);
        }

        const queryString = searchParams.toString();
        return `/admin/reports/sales${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Reports'],
    }),

    // Get user report
    getUserReport: build.query<ApiResponse<UserReport>, GetReportParams | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();

        if (params) {
          if (params.startDate) searchParams.append('startDate', params.startDate);
          if (params.endDate) searchParams.append('endDate', params.endDate);
        }

        const queryString = searchParams.toString();
        return `/admin/reports/users${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Reports'],
    }),

    // Get order report
    getOrderReport: build.query<ApiResponse<OrderReport>, GetReportParams | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();

        if (params) {
          if (params.startDate) searchParams.append('startDate', params.startDate);
          if (params.endDate) searchParams.append('endDate', params.endDate);
          if (params.groupBy) searchParams.append('groupBy', params.groupBy);
        }

        const queryString = searchParams.toString();
        return `/admin/reports/orders${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Reports'],
    }),

    // Get payment report
    getPaymentReport: build.query<ApiResponse<PaymentReport>, GetReportParams | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();

        if (params) {
          if (params.startDate) searchParams.append('startDate', params.startDate);
          if (params.endDate) searchParams.append('endDate', params.endDate);
        }

        const queryString = searchParams.toString();
        return `/admin/reports/payments${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Reports'],
    }),

    // Get dashboard stats
    getDashboardStats: build.query<ApiResponse<DashboardStats>, void>({
      query: () => '/admin/dashboard/stats',
      providesTags: ['DashboardStats'],
    }),
  }),
});

export const {
  useGetSalesReportQuery,
  useGetUserReportQuery,
  useGetOrderReportQuery,
  useGetPaymentReportQuery,
  useGetDashboardStatsQuery,
} = adminReportApi;
