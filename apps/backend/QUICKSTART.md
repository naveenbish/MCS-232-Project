# CraveCart Backend - Quick Start Guide

Get the CraveCart backend API up and running in 5 minutes!

## Prerequisites

Before you begin, ensure you have the following installed:
- ✅ Node.js (v18+) - [Download](https://nodejs.org/)
- ✅ Docker Desktop - [Download](https://www.docker.com/products/docker-desktop/)
- ✅ npm (comes with Node.js)

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Dependencies (1 min)

```bash
cd backend
npm install
```

### Step 2: Start PostgreSQL Database (1 min)

```bash
docker-compose up -d
```

Wait for the container to start (about 10 seconds), then verify it's running:

```bash
docker-compose ps
```

You should see `cravecart_postgres` with status "Up".

### Step 3: Setup Database (2 min)

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations to create database tables
npm run prisma:migrate

# Seed the database with sample data
npm run prisma:seed
```

### Step 4: Start the Server (30 sec)

```bash
npm run dev
```

You should see output like:

```
==================================================
🚀 CraveCart Backend Server Started
📍 Server: http://localhost:5000
📍 API: http://localhost:5000/api/v1
🌍 Environment: development
⚡ Socket.IO: Enabled
==================================================
```

### Step 5: Test the API (30 sec)

Open your browser or use curl:

**Health Check:**
```bash
curl http://localhost:5000/health
```

**Login as Admin:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@cravecart.com",
    "password": "Admin@123456"
  }'
```

**Get Food Items:**
```bash
curl http://localhost:5000/api/v1/food/items
```

## 📝 Default Credentials

After seeding, you can login with these accounts:

**Admin:**
- Email: `admin@cravecart.com`
- Password: `Admin@123456`

**Sample Users:**
- Email: `john.doe@example.com`
- Password: `User@123456`

- Email: `jane.smith@example.com`
- Password: `User@123456`

## 🔍 Explore the API

### Using Postman/Thunder Client

1. Import the API endpoints from the README.md
2. Login to get a JWT token
3. Add the token to Authorization header:
   ```
   Authorization: Bearer <your-token>
   ```

### Quick Test Endpoints

**Public Endpoints (No Auth Required):**
- GET `/api/v1/food/categories` - Get all food categories
- GET `/api/v1/food/items` - Get all food items
- POST `/api/v1/auth/register` - Register new user
- POST `/api/v1/auth/login` - User login

**User Endpoints (Auth Required):**
- GET `/api/v1/auth/me` - Get current user
- POST `/api/v1/orders` - Create an order
- GET `/api/v1/orders` - Get user's orders

**Admin Endpoints (Admin Auth Required):**
- GET `/api/v1/admin/dashboard/stats` - Dashboard statistics
- POST `/api/v1/admin/food-items` - Create food item
- GET `/api/v1/admin/reports/sales` - Sales report

## 🎯 Common Use Cases

### 1. Register and Login as User

**Register:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test@123456",
    "contact": "9876543210",
    "address": "123 Test Street, Mumbai"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123456"
  }'
```

Save the token from the response!

### 2. Browse Food Items

```bash
# Get all categories
curl http://localhost:5000/api/v1/food/categories

# Get all food items
curl http://localhost:5000/api/v1/food/items

# Search for pizza
curl http://localhost:5000/api/v1/food/items?search=pizza

# Filter by category
curl http://localhost:5000/api/v1/food/items?categoryId=<category-id>
```

### 3. Place an Order

```bash
curl -X POST http://localhost:5000/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "items": [
      {
        "itemId": "<food-item-id>",
        "quantity": 2
      }
    ],
    "deliveryAddress": "123 Test Street, Mumbai",
    "contactNumber": "9876543210"
  }'
```

## 🛠️ Development Tools

### Prisma Studio (Database GUI)

View and edit your database visually:

```bash
npm run prisma:studio
```

Opens at `http://localhost:5555`

### View Logs

Logs are stored in the `logs/` directory:
- `application-YYYY-MM-DD.log` - All logs
- `error-YYYY-MM-DD.log` - Error logs only

### Database Reset

If you need to reset the database:

```bash
npx prisma migrate reset
npm run prisma:seed
```

## 🐛 Troubleshooting

**Port 5000 already in use:**
```bash
# Change PORT in .env file
PORT=5001
```

**Database connection error:**
```bash
# Restart PostgreSQL container
docker-compose restart

# Or recreate it
docker-compose down
docker-compose up -d
```

**Prisma errors:**
```bash
# Regenerate Prisma Client
npm run prisma:generate

# Re-run migrations
npm run prisma:migrate
```

**Clean start:**
```bash
# Stop everything
docker-compose down -v

# Remove node_modules
rm -rf node_modules package-lock.json

# Fresh install
npm install
docker-compose up -d
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

## 📚 Next Steps

1. **Configure Razorpay** (Optional)
   - Sign up at [Razorpay](https://razorpay.com/)
   - Get your API keys
   - Add them to `.env` file

2. **Integrate with Frontend**
   - The API is ready to connect with the Next.js frontend
   - Set `ALLOWED_ORIGINS` in `.env` to include your frontend URL

3. **Explore Admin Features**
   - Login as admin
   - Try creating categories and food items
   - View reports and analytics

4. **Test Socket.IO**
   - Connect to WebSocket from frontend
   - Place an order and watch real-time status updates

## 🎉 You're Ready!

Your CraveCart backend is now running! Check out the full README.md for:
- Complete API documentation
- Security features
- Production deployment guide
- Advanced configuration options

Happy coding! 🚀
