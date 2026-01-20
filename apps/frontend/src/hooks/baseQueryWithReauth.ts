import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query';
import { Mutex } from 'async-mutex';
import Cookies from 'js-cookie';
import { authApi } from '@/services/auth';
import { logOutAuth } from '@/features/auth/authSlice';

const mutex = new Mutex();

export const baseQueryWithReauth = (
  baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>
): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> => {
  return async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
      // Use mutex to prevent multiple refresh attempts
      if (!mutex.isLocked()) {
        const release = await mutex.acquire();
        try {
          const refreshToken = Cookies.get('refresh_token');
          if (!refreshToken) {
            api.dispatch(logOutAuth());
            return result;
          }

          // Attempt to refresh the token
          const refreshResult = await api.dispatch(
            authApi.endpoints.refreshToken.initiate(refreshToken)
          );

          // If refresh successful, retry original request
          if ('data' in refreshResult) {
            result = await baseQuery(args, api, extraOptions);
          } else {
            api.dispatch(logOutAuth());
          }
        } finally {
          release();
        }
      } else {
        // Wait for ongoing refresh to complete
        await mutex.waitForUnlock();

        const newAccessToken = Cookies.get('access_token');

        if (newAccessToken) {
          // Retry request with new token
          result = await baseQuery(args, api, extraOptions);
        }
      }
    }

    return result;
  };
};
