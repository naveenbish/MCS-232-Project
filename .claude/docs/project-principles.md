# CraveCart Project Principles

## Core Development Principle: NO PREDICTIONS, ONLY VERIFICATION

### Always Check, Never Assume

When working on this project, NEVER make assumptions or predictions. Always verify by checking the actual implementation:

1. **Docker Containers**
   - ❌ DON'T: Guess container names like `cravecart-postgres`
   - ✅ DO: Check `apps/backend/docker-compose.yml` for actual container names
   - Container name: `cravecart_postgres` (with underscore, not hyphen)

2. **Database Configuration**
   - ❌ DON'T: Assume default PostgreSQL credentials (postgres/postgres)
   - ✅ DO: Check `apps/backend/.env` for actual credentials
   - Actual: `cravecart_user` / `cravecart_password` / `cravecart_db`

3. **Database Schema**
   - ❌ DON'T: Assume Prisma model names match database table names
   - ✅ DO: Check actual database schema or Prisma migrations
   - Prisma uses snake_case in database: `food_items` not `FoodItem`, `is_veg` not `isVeg`

4. **API Endpoints**
   - ❌ DON'T: Guess API routes
   - ✅ DO: Check `apps/backend/src/routes/` for actual endpoints

5. **Environment Variables**
   - ❌ DON'T: Assume variable names
   - ✅ DO: Check `.env` files in both backend and frontend

## Verification Checklist

Before making any changes or running commands:

### For Docker Operations:
```bash
# 1. Check what's running
docker ps

# 2. Check docker-compose configuration
cat apps/backend/docker-compose.yml

# 3. Use exact container names from docker ps output
docker exec cravecart_postgres [command]
```

### For Database Operations:
```bash
# 1. Check credentials
grep DATABASE_URL apps/backend/.env

# 2. Check table structure
docker exec cravecart_postgres psql -U cravecart_user -d cravecart_db -c "\dt"

# 3. Check column names
docker exec cravecart_postgres psql -U cravecart_user -d cravecart_db -c "\d table_name"
```

### For Code Changes:
```bash
# 1. Read the existing file first
cat [file_path]

# 2. Check related files for context
grep -r "pattern" apps/backend/src/

# 3. Verify imports and dependencies
```

## Project-Specific Facts (Always True)

### Docker Setup:
- Container name: `cravecart_postgres`
- Database user: `cravecart_user`
- Database name: `cravecart_db`
- PostgreSQL port: `5432`

### Database Schema:
- Tables use snake_case: `food_items`, `order_details`, etc.
- Columns use snake_case: `is_veg`, `category_id`, `created_at`
- IDs are UUIDs stored as text

### API Structure:
- Base URL: `/api/v1`
- Auth endpoints: `/api/v1/auth/*`
- Admin endpoints: `/api/v1/admin/*`
- Public endpoints: `/api/v1/menu`, `/api/v1/categories`

### Frontend:
- Next.js 15 with App Router
- Redux Toolkit for state management
- RTK Query for API calls
- Socket.IO client for real-time updates

## The Golden Rule

**When in doubt, CHECK THE CODE!**

Never assume, always verify. The codebase is the source of truth, not your assumptions about how things "should" work.

## Common Pitfalls to Avoid

1. **Assuming Prisma model names = database table names**
   - Prisma converts PascalCase to snake_case
   - `FoodItem` model → `food_items` table
   - `isVeg` field → `is_veg` column

2. **Assuming default PostgreSQL setup**
   - This project uses custom user/database names
   - Always check `.env` for actual configuration

3. **Assuming Docker naming conventions**
   - Docker Compose uses project name + service name
   - Underscores, not hyphens in container names

4. **Assuming API patterns**
   - Always check the actual route files
   - Middleware might modify expected behavior

## How to Approach Problems

1. **Identify what you need to know**
2. **Find where that information lives** (config file, schema, routes, etc.)
3. **Read/check that source directly**
4. **Verify your understanding** (test with a read operation first)
5. **Only then make changes**

Remember: The project already works. Your job is to understand how it works, not to guess how it might work.