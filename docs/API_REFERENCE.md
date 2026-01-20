# 🔌 CraveCart API Reference

Complete API documentation for the CraveCart food delivery platform.

## Table of Contents

1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [User Endpoints](#user-endpoints)
4. [Food Items Endpoints](#food-items-endpoints)
5. [Category Endpoints](#category-endpoints)
6. [Order Endpoints](#order-endpoints)
7. [Payment Endpoints](#payment-endpoints)
8. [Admin Endpoints](#admin-endpoints)
9. [WebSocket Events](#websocket-events)
10. [Error Handling](#error-handling)
11. [Rate Limiting](#rate-limiting)

## 🌐 API Overview

### Base URL
```
Development: http://localhost:5000/api
Production: https://api.cravecart.com
```

### API Version
```
Current Version: v1
Path: /api/v1
```

### Request Headers
```javascript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <JWT_TOKEN>",
  "X-API-Version": "1.0"
}
```

### Response Format
```javascript
// Success Response
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Success message"
}

// Error Response
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

## 🔐 Authentication

### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2024-01-15T10:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Registration successful"
}
```

**Status Codes:**
- `201` - User created successfully
- `400` - Validation error
- `409` - Email already exists

### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Login successful"
}
```

**Status Codes:**
- `200` - Login successful
- `401` - Invalid credentials
- `404` - User not found

### Logout
```http
POST /api/auth/logout
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Refresh Token
```http
POST /api/auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "new_jwt_token",
    "refreshToken": "new_refresh_token"
  }
}
```

## 👤 User Endpoints

### Get User Profile
```http
GET /api/users/profile
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "phone": "+1234567890",
    "address": "123 Main St",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-20T15:30:00Z"
  }
}
```

### Update Profile
```http
PUT /api/users/profile
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "John Updated",
  "phone": "+0987654321",
  "address": "456 New Street"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "name": "John Updated",
    "email": "john@example.com",
    "phone": "+0987654321",
    "address": "456 New Street"
  },
  "message": "Profile updated successfully"
}
```

### Change Password
```http
POST /api/users/change-password
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewSecurePass456!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### Get All Users (Admin)
```http
GET /api/users?page=1&limit=10
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name or email

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_123",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "user",
        "orderCount": 5,
        "totalSpent": 2500,
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "totalPages": 10
    }
  }
}
```

## 🍕 Food Items Endpoints

### Get All Food Items
```http
GET /api/food-items
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 12)
- `category` (optional): Filter by category ID
- `isVeg` (optional): Filter vegetarian items (true/false)
- `search` (optional): Search by name
- `isAvailable` (optional): Filter by availability

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "item_001",
        "name": "Margherita Pizza",
        "description": "Classic Italian pizza",
        "price": 299,
        "category": {
          "id": "cat_001",
          "name": "Main Course"
        },
        "imageUrl": "https://cdn.example.com/pizza.jpg",
        "isVeg": true,
        "isAvailable": true,
        "createdAt": "2024-01-10T08:00:00Z"
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 12,
      "totalPages": 5
    }
  }
}
```

### Get Single Food Item
```http
GET /api/food-items/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "item_001",
    "name": "Margherita Pizza",
    "description": "Classic Italian pizza with fresh basil",
    "price": 299,
    "category": {
      "id": "cat_001",
      "name": "Main Course"
    },
    "imageUrl": "https://cdn.example.com/pizza.jpg",
    "isVeg": true,
    "isAvailable": true,
    "nutrition": {
      "calories": 250,
      "protein": 12,
      "carbs": 35,
      "fat": 8
    },
    "createdAt": "2024-01-10T08:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

### Create Food Item (Admin)
```http
POST /api/food-items
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "name": "New Burger",
  "description": "Delicious beef burger",
  "price": 199,
  "categoryId": "cat_002",
  "imageUrl": "https://cdn.example.com/burger.jpg",
  "isVeg": false,
  "isAvailable": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "item_new",
    "name": "New Burger",
    "description": "Delicious beef burger",
    "price": 199,
    "categoryId": "cat_002",
    "imageUrl": "https://cdn.example.com/burger.jpg",
    "isVeg": false,
    "isAvailable": true,
    "createdAt": "2024-01-20T12:00:00Z"
  },
  "message": "Food item created successfully"
}
```

### Update Food Item (Admin)
```http
PUT /api/food-items/:id
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "name": "Updated Burger",
  "price": 249,
  "isAvailable": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "item_001",
    "name": "Updated Burger",
    "price": 249,
    "isAvailable": false
  },
  "message": "Food item updated successfully"
}
```

### Delete Food Item (Admin)
```http
DELETE /api/food-items/:id
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Food item deleted successfully"
}
```

## 📁 Category Endpoints

### Get All Categories
```http
GET /api/categories
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cat_001",
      "name": "Main Course",
      "description": "Main dishes",
      "displayOrder": 2,
      "itemCount": 15,
      "isActive": true
    },
    {
      "id": "cat_002",
      "name": "Starters",
      "description": "Appetizers and starters",
      "displayOrder": 1,
      "itemCount": 10,
      "isActive": true
    }
  ]
}
```

### Create Category (Admin)
```http
POST /api/categories
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "name": "Beverages",
  "description": "Hot and cold drinks",
  "displayOrder": 4
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cat_new",
    "name": "Beverages",
    "description": "Hot and cold drinks",
    "displayOrder": 4,
    "isActive": true,
    "createdAt": "2024-01-20T12:00:00Z"
  },
  "message": "Category created successfully"
}
```

### Update Category (Admin)
```http
PUT /api/categories/:id
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "name": "Updated Category",
  "displayOrder": 5,
  "isActive": false
}
```

### Delete Category (Admin)
```http
DELETE /api/categories/:id
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Note:** Cannot delete category with associated food items.

## 🛒 Cart Management

### Client-Side Cart
The cart is managed entirely on the client side using Redux Toolkit and localStorage for persistence. There are no dedicated cart API endpoints.

**Cart State Management:**
- **Storage**: Browser localStorage
- **State**: Redux Toolkit slice
- **Persistence**: Automatic save on every update
- **Sync**: No server sync (future enhancement planned)

**Cart Operations (Client-Side Only):**
- Add to cart
- Update quantity
- Remove item
- Clear cart
- Calculate totals

## 📦 Order Endpoints

### Create Order
```http
POST /api/orders
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "items": [
    {
      "foodItemId": "item_001",
      "quantity": 2,
      "price": 299
    },
    {
      "foodItemId": "item_002",
      "quantity": 1,
      "price": 199
    }
  ],
  "deliveryAddress": "123 Main Street, Apt 4B",
  "contactNumber": "+1234567890",
  "deliveryInstructions": "Ring doorbell twice",
  "totalAmount": 797
}
```

**Note:** Cart items are sent directly from client-side cart state when creating an order.

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "ORD12345",
    "userId": "user_123",
    "items": [...],
    "totalAmount": 797,
    "status": "PENDING",
    "paymentStatus": "PENDING",
    "deliveryAddress": "123 Main Street, Apt 4B",
    "estimatedDelivery": "2024-01-20T13:30:00Z",
    "createdAt": "2024-01-20T12:00:00Z"
  },
  "message": "Order placed successfully"
}
```

