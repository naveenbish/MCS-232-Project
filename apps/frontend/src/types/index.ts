// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  contact?: string;
  address?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  contact?: string | null;
  address?: string | null;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface JwtPayload {
  id: string;
  email: string;
  role: 'user' | 'admin';
  exp: number;
  iat: number;
}

// Food Types
export interface Category {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    foodItems: number;
  };
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
}

export interface FoodItem {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  description?: string | null;
  image?: string | null;
  availabilityStatus: boolean;
  isVeg?: boolean;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  averageRating?: number;
  reviewCount?: number;
}

export interface CreateFoodItemDto {
  name: string;
  price: number;
  categoryId: string;
  description?: string;
  image?: string;
  availabilityStatus?: boolean;
  isVeg?: boolean;
}

export interface UpdateFoodItemDto {
  name?: string;
  price?: number;
  categoryId?: string;
  description?: string;
  image?: string;
  availabilityStatus?: boolean;
  isVeg?: boolean;
}

export interface FoodItemFilters {
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  availabilityStatus?: boolean;
  page?: number;
  limit?: number;
}

export interface GetFoodItemsParams {
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isAvailable?: boolean;
  isVeg?: boolean;
  sortBy?: string;
  page?: number;
  limit?: number;
}

// Cart Types
export interface CartItem {
  foodItem: FoodItem;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  totalAmount: number;
}

// Order Types
export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'PREPARED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface OrderItem {
  id: string;
  orderId: string;
  itemId: string;
  quantity: number;
  priceAtTime: number;
  subtotal: number;
  foodItem: {
    id: string;
    name: string;
    image?: string | null;
    price: number;
  };
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  orderTimestamp: string;
  deliveryAddress: string;
  contactNumber: string;
  createdAt: string;
  updatedAt: string;
  orderDetails: OrderItem[];
  payment?: Payment;
}

export interface CreateOrderData {
  items: Array<{
    itemId: string;
    quantity: number;
  }>;
  deliveryAddress: string;
  contactNumber: string;
}

export interface CreateOrderDto extends CreateOrderData {}

export interface GetOrdersParams {
  page?: number;
  limit?: number;
  status?: string;
}

// Payment Types
export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REFUNDED';

export interface Payment {
  id: string;
  orderId: string;
  paymentStatus: PaymentStatus;
  paymentMethod?: string | null;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  razorpaySignature?: string | null;
  amount: number;
  transactionDate?: string | null;
  createdAt: string;
}

export interface PaymentOrderData {
  orderId: string;
  amount: number;
}

export interface VerifyPaymentData {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  orderId: string;
}

// Type aliases for DTOs (for backward compatibility)
export type CreatePaymentDto = PaymentOrderData;
export type VerifyPaymentDto = VerifyPaymentData;

// Review Types
export interface Review {
  id: string;
  userId: string;
  foodItemId: string;
  rating: number;
  comments?: string | null;
  reviewDate: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

export interface CreateReviewData {
  foodItemId: string;
  rating: number;
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

// Socket Event Types
export interface OrderUpdateEvent {
  orderId: string;
  status: OrderStatus;
  message: string;
  timestamp: string;
}

// Admin Report Types
export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalFoodItems: number;
  pendingOrders: number;
  completedOrders: number;
}

export interface SalesReport {
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
  orderStatusBreakdown: Array<{
    status: OrderStatus;
    _count: {
      status: number;
    };
  }>;
}
