import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import type { JwtPayload } from '@/types';

interface UserDetailsState {
  id: string | null;
  email: string | null;
  role: 'user' | 'admin' | null;
  exp: number | null;
  iat: number | null;
}

const initialState: UserDetailsState = {
  id: null,
  email: null,
  role: null,
  exp: null,
  iat: null,
};

const userDetailsSlice = createSlice({
  name: 'userDetails',
  initialState: initialState,
  reducers: {
    setUserDetails(state, action: PayloadAction<Partial<UserDetailsState>>) {
      // If access_token is provided, decode it
      if ('access_token' in action.payload) {
        const { access_token } = action.payload as { access_token: string };
        let decodeToken: JwtPayload | null = null;

        try {
          decodeToken = jwtDecode<JwtPayload>(access_token);
        } catch (_err) {
          toast.error('Token Expired');
          Cookies.remove('access_token');
          Cookies.remove('refresh_token');
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return;
        }

        // Check expiration
        const now = Math.floor(Date.now() / 1000);
        if (decodeToken.exp && decodeToken.exp < now) {
          toast.error('Session expired, please login again');
          Cookies.remove('access_token');
          Cookies.remove('refresh_token');
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return;
        }

        // Save state if token is valid
        state.id = decodeToken.id;
        state.email = decodeToken.email;
        state.role = decodeToken.role;
        state.exp = decodeToken.exp || null;
        state.iat = decodeToken.iat || null;
      } else {
        // Direct assignment of user details
        Object.assign(state, action.payload);
      }
    },
    clearUserDetails(state) {
      state.id = null;
      state.email = null;
      state.role = null;
      state.exp = null;
      state.iat = null;
    },
  },
});

export const { setUserDetails, clearUserDetails } = userDetailsSlice.actions;
export default userDetailsSlice.reducer;
