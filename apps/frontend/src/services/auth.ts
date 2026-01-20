import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setAuthCookies, logOutAuth } from '@/features/auth/authSlice';
import type { LoginCredentials, RegisterData, AuthResponse, User, ApiResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

interface RefreshResponse {
  access_token: string;
  refresh_token?: string;
}

interface AuthResponseData {
  token: string;
  refresh_token: string;
  user?: User;
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/auth`,
  }),
  endpoints: (build) => ({
    login: build.mutation<ApiResponse<AuthResponseData>, LoginCredentials>({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: build.mutation<ApiResponse<AuthResponseData>, RegisterData>({
      query: (userData) => ({
        url: '/register',
        method: 'POST',
        body: userData,
      }),
    }),
    refreshToken: build.mutation<RefreshResponse, string>({
      query: (refreshToken) => ({
        url: '/refresh-token',
        method: 'POST',
        params: { refresh_token: refreshToken },
      }),
      async onQueryStarted(refreshTokenArg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          const newRefreshToken = data.refresh_token || refreshTokenArg;

          dispatch(
            setAuthCookies({
              access_token: data.access_token,
              refresh_token: newRefreshToken,
            })
          );
        } catch (error) {
          dispatch(logOutAuth());
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRefreshTokenMutation
} = authApi;
