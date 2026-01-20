# API Endpoints Reference

Complete documentation for all CraveCart API endpoints.

## Table of Contents

1. [Base Configuration](#base-configuration)
2. [Authentication Endpoints](#authentication-endpoints)
3. [Food Endpoints](#food-endpoints)
4. [Order Endpoints](#order-endpoints)
5. [Payment Endpoints](#payment-endpoints)
6. [Review Endpoints](#review-endpoints)
7. [Admin Endpoints](#admin-endpoints)
8. [Error Responses](#error-responses)
9. [Pagination & Filtering](#pagination--filtering)

## Base Configuration

### Base URL
```
Development: http://localhost:5000/api/v1
Production: https://api.cravecart.com/api/v1
```

### Headers

**Required for all requests**:
```http
Content-Type: application/json
```

**Required for authenticated endpoints**:
```http
Authorization: Bearer <jwt_token>
```

### Response Format

All responses follow this structure:

**Success Response**:
```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}
```

**Error Response**:
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "statusCode": 400
  }
}
```

## Authentication Endpoints

### POST /auth/register
Register a new customer account.

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass@123",
  "contact": "+1234567890",
  "address": "123 Main St, City, State 12345"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "contact": "+1234567890",
      "address": "123 Main St, City, State 12345"
    },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  },
  "message": "Registration successful"
}
```

**Validation Rules**:
- Name: Required, min 2 characters
- Email: Required, valid email format
- Password: Required, min 8 characters, must contain uppercase, lowercase, number, special character
- Contact: Optional, valid phone format
- Address: Optional

### POST /auth/login
Customer login.

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "SecurePass@123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  },
  "message": "Login successful"
}
```

### POST /auth/admin/login
Admin login.

**Request Body**:
```json
{
  "email": "admin@cravecart.com",
  "password": "Admin@123456"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "admin": {
      "id": "uuid",
      "name": "Admin User",
      "email": "admin@cravecart.com",
      "role": "admin"
    },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

### GET /auth/me
Get current authenticated user. 🔒

**Headers**:
```http
Authorization: Bearer <jwt_token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "contact": "+1234567890",
    "address": "123 Main St"
  }
}
```

### PUT /auth/profile
Update user profile. 🔒

**Request Body**:
```json
{
  "name": "John Updated",
  "contact": "+9876543210",
  "address": "456 New St",
  "currentPassword": "OldPass@123",
  "newPassword": "NewPass@456"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Updated",
    "email": "john@example.com",
    "contact": "+9876543210",
    "address": "456 New St"
  },
  "message": "Profile updated successfully"
}
```

### POST /auth/refresh
Refresh access token.

**Request Body**:
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_token",
    "refreshToken": "new_refresh_token"
  }
}
```

### POST /auth/logout
Logout user. 🔒

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Logout successful"
}
```

## Food Endpoints

### GET /food/categories
Get all food categories.

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Appetizers",
      "description": "Start your meal right",
      "itemCount": 5
    },
    {
      "id": "uuid",
      "name": "Main Course",
      "description": "Hearty main dishes",
      "itemCount": 8
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 6,
    "totalPages": 1
  }
}
```

### GET /food/categories/:id
Get single category with items.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Pizza",
    "description": "Wood-fired pizzas",
    "items": [
      {
        "id": "uuid",
        "name": "Margherita Pizza",
        "price": 12.99,
        "description": "Classic Italian",
        "image": "/uploads/margherita.jpg",
        "isVeg": true,
        "availabilityStatus": true
      }
    ]
  }
}
```

### GET /food/items
Get all food items with filters.

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search term for name/description
- `categoryId` (optional): Filter by category
- `isVeg` (optional): Filter vegetarian (true/false)
- `minPrice` (optional): Minimum price
- `maxPrice` (optional): Maximum price
- `available` (optional): Only available items (default: true)
- `sortBy` (optional): Sort field (price, name, rating)
- `sortOrder` (optional): asc or desc

**Example Request**:
```
GET /food/items?search=pizza&isVeg=true&minPrice=10&maxPrice=20&sortBy=price&sortOrder=asc
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Margherita Pizza",
      "price": 12.99,
      "category": {
        "id": "uuid",
        "name": "Pizza"
      },
      "description": "Classic Italian pizza",
      "image": "/uploads/margherita.jpg",
      "isVeg": true,
      "availabilityStatus": true,
      "averageRating": 4.5,
      "reviewCount": 23
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 14,
    "totalPages": 2
  }
}
```

### GET /food/items/:id
Get single food item with reviews.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Butter Chicken",
    "price": 15.99,
    "category": {
      "id": "uuid",
      "name": "Main Course"
    },
    "description": "Creamy tomato-based curry",
    "image": "/uploads/butter-chicken.jpg",
    "isVeg": false,
    "availabilityStatus": true,
    "averageRating": 4.7,
    "reviews": [
      {
        "id": "uuid",
        "rating": 5,
        "comments": "Absolutely delicious!",
        "user": {
          "name": "John Doe"
        },
        "reviewDate": "2024-11-20T10:30:00Z"
      }
    ]
  }
}
```

## Order Endpoints

### POST /orders
Create new order. 🔒

**Request Body**:
```json
{
  "items": [
    {
      "itemId": "uuid",
      "quantity": 2
    },
    {
      "itemId": "uuid",
      "quantity": 1
    }
  ],
  "deliveryAddress": "123 Main St, City, State 12345",
  "contactNumber": "+1234567890",
  "specialInstructions": "Please ring doorbell twice"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "uuid",
      "userId": "uuid",
      "status": "PENDING",
      "totalAmount": 43.97,
      "orderTimestamp": "2024-11-25T10:30:00Z",
      "deliveryAddress": "123 Main St, City, State 12345",
      "contactNumber": "+1234567890",
      "orderDetails": [
        {
          "id": "uuid",
          "itemId": "uuid",
          "itemName": "Margherita Pizza",
          "quantity": 2,
          "priceAtTime": 12.99,
          "subtotal": 25.98
        }
      ]
    },
    "payment": {
      "id": "uuid",
      "orderId": "uuid",
      "amount": 43.97,
      "paymentStatus": "PENDING"
    }
  },
  "message": "Order created successfully"
}
```

### GET /orders
Get user's orders. 🔒

**Query Parameters**:
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "status": "DELIVERED",
      "totalAmount": 43.97,
      "orderTimestamp": "2024-11-24T10:30:00Z",
      "itemCount": 3,
      "payment": {
        "paymentStatus": "COMPLETED"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

### GET /orders/:id
Get order details. 🔒

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "status": "PREPARING",
    "totalAmount": 43.97,
    "orderTimestamp": "2024-11-25T10:30:00Z",
    "deliveryAddress": "123 Main St",
    "contactNumber": "+1234567890",
    "orderDetails": [
      {
        "id": "uuid",
        "foodItem": {
          "id": "uuid",
          "name": "Margherita Pizza",
          "image": "/uploads/margherita.jpg"
        },
        "quantity": 2,
        "priceAtTime": 12.99,
        "subtotal": 25.98
      }
    ],
    "payment": {
      "id": "uuid",
      "paymentStatus": "COMPLETED",
      "paymentMethod": "card",
      "transactionDate": "2024-11-25T10:31:00Z"
    }
  }
}
```