### Get User Orders
```http
GET /api/orders
```

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "ORD12345",
        "items": [...],
        "totalAmount": 797,
        "status": "DELIVERED",
        "paymentStatus": "PAID",
        "deliveryAddress": "123 Main Street",
        "createdAt": "2024-01-20T12:00:00Z",
        "deliveredAt": "2024-01-20T13:25:00Z"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "totalPages": 3
    }
  }
}
```

### Get Single Order
```http
GET /api/orders/:orderId
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ORD12345",
    "userId": "user_123",
    "items": [
      {
        "foodItem": {
          "id": "item_001",
          "name": "Margherita Pizza",
          "imageUrl": "..."
        },
        "quantity": 2,
        "price": 299,
        "subtotal": 598
      }
    ],
    "totalAmount": 797,
    "status": "PREPARING",
    "paymentStatus": "PAID",
    "deliveryAddress": "123 Main Street, Apt 4B",
    "contactNumber": "+1234567890",
    "deliveryInstructions": "Ring doorbell twice",
    "statusHistory": [
      {
        "status": "PENDING",
        "timestamp": "2024-01-20T12:00:00Z"
      },
      {
        "status": "CONFIRMED",
        "timestamp": "2024-01-20T12:05:00Z"
      },
      {
        "status": "PREPARING",
        "timestamp": "2024-01-20T12:10:00Z"
      }
    ],
    "createdAt": "2024-01-20T12:00:00Z"
  }
}
```

### Update Order Status (Admin)
```http
PUT /api/orders/:orderId/status
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "status": "CONFIRMED"
}
```

**Valid Status Values:**
- `PENDING`
- `CONFIRMED`
- `PREPARING`
- `OUT_FOR_DELIVERY`
- `DELIVERED`
- `CANCELLED`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ORD12345",
    "status": "CONFIRMED",
    "updatedAt": "2024-01-20T12:05:00Z"
  },
  "message": "Order status updated successfully"
}
```

