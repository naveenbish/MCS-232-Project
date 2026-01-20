# Troubleshooting Guide

Comprehensive guide to solving common issues in the CraveCart application.

## Table of Contents

1. [Quick Diagnostics](#quick-diagnostics)
2. [Installation Issues](#installation-issues)
3. [Database Issues](#database-issues)
4. [Backend Issues](#backend-issues)
5. [Frontend Issues](#frontend-issues)
6. [Docker Issues](#docker-issues)
7. [Authentication Issues](#authentication-issues)
8. [API Issues](#api-issues)
9. [Build & Deployment Issues](#build--deployment-issues)
10. [Performance Issues](#performance-issues)

## Quick Diagnostics

### System Health Check

Run this script to check your system:

```bash
#!/bin/bash
echo "=== CraveCart System Check ==="

# Check Node version
echo -n "Node.js: "
node --version || echo "NOT INSTALLED"

# Check npm version
echo -n "npm: "
npm --version || echo "NOT INSTALLED"

# Check Docker
echo -n "Docker: "
docker --version || echo "NOT INSTALLED"

# Check PostgreSQL container
echo -n "PostgreSQL Container: "
docker ps | grep postgres && echo "RUNNING" || echo "NOT RUNNING"

# Check ports
echo "Port 3000: $(lsof -i :3000 > /dev/null 2>&1 && echo 'IN USE' || echo 'FREE')"
echo "Port 5000: $(lsof -i :5000 > /dev/null 2>&1 && echo 'IN USE' || echo 'FREE')"
echo "Port 5432: $(lsof -i :5432 > /dev/null 2>&1 && echo 'IN USE' || echo 'FREE')"

# Check environment files
echo -n "Backend .env: "
[ -f apps/backend/.env ] && echo "EXISTS" || echo "MISSING"
echo -n "Frontend .env.local: "
[ -f apps/frontend/.env.local ] && echo "EXISTS" || echo "MISSING"
```

## Installation Issues

### Issue: `npm install` fails

**Error**: `npm ERR! code ERESOLVE`

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Remove existing modules
rm -rf node_modules package-lock.json
rm -rf apps/*/node_modules apps/*/package-lock.json

# Reinstall with legacy peer deps
npm install --legacy-peer-deps

# Or use force
npm install --force
```

### Issue: Node version mismatch

**Error**: `The engine "node" is incompatible with this module`

**Solution**:
```bash
# Check current version
node --version

# Install nvm (if not installed)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install and use correct Node version
nvm install 18
nvm use 18

# Set as default
nvm alias default 18
```

### Issue: Permission denied during install

**Error**: `EACCES: permission denied`

**Solution**:
```bash
# Fix npm permissions (don't use sudo!)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Or fix ownership
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

## Database Issues

### Issue: Cannot connect to database

**Error**: `Can't reach database server at localhost:5432`

**Solution 1** - Start PostgreSQL:
```bash
cd apps/backend
docker-compose up -d

# Verify it's running
docker ps | grep postgres
```

**Solution 2** - Check connection string:
```bash
# Verify .env file
cat apps/backend/.env | grep DATABASE_URL

# Should be:
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cravecart?schema=public"

# Test connection
psql postgresql://postgres:postgres@localhost:5432/cravecart -c "SELECT 1"
```

**Solution 3** - Reset database:
```bash
cd apps/backend

# Stop and remove container
docker-compose down -v

# Start fresh
docker-compose up -d

# Wait for startup
sleep 5

# Run migrations
npx prisma migrate deploy
npx prisma db seed
```

### Issue: Migration failed

**Error**: `P3009: migrate found failed migrations`

**Solution**:
```bash
# Reset migrations (CAUTION: Deletes all data)
npx prisma migrate reset --force

# Or mark as resolved
npx prisma migrate resolve --applied "20231123101609_init"

# Verify status
npx prisma migrate status
```

### Issue: Prisma Client not generated

**Error**: `Cannot find module '@prisma/client'`

**Solution**:
```bash
cd apps/backend

# Generate client
npx prisma generate

# Verify
ls node_modules/.prisma/client
```

## Backend Issues

### Issue: Port 5000 already in use

**Error**: `EADDRINUSE: address already in use :::5000`

**Solution 1** - Kill the process:
```bash
# Find process
lsof -i :5000

# Kill it
kill -9 $(lsof -t -i:5000)
```

**Solution 2** - Change port:
```bash
# Edit apps/backend/.env
PORT=5001

# Update frontend .env.local
NEXT_PUBLIC_API_URL=http://localhost:5001/api/v1
```

### Issue: Module not found

**Error**: `Cannot find module 'express'`

**Solution**:
```bash
cd apps/backend

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# If TypeScript module issues
npm run build
```

### Issue: Environment variables not loading

**Error**: `JWT_SECRET is not defined`

**Solution**:
```bash
# Check .env exists
ls -la apps/backend/.env

# Create from example
cp apps/backend/.env.example apps/backend/.env

# Verify loading
cd apps/backend
node -e "require('dotenv').config(); console.log(process.env.JWT_SECRET)"
```

## Frontend Issues

### Issue: Next.js won't start

**Error**: `Error: Cannot find module 'next'`

**Solution**:
```bash
cd apps/frontend

# Clean install
rm -rf node_modules .next package-lock.json
npm install

# Clear cache
rm -rf .next

# Start
npm run dev
```

### Issue: Hydration errors

**Error**: `Hydration failed because the initial UI does not match`

**Solution 1** - Check for client-only code:
```typescript
// Wrap client-only code
if (typeof window !== 'undefined') {
  // Client-only code here
}

// Or use useEffect
useEffect(() => {
  // Client-only code here
}, []);
```

**Solution 2** - Use dynamic imports:
```typescript
import dynamic from 'next/dynamic';

const ClientOnlyComponent = dynamic(
  () => import('../components/ClientOnly'),
  { ssr: false }
);
```

### Issue: API calls failing

**Error**: `Failed to fetch`

**Solution**:
```bash
# Check backend is running
curl http://localhost:5000/api/v1/health

# Check environment variable
cat apps/frontend/.env.local | grep NEXT_PUBLIC_API_URL

# Should be:
# NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1

# Restart frontend
cd apps/frontend
npm run dev
```

## Docker Issues

### Issue: Docker daemon not running

**Error**: `Cannot connect to the Docker daemon`

**Solution**:
```bash
# Start Docker Desktop (Mac/Windows)
# Or on Linux:
sudo systemctl start docker

# Verify
docker ps
```

### Issue: Container won't start

**Error**: `container exited with code 1`

**Solution**:
```bash
# Check logs
docker logs cravecart-backend

# Common fixes:
# 1. Rebuild without cache
docker-compose build --no-cache

# 2. Remove all containers
docker-compose down -v

# 3. Clean Docker system
docker system prune -a

# 4. Restart
docker-compose up --build
```

### Issue: Volume permission issues

**Error**: `Permission denied` in Docker logs

**Solution**:
```bash
# Fix permissions on host
chmod -R 755 apps/backend/logs
chmod -R 755 apps/backend/uploads

# Or in docker-compose.yml, add user:
services:
  backend:
    user: "1000:1000"  # Your user ID
```

## Authentication Issues

### Issue: Login fails with correct credentials

**Debugging steps**:
```bash
# 1. Check password hash
cd apps/backend
npx ts-node -e "
const bcrypt = require('bcrypt');
bcrypt.compare('User@123456', '$2b$10$...', (err, res) => console.log(res));
"

# 2. Check database user
docker exec -it cravecart-postgres psql -U postgres -d cravecart \
  -c "SELECT email, password FROM users WHERE email='john.doe@example.com';"

# 3. Reset test user password
npx ts-node -e "
const bcrypt = require('bcrypt');
bcrypt.hash('User@123456', 10, (err, hash) => console.log(hash));
"
# Then update in database
```

### Issue: JWT token errors

**Error**: `JsonWebTokenError: invalid signature`

**Solution**:
```bash
# Ensure same JWT_SECRET in both apps
grep JWT_SECRET apps/backend/.env
grep JWT_SECRET apps/frontend/.env.local

# They must match exactly!

# Generate new secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Issue: Cookies not being set

**Solution**:
```javascript
// Check cookie settings in backend
// apps/backend/src/controllers/authController.ts
res.cookie('accessToken', token, {
  httpOnly: true,
  secure: false, // Set to false for localhost
  sameSite: 'lax', // Try 'lax' instead of 'strict'
  maxAge: 7 * 24 * 60 * 60 * 1000
});
```

## API Issues

### Issue: CORS errors

**Error**: `Access to fetch at 'http://localhost:5000' from origin 'http://localhost:3000' has been blocked by CORS`

**Solution**:
```bash
# Check CORS configuration
grep FRONTEND_URL apps/backend/.env
# Should include: http://localhost:3000

# Check CORS middleware
# apps/backend/src/index.ts
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### Issue: 404 Not Found on API routes

**Solution**:
```bash
# Check API version in URL
curl http://localhost:5000/api/v1/health

# Not:
curl http://localhost:5000/api/health

# Check route registration
grep -r "router" apps/backend/src/routes/
```

### Issue: Rate limiting triggered

**Error**: `Too many requests`

**Solution**:
```bash
# Increase limit in .env
RATE_LIMIT_MAX_REQUESTS=1000

# Or disable for development
# Comment out rate limiter in apps/backend/src/index.ts
// app.use('/api/v1/auth', rateLimiter);
```

## Build & Deployment Issues

### Issue: Build fails

**Error**: `Type error: Cannot find name 'X'`

**Solution**:
```bash
# Clean build
cd apps/backend
rm -rf dist
npx tsc --noEmit  # Check types
npm run build

cd ../frontend
rm -rf .next
npm run build
```

### Issue: Production build not working

**Solution**:
```bash
# Test production build locally
NODE_ENV=production npm run build
NODE_ENV=production npm start

# Check for missing dependencies
npm ls
npm install --production

# Verify environment variables
env | grep NODE_ENV
```

### Issue: Docker build fails

**Solution**:
```bash
# Clear Docker cache
docker builder prune -a

# Build with detailed output
docker-compose build --no-cache --progress=plain

# Check Dockerfile syntax
docker build -f apps/backend/Dockerfile apps/backend
```

## Performance Issues

### Issue: Slow API responses

**Diagnosis**:
```bash
# Check database queries
cd apps/backend
npx prisma studio
# Look for N+1 queries

# Add query logging
# apps/backend/src/config/database.ts
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

**Solution**:
```typescript
// Use includes for relations
const orders = await prisma.order.findMany({
  include: {
    orderDetails: {
      include: {
        foodItem: true
      }
    }
  }
});

// Add indexes
// In schema.prisma
@@index([userId, status])
```

### Issue: High memory usage

**Solution**:
```bash
# Check memory usage
docker stats

# Limit container memory
# docker-compose.yml
services:
  backend:
    mem_limit: 512m

# Add Node.js memory limit
NODE_OPTIONS="--max-old-space-size=512" npm start
```

### Issue: Slow frontend loading

**Solution**:
```bash
# Analyze bundle
cd apps/frontend
npm run build
npx next-bundle-analyzer

# Enable compression
npm install compression

# Check for large imports
# Use dynamic imports for large components
```

## Recovery Procedures

### Complete Reset

```bash
#!/bin/bash
# Nuclear option - reset everything

# Stop all services
docker-compose down -v

# Clean everything
rm -rf node_modules apps/*/node_modules
rm -rf apps/backend/dist apps/frontend/.next
rm -rf apps/backend/logs/*

# Reinstall
npm install

# Setup database
cd apps/backend
docker-compose up -d
sleep 5
npx prisma migrate deploy
npx prisma db seed

# Start fresh
cd ../..
npm run dev
```

### Data Recovery

```bash
# Backup current data
docker exec cravecart-postgres pg_dump -U postgres cravecart > backup.sql

# Restore from backup
docker exec -i cravecart-postgres psql -U postgres cravecart < backup.sql
```

## Getting Help

If you're still stuck:

1. **Check logs**:
```bash
# Backend logs
docker logs cravecart-backend
cat apps/backend/logs/error.log

# Frontend logs
# Check browser console

# Database logs
docker logs cravecart-postgres
```

2. **Enable debug mode**:
```bash
# Backend
DEBUG=* npm run dev

# Frontend
NODE_OPTIONS='--inspect' npm run dev
```

3. **Create minimal reproduction**:
- Isolate the issue
- Create a minimal test case
- Document steps to reproduce

4. **Search for similar issues**:
- Check GitHub issues
- Search Stack Overflow
- Review documentation

---

**Remember**: Most issues are related to:
- Missing environment variables
- Port conflicts
- Database connection
- Module installation
- Docker not running

Always start with the Quick Diagnostics section!