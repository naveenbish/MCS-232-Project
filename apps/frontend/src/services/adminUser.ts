import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@/hooks/baseQuery';
import type { ApiResponse } from '@/types';

interface User {
  id: string;
  name: string;
  email: string;
  contact?: string | null;
  address?: string | null;
  createdAt: string;
  updatedAt: string;
  totalOrders: number;
  totalSpent: number;
  role: string;
  status: string;
}

interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UserStats {
  totalUsers: number;
  newUsersThisMonth: number;
  activeUsers: number;
}

interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  contact?: string;
  address?: string;
}

interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  contact?: string;
  address?: string;
}

export const adminUserApi = createApi({
  reducerPath: 'adminUserApi',
  baseQuery,
  tagTypes: ['User', 'UserStats'],
  endpoints: (build) => ({
    // Get all users
    getUsers: build.query<ApiResponse<UsersResponse>, {
      page?: number;
      limit?: number;
      search?: string;
      role?: string;
      status?: string;
    }>({
      query: (params) => ({
        url: '/admin/users',
        params,
      }),
      providesTags: ['User'],
    }),

    // Get single user
    getUserById: build.query<ApiResponse<{ user: User }>, string>({
      query: (id) => `/admin/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'User', id }],
    }),

    // Create user
    createUser: build.mutation<ApiResponse<{ user: User }>, CreateUserDto>({
      query: (userData) => ({
        url: '/admin/users',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User', 'UserStats'],
    }),

    // Update user
    updateUser: build.mutation<ApiResponse<{ user: User }>, { id: string; data: UpdateUserDto }>({
      query: ({ id, data }) => ({
        url: `/admin/users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'User', id },
        'User',
      ],
    }),

    // Delete user
    deleteUser: build.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User', 'UserStats'],
    }),

    // Reset user password
    resetUserPassword: build.mutation<ApiResponse<void>, { id: string; newPassword: string }>({
      query: ({ id, newPassword }) => ({
        url: `/admin/users/${id}/reset-password`,
        method: 'POST',
        body: { newPassword },
      }),
    }),

    // Get user statistics
    getUserStats: build.query<ApiResponse<{ stats: UserStats }>, void>({
      query: () => '/admin/users/stats',
      providesTags: ['UserStats'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useResetUserPasswordMutation,
  useGetUserStatsQuery,
} = adminUserApi;