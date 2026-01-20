# 🍕 CraveCart - Food Delivery Platform

A production-ready, full-stack food ordering and delivery application built with modern technologies. CraveCart enables customers to browse menus, place orders, make payments, and track deliveries in real-time, while providing administrators with comprehensive management tools and analytics.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js%2015-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)](https://www.prisma.io/)

---

## ✨ Features

### 👥 For Customers
- **Browse Menu** - Explore food items organized by categories
- **Smart Search & Filter** - Find dishes by name, category, or price range
- **Shopping Cart** - Add items with quantity control (persists in localStorage)
- **Secure Checkout** - Place orders with delivery address and contact details
- **Payment Integration** - Pay securely via Razorpay payment gateway
- **Order Tracking** - Real-time order status updates via Socket.IO
- **Order History** - View all past orders with detailed information
- **Reviews & Ratings** - Rate and review food items you've ordered

### 👨‍💼 For Administrators
- **Category Management** - Create, update, and delete food categories
- **Menu Management** - Add, edit, remove food items with images
- **Order Management** - View all orders, update status (triggers real-time notifications)
- **Sales Analytics** - View revenue reports, top-selling items, sales trends
- **User Analytics** - Track user registrations, active customers
- **Payment Reports** - Monitor payment status, revenue breakdowns
- **Dashboard** - Comprehensive statistics and insights

### 🔒 Security & Quality
- JWT authentication with automatic token refresh
- Secure password hashing with bcrypt
- Input validation and sanitization
- Rate limiting on API endpoints
- CORS protection
- Helmet security headers
- Winston logging with daily rotation

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.0.2 (App Router)
- **Language**: TypeScript
- **UI Library**: React 18.2.0
- **Styling**: Tailwind CSS v4
- **State Management**: Redux Toolkit 2.0.1 + RTK Query
- **Authentication**: Cookie-based JWT with automatic refresh
- **UI Components**: shadcn/ui, Radix UI
- **Form Handling**: React Hook Form + Zod validation
- **Real-time**: Socket.IO Client 4.6.1
- **Notifications**: Sonner (toast notifications)
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 15
- **ORM**: Prisma 5.22.0
- **Authentication**: JWT (jsonwebtoken) with refresh tokens
- **Password Hashing**: bcrypt
- **Real-time**: Socket.IO 4.8.1
- **Payment Gateway**: Razorpay 2.9.4
- **Security**: Helmet, CORS, express-rate-limit, express-validator
- **Logging**: Winston with daily rotation
- **File Upload**: Multer

### DevOps & Tools
- **Monorepo**: Turborepo
- **Package Manager**: npm workspaces
- **Containerization**: Docker & Docker Compose
- **Database GUI**: Prisma Studio

---

## 📁 Project Structure

```
MCS-232-Project/
├── apps/
│   ├── backend/                      # Express TypeScript API
│   │   ├── src/
│   │   │   ├── config/              # Database, logger, Socket.IO, Razorpay
│   │   │   ├── controllers/         # 6 controllers (auth, food, order, payment, report, review)
│   │   │   ├── middleware/          # Auth, validation, rate limiting, error handling
│   │   │   ├── routes/              # 6 route files
│   │   │   ├── services/            # Business logic (6 services)
│   │   │   ├── types/               # TypeScript type definitions
│   │   │   ├── utils/               # JWT, password, response, validators
│   │   │   └── index.ts             # Express app entry point
│   │   ├── prisma/
│   │   │   ├── schema.prisma        # Database schema (8 tables)
│   │   │   └── seed.ts              # Sample data seeding
│   │   ├── logs/                    # Winston log files
│   │   ├── uploads/                 # File uploads directory
│   │   ├── .env                     # Environment configuration
│   │   ├── .env.example             # Environment template
│   │   ├── docker-compose.yml       # PostgreSQL container
│   │   ├── Dockerfile               # Production build
│   │   ├── Dockerfile.dev           # Development build
│   │   ├── README.md                # Complete API documentation
│   │   └── QUICKSTART.md            # 5-minute setup guide
│   │
│   └── frontend/                    # Next.js 15 Application
│       ├── src/
│       │   ├── app/                 # Next.js app directory (pages)
│       │   │   ├── admin/           # Admin dashboard pages
│       │   │   ├── api/             # API routes (auth refresh endpoint)
│       │   │   ├── cart/            # Shopping cart page
│       │   │   ├── checkout/        # Checkout page
│       │   │   ├── login/           # Login page
│       │   │   ├── menu/            # Food menu/browse page
│       │   │   ├── orders/          # User orders page
│       │   │   ├── profile/         # User profile page
│       │   │   └── register/        # Registration page
│       │   ├── components/          # React components
│       │   │   └── ui/              # shadcn/ui components
│       │   ├── features/            # Redux slices (auth, cart, userDetails)
│       │   ├── services/            # RTK Query APIs (8 services)
│       │   ├── hooks/               # Custom hooks + typed Redux hooks
│       │   ├── lib/                 # Utilities
│       │   ├── types/               # TypeScript types
│       │   ├── middleware.ts        # Next.js middleware (route protection)
│       │   └── store.ts             # Redux store configuration
│       ├── public/                  # Static assets
│       ├── .env.local               # Environment variables
│       ├── Dockerfile               # Production build
│       ├── Dockerfile.dev           # Development build
│       ├── README.md                # Frontend documentation
│       └── FRONTEND_IMPLEMENTATION_GUIDE.md  # Complete code templates
│
├── docker-compose.yml               # Production Docker setup (all services)
├── docker-compose.dev.yml           # Development Docker setup (with hot reload)
├── package.json                     # Root package with Turborepo scripts
├── turbo.json                       # Turborepo pipeline configuration
├── PROJECT_SUMMARY.md               # Overall project status
├── QUICK_REFERENCE.md               # Quick commands and API reference
└── README.md                        # This file
```

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)
- **npm** (comes with Node.js)