### POST /orders/:id/cancel
Cancel order. 🔒

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "CANCELLED",
    "refundStatus": "INITIATED"
  },
  "message": "Order cancelled successfully"
}
```

## Payment Endpoints

### POST /payments/create
Create Razorpay payment order. 🔒

**Request Body**:
```json
{
  "orderId": "uuid",
  "amount": 43.97
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "razorpayOrderId": "order_XXXXXXXXXXXXX",
    "amount": 4397,
    "currency": "INR",
    "keyId": "rzp_test_XXXXXXXXXX"
  }
}
```

### POST /payments/verify
Verify payment signature. 🔒

**Request Body**:
```json
{
  "orderId": "uuid",
  "razorpayOrderId": "order_XXXXXXXXXXXXX",
  "razorpayPaymentId": "pay_XXXXXXXXXXXXX",
  "razorpaySignature": "signature_string"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "payment": {
      "id": "uuid",
      "orderId": "uuid",
      "paymentStatus": "COMPLETED",
      "transactionDate": "2024-11-25T10:31:00Z"
    },
    "order": {
      "id": "uuid",
      "status": "CONFIRMED"
    }
  },
  "message": "Payment verified successfully"
}
```

### POST /payments/webhook
Razorpay webhook handler.

**Headers**:
```http
X-Razorpay-Signature: webhook_signature
```

**Request Body**: Razorpay webhook payload

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Webhook processed"
}
```

