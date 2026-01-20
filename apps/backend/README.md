# CraveCart Backend API

A comprehensive, production-ready backend API for the CraveCart food ordering web application built with TypeScript, Express.js, PostgreSQL, and Prisma ORM.

## 🚀 Features

- **User Authentication**: JWT-based authentication with secure password hashing
- **Food Management**: Browse, search, and filter food items by categories
- **Order Management**: Create orders, track order status in real-time
- **Payment Integration**: Razorpay payment gateway with webhook support
- **Review System**: Users can rate and review food items
- **Real-time Updates**: Socket.IO for live order tracking
- **Admin Dashboard**: Complete admin panel with reports and analytics
- **Security**: Helmet, CORS, rate limiting, input validation
- **Logging**: Winston logger with daily rotation
- **TypeScript**: Full type safety and better developer experience

## 📋 Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- npm or yarn

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
NODE_ENV=development
PORT=5000
API_VERSION=v1

DATABASE_URL="postgresql://cravecart_user:cravecart_password@localhost:5432/cravecart_db"

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRES_IN=30d

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret

FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

COOKIE_SECRET=your-cookie-secret-key
```

### 4. Start PostgreSQL Database

```bash
docker-compose up -d
```

This will start a PostgreSQL database container on port 5432.

### 5. Run Database Migrations

```bash
npm run prisma:migrate
```

### 6. Generate Prisma Client

```bash
npm run prisma:generate
```

### 7. Seed the Database (Optional)

```bash
npm run prisma:seed
```

This will create:
- 1 Admin user
- 6 Categories
- 14 Food items
- 2 Sample users

### 8. Start the Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## 📁 Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts             # Database seeding script
├── src/
│   ├── config/             # Configuration files
│   │   ├── database.ts     # Prisma client setup
│   │   ├── env.ts          # Environment variables
│   │   ├── logger.ts       # Winston logger
│   │   ├── razorpay.ts     # Razorpay configuration
│   │   └── socket.ts       # Socket.IO setup
│   ├── controllers/        # Request handlers
│   │   ├── authController.ts
│   │   ├── foodController.ts
│   │   ├── orderController.ts
│   │   ├── paymentController.ts
│   │   ├── reportController.ts
│   │   └── reviewController.ts
│   ├── middleware/         # Express middleware
│   │   ├── auth.ts         # Authentication & authorization
│   │   ├── errorHandler.ts # Global error handling
│   │   ├── rateLimiter.ts  # Rate limiting
│   │   ├── requestLogger.ts # Request logging
│   │   └── validate.ts     # Input validation
│   ├── routes/             # API routes
│   │   ├── adminRoutes.ts
│   │   ├── authRoutes.ts
│   │   ├── foodRoutes.ts
│   │   ├── orderRoutes.ts
│   │   ├── paymentRoutes.ts
│   │   └── reviewRoutes.ts
│   ├── services/           # Business logic
│   │   ├── authService.ts
│   │   ├── foodService.ts
│   │   ├── orderService.ts
│   │   ├── paymentService.ts
│   │   ├── reportService.ts
│   │   └── reviewService.ts
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   ├── utils/              # Utility functions
│   │   ├── jwt.ts
│   │   ├── password.ts
│   │   ├── response.ts
│   │   └── validators.ts
│   └── index.ts            # Application entry point
├── .env.example            # Environment variables template
├── .gitignore
├── docker-compose.yml      # Docker configuration
├── package.json
├── tsconfig.json
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/admin/login` - Admin login
- `GET /api/v1/auth/me` - Get current user
- `PUT /api/v1/auth/profile` - Update user profile
- `POST /api/v1/auth/logout` - Logout

### Food Items
- `GET /api/v1/food/categories` - Get all categories
- `GET /api/v1/food/categories/:id` - Get category by ID
- `GET /api/v1/food/items` - Get all food items (with filters)
- `GET /api/v1/food/items/:id` - Get food item by ID

