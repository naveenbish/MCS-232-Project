import { fetchBaseQuery } from '@reduxjs/toolkit/query';
import Cookies from 'js-cookie';
import { baseQueryWithReauth } from './baseQueryWithReauth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers) => {
    const accessToken = Cookies.get('access_token');
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
    return headers;
  },
});

// Enhanced with reauth capability
export const baseQuery = baseQueryWithReauth(rawBaseQuery);
