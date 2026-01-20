import { Request } from 'express';
import { User, Admin } from '@prisma/client';

// Extend Express Request type to include user information
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'user' | 'admin';
  };
}

// User Types
export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
  contact?: string;
  address?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  contact?: string | null;
  address?: string | null;
  createdAt: Date;
}

// Admin Types
export interface AdminLoginInput {
  email: string;
  password: string;
}

export interface AdminResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  contact?: string | null;
}

// Food Item Types
export interface CreateFoodItemInput {
  name: string;
  price: number;
  categoryId: string;
  description?: string;
  image?: string;
  availabilityStatus?: boolean;
}

export interface UpdateFoodItemInput {
  name?: string;
  price?: number;
  categoryId?: string;
  description?: string;
  image?: string;
  availabilityStatus?: boolean;
}

// Category Types
export interface CreateCategoryInput {
  name: string;
  description?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string;
}

// Order Types
export interface CreateOrderInput {
  items: Array<{
    itemId: string;
    quantity: number;
  }>;
  deliveryAddress: string;
  contactNumber: string;
}

export interface OrderItemInput {
  itemId: string;
  quantity: number;
}

export interface UpdateOrderStatusInput {
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'PREPARED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
}

// Payment Types
export interface CreatePaymentOrderInput {
  orderId: string;
  amount: number;
}

export interface VerifyPaymentInput {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  orderId: string;
}

// Review Types
export interface CreateReviewInput {
  foodItemId: string;
  rating: number;
  comments?: string;
}

export interface UpdateReviewInput {
  rating?: number;
  comments?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// JWT Payload Types
export interface JwtPayload {
  id: string;
  email: string;
  role: 'user' | 'admin';
}

// Filter and Query Types
export interface FoodItemFilters {
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  availabilityStatus?: boolean;
  isVeg?: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Socket.IO Event Types
export interface OrderUpdateEvent {
  orderId: string;
  status: string;
  message: string;
  timestamp: Date;
}

// Report Types
export interface SalesReportParams {
  startDate?: Date;
  endDate?: Date;
  groupBy?: 'day' | 'week' | 'month';
}

export interface SalesReportData {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  successfulPayments: number;
  failedPayments: number;
  topSellingItems: Array<{
    itemId: string;
    name: string;
    totalQuantity: number;
    totalRevenue: number;
  }>;
}

// Error Types
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export type SafeUser = Omit<User, 'password'>;
export type SafeAdmin = Omit<Admin, 'password'>;