### GET /payments/:orderId
Get payment details by order. 🔒

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "orderId": "uuid",
    "amount": 43.97,
    "paymentStatus": "COMPLETED",
    "paymentMethod": "upi",
    "razorpayPaymentId": "pay_XXXXXXXXXXXXX",
    "transactionDate": "2024-11-25T10:31:00Z"
  }
}
```

## Review Endpoints

### POST /reviews
Create review. 🔒

**Request Body**:
```json
{
  "foodItemId": "uuid",
  "rating": 5,
  "comments": "Excellent taste and quality!"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "foodItemId": "uuid",
    "rating": 5,
    "comments": "Excellent taste and quality!",
    "reviewDate": "2024-11-25T12:00:00Z"
  },
  "message": "Review added successfully"
}
```

### GET /reviews/food/:itemId
Get reviews for food item.

**Query Parameters**:
- `page` (optional): Page number
- `limit` (optional): Items per page
- `sortBy` (optional): date or rating

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "rating": 5,
      "comments": "Best pizza in town!",
      "user": {
        "name": "John Doe"
      },
      "reviewDate": "2024-11-24T10:00:00Z"
    }
  ],
  "stats": {
    "averageRating": 4.5,
    "totalReviews": 23,
    "distribution": {
      "5": 15,
      "4": 5,
      "3": 2,
      "2": 1,
      "1": 0
    }
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 23,
    "totalPages": 3
  }
}
```

### GET /reviews/my-reviews
Get current user's reviews. 🔒

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "foodItem": {
        "id": "uuid",
        "name": "Margherita Pizza",
        "image": "/uploads/margherita.jpg"
      },
      "rating": 5,
      "comments": "Love it!",
      "reviewDate": "2024-11-20T10:00:00Z"
    }
  ]
}
```

### PUT /reviews/:id
Update review. 🔒

**Request Body**:
```json
{
  "rating": 4,
  "comments": "Good, but could be better"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "rating": 4,
    "comments": "Good, but could be better",
    "updatedAt": "2024-11-25T13:00:00Z"
  },
  "message": "Review updated successfully"
}
```

### DELETE /reviews/:id
Delete review. 🔒

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

## Admin Endpoints

All admin endpoints require authentication with admin role. 🔒👮

### Category Management

#### POST /admin/categories
Create category.

**Request Body**:
```json
{
  "name": "Salads",
  "description": "Fresh and healthy salads"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Salads",
    "description": "Fresh and healthy salads"
  }
}
```

#### PUT /admin/categories/:id
Update category.

**Request Body**:
```json
{
  "name": "Fresh Salads",
  "description": "Garden fresh salads"
}
```

#### DELETE /admin/categories/:id
Delete category.

### Food Item Management

#### POST /admin/food-items
Create food item.

**Request Body** (multipart/form-data):
- `name`: Item name
- `price`: Item price
- `categoryId`: Category UUID
- `description`: Item description
- `isVeg`: true/false
- `availabilityStatus`: true/false
- `image`: Image file

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Caesar Salad",
    "price": 8.99,
    "categoryId": "uuid",
    "image": "/uploads/food-items/caesar-salad.jpg"
  }
}
```

#### PUT /admin/food-items/:id
Update food item.

#### DELETE /admin/food-items/:id
Delete food item.

### Order Management

#### GET /admin/orders
Get all orders.

