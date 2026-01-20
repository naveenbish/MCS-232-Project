# Commands Reference

Complete reference for all commands used in the CraveCart project.

## Table of Contents

1. [Quick Start Commands](#quick-start-commands)
2. [Development Commands](#development-commands)
3. [Database Commands](#database-commands)
4. [Build Commands](#build-commands)
5. [Docker Commands](#docker-commands)
6. [Testing Commands](#testing-commands)
7. [Utility Commands](#utility-commands)
8. [Troubleshooting Commands](#troubleshooting-commands)

## Quick Start Commands

### Initial Setup
```bash
# Clone repository
git clone [repository-url]
cd MCS-232-Project

# Install all dependencies
npm install

# Setup backend environment
cd apps/backend
cp .env.example .env

# Setup frontend environment
cd ../frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
JWT_SECRET=cravecart-super-secret-jwt-key-change-in-production-2024" > .env.local

# Return to root
cd ../..
```

### Quick Development Start
```bash
# From root directory - starts everything
npm run dev

# Or step by step:
cd apps/backend
docker-compose up -d     # Start PostgreSQL
npm run prisma:migrate    # Run migrations
npm run prisma:seed      # Seed database
cd ../..
npm run dev              # Start both frontend and backend
```

## Development Commands

### Monorepo Commands (Root Directory)

| Command | Description | What it does |
|---------|-------------|--------------|
| `npm run dev` | Start all services in dev mode | Runs frontend on :3000, backend on :5000 |
| `npm run build` | Build all applications | Creates production builds |
| `npm run start` | Start production builds | Runs built applications |
| `npm run lint` | Lint all code | Checks code quality |
| `npm run format` | Format all code | Applies Prettier formatting |

### Backend Commands (apps/backend)

| Command | Description | Details |
|---------|-------------|---------|
| `npm run dev` | Start backend in dev mode | Uses nodemon for hot reload |
| `npm run build` | Compile TypeScript | Outputs to `dist/` |
| `npm run start` | Start production build | Runs compiled JavaScript |
| `npm run lint` | Lint backend code | ESLint check |
| `npm run format` | Format backend code | Prettier formatting |
| `npm run test` | Run tests | Jest test suite |
| `npm run test:watch` | Watch mode tests | Auto-rerun on changes |
| `npm run test:coverage` | Test with coverage | Generate coverage report |

### Frontend Commands (apps/frontend)

| Command | Description | Details |
|---------|-------------|---------|
| `npm run dev` | Start Next.js dev server | Hot reload enabled |
| `npm run build` | Build for production | Optimized build |
| `npm run start` | Start production server | Serves built app |
| `npm run lint` | Lint frontend code | Next.js ESLint |
| `npm run analyze` | Analyze bundle size | Webpack bundle analyzer |

## Database Commands

### Prisma Commands (apps/backend)

| Command | Description | When to use |
|---------|-------------|-------------|
| `npx prisma init` | Initialize Prisma | First time setup |
| `npx prisma generate` | Generate Prisma Client | After schema changes |
| `npx prisma migrate dev` | Create and apply migration | Development migrations |
| `npx prisma migrate deploy` | Apply migrations | Production deployment |
| `npx prisma migrate reset` | Reset database | Clean slate (CAUTION) |
| `npx prisma migrate status` | Check migration status | Verify migrations |
| `npx prisma db seed` | Seed database | Load sample data |
| `npx prisma studio` | Open Prisma Studio | GUI database browser |
| `npx prisma format` | Format schema file | Clean up schema.prisma |
| `npx prisma validate` | Validate schema | Check for errors |

### Direct PostgreSQL Commands

```bash
# Connect to database
psql -U postgres -d cravecart

# Backup database
pg_dump -U postgres -d cravecart > backup.sql

# Restore database
psql -U postgres -d cravecart < backup.sql

# Export specific table
pg_dump -U postgres -d cravecart -t users > users.sql

# Check database size
psql -U postgres -d cravecart -c "SELECT pg_database_size('cravecart');"

# List all tables
psql -U postgres -d cravecart -c "\dt"

# Count records in table
psql -U postgres -d cravecart -c "SELECT COUNT(*) FROM users;"
```

### Database Migrations

```bash
# Create new migration
npx prisma migrate dev --name add_user_field

# Apply specific migration
npx prisma migrate deploy --schema=./prisma/schema.prisma

# Rollback migration (manual)
psql -U postgres -d cravecart < prisma/migrations/[timestamp]_[name]/down.sql

# Create migration without applying
npx prisma migrate dev --create-only --name my_migration

# Mark migration as applied
npx prisma migrate resolve --applied [migration_name]
```

## Build Commands

### Production Build

```bash
# From root - build everything
npm run build

# Backend production build
cd apps/backend
npm run build
# Output: dist/ directory with compiled JS

# Frontend production build
cd apps/frontend
npm run build
# Output: .next/ directory with optimized build

# Build and analyze bundle
cd apps/frontend
npm run build
npx next-bundle-analyzer
```

### TypeScript Compilation

```bash
# Check types without building
cd apps/backend
npx tsc --noEmit

# Build with source maps
npx tsc --sourceMap

# Watch mode compilation
npx tsc --watch

# Build specific file
npx tsc src/index.ts
```

## Docker Commands

### Container Management

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Start with rebuild
docker-compose up --build

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# View logs
docker-compose logs

# Follow logs
docker-compose logs -f

# Logs for specific service
docker-compose logs backend
```

### Individual Container Commands

```bash
# List running containers
docker ps

# List all containers
docker ps -a

# Stop container
docker stop cravecart-backend

# Start container
docker start cravecart-backend

# Restart container
docker restart cravecart-backend

# Remove container
docker rm cravecart-backend

# Execute command in container
docker exec -it cravecart-backend sh

# View container logs
docker logs cravecart-backend

# Copy files from container
docker cp cravecart-backend:/app/logs ./logs
```

### Docker Images

```bash
# List images
docker images

# Build image
docker build -t cravecart-backend ./apps/backend

# Tag image
docker tag cravecart-backend:latest cravecart-backend:v1.0.0

# Push to registry
docker push username/cravecart-backend:latest

# Remove image
docker rmi cravecart-backend

# Clean unused images
docker image prune

# Clean everything
docker system prune -a
```

### Docker Volumes

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect postgres_data

# Create volume
docker volume create cravecart_data

# Remove volume
docker volume rm cravecart_data

# Clean unused volumes
docker volume prune
```

## Testing Commands

### Unit Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- auth.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should create user"

# Update snapshots
npm test -- -u

# Run tests in CI mode
CI=true npm test
```

### E2E Tests (if configured)

```bash
# Run E2E tests
npm run test:e2e

# Run E2E in headed mode
npm run test:e2e:headed

# Run specific E2E test
npm run test:e2e -- --spec cypress/e2e/auth.cy.ts

# Open Cypress
npx cypress open
```

### API Testing

```bash
# Test endpoint with curl
curl http://localhost:5000/api/v1/health

# Test POST request
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"User@123456"}'

# Test with authentication
curl http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test file upload
curl -X POST http://localhost:5000/api/v1/upload \
  -F "file=@/path/to/image.jpg"
```

## Utility Commands

### NPM Management

```bash
# Check outdated packages
npm outdated

# Update packages
npm update

# Install specific version
npm install package@1.2.3

# Install and save as dev dependency
npm install --save-dev package

# Remove package
npm uninstall package

# List installed packages
npm ls

# Check package info
npm info package

# Clean cache
npm cache clean --force

# Audit for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Git Commands

```bash
# Check status
git status

# Add changes
git add .

# Commit changes
git commit -m "feat: add new feature"

# Push to remote
git push origin main

# Pull latest changes
git pull origin main

# Create branch
git checkout -b feature/new-feature

# Switch branch
git checkout main

# Merge branch
git merge feature/new-feature

# View commit history
git log --oneline

# Stash changes
git stash

# Apply stash
git stash pop

# Reset to previous commit
git reset --hard HEAD~1
```

### Process Management

```bash
# Find process using port
lsof -i :5000  # Mac/Linux
netstat -ano | findstr :5000  # Windows

# Kill process by port
kill -9 $(lsof -t -i:5000)  # Mac/Linux

# Kill Node processes
killall node  # Mac/Linux
taskkill /F /IM node.exe  # Windows

# Check memory usage
free -h  # Linux
top  # Mac/Linux
```

## Troubleshooting Commands

### Port Issues

```bash
# Check if port is in use
lsof -i :3000
lsof -i :5000
lsof -i :5432

# Kill process on port
kill -9 $(lsof -t -i:3000)

# Change port (add to package.json)
"dev": "next dev -p 3001"
```

### Database Issues

```bash
# Check PostgreSQL status
docker ps | grep postgres

# Connect to PostgreSQL container
docker exec -it cravecart-postgres psql -U postgres

# Reset database completely
cd apps/backend
npx prisma migrate reset --force

# Check database connection
psql postgresql://postgres:postgres@localhost:5432/cravecart -c "SELECT 1"

# View database logs
docker logs cravecart-postgres
```

### Build Issues

```bash
# Clear Next.js cache
cd apps/frontend
rm -rf .next

# Clear build artifacts
cd apps/backend
rm -rf dist

# Clear all node_modules
find . -name "node_modules" -type d -prune -exec rm -rf {} +

# Clear npm cache
npm cache clean --force

# Rebuild from scratch
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Permission Issues

```bash
# Fix file permissions (Mac/Linux)
chmod -R 755 .
chmod -R 644 *.json *.md

# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Fix Docker permissions
sudo usermod -aG docker $USER
```

## Environment-Specific Commands

### Development Environment

```bash
# Start development
npm run dev

# Watch files
npm run watch

# Hot reload
# Automatic in dev mode
```

### Staging Environment

```bash
# Build for staging
NODE_ENV=staging npm run build

# Deploy to staging
npm run deploy:staging

# Run staging locally
NODE_ENV=staging npm start
```

### Production Environment

```bash
# Build for production
NODE_ENV=production npm run build

# Start production
NODE_ENV=production npm start

# Deploy to production
npm run deploy:production

# Check production logs
pm2 logs
```

## Maintenance Commands

### Regular Maintenance

```bash
# Update dependencies (weekly)
npm update
npm audit fix

# Clean Docker (monthly)
docker system prune -a
docker volume prune

# Backup database (daily)
pg_dump -U postgres -d cravecart > backup-$(date +%Y%m%d).sql

# Rotate logs (weekly)
find ./logs -type f -mtime +7 -delete

# Optimize database (monthly)
psql -U postgres -d cravecart -c "VACUUM ANALYZE;"
```

### Performance Monitoring

```bash
# Check Node memory usage
node --inspect app.js

# Profile application
node --prof app.js

# Generate flame graph
0x -o app.js

# Check bundle size
cd apps/frontend
npm run analyze

# Database query analysis
psql -U postgres -d cravecart -c "EXPLAIN ANALYZE SELECT * FROM orders;"
```

## Useful Aliases

Add to your shell profile (`.bashrc`, `.zshrc`):

```bash
# CraveCart aliases
alias cc="cd ~/Documents/MCS-232-Project"
alias ccdev="cd ~/Documents/MCS-232-Project && npm run dev"
alias ccdb="cd ~/Documents/MCS-232-Project/apps/backend && npx prisma studio"
alias cclogs="cd ~/Documents/MCS-232-Project && docker-compose logs -f"
alias ccreset="cd ~/Documents/MCS-232-Project/apps/backend && npx prisma migrate reset --force"
alias ccbuild="cd ~/Documents/MCS-232-Project && npm run build"
alias cctest="cd ~/Documents/MCS-232-Project && npm test"
```

---

**Note**: Always ensure you're in the correct directory when running commands. Most commands are context-sensitive and need to be run from specific locations.