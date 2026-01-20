import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import cartReducer from '@/features/cart/cartSlice';
import userDetailsReducer from '@/features/userDetails/userDetailsSlice';
import { authApi } from '@/services/auth';
import { foodApi } from '@/services/food';
import { orderApi } from '@/services/order';
import { paymentApi } from '@/services/payment';
import { reviewApi } from '@/services/review';
import { adminFoodApi } from '@/services/adminFood';
import { adminOrderApi } from '@/services/adminOrder';
import { adminReportApi } from '@/services/adminReport';
import { adminUserApi } from '@/services/adminUser';
import { adminInventoryApi } from '@/services/adminInventory';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    userDetails: userDetailsReducer,
    [authApi.reducerPath]: authApi.reducer,
    [foodApi.reducerPath]: foodApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
    [paymentApi.reducerPath]: paymentApi.reducer,
    [reviewApi.reducerPath]: reviewApi.reducer,
    [adminFoodApi.reducerPath]: adminFoodApi.reducer,
    [adminOrderApi.reducerPath]: adminOrderApi.reducer,
    [adminReportApi.reducerPath]: adminReportApi.reducer,
    [adminUserApi.reducerPath]: adminUserApi.reducer,
    [adminInventoryApi.reducerPath]: adminInventoryApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(foodApi.middleware)
      .concat(orderApi.middleware)
      .concat(paymentApi.middleware)
      .concat(reviewApi.middleware)
      .concat(adminFoodApi.middleware)
      .concat(adminOrderApi.middleware)
      .concat(adminReportApi.middleware)
      .concat(adminUserApi.middleware)
      .concat(adminInventoryApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