**Query Parameters**:
- `page`: Page number
- `limit`: Items per page
- `status`: Filter by status
- `userId`: Filter by user
- `dateFrom`: Start date
- `dateTo`: End date

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "status": "PREPARING",
      "totalAmount": 43.97,
      "orderTimestamp": "2024-11-25T10:30:00Z",
      "payment": {
        "paymentStatus": "COMPLETED"
      }
    }
  ],
  "stats": {
    "totalOrders": 150,
    "pendingOrders": 5,
    "totalRevenue": 4500.00
  }
}
```

#### PUT /admin/orders/:id/status
Update order status.

**Request Body**:
```json
{
  "status": "PREPARING"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "PREPARING",
    "updatedAt": "2024-11-25T11:00:00Z"
  },
  "message": "Order status updated"
}
```

### Reports & Analytics

#### GET /admin/reports/sales
Sales report.

**Query Parameters**:
- `dateFrom`: Start date
- `dateTo`: End date
- `groupBy`: day, week, month

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "totalSales": 45000,
    "totalOrders": 850,
    "averageOrderValue": 52.94,
    "salesByDate": [
      {
        "date": "2024-11-25",
        "orders": 45,
        "revenue": 2340.50
      }
    ],
    "topSellingItems": [
      {
        "name": "Margherita Pizza",
        "quantity": 120,
        "revenue": 1558.80
      }
    ]
  }
}
```

#### GET /admin/reports/users
User analytics.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "totalUsers": 250,
    "newUsersThisMonth": 45,
    "activeUsers": 180,
    "topCustomers": [
      {
        "name": "John Doe",
        "orderCount": 25,
        "totalSpent": 450.75
      }
    ]
  }
}
```

#### GET /admin/dashboard/stats
Dashboard statistics.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "todayOrders": 45,
    "todayRevenue": 2340.50,
    "pendingOrders": 5,
    "totalCustomers": 250,
    "totalMenuItems": 45,
    "lowStockItems": 3,
    "recentOrders": [...],
    "orderStatusBreakdown": {
      "PENDING": 5,
      "PREPARING": 3,
      "OUT_FOR_DELIVERY": 7,
      "DELIVERED": 30
    }
  }
}
```

## Error Responses

### Common Error Codes

| Status Code | Error Code | Description |
|------------|------------|-------------|
| 400 | BAD_REQUEST | Invalid request data |
| 401 | UNAUTHORIZED | Missing or invalid token |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Resource already exists |
| 422 | VALIDATION_ERROR | Validation failed |
| 429 | TOO_MANY_REQUESTS | Rate limit exceeded |
| 500 | INTERNAL_SERVER_ERROR | Server error |

### Error Response Examples

**Validation Error** (422):
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "statusCode": 422,
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      },
      {
        "field": "password",
        "message": "Password must be at least 8 characters"
      }
    ]
  }
}
```

**Authentication Error** (401):
```json
{
  "success": false,
  "error": {
    "message": "Token expired",
    "code": "TOKEN_EXPIRED",
    "statusCode": 401
  }
}
```

**Rate Limit Error** (429):
```json
{
  "success": false,
  "error": {
    "message": "Too many requests",
    "code": "RATE_LIMIT_EXCEEDED",
    "statusCode": 429,
    "retryAfter": 900
  }
}
```

## Pagination & Filtering

### Standard Pagination

All list endpoints support pagination:

```
GET /endpoint?page=2&limit=20
```

**Pagination Response**:
```json
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": true
  }
}
```

### Standard Filters

Common filter parameters:
- `search`: Text search
- `sortBy`: Field to sort by
- `sortOrder`: asc or desc
- `dateFrom`: Start date (ISO 8601)
- `dateTo`: End date (ISO 8601)

### Rate Limiting

Default limits:
- Public endpoints: 100 requests per 15 minutes
- Authenticated endpoints: 200 requests per 15 minutes
- Admin endpoints: 500 requests per 15 minutes

Rate limit headers:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1700912400
```

---

**Note**:
- 🔒 indicates authentication required
- 👮 indicates admin role required
- All timestamps are in ISO 8601 format (UTC)
- File uploads use multipart/form-data
- Prices are in decimal format (e.g., 12.99)