### Cancel Order
```http
POST /api/orders/:orderId/cancel
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "reason": "Changed my mind"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ORD12345",
    "status": "CANCELLED",
    "cancellationReason": "Changed my mind",
    "cancelledAt": "2024-01-20T12:30:00Z"
  },
  "message": "Order cancelled successfully"
}
```

### Get All Orders (Admin)
```http
GET /api/admin/orders
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `status`: Filter by status
- `date`: Filter by date (YYYY-MM-DD)
- `userId`: Filter by user

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [...],
    "statistics": {
      "totalOrders": 150,
      "pendingOrders": 5,
      "completedOrders": 140,
      "cancelledOrders": 5,
      "totalRevenue": 45000
    },
    "pagination": {...}
  }
}
```

## 💳 Payment Endpoints

### Initialize Payment
```http
POST /api/payments/initialize
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "orderId": "ORD12345",
  "amount": 797
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "razorpayOrderId": "order_razorpay123",
    "amount": 797,
    "currency": "INR",
    "key": "rzp_test_key",
    "orderId": "ORD12345"
  }
}
```

### Verify Payment
```http
POST /api/payments/verify
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "razorpay_order_id": "order_razorpay123",
  "razorpay_payment_id": "pay_razorpay456",
  "razorpay_signature": "signature_here",
  "orderId": "ORD12345"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "ORD12345",
    "paymentId": "pay_razorpay456",
    "status": "SUCCESS",
    "amount": 797,
    "paidAt": "2024-01-20T12:15:00Z"
  },
  "message": "Payment verified successfully"
}
```

### Get Payment Status
```http
GET /api/payments/:orderId/status
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "ORD12345",
    "paymentStatus": "PAID",
    "amount": 797,
    "paymentMethod": "CARD",
    "transactionId": "pay_razorpay456",
    "paidAt": "2024-01-20T12:15:00Z"
  }
}
```

### Initiate Refund (Admin)
```http
POST /api/payments/:orderId/refund
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "amount": 797,
  "reason": "Customer request"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "refundId": "rfnd_123",
    "orderId": "ORD12345",
    "amount": 797,
    "status": "PROCESSING",
    "reason": "Customer request",
    "initiatedAt": "2024-01-20T14:00:00Z"
  },
  "message": "Refund initiated successfully"
}
```

## 👨‍💼 Admin Endpoints

### Dashboard Statistics
```http
GET /api/admin/dashboard
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "revenue": {
      "total": 150000,
      "today": 5000,
      "week": 35000,
      "month": 150000,
      "growth": 12.5
    },
    "orders": {
      "total": 500,
      "pending": 10,
      "preparing": 5,
      "delivered": 475,
      "cancelled": 10
    },
    "users": {
      "total": 250,
      "active": 180,
      "new": 25
    },
    "popularItems": [
      {
        "id": "item_001",
        "name": "Margherita Pizza",
        "orderCount": 150,
        "revenue": 44850
      }
    ],
    "recentOrders": [...],
    "charts": {
      "revenue": [...],
      "orders": [...]
    }
  }
}
```

### Reports
```http
GET /api/admin/reports
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `type`: Report type (sales, orders, customers, products)
- `startDate`: Start date (YYYY-MM-DD)
- `endDate`: End date (YYYY-MM-DD)
- `format`: Export format (json, csv, pdf)

**Response:**
```json
{
  "success": true,
  "data": {
    "reportType": "sales",
    "period": {
      "start": "2024-01-01",
      "end": "2024-01-31"
    },
    "summary": {
      "totalRevenue": 450000,
      "totalOrders": 1500,
      "averageOrderValue": 300,
      "topSellingItems": [...],
      "peakHours": [...]
    },
    "details": [...]
  }
}
```

### System Settings
```http
GET /api/admin/settings
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "business": {
      "name": "CraveCart Restaurant",
      "address": "123 Food Street",
      "phone": "+1234567890",
      "email": "info@cravecart.com",
      "operatingHours": {
        "monday": "11:00-23:00",
        "tuesday": "11:00-23:00"
      }
    },
    "order": {
      "minOrderValue": 100,
      "deliveryRadius": 5,
      "preparationTime": 30,
      "autoCancelDuration": 3600
    },
    "payment": {
      "acceptedMethods": ["CARD", "UPI", "NETBANKING"],
      "taxRate": 18,
      "serviceCharge": 0
    }
  }
}
```

### Update Settings
```http
PUT /api/admin/settings
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "order": {
    "minOrderValue": 150,
    "preparationTime": 25
  }
}
```

## 🔔 WebSocket Events

### Connection
```javascript
// Client connection
const socket = io('http://localhost:5000', {
  auth: {
    token: 'JWT_TOKEN_HERE'
  }
});

