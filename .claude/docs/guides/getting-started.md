# Getting Started with CraveCart

This guide will help you set up and run the CraveCart food delivery platform on your local development environment.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Environment Setup](#environment-setup)
4. [Database Setup](#database-setup)
5. [Running the Application](#running-the-application)
6. [Verifying the Installation](#verifying-the-installation)
7. [Test Accounts](#test-accounts)
8. [Common Issues](#common-issues)
9. [Next Steps](#next-steps)
10. [FAQ](#faq)

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

| Software | Minimum Version | Verification Command |
|----------|----------------|---------------------|
| Node.js | 18.0.0 | `node --version` |
| npm | 10.2.3 | `npm --version` |
| Docker | 20.10.0 | `docker --version` |
| Docker Compose | 2.0.0 | `docker-compose --version` |
| Git | 2.0.0 | `git --version` |

### System Requirements

- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 20.04+ recommended)
- **RAM**: Minimum 8GB (16GB recommended for smooth development)
- **Disk Space**: At least 2GB free space
- **Ports**: Ensure ports 3000, 5000, 5432, and 5555 are available

## Installation

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone [repository-url]

# Navigate to the project directory
cd MCS-232-Project

# Verify you're in the correct directory
ls -la
# You should see: package.json, turbo.json, apps/, docker-compose.yml, etc.
```

### Step 2: Install Dependencies

```bash
# Install all dependencies for the monorepo
npm install

# This will install dependencies for:
# - Root workspace (Turborepo)
# - Backend application
# - Frontend application
```

**Note**: This may take 3-5 minutes depending on your internet connection.

## Environment Setup

### Step 3: Configure Environment Variables

#### Backend Environment (.env)

```bash
# Navigate to backend directory
cd apps/backend

# Copy the example environment file
cp .env.example .env

# The default .env should contain:
```

```env
# Server Configuration
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cravecart?schema=public"

# JWT Configuration
JWT_SECRET="cravecart-super-secret-jwt-key-change-in-production-2024"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_SECRET="cravecart-super-secret-refresh-key-change-in-production-2024"
JWT_REFRESH_EXPIRES_IN="30d"

# CORS
FRONTEND_URL="http://localhost:3000"
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001"

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH="./uploads"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL="info"
LOG_DIR="./logs"

# Admin Seed Data
ADMIN_EMAIL="admin@cravecart.com"
ADMIN_PASSWORD="Admin@123456"
ADMIN_NAME="Admin User"
```

#### Frontend Environment (.env.local)

```bash
# Navigate to frontend directory
cd ../frontend

# Create the environment file
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
JWT_SECRET=cravecart-super-secret-jwt-key-change-in-production-2024
EOF

# Return to root directory
cd ../..
```

## Database Setup

### Step 4: Start PostgreSQL Database

```bash
# Navigate to backend directory
cd apps/backend

# Start PostgreSQL using Docker Compose
docker-compose up -d

# Verify the database is running
docker ps
# You should see a container named 'cravecart-postgres'

# Check database logs (optional)
docker logs cravecart-postgres
```

### Step 5: Run Database Migrations

```bash
# Generate Prisma Client (if needed)
npx prisma generate

# Run database migrations
npx prisma migrate dev

# You should see:
# ✔ Database is up to date
# ✔ Generated Prisma Client
```

### Step 6: Seed the Database

```bash
# Seed the database with sample data
npx prisma db seed

# This creates:
# - 1 Admin account
# - 3 Customer accounts
# - 6 Food categories
# - 14 Food items with images

# Return to root directory
cd ../..
```

## Running the Application

### Option 1: Development Mode (Recommended)

```bash
# From the root directory, start all services
npm run dev

# This starts:
# - Backend on http://localhost:5000
# - Frontend on http://localhost:3000
# - Both with hot reload enabled
```

### Option 2: Using Docker (Production-like)

```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up --build -d

# View logs
docker-compose logs -f
```

### Option 3: Run Services Individually

```bash
# Terminal 1 - Backend
cd apps/backend
npm run dev

# Terminal 2 - Frontend
cd apps/frontend
npm run dev
```

## Verifying the Installation

### Step 1: Check Backend API

Open your browser or use curl:

```bash
# Check API health
curl http://localhost:5000/api/v1/health

# Response should be:
# {"status":"OK","message":"API is running"}

# Check categories endpoint
curl http://localhost:5000/api/v1/food/categories

# Should return 6 categories
```

### Step 2: Check Frontend

1. Open http://localhost:3000 in your browser
2. You should see the CraveCart homepage
3. Click on "Menu" to browse food items
4. Try logging in with test credentials

### Step 3: Check Database (Optional)

```bash
# Open Prisma Studio
cd apps/backend
npx prisma studio

# Opens at http://localhost:5555
# You can browse all tables and data
```

## Test Accounts

### Admin Account
- **Email**: `admin@cravecart.com`
- **Password**: `Admin@123456`
- **Access**: Full admin dashboard at `/admin`

### Customer Accounts

| Name | Email | Password |
|------|-------|----------|
| John Doe | `john.doe@example.com` | `User@123456` |
| Jane Smith | `jane.smith@example.com` | `User@123456` |
| Bob Johnson | `bob.johnson@example.com` | `User@123456` |

### Testing Payment (Razorpay Test Mode)

Use these test card details:
- **Card Number**: 4111 1111 1111 1111
- **Expiry**: Any future date
- **CVV**: Any 3 digits
- **Name**: Any name

## Common Issues

### Issue 1: Port Already in Use

**Error**: `EADDRINUSE: address already in use :::5000`

**Solution**:
```bash
# Find process using the port
lsof -i :5000  # Mac/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process or change the port in .env
```

### Issue 2: Database Connection Failed

**Error**: `Can't reach database server at localhost:5432`

**Solution**:
```bash
# Ensure PostgreSQL container is running
docker ps

# If not running, start it
cd apps/backend
docker-compose up -d

# Check container logs
docker logs cravecart-postgres
```

### Issue 3: Prisma Client Not Generated

**Error**: `Cannot find module '@prisma/client'`

**Solution**:
```bash
cd apps/backend
npx prisma generate
```

### Issue 4: Module Not Found Errors

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
rm -rf apps/*/node_modules apps/*/package-lock.json
npm install
```

### Issue 5: Docker Build Fails

**Solution**:
```bash
# Clean Docker cache
docker system prune -a
docker-compose build --no-cache
```

## Next Steps

Now that you have CraveCart running, here are some suggested next steps:

### 1. Explore the Application

- **Customer Flow**:
  1. Register a new account
  2. Browse the menu
  3. Add items to cart
  4. Complete checkout
  5. Track order status

- **Admin Flow**:
  1. Login as admin
  2. View dashboard
  3. Manage categories
  4. Add/edit food items
  5. Process orders

### 2. Development Tasks

- Review the [Architecture Overview](../architecture/overview.md)
- Understand the [API Endpoints](../api/endpoints.md)
- Learn about [Authentication](../api/authentication.md)
- Explore the [Database Schema](../reference/database-schema.md)

### 3. Useful Commands

```bash
# View all available commands
npm run

# Run linting
npm run lint

# Build for production
npm run build

# Run tests (when implemented)
npm run test
```

### 4. Development Tools

- **Prisma Studio**: Database GUI at http://localhost:5555
- **Redux DevTools**: Install browser extension for state debugging
- **React DevTools**: Install for component debugging

## FAQ

### Q: Can I use a different database?

**A**: The project is configured for PostgreSQL. While Prisma supports other databases, you would need to:
1. Update the provider in `prisma/schema.prisma`
2. Adjust certain PostgreSQL-specific features
3. Update the connection string

### Q: How do I reset the database?

**A**:
```bash
cd apps/backend
npx prisma migrate reset
# This will drop the database, re-run migrations, and re-seed
```

### Q: Can I change the ports?

**A**: Yes, update the port numbers in:
- Backend: `apps/backend/.env` (PORT variable)
- Frontend: `apps/frontend/package.json` (add `-p [port]` to dev script)
- Update corresponding URLs in environment files

### Q: How do I add new food items?

**A**:
1. Login as admin
2. Navigate to `/admin`
3. Go to "Manage Menu"
4. Click "Add Item"
5. Fill in details and upload image

### Q: Is email functionality working?

**A**: Email configuration is optional. To enable:
1. Add SMTP credentials to `apps/backend/.env`
2. Implement email service calls where needed

### Q: How do I deploy to production?

**A**: See the [Deployment Guide](../architecture/deployment.md) for detailed instructions on:
- Docker deployment
- Environment configuration
- Security considerations
- Monitoring setup

## Troubleshooting Resources

- [Detailed Troubleshooting Guide](troubleshooting.md)
- [Debugging Guide](debugging.md)
- [Development Setup](development-setup.md)
- [Backend README](../../../apps/backend/README.md)

## Support

If you encounter issues not covered here:

1. Check the troubleshooting guide
2. Review existing GitHub issues
3. Consult the API documentation
4. Check Docker and PostgreSQL logs

---

**Congratulations!** You now have CraveCart running on your local machine. Happy coding!