import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@/hooks/baseQuery';
import type {
  ApiResponse,
  Payment,
  CreatePaymentDto,
  VerifyPaymentDto,
} from '@/types';

export const paymentApi = createApi({
  reducerPath: 'paymentApi',
  baseQuery,
  tagTypes: ['Payment'],
  endpoints: (build) => ({
    // Create Razorpay order
    createPayment: build.mutation<ApiResponse<Payment>, CreatePaymentDto>({
      query: (paymentData) => ({
        url: '/payments/create',
        method: 'POST',
        body: paymentData,
      }),
    }),

    // Verify payment
    verifyPayment: build.mutation<ApiResponse<Payment>, VerifyPaymentDto>({
      query: (verificationData) => ({
        url: '/payments/verify',
        method: 'POST',
        body: verificationData,
      }),
      invalidatesTags: ['Payment'],
    }),

    // Get payment details by order ID
    getPaymentByOrderId: build.query<ApiResponse<Payment>, string>({
      query: (orderId) => `/payments/${orderId}`,
      providesTags: (result, error, orderId) => [{ type: 'Payment', id: orderId }],
    }),
  }),
});

export const {
  useCreatePaymentMutation,
  useVerifyPaymentMutation,
  useGetPaymentByOrderIdQuery,
} = paymentApi;