socket.on('connect', () => {
  console.log('Connected to server');
});
```

### Order Events

#### Join Order Room
```javascript
// Join specific order updates
socket.emit('join-order', 'ORD12345');
```

#### Order Status Update
```javascript
// Listen for status updates
socket.on('order-status-update', (data) => {
  console.log('Order status changed:', data);
  // {
  //   orderId: 'ORD12345',
  //   status: 'PREPARING',
  //   updatedAt: '2024-01-20T12:30:00Z'
  // }
});
```

#### New Order (Admin)
```javascript
// Admin receives new order notifications
socket.on('new-order', (data) => {
  console.log('New order received:', data);
  // {
  //   orderId: 'ORD12346',
  //   customerName: 'John Doe',
  //   totalAmount: 599,
  //   items: [...]
  // }
});
```

### Payment Events

#### Payment Confirmation
```javascript
socket.on('payment-confirmed', (data) => {
  console.log('Payment confirmed:', data);
  // {
  //   orderId: 'ORD12345',
  //   paymentId: 'pay_123',
  //   amount: 797
  // }
});
```

### Admin Events

#### Dashboard Update
```javascript
// Real-time dashboard metrics
socket.on('dashboard-update', (data) => {
  console.log('Dashboard metrics updated:', data);
  // {
  //   activeOrders: 5,
  //   todayRevenue: 15000,
  //   newUsers: 3
  // }
});
```

### Error Events

```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error);
  // {
  //   code: 'AUTH_ERROR',
  //   message: 'Invalid token'
  // }
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});
```

## ❌ Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "field": "specific_field", // For validation errors
    "details": {} // Additional error context
  }
}
```

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|------------|
| `AUTH_REQUIRED` | Authentication required | 401 |
| `INVALID_CREDENTIALS` | Invalid login credentials | 401 |
| `TOKEN_EXPIRED` | JWT token has expired | 401 |
| `FORBIDDEN` | Access denied | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `VALIDATION_ERROR` | Request validation failed | 400 |
| `DUPLICATE_ENTRY` | Resource already exists | 409 |
| `SERVER_ERROR` | Internal server error | 500 |
| `PAYMENT_FAILED` | Payment processing failed | 402 |
| `RATE_LIMIT_EXCEEDED` | Too many requests | 429 |

### Error Handling Examples

#### Validation Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "email": "Invalid email format",
      "password": "Password must be at least 8 characters"
    }
  }
}
```

#### Authentication Error
```json
{
  "success": false,
  "error": {
    "code": "AUTH_REQUIRED",
    "message": "Please login to continue"
  }
}
```

## 🚦 Rate Limiting

### Rate Limit Rules

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| Authentication | 5 requests | 15 minutes |
| Public API | 100 requests | 1 minute |
| User API | 200 requests | 1 minute |
| Admin API | 500 requests | 1 minute |
| Payment | 10 requests | 1 minute |

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642684800000
```

### Rate Limit Exceeded Response

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests, please try again later",
    "retryAfter": 60
  }
}
```

## 🔧 Testing

### Test Credentials

```javascript
// Test User
{
  "email": "test@example.com",
  "password": "TestUser123!"
}

// Test Admin
{
  "email": "admin@cravecart.com",
  "password": "Admin@123456"
}

// Test Payment Card (Razorpay Test Mode)
{
  "number": "4111111111111111",
  "expiry": "12/25",
  "cvv": "123"
}
```

### Postman Collection

Import our Postman collection for easy API testing:
```
https://api.cravecart.com/postman/collection.json
```

### API Health Check

```http
GET /api/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "uptime": 86400,
    "database": "connected",
    "redis": "connected",
    "version": "1.0.0"
  }
}
```

---

*For additional API support, contact the development team at api-support@cravecart.com*