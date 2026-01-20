import { createSlice } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import type { JwtPayload } from '@/types';

const authSlice = createSlice({
  name: 'auth',
  initialState: {},
  reducers: {
    setAuthCookies(state, action) {
      const { access_token, refresh_token } = action.payload;
      const decodeToken = jwtDecode<JwtPayload>(access_token);
      const expireAt = new Date(Number(decodeToken.exp) * 1000);

      // Store access token with expiration from JWT
      Cookies.set('access_token', access_token, {
        expires: expireAt,
        path: '/',
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      });

      // Store refresh token for 7 days
      Cookies.set('refresh_token', refresh_token, {
        expires: 7,
        path: '/',
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      });
    },
    logOutAuth() {
      Cookies.remove('access_token', { path: '/' });
      Cookies.remove('refresh_token', { path: '/' });
    },
  },
});

export const { setAuthCookies, logOutAuth } = authSlice.actions;
export default authSlice.reducer;