### Method 1: Using Turborepo (Recommended - Fastest)

```bash
# 1. Install all dependencies
npm install

# 2. Start PostgreSQL database (ensure Docker Desktop is running)
cd apps/backend
docker-compose up -d

# 3. Setup database (run migrations and seed data)
npm run prisma:migrate
npm run prisma:seed

# 4. Start both backend and frontend (from root directory)
cd ../..
npm run dev
```

**Access the application:**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

### Method 2: Using Docker Compose (Complete Stack)

**Development Mode (with hot reload):**
```bash
# Start all services (PostgreSQL, Backend, Frontend)
docker-compose -f docker-compose.dev.yml up

# Or in detached mode
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

**Production Mode:**
```bash
# Build and start all services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Method 3: Manual Setup (Step-by-Step)

**Terminal 1 - Database & Backend:**
```bash
cd apps/backend

# Install dependencies
npm install

# Start PostgreSQL database
docker-compose up -d

# Run database migrations
npm run prisma:generate
npm run prisma:migrate

# Seed sample data
npm run prisma:seed

# Start development server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd apps/frontend

# Install dependencies (if not done via root)
npm install

# Start development server
npm run dev
```

---

## ⚙️ Environment Variables

### Backend Configuration

Located at: `apps/backend/.env`

```env
# Server
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database
DATABASE_URL="postgresql://cravecart_user:cravecart_password@localhost:5432/cravecart_db"

# JWT Secrets (Change in production!)
JWT_SECRET=cravecart-super-secret-jwt-key-change-in-production-2024
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=cravecart-refresh-token-secret-change-in-production-2024
JWT_REFRESH_EXPIRES_IN=30d

# Razorpay (Optional for testing)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# CORS
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Frontend Configuration

Located at: `apps/frontend/.env.local`

```env
# API URLs
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000

# JWT Secret (must match backend)
JWT_SECRET=cravecart-super-secret-jwt-key-change-in-production-2024