### Orders
- `POST /api/v1/orders` - Create new order
- `GET /api/v1/orders` - Get user's orders
- `GET /api/v1/orders/:id` - Get order details
- `POST /api/v1/orders/:id/cancel` - Cancel order

### Payments
- `POST /api/v1/payments/create` - Create payment order
- `POST /api/v1/payments/verify` - Verify payment
- `GET /api/v1/payments/:orderId` - Get payment details
- `POST /api/v1/payments/webhook` - Razorpay webhook

### Reviews
- `POST /api/v1/reviews` - Create review
- `GET /api/v1/reviews/food/:itemId` - Get reviews for food item
- `GET /api/v1/reviews/my-reviews` - Get user's reviews
- `PUT /api/v1/reviews/:id` - Update review
- `DELETE /api/v1/reviews/:id` - Delete review

### Admin
- `POST /api/v1/admin/categories` - Create category
- `PUT /api/v1/admin/categories/:id` - Update category
- `DELETE /api/v1/admin/categories/:id` - Delete category
- `POST /api/v1/admin/food-items` - Create food item
- `PUT /api/v1/admin/food-items/:id` - Update food item
- `DELETE /api/v1/admin/food-items/:id` - Delete food item
- `GET /api/v1/admin/orders` - Get all orders
- `PUT /api/v1/admin/orders/:id/status` - Update order status
- `GET /api/v1/admin/reports/sales` - Sales report
- `GET /api/v1/admin/reports/users` - User report
- `GET /api/v1/admin/reports/orders` - Order report
- `GET /api/v1/admin/reports/payments` - Payment report
- `GET /api/v1/admin/dashboard/stats` - Dashboard statistics

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📊 Database Schema

The database consists of 8 main tables:

1. **Users** - Customer information
2. **Admins** - Admin user accounts
3. **Categories** - Food categories
4. **FoodItems** - Food menu items
5. **Orders** - Customer orders
6. **OrderDetails** - Order line items
7. **Payments** - Payment transactions
8. **Reviews** - User reviews and ratings

## 🧪 Testing

```bash
npm test
```

## 🏗️ Build for Production

```bash
npm run build
```

This will compile TypeScript to JavaScript in the `dist/` directory.

## 🚀 Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Configure production database URL
3. Set secure JWT secrets
4. Configure Razorpay credentials
5. Run migrations: `npm run prisma:migrate`
6. Start the server: `npm start`

## 📝 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio
- `npm run prisma:seed` - Seed the database
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 🔒 Security Features

- **Helmet** - Sets security HTTP headers
- **CORS** - Configured cross-origin resource sharing
- **Rate Limiting** - Prevents brute force attacks
- **Input Validation** - Express-validator for request validation
- **Password Hashing** - Bcrypt with salt rounds
- **JWT Authentication** - Secure token-based authentication
- **SQL Injection Prevention** - Prisma ORM with parameterized queries

## 📦 Dependencies

### Core
- Express.js - Web framework
- TypeScript - Type safety
- Prisma - ORM
- PostgreSQL - Database

### Authentication & Security
- jsonwebtoken - JWT tokens
- bcrypt - Password hashing
- helmet - Security headers
- cors - CORS handling
- express-rate-limit - Rate limiting

### Payments
- Razorpay - Payment gateway

### Real-time
- Socket.IO - WebSocket communication

### Logging
- Winston - Logger
- Winston-daily-rotate-file - Log rotation

### Validation
- express-validator - Request validation

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL container is running: `docker-compose ps`
- Check DATABASE_URL in .env file
- Verify database credentials

### Port Already in Use
- Change PORT in .env file
- Kill the process using the port: `lsof -ti:5000 | xargs kill`

### Prisma Issues
- Regenerate Prisma Client: `npm run prisma:generate`
- Reset database: `npx prisma migrate reset`

## 📄 License

This project is licensed under the MIT License.

## 👥 Contributors

- CraveCart Team

## 📞 Support

For issues and questions, please create an issue in the repository.
