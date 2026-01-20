'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/hooks';
import { setUserDetails } from '@/features/userDetails/userDetailsSlice';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import type { JwtPayload } from '@/types';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Check if user is logged in by checking cookies
    const accessToken = Cookies.get('access_token');

    if (accessToken) {
      try {
        const decodedToken = jwtDecode<JwtPayload>(accessToken);

        // Check if token is not expired
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp && decodedToken.exp > currentTime) {
          // Restore user details from token
          dispatch(
            setUserDetails({
              access_token: accessToken
            })
          );
        } else {
          // Token expired, remove cookies
          Cookies.remove('access_token', { path: '/' });
          Cookies.remove('refresh_token', { path: '/' });
        }
      } catch (error) {
        console.error('Failed to decode token:', error);
        // Invalid token, remove cookies
        Cookies.remove('access_token', { path: '/' });
        Cookies.remove('refresh_token', { path: '/' });
      }
    }
  }, [dispatch]);

  return <>{children}</>;
}