# Razorpay (Optional for testing)
NEXT_PUBLIC_RAZORPAY_KEY_ID=
```

**Note:** Environment files already exist and are pre-configured. Razorpay keys are optional for testing basic functionality.

---

## 📦 Available Scripts

### Root Level (Turborepo)

```bash
npm run dev              # Start all apps in development mode
npm run build            # Build all apps for production
npm run start            # Start all apps in production mode
npm run lint             # Lint all apps
npm run docker:up        # Start Docker containers (production)
npm run docker:down      # Stop Docker containers
npm run docker:logs      # View Docker logs
npm run prisma:migrate   # Run database migrations (backend)
npm run prisma:seed      # Seed database with sample data (backend)
npm run prisma:studio    # Open Prisma Studio (backend)
```

### Backend Scripts

```bash
cd apps/backend
npm run dev              # Start development server with nodemon
npm run build            # Build TypeScript to JavaScript
npm run start            # Start production server
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:seed      # Seed database with sample data
npm run prisma:studio    # Open Prisma Studio GUI (http://localhost:5555)
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
```

### Frontend Scripts

```bash
cd apps/frontend
npm run dev              # Start Next.js development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
```

---

## 🌐 Access URLs

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Base**: http://localhost:5000/api/v1
- **Prisma Studio** (Database GUI): http://localhost:5555 (run `npm run prisma:studio`)
- **PostgreSQL Database**: localhost:5432

---

## 🔐 Default Test Credentials

After seeding the database, you can use these accounts for testing:

### Admin Account
- **Email**: `admin@cravecart.com`
- **Password**: `Admin@123456`
- **Access**: Full admin dashboard with reports and management tools

### Sample User Accounts
- **Email**: `john.doe@example.com` | **Password**: `User@123456`
- **Email**: `jane.smith@example.com` | **Password**: `User@123456`
- **Access**: Customer features (browse, order, pay, review)

---

## 📊 Database Schema

The application uses **8 database tables** with PostgreSQL:

### Tables

1. **users** - Customer accounts
   - Fields: id, name, email, password, contact, address, createdAt, updatedAt

2. **admins** - Admin accounts
   - Fields: id, name, email, password, role, contact, createdAt, updatedAt

3. **categories** - Food categories
   - Fields: id, name, description, createdAt, updatedAt

4. **food_items** - Menu items
   - Fields: id, name, price, categoryId, description, image, availabilityStatus, createdAt, updatedAt

5. **orders** - Customer orders
   - Fields: id, userId, status, totalAmount, deliveryAddress, contactNumber, createdAt, updatedAt

6. **order_details** - Order line items
   - Fields: id, orderId, itemId, quantity, priceAtTime, subtotal

7. **payments** - Payment transactions
   - Fields: id, orderId, paymentStatus, paymentMethod, razorpayOrderId, razorpayPaymentId, razorpaySignature, amount, createdAt, updatedAt

8. **reviews** - User reviews
   - Fields: id, userId, foodItemId, rating, comments, createdAt, updatedAt

### Enums

- **OrderStatus**: `PENDING`, `CONFIRMED`, `PREPARING`, `PREPARED`, `OUT_FOR_DELIVERY`, `DELIVERED`, `COMPLETED`, `CANCELLED`
- **PaymentStatus**: `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`, `REFUNDED`

---

## 🔌 API Endpoints Overview

### Authentication (`/api/v1/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `POST /admin/login` - Admin login
- `GET /me` - Get current user (protected)
- `PUT /profile` - Update profile (protected)

### Food Items (`/api/v1/food`)
- `GET /categories` - Get all categories
- `GET /items` - Get food items (supports filters: search, categoryId, page, limit)
- `GET /items/:id` - Get single food item

### Orders (`/api/v1/orders`) - Protected
- `POST /` - Create new order
- `GET /` - Get user's orders
- `GET /:id` - Get order details
- `POST /:id/cancel` - Cancel order

### Payments (`/api/v1/payments`) - Protected
- `POST /create` - Create Razorpay order
- `POST /verify` - Verify payment
- `GET /:orderId` - Get payment details

### Reviews (`/api/v1/reviews`) - Protected
- `POST /` - Create review
- `GET /food/:itemId` - Get reviews for food item
- `GET /my-reviews` - Get user's reviews
- `PUT /:id` - Update review
- `DELETE /:id` - Delete review

### Admin Endpoints (`/api/v1/admin`) - Admin Only
- **Categories**: POST, PUT, DELETE `/categories`
- **Food Items**: POST, PUT, DELETE `/food-items`
- **Orders**: GET all, UPDATE status `/orders`
- **Reports**: Sales, Users, Orders, Payments `/reports/*`
- **Dashboard**: `/dashboard/stats`

**Complete API documentation**: See `apps/backend/README.md`

---

## 📈 Project Status

### Backend: ✅ 100% Complete
- ✅ Complete REST API with 30+ endpoints
- ✅ JWT authentication with automatic token refresh
- ✅ All 8 database tables implemented
- ✅ Razorpay payment integration
- ✅ Socket.IO for real-time updates
- ✅ Admin dashboard with reports
- ✅ Security features (helmet, CORS, rate limiting)
- ✅ Winston logging with daily rotation
- ✅ Database seeding with sample data
- ✅ Comprehensive error handling

