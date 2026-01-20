# Database Schema Reference

Complete documentation of the CraveCart database schema, including all tables, relationships, constraints, and indexes.

## Table of Contents

1. [Database Overview](#database-overview)
2. [Tables](#tables)
3. [Relationships](#relationships)
4. [Enums](#enums)
5. [Indexes](#indexes)
6. [Migrations](#migrations)
7. [Seed Data](#seed-data)
8. [Query Examples](#query-examples)

## Database Overview

- **Database System**: PostgreSQL 15
- **ORM**: Prisma 5.22.0
- **Schema Location**: `apps/backend/prisma/schema.prisma`
- **Database Name**: `cravecart`
- **Total Tables**: 8
- **Total Enums**: 2

### Connection String Format

```
postgresql://[username]:[password]@[host]:[port]/[database]?schema=[schema]
```

## Tables

### 1. users

Customer accounts table.

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | String | PRIMARY KEY | uuid() | Unique identifier |
| `name` | String | NOT NULL | - | User's full name |
| `email` | String | UNIQUE, NOT NULL | - | Email address |
| `password` | String | NOT NULL | - | Bcrypt hashed password |
| `contact` | String? | - | - | Phone number |
| `address` | String? | - | - | Delivery address |
| `createdAt` | DateTime | NOT NULL | now() | Account creation timestamp |
| `updatedAt` | DateTime | NOT NULL | auto | Last update timestamp |

**Relations**:
- Has many `orders`
- Has many `reviews`

**Sample Data**:
```sql
SELECT * FROM users LIMIT 1;
-- id: "550e8400-e29b-41d4-a716-446655440001"
-- name: "John Doe"
-- email: "john.doe@example.com"
-- password: "$2b$10$..." (hashed)
-- contact: "+1234567890"
-- address: "123 Main St, City, State 12345"
```

### 2. admins

Administrative accounts table.

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | String | PRIMARY KEY | uuid() | Unique identifier |
| `name` | String | NOT NULL | - | Admin's full name |
| `email` | String | UNIQUE, NOT NULL | - | Email address |
| `password` | String | NOT NULL | - | Bcrypt hashed password |
| `role` | String | NOT NULL | "admin" | Role designation |
| `contact` | String? | - | - | Phone number |
| `createdAt` | DateTime | NOT NULL | now() | Account creation timestamp |
| `updatedAt` | DateTime | NOT NULL | auto | Last update timestamp |

**Sample Data**:
```sql
-- Default admin account
-- email: "admin@cravecart.com"
-- password: "Admin@123456" (before hashing)
```

### 3. categories

Food category classification table.

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | String | PRIMARY KEY | uuid() | Unique identifier |
| `name` | String | UNIQUE, NOT NULL | - | Category name |
| `description` | String? | - | - | Category description |
| `createdAt` | DateTime | NOT NULL | now() | Creation timestamp |
| `updatedAt` | DateTime | NOT NULL | auto | Last update timestamp |

**Relations**:
- Has many `food_items`

**Sample Categories**:
```sql
-- Seeded categories:
-- "Appetizers", "Main Course", "Desserts",
-- "Beverages", "Pizza", "Burgers"
```

### 4. food_items

Menu items table with complete product information.

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | String | PRIMARY KEY | uuid() | Unique identifier |
| `name` | String | NOT NULL | - | Item name |
| `price` | Decimal(10,2) | NOT NULL | - | Item price |
| `categoryId` | String | FOREIGN KEY | - | Category reference |
| `description` | String? | - | - | Item description |
| `image` | String? | - | - | Image URL/path |
| `isVeg` | Boolean | NOT NULL | true | Vegetarian flag |
| `availabilityStatus` | Boolean | NOT NULL | true | Available for order |
| `createdAt` | DateTime | NOT NULL | now() | Creation timestamp |
| `updatedAt` | DateTime | NOT NULL | auto | Last update timestamp |

**Relations**:
- Belongs to `category` (CASCADE delete)
- Has many `order_details`
- Has many `reviews`

**Sample Data**:
```sql
-- Example item:
-- name: "Margherita Pizza"
-- price: 12.99
-- categoryId: [Pizza category ID]
-- description: "Classic pizza with mozzarella and basil"
-- image: "/uploads/food-items/margherita.png"
-- isVeg: true
-- availabilityStatus: true
```

### 5. orders

Customer order records with delivery information.

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | String | PRIMARY KEY | uuid() | Order ID |
| `userId` | String | FOREIGN KEY | - | Customer reference |
| `status` | OrderStatus | ENUM, NOT NULL | PENDING | Order status |
| `totalAmount` | Decimal(10,2) | NOT NULL | - | Total order value |
| `orderTimestamp` | DateTime | NOT NULL | now() | Order placement time |
| `deliveryAddress` | String? | - | - | Delivery location |
| `contactNumber` | String? | - | - | Contact phone |
| `createdAt` | DateTime | NOT NULL | now() | Creation timestamp |
| `updatedAt` | DateTime | NOT NULL | auto | Last update timestamp |

**Relations**:
- Belongs to `user` (CASCADE delete)
- Has many `order_details`
- Has one `payment`

**Status Flow**:
```
PENDING → CONFIRMED → PREPARING → PREPARED →
OUT_FOR_DELIVERY → DELIVERED → COMPLETED
                 ↓
            CANCELLED (can happen at any stage before DELIVERED)
```

### 6. order_details

Line items for orders (junction table).

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | String | PRIMARY KEY | uuid() | Detail ID |
| `orderId` | String | FOREIGN KEY | - | Order reference |
| `itemId` | String | FOREIGN KEY | - | Food item reference |
| `quantity` | Int | NOT NULL | - | Quantity ordered |
| `priceAtTime` | Decimal(10,2) | NOT NULL | - | Price when ordered |
| `subtotal` | Decimal(10,2) | NOT NULL | - | Line total |
| `createdAt` | DateTime | NOT NULL | now() | Creation timestamp |

**Relations**:
- Belongs to `order` (CASCADE delete)
- Belongs to `food_item` (RESTRICT delete)

**Important**: `priceAtTime` captures the item price at order time to handle price changes.

### 7. payments

Payment transaction records integrated with Razorpay.

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | String | PRIMARY KEY | uuid() | Payment ID |
| `orderId` | String | UNIQUE, FOREIGN KEY | - | Order reference |
| `paymentStatus` | PaymentStatus | ENUM, NOT NULL | PENDING | Payment status |
| `paymentMethod` | String? | - | - | Payment method used |
| `razorpayOrderId` | String? | UNIQUE | - | Razorpay order ID |
| `razorpayPaymentId` | String? | UNIQUE | - | Razorpay payment ID |
| `razorpaySignature` | String? | - | - | Payment signature |
| `amount` | Decimal(10,2) | NOT NULL | - | Payment amount |
| `transactionDate` | DateTime? | - | - | Transaction completion time |
| `createdAt` | DateTime | NOT NULL | now() | Creation timestamp |
| `updatedAt` | DateTime | NOT NULL | auto | Last update timestamp |

**Relations**:
- Belongs to `order` (CASCADE delete)

**Payment Methods**:
- `card` - Credit/Debit card
- `upi` - UPI payment
- `netbanking` - Net banking
- `wallet` - Digital wallet

### 8. reviews

Customer reviews and ratings for food items.

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | String | PRIMARY KEY | uuid() | Review ID |
| `userId` | String | FOREIGN KEY | - | Reviewer reference |
| `foodItemId` | String | FOREIGN KEY | - | Food item reference |
| `rating` | Int | NOT NULL, CHECK(1-5) | - | Star rating |
| `comments` | String? | - | - | Review text |
| `reviewDate` | DateTime | NOT NULL | now() | Review submission time |
| `createdAt` | DateTime | NOT NULL | now() | Creation timestamp |
| `updatedAt` | DateTime | NOT NULL | auto | Last update timestamp |

**Relations**:
- Belongs to `user` (CASCADE delete)
- Belongs to `food_item` (CASCADE delete)

**Constraints**:
- Unique composite key: `[userId, foodItemId]` - One review per user per item

## Relationships

### Entity Relationship Diagram

```
users (1) ─────< (N) orders
  │                    │
  │                    │ (1)
  │                    ↓
  │                 payment (1)
  │
  │                 (1) │
  │                    ↓
  └────< (N) reviews   order_details (N) >──── (1) food_items
                           (N)                        │ (N)
                            │                         │
                            └─────────────────────────┘
                                                      │ (1)
                                                      ↓
                                                  categories

admins (standalone - no direct relations)
```

### Relationship Rules

1. **User → Orders**: One-to-Many
   - Deletion: CASCADE (deleting user deletes their orders)

2. **Order → OrderDetails**: One-to-Many
   - Deletion: CASCADE (deleting order deletes its details)

3. **Order → Payment**: One-to-One
   - Deletion: CASCADE (deleting order deletes payment)

4. **FoodItem → OrderDetails**: One-to-Many
   - Deletion: RESTRICT (cannot delete items with orders)

5. **Category → FoodItems**: One-to-Many
   - Deletion: CASCADE (deleting category deletes its items)

6. **User → Reviews**: One-to-Many
   - Deletion: CASCADE (deleting user deletes their reviews)

7. **FoodItem → Reviews**: One-to-Many
   - Deletion: CASCADE (deleting item deletes its reviews)

## Enums

### OrderStatus

```prisma
enum OrderStatus {
  PENDING            // Initial state after order placement
  CONFIRMED          // Order confirmed by restaurant
  PREPARING          // Order being prepared
  PREPARED           // Order ready for delivery
  OUT_FOR_DELIVERY   // Order picked up by delivery person
  DELIVERED          // Order delivered to customer
  COMPLETED          // Order completed and closed
  CANCELLED          // Order cancelled
}
```

### PaymentStatus

```prisma
enum PaymentStatus {
  PENDING     // Payment initiated
  PROCESSING  // Payment being processed
  COMPLETED   // Payment successful
  FAILED      // Payment failed
  REFUNDED    // Payment refunded
}
```

## Indexes

### Automatic Indexes

Prisma automatically creates indexes for:
- All PRIMARY KEY columns (`id`)
- All UNIQUE columns (`email` in users/admins)
- All FOREIGN KEY columns (`userId`, `categoryId`, etc.)

### Composite Indexes

```prisma
// In reviews table
@@unique([userId, foodItemId])  // Ensures one review per user per item
```

### Recommended Additional Indexes

For production optimization, consider adding:

```sql
-- For order queries by status
CREATE INDEX idx_orders_status ON orders(status);

-- For order queries by user and status
CREATE INDEX idx_orders_user_status ON orders(userId, status);

-- For food items by category and availability
CREATE INDEX idx_food_items_category_available
ON food_items(categoryId, availabilityStatus);

-- For reviews by food item
CREATE INDEX idx_reviews_food_item ON reviews(foodItemId);

-- For payments by status
CREATE INDEX idx_payments_status ON payments(paymentStatus);
```

## Migrations

### Migration History

Location: `apps/backend/prisma/migrations/`

**Initial Migration**: `20251123101609_init`
- Creates all 8 tables
- Sets up relationships
- Defines enums
- Adds constraints

### Running Migrations

```bash
# Development - create and apply migration
cd apps/backend
npx prisma migrate dev --name migration_name

# Production - apply existing migrations
npx prisma migrate deploy

# Reset database (CAUTION: deletes all data)
npx prisma migrate reset

# Check migration status
npx prisma migrate status
```

### Migration Best Practices

1. **Always backup before migrations**
   ```bash
   pg_dump -U postgres -d cravecart > backup.sql
   ```

2. **Test migrations in staging first**

3. **Use transactions for data migrations**
   ```sql
   BEGIN;
   -- migration operations
   COMMIT;
   ```

## Seed Data

Location: `apps/backend/prisma/seed.ts`

### Default Seed Data

**Admin Account**:
```javascript
{
  email: 'admin@cravecart.com',
  password: 'Admin@123456',  // Hashed before storage
  name: 'Admin User',
  role: 'admin'
}
```

**Sample Users** (3):
```javascript
[
  { name: 'John Doe', email: 'john.doe@example.com' },
  { name: 'Jane Smith', email: 'jane.smith@example.com' },
  { name: 'Bob Johnson', email: 'bob.johnson@example.com' }
]
// All use password: 'User@123456'
```

**Categories** (6):
- Appetizers
- Main Course
- Desserts
- Beverages
- Pizza
- Burgers

**Food Items** (14):
- 2 Appetizers (Garlic Bread, Paneer Tikka)
- 2 Main Courses (Butter Chicken, Biryani)
- 2 Desserts (Chocolate Cake, Ice Cream)
- 2 Beverages (Lime Soda, Mango Lassi)
- 3 Pizzas (Margherita, Pepperoni, Veggie)
- 3 Burgers (Classic Beef, Chicken, Veggie)

### Running Seed

```bash
# Seed the database
npx prisma db seed

# Re-seed (reset and seed)
npx prisma migrate reset
```

## Query Examples

### Common Queries

**Get user with orders**:
```javascript
const userWithOrders = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    orders: {
      include: {
        orderDetails: {
          include: {
            foodItem: true
          }
        },
        payment: true
      }
    }
  }
});
```

**Get food items by category**:
```javascript
const items = await prisma.foodItem.findMany({
  where: {
    categoryId: categoryId,
    availabilityStatus: true
  },
  include: {
    category: true,
    reviews: {
      select: {
        rating: true
      }
    }
  }
});
```

**Create order with transaction**:
```javascript
const result = await prisma.$transaction(async (tx) => {
  // Create order
  const order = await tx.order.create({
    data: {
      userId,
      status: 'PENDING',
      totalAmount,
      deliveryAddress,
      contactNumber
    }
  });

  // Create order details
  const details = await tx.orderDetail.createMany({
    data: items.map(item => ({
      orderId: order.id,
      itemId: item.id,
      quantity: item.quantity,
      priceAtTime: item.price,
      subtotal: item.price * item.quantity
    }))
  });

  // Create payment record
  const payment = await tx.payment.create({
    data: {
      orderId: order.id,
      amount: totalAmount,
      paymentStatus: 'PENDING'
    }
  });

  return { order, details, payment };
});
```

**Get order statistics**:
```javascript
const stats = await prisma.order.groupBy({
  by: ['status'],
  _count: {
    id: true
  },
  _sum: {
    totalAmount: true
  }
});
```

**Search food items**:
```javascript
const searchResults = await prisma.foodItem.findMany({
  where: {
    OR: [
      { name: { contains: searchTerm, mode: 'insensitive' } },
      { description: { contains: searchTerm, mode: 'insensitive' } }
    ],
    availabilityStatus: true
  }
});
```

### Performance Queries

**Get popular items**:
```sql
SELECT
  fi.id,
  fi.name,
  COUNT(od.id) as order_count,
  AVG(r.rating) as avg_rating
FROM food_items fi
LEFT JOIN order_details od ON fi.id = od."itemId"
LEFT JOIN reviews r ON fi.id = r."foodItemId"
GROUP BY fi.id, fi.name
ORDER BY order_count DESC
LIMIT 10;
```

**Daily sales report**:
```sql
SELECT
  DATE(o."orderTimestamp") as date,
  COUNT(o.id) as total_orders,
  SUM(o."totalAmount") as total_revenue
FROM orders o
WHERE o.status = 'COMPLETED'
GROUP BY DATE(o."orderTimestamp")
ORDER BY date DESC;
```

## Database Maintenance

### Backup Commands

```bash
# Full backup
pg_dump -U postgres -d cravecart > cravecart_backup.sql

# Compressed backup
pg_dump -U postgres -d cravecart | gzip > cravecart_backup.sql.gz

# Restore from backup
psql -U postgres -d cravecart < cravecart_backup.sql
```

### Optimization

```sql
-- Update statistics
ANALYZE;

-- Rebuild indexes
REINDEX DATABASE cravecart;

-- Vacuum (clean up dead rows)
VACUUM FULL;
```

---

**Note**: This schema is designed for scalability and can handle thousands of concurrent users with proper indexing and query optimization.