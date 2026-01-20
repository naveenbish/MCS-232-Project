# 💻 CraveCart Tech Stack & Architecture

Comprehensive technical documentation for the CraveCart food delivery platform.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Frontend Technologies](#frontend-technologies)
3. [Backend Technologies](#backend-technologies)
4. [Database Design](#database-design)
5. [Real-time Communication](#real-time-communication)
6. [Payment Integration](#payment-integration)
7. [Development Setup](#development-setup)
8. [Deployment](#deployment)
9. [Performance Optimization](#performance-optimization)
10. [Security Measures](#security-measures)
11. [Testing Strategy](#testing-strategy)
12. [Monitoring & Logging](#monitoring--logging)

## 🏗️ Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Client Layer                       │
├─────────────────────────────────────────────────────┤
│  Next.js 15 App  │  Mobile PWA  │  Admin Dashboard  │
└──────────┬──────────────┬──────────────┬───────────┘
           │              │              │
           └──────────────┼──────────────┘
                          │
                    Load Balancer
                          │
           ┌──────────────┼──────────────┐
           │              │              │
    ┌──────▼─────┐ ┌──────▼─────┐ ┌─────▼──────┐
    │  API Server│ │  API Server│ │ API Server │
    │  (Node.js) │ │  (Node.js) │ │ (Node.js)  │
    └──────┬─────┘ └──────┬─────┘ └─────┬──────┘
           │              │              │
           └──────────────┼──────────────┘
                          │
           ┌──────────────┼──────────────┐
           │              │              │
    ┌──────▼─────┐ ┌──────▼─────┐ ┌─────▼──────┐
    │PostgreSQL │ │   Redis    │ │  Socket.IO │
    │  Primary  │ │   Cache    │ │   Server   │
    └────────────┘ └────────────┘ └────────────┘
```

### Monorepo Structure

```
MCS-232-Project/
├── apps/
│   ├── frontend/          # Next.js 15 application
│   │   ├── src/
│   │   │   ├── app/      # App router pages
│   │   │   ├── components/
│   │   │   ├── features/
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   ├── services/
│   │   │   └── store/
│   │   └── public/
│   │
│   └── backend/           # Express.js API
│       ├── src/
│       │   ├── controllers/
│       │   ├── middleware/
│       │   ├── models/
│       │   ├── routes/
│       │   ├── services/
│       │   └── utils/
│       └── prisma/
│
├── packages/              # Shared packages
│   ├── types/            # TypeScript definitions
│   └── utils/            # Shared utilities
│
├── docs/                 # Documentation
├── docker/              # Docker configurations
└── turbo.json          # Turborepo config
```

## 🎨 Frontend Technologies

### Core Framework

#### Next.js 15
```json
{
  "framework": "Next.js",
  "version": "15.0.0",
  "features": [
    "App Router",
    "Server Components",
    "Server Actions",
    "Streaming SSR",
    "Parallel Routes",
    "Intercepting Routes"
  ]
}
```

**Key Features Used:**
- **App Router**: Modern routing with layouts
- **Server Components**: Better performance
- **Dynamic Imports**: Code splitting
- **Image Optimization**: Next/Image
- **Font Optimization**: Next/Font

### Language & Type Safety

#### TypeScript
```typescript
// tsconfig.json configuration
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,
    "noEmit": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@features/*": ["./src/features/*"]
    }
  }
}
```

### State Management

#### Redux Toolkit + RTK Query
```typescript
// Store configuration
import { configureStore } from '@reduxjs/toolkit';
import { foodApi } from '@/services/api/foodApi';
import { orderApi } from '@/services/api/orderApi';
import cartReducer from '@/features/cart/cartSlice';
import authReducer from '@/features/auth/authSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
    [foodApi.reducerPath]: foodApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      foodApi.middleware,
      orderApi.middleware
    ),
});
```

**RTK Query Features:**
- Automatic caching
- Optimistic updates
- Polling/refetching
- Request deduplication

### Styling & Animation

#### Tailwind CSS v4
```javascript
// tailwind.config.ts
export default {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef2f2',
          500: '#ef4444',
          900: '#7f1d1d'
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out'
      }
    }
  },
  plugins: []
}
```

#### shadcn/ui Components
```typescript
// Component library setup
Components used:
- Button
- Card
- Dialog/Modal
- Form
- Input
- Select
- Toast
- Tabs
- Table
- Badge
- Skeleton
- Avatar
```

#### Framer Motion
```typescript
// Animation library for React
import { motion, AnimatePresence } from 'framer-motion';

// Used for:
- Cart item animations
- Button micro-interactions
- Page transitions
- Quantity controls
- Stagger effects
- Spring physics
- Exit animations

// Example animation variants
export const itemVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 100
    }
  },
  exit: { opacity: 0, x: 50 }
};
```

### Real-time Communication

#### Socket.IO Client
```typescript
// Socket connection setup
import { io, Socket } from 'socket.io-client';

const socket: Socket = io(process.env.NEXT_PUBLIC_API_URL!, {
  auth: {
    token: localStorage.getItem('token')
  },
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Event listeners
socket.on('order-status-update', (data) => {
  dispatch(updateOrderStatus(data));
});
```

## 🚀 Backend Technologies

### Core Framework

#### Express.js with TypeScript
```typescript
// Server setup
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```

### Database & ORM

#### PostgreSQL + Prisma
```prisma
// schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String   @id @default(uuid())
  email         String   @unique
  password      String
  name          String
  role          Role     @default(USER)
  orders        Order[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([email])
}

model FoodItem {
  id            String   @id @default(uuid())
  name          String
  description   String
  price         Decimal  @db.Decimal(10, 2)
  imageUrl      String
  category      Category @relation(fields: [categoryId], references: [id])
  categoryId    String
  isVeg         Boolean  @default(false)
  isAvailable   Boolean  @default(true)
  orderItems    OrderItem[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([categoryId, isAvailable])
}

model Order {
  id                String      @id @default(cuid())
  user              User        @relation(fields: [userId], references: [id])
  userId            String
  items             OrderItem[]
  totalAmount       Decimal     @db.Decimal(10, 2)
  status            OrderStatus @default(PENDING)
  paymentStatus     PaymentStatus @default(PENDING)
  paymentId         String?
  deliveryAddress   String
  contactNumber     String
  deliveryInstructions String?
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt

  @@index([userId, status])
}
```

### Authentication

#### JWT Implementation
```typescript
// JWT service
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export class AuthService {
  generateToken(userId: string, role: string): string {
    return jwt.sign(
      { id: userId, role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
```

### Middleware Stack

```typescript
// Authentication middleware
export const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Admin authorization
export const authorize = (roles: string[]) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};
```

### Caching Layer

#### Redis Integration
```typescript
// Redis client setup
import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 1000)
  }
});

// Caching middleware
export const cache = (duration: number) => {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;

    const cached = await redisClient.get(key);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    res.sendResponse = res.json;
    res.json = (body) => {
      redisClient.setEx(key, duration, JSON.stringify(body));
      res.sendResponse(body);
    };

    next();
  };
};
```

## 🗄️ Database Design

### Entity Relationship Diagram

```
User (1) ─────────── (*) Order
  │                       │
  │                       │
  └─ id                   ├─ id
  └─ email                ├─ userId (FK)
  └─ password             ├─ totalAmount
  └─ name                 ├─ status
  └─ role                 ├─ paymentStatus
                          │
                          │
Category (1) ───── (*) FoodItem (1) ───── (*) OrderItem
  │                      │                      │
  ├─ id                  ├─ id                 ├─ id
  ├─ name                ├─ name               ├─ orderId (FK)
  └─ displayOrder        ├─ price              ├─ foodItemId (FK)
                         ├─ categoryId (FK)    ├─ quantity
                         └─ isAvailable        └─ price
```

### Indexes & Optimization

```sql
-- Performance indexes
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_food_items_category ON food_items(category_id, is_available);
CREATE INDEX idx_users_email ON users(email);

-- Full-text search
CREATE INDEX idx_food_items_search ON food_items USING GIN(
  to_tsvector('english', name || ' ' || description)
);
```

### Migration Strategy

```bash
# Prisma migrations
npx prisma migrate dev --name init
npx prisma migrate deploy --production
npx prisma generate
```

## 🔄 Real-time Communication

### Socket.IO Architecture

```typescript
// Socket.IO server setup
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Redis adapter for scaling
const pubClient = createClient({ url: REDIS_URL });
const subClient = pubClient.duplicate();
io.adapter(createAdapter(pubClient, subClient));

// Authentication
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  try {
    const user = await verifyToken(token);
    socket.data.user = user;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});
```

### Event Handling

```typescript
// Order events
io.on('connection', (socket) => {
  // Join user room
  socket.join(`user:${socket.data.user.id}`);

  // Join order room
  socket.on('join-order', (orderId) => {
    socket.join(`order:${orderId}`);
  });

  // Admin events
  if (socket.data.user.role === 'ADMIN') {
    socket.join('admin-room');

    // Send dashboard updates
    const interval = setInterval(() => {
      socket.emit('dashboard-update', getDashboardMetrics());
    }, 30000);

    socket.on('disconnect', () => {
      clearInterval(interval);
    });
  }
});

// Emit order updates
export const emitOrderUpdate = (orderId: string, status: string) => {
  io.to(`order:${orderId}`).emit('order-status-update', {
    orderId,
    status,
    updatedAt: new Date()
  });

  io.to('admin-room').emit('order-update', {
    orderId,
    status
  });
};
```

## 💳 Payment Integration

### Razorpay Setup

```typescript
// Razorpay configuration
import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Create order
export const createPaymentOrder = async (amount: number, orderId: string) => {
  const options = {
    amount: amount * 100, // Amount in paise
    currency: 'INR',
    receipt: orderId,
    payment_capture: 1,
    notes: {
      orderId,
      platform: 'CraveCart'
    }
  };

  return razorpay.orders.create(options);
};

// Verify payment signature
export const verifyPaymentSignature = (
  orderId: string,
  paymentId: string,
  signature: string
): boolean => {
  const text = `${orderId}|${paymentId}`;
  const generated = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(text)
    .digest('hex');

  return generated === signature;
};
```

### Payment Flow

```
User → Checkout → Create Order → Initialize Payment
                        ↓
                  Razorpay Gateway
                        ↓
                  Payment Success
                        ↓
                  Verify Signature
                        ↓
                  Update Order Status
                        ↓
                  Send Confirmation
```

## 🛠️ Development Setup

### Prerequisites

```bash
# Required versions
Node.js: >= 18.0.0
npm: >= 9.0.0
PostgreSQL: >= 14.0
Redis: >= 6.2
```

### Environment Variables

```env
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_RAZORPAY_KEY=rzp_test_xxx
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000

# Backend (.env)
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:pass@localhost:5432/cravecart
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
CLIENT_URL=http://localhost:3000
```

### Local Development

```bash
# Clone repository
git clone <repository-url>
cd MCS-232-Project

# Install dependencies
npm install

# Setup database
npx prisma migrate dev
npx prisma db seed

# Run development servers
npm run dev

# Individual apps
npm run dev:frontend
npm run dev:backend

# With Turbo
turbo dev
```

### Docker Development

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: cravecart
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"

  app:
    build: .
    depends_on:
      - postgres
      - redis
    environment:
      DATABASE_URL: postgresql://admin:password@postgres:5432/cravecart
      REDIS_URL: redis://redis:6379
    ports:
      - "3000:3000"
      - "5000:5000"
    volumes:
      - .:/app
      - /app/node_modules

volumes:
  postgres_data:
```

## 🚢 Deployment

### Production Build

```bash
# Build all apps
npm run build

# Build specific app
npm run build:frontend
npm run build:backend

# Type checking
npm run type-check

# Linting
npm run lint
```

### Deployment Architecture

```yaml
# Kubernetes deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cravecart-frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: cravecart/frontend:latest
        ports:
        - containerPort: 3000
        env:
        - name: NEXT_PUBLIC_API_URL
          value: "https://api.cravecart.com"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

### CI/CD Pipeline

```yaml
# GitHub Actions workflow
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Production
        run: |
          # Deploy script
          npm run deploy:production
```

## ⚡ Performance Optimization

### Frontend Optimization

```typescript
// Next.js optimizations
// 1. Image optimization
import Image from 'next/image';

<Image
  src="/food.jpg"
  alt="Food"
  width={400}
  height={300}
  loading="lazy"
  placeholder="blur"
/>

// 2. Dynamic imports
const HeavyComponent = dynamic(
  () => import('@/components/HeavyComponent'),
  {
    loading: () => <Skeleton />,
    ssr: false
  }
);

// 3. Prefetching
import { prefetch } from '@/lib/api';

useEffect(() => {
  prefetch('/api/menu');
}, []);
```

### Backend Optimization

```typescript
// Query optimization
// 1. Pagination
const items = await prisma.foodItem.findMany({
  skip: (page - 1) * limit,
  take: limit,
  include: {
    category: true
  }
});

// 2. Select specific fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true
  }
});

// 3. Database connection pooling
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
  log: ['error'],
  connectionLimit: 10,
});
```

### Caching Strategy

```typescript
// Multi-level caching
// 1. Browser cache
res.setHeader('Cache-Control', 'public, max-age=3600');

// 2. CDN cache
res.setHeader('CDN-Cache-Control', 'max-age=86400');

// 3. Application cache (Redis)
const cached = await redis.get(key);
if (cached) return JSON.parse(cached);

// 4. Database query cache
const result = await prisma.$queryRaw`
  SELECT * FROM food_items
  WHERE category_id = ${categoryId}
  CACHE 3600
`;
```

## 🔒 Security Measures

### Security Implementation

```typescript
// 1. Input validation
import { z } from 'zod';

const orderSchema = z.object({
  items: z.array(z.object({
    foodItemId: z.string().uuid(),
    quantity: z.number().min(1).max(10)
  })),
  deliveryAddress: z.string().min(10).max(200),
  contactNumber: z.string().regex(/^\+?[1-9]\d{9,14}$/)
});

// 2. SQL injection prevention (Prisma handles this)
const user = await prisma.user.findUnique({
  where: { email: sanitizedEmail }
});

// 3. XSS protection
import DOMPurify from 'isomorphic-dompurify';
const clean = DOMPurify.sanitize(userInput);

// 4. CSRF protection
import csrf from 'csurf';
app.use(csrf({ cookie: true }));

// 5. Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests'
});
```

### Security Headers

```typescript
// Helmet.js configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://checkout.razorpay.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

## 🧪 Testing Strategy

### Testing Stack

```json
{
  "unit": "Jest + React Testing Library",
  "integration": "Supertest",
  "e2e": "Playwright",
  "performance": "Lighthouse CI"
}
```

### Test Examples

```typescript
// Unit test
describe('Cart Reducer', () => {
  test('should add item to cart', () => {
    const state = cartReducer(initialState, addItem(mockItem));
    expect(state.items).toHaveLength(1);
    expect(state.total).toBe(mockItem.price);
  });
});

// API test
describe('POST /api/orders', () => {
  test('should create order', async () => {
    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send(mockOrder);

    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty('orderId');
  });
});

// E2E test
test('complete order flow', async ({ page }) => {
  await page.goto('/menu');
  await page.click('[data-testid="add-to-cart"]');
  await page.goto('/cart');
  await page.click('[data-testid="checkout"]');
  await page.fill('[name="address"]', '123 Test St');
  await page.click('[data-testid="place-order"]');
  await expect(page).toHaveURL('/orders');
});
```

## 📊 Monitoring & Logging

### Logging Setup

```typescript
// Winston logger
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Request logging
app.use((req, res, next) => {
  logger.info({
    method: req.method,
    url: req.url,
    ip: req.ip,
    timestamp: new Date()
  });
  next();
});
```

### Monitoring Tools

```yaml
# Prometheus metrics
- Application metrics
- Database performance
- API response times
- Error rates

# Grafana dashboards
- Real-time monitoring
- Alert configuration
- Performance trends
- User analytics

# Sentry error tracking
- JavaScript errors
- API errors
- Performance monitoring
- Release tracking
```

## 🔄 Future Enhancements

### Planned Technologies

```javascript
Upcoming:
- GraphQL API layer
- Microservices architecture
- Kubernetes orchestration
- Event-driven architecture (Kafka)
- Machine learning recommendations
- Progressive Web App (PWA)
- React Native mobile apps
- Blockchain for payments
```

---

*For technical support, contact the development team at dev-support@cravecart.com*