### Frontend: ⚠️ 70% Complete

**Completed:**
- ✅ Project setup (Next.js 15, TypeScript, Tailwind)
- ✅ Complete TypeScript type definitions
- ✅ Redux store with RTK Query
- ✅ Auth slice (Customer-Connect pattern with automatic token refresh)
- ✅ Cart slice with localStorage persistence
- ✅ User details slice
- ✅ All RTK Query API services (8 services)
- ✅ Base query with automatic Bearer token injection
- ✅ Middleware for route protection
- ✅ Utility functions
- ✅ Some UI components (shadcn/ui)

**Needs Implementation:**
- ⏳ Complete page components (login, menu, cart, checkout, orders, admin dashboard)
- ⏳ Additional custom UI components
- ⏳ Socket.IO integration for real-time updates
- ⏳ Complete theming setup

**Note:** The `apps/frontend/FRONTEND_IMPLEMENTATION_GUIDE.md` provides complete code templates for all remaining components.

---

## 🔧 Troubleshooting

### Port Already in Use

```bash
# Check and kill process on port 3000 (Frontend)
lsof -ti:3000 | xargs kill -9

# Check and kill process on port 5000 (Backend)
lsof -ti:5000 | xargs kill -9
```

### Database Connection Issues

```bash
cd apps/backend

# Restart PostgreSQL container
docker-compose restart

# Regenerate Prisma client
npm run prisma:generate

# Re-run migrations
npm run prisma:migrate
```

### Clean Reset (Nuclear Option)

```bash
# Stop all Docker containers
docker-compose down -v

# Remove all node_modules and lock files
rm -rf node_modules package-lock.json
rm -rf apps/*/node_modules apps/*/package-lock.json

# Reinstall dependencies
npm install

# Restart database and migrate
cd apps/backend
docker-compose up -d
npm run prisma:migrate
npm run prisma:seed

# Start development (from root)
cd ../..
npm run dev
```

### Docker Build Issues

```bash
# Clear Docker cache
docker-compose down -v
docker system prune -a

# Rebuild from scratch
docker-compose up --build
```

---

## 📚 Additional Documentation

- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Complete project status and implementation guide
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Quick commands, API endpoints, and patterns
- **[apps/backend/README.md](./apps/backend/README.md)** - Complete backend API documentation
- **[apps/backend/QUICKSTART.md](./apps/backend/QUICKSTART.md)** - 5-minute backend setup guide
- **[apps/frontend/FRONTEND_IMPLEMENTATION_GUIDE.md](./apps/frontend/FRONTEND_IMPLEMENTATION_GUIDE.md)** - Complete frontend code templates

---

## 💻 Development Workflow

1. **Make changes** to backend or frontend code
2. **Hot reload** automatically picks up changes in development mode
3. **Test locally** using the development URLs
4. **Run tests** (if available) to ensure nothing breaks
5. **Build and test** with Docker before deployment
6. **Deploy** using docker-compose for production

---

## 🚢 Deployment

### Using Docker Compose (Recommended)

```bash
# On your server
git clone <repository-url>
cd MCS-232-Project

# Update environment variables for production
nano apps/backend/.env
nano apps/frontend/.env.local

# Start in production mode
docker-compose up -d

# View logs
docker-compose logs -f
```

### Manual Deployment

**Backend:**
```bash
cd apps/backend
npm install
npm run build
npm start
```

**Frontend:**
```bash
cd apps/frontend
npm install
npm run build
npm start
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly (local + Docker)
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🆘 Support & Help

Need help getting started or found a bug?

- 📖 Check the documentation files in the repo
- 🐛 Open an issue on GitHub
- 📧 Contact the development team

---

## 🏆 Built With

- [Turborepo](https://turbo.build/) - High-performance build system for monorepos
- [Next.js](https://nextjs.org/) - The React Framework for Production
- [Express](https://expressjs.com/) - Fast, unopinionated web framework for Node.js
- [Prisma](https://www.prisma.io/) - Next-generation ORM for Node.js & TypeScript
- [PostgreSQL](https://www.postgresql.org/) - The world's most advanced open source database
- [Redux Toolkit](https://redux-toolkit.js.org/) - The official, opinionated, batteries-included toolset for Redux
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautifully designed components

---

**Built with ❤️ for learning and demonstration purposes**
