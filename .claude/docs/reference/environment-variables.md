# Environment Variables Reference

Complete reference for all environment variables used in the CraveCart application.

## Table of Contents

1. [Backend Environment Variables](#backend-environment-variables)
2. [Frontend Environment Variables](#frontend-environment-variables)
3. [Docker Environment Variables](#docker-environment-variables)
4. [Security Considerations](#security-considerations)
5. [Environment-Specific Configurations](#environment-specific-configurations)

## Backend Environment Variables

Location: `apps/backend/.env`

### Server Configuration

| Variable | Type | Default | Required | Description |
|----------|------|---------|----------|-------------|
| `NODE_ENV` | string | `development` | Yes | Environment mode: `development`, `production`, `test` |
| `PORT` | number | `5000` | Yes | Port number for the Express server |
| `API_VERSION` | string | `v1` | Yes | API version prefix for routes |

### Database Configuration

| Variable | Type | Default | Required | Description |
|----------|------|---------|----------|-------------|
| `DATABASE_URL` | string | - | Yes | PostgreSQL connection string |

**Format**:
```
postgresql://[user]:[password]@[host]:[port]/[database]?schema=[schema]
```

**Examples**:
```env
# Development (local)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cravecart?schema=public"

# Docker network
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/cravecart?schema=public"

# Production (with SSL)
DATABASE_URL="postgresql://user:pass@db.example.com:5432/cravecart?schema=public&sslmode=require"
```

### JWT Authentication

| Variable | Type | Default | Required | Description |
|----------|------|---------|----------|-------------|
| `JWT_SECRET` | string | - | Yes | Secret key for signing JWT access tokens |
| `JWT_EXPIRES_IN` | string | `7d` | Yes | Access token expiration time |
| `JWT_REFRESH_SECRET` | string | - | Yes | Secret key for signing refresh tokens |
| `JWT_REFRESH_EXPIRES_IN` | string | `30d` | Yes | Refresh token expiration time |

**Security Notes**:
- Use strong, random strings (minimum 32 characters)
- Never commit actual secrets to version control
- Rotate secrets periodically in production
- Use different secrets for different environments

**Time Format Examples**:
- `1h` - 1 hour
- `24h` - 24 hours
- `7d` - 7 days
- `30d` - 30 days

### CORS Configuration

| Variable | Type | Default | Required | Description |
|----------|------|---------|----------|-------------|
| `FRONTEND_URL` | string | `http://localhost:3000` | Yes | Primary frontend URL |
| `ALLOWED_ORIGINS` | string | `http://localhost:3000` | Yes | Comma-separated list of allowed origins |

**Examples**:
```env
# Single origin
ALLOWED_ORIGINS="http://localhost:3000"

# Multiple origins
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001,https://app.cravecart.com"

# With wildcards (not recommended for production)
ALLOWED_ORIGINS="http://localhost:*"
```

### Payment Gateway (Razorpay)

| Variable | Type | Default | Required | Description |
|----------|------|---------|----------|-------------|
| `RAZORPAY_KEY_ID` | string | - | No* | Razorpay API Key ID |
| `RAZORPAY_KEY_SECRET` | string | - | No* | Razorpay API Key Secret |
| `RAZORPAY_WEBHOOK_SECRET` | string | - | No* | Webhook signature verification secret |

**Notes**:
- *Required only if payment functionality is enabled
- Use test keys for development
- Never expose KEY_SECRET in client-side code

**Test Mode Keys** (for development):
```env
RAZORPAY_KEY_ID="rzp_test_XXXXXXXXXXXX"
RAZORPAY_KEY_SECRET="YYYYYYYYYYYYYYYYYYYYYYYY"
```

### File Upload Configuration

| Variable | Type | Default | Required | Description |
|----------|------|---------|----------|-------------|
| `MAX_FILE_SIZE` | number | `5242880` | No | Maximum file size in bytes (default: 5MB) |
| `UPLOAD_PATH` | string | `./uploads` | No | Local directory for file uploads |
| `ALLOWED_FILE_TYPES` | string | `image/jpeg,image/png,image/webp` | No | Comma-separated MIME types |

### Rate Limiting

| Variable | Type | Default | Required | Description |
|----------|------|---------|----------|-------------|
| `RATE_LIMIT_WINDOW_MS` | number | `900000` | No | Time window in milliseconds (default: 15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | number | `100` | No | Maximum requests per window |
| `RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS` | boolean | `false` | No | Skip counting successful requests |
| `RATE_LIMIT_SKIP_FAILED_REQUESTS` | boolean | `false` | No | Skip counting failed requests |

### Logging Configuration

| Variable | Type | Default | Required | Description |
|----------|------|---------|----------|-------------|
| `LOG_LEVEL` | string | `info` | No | Logging level: `error`, `warn`, `info`, `debug` |
| `LOG_DIR` | string | `./logs` | No | Directory for log files |
| `LOG_MAX_SIZE` | string | `20m` | No | Maximum size of log file before rotation |
| `LOG_MAX_FILES` | string | `14d` | No | Maximum age of log files |
| `LOG_DATE_PATTERN` | string | `YYYY-MM-DD` | No | Date pattern for log file names |

### Email Configuration (Optional)

| Variable | Type | Default | Required | Description |
|----------|------|---------|----------|-------------|
| `SMTP_HOST` | string | - | No | SMTP server hostname |
| `SMTP_PORT` | number | `587` | No | SMTP server port |
| `SMTP_SECURE` | boolean | `false` | No | Use TLS/SSL |
| `SMTP_USER` | string | - | No | SMTP username |
| `SMTP_PASSWORD` | string | - | No | SMTP password |
| `EMAIL_FROM` | string | - | No | Default sender email address |

**Examples**:
```env
# Gmail
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="app-specific-password"

# SendGrid
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT=587
SMTP_USER="apikey"
SMTP_PASSWORD="SG.actual-api-key"
```

### AWS S3 Configuration (Optional)

| Variable | Type | Default | Required | Description |
|----------|------|---------|----------|-------------|
| `AWS_ACCESS_KEY_ID` | string | - | No | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | string | - | No | AWS secret key |
| `AWS_REGION` | string | `us-east-1` | No | AWS region |
| `AWS_S3_BUCKET` | string | - | No | S3 bucket name |
| `AWS_S3_ENDPOINT` | string | - | No | Custom S3 endpoint (for S3-compatible services) |

### Admin Seed Configuration

| Variable | Type | Default | Required | Description |
|----------|------|---------|----------|-------------|
| `ADMIN_EMAIL` | string | `admin@cravecart.com` | No | Default admin email |
| `ADMIN_PASSWORD` | string | `Admin@123456` | No | Default admin password |
| `ADMIN_NAME` | string | `Admin User` | No | Default admin name |

**Note**: Only used during database seeding. Change immediately after first login.

### Socket.IO Configuration

| Variable | Type | Default | Required | Description |
|----------|------|---------|----------|-------------|
| `SOCKET_PING_TIMEOUT` | number | `60000` | No | Ping timeout in milliseconds |
| `SOCKET_PING_INTERVAL` | number | `25000` | No | Ping interval in milliseconds |
| `SOCKET_MAX_HTTP_BUFFER_SIZE` | number | `1e6` | No | Maximum HTTP buffer size |

## Frontend Environment Variables

Location: `apps/frontend/.env.local`

### Public Environment Variables

| Variable | Type | Default | Required | Description |
|----------|------|---------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | string | - | Yes | Backend API base URL |
| `NEXT_PUBLIC_SOCKET_URL` | string | - | Yes | WebSocket server URL |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | string | - | No | Razorpay public key for client |
| `NEXT_PUBLIC_APP_NAME` | string | `CraveCart` | No | Application name |
| `NEXT_PUBLIC_APP_URL` | string | `http://localhost:3000` | No | Frontend application URL |

### Server-Side Environment Variables

| Variable | Type | Default | Required | Description |
|----------|------|---------|----------|-------------|
| `JWT_SECRET` | string | - | Yes | Must match backend JWT_SECRET for middleware |
| `NEXT_PUBLIC_GA_ID` | string | - | No | Google Analytics tracking ID |
| `NEXT_PUBLIC_GTM_ID` | string | - | No | Google Tag Manager ID |

### Example Frontend .env.local

```env
# Development
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=CraveCart
NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET=cravecart-super-secret-jwt-key-change-in-production-2024

# Production
NEXT_PUBLIC_API_URL=https://api.cravecart.com/api/v1
NEXT_PUBLIC_SOCKET_URL=wss://api.cravecart.com
NEXT_PUBLIC_APP_NAME=CraveCart
NEXT_PUBLIC_APP_URL=https://cravecart.com
JWT_SECRET=production-secret-key
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXX
```

## Docker Environment Variables

Location: `docker-compose.yml` and `docker-compose.dev.yml`

### PostgreSQL Container

| Variable | Type | Default | Required | Description |
|----------|------|---------|----------|-------------|
| `POSTGRES_USER` | string | `postgres` | Yes | PostgreSQL username |
| `POSTGRES_PASSWORD` | string | `postgres` | Yes | PostgreSQL password |
| `POSTGRES_DB` | string | `cravecart` | Yes | Database name |
| `POSTGRES_HOST` | string | `postgres` | Yes | Database host (container name) |
| `POSTGRES_PORT` | number | `5432` | Yes | Database port |

### Backend Container

Inherits all backend environment variables plus:

| Variable | Type | Default | Required | Description |
|----------|------|---------|----------|-------------|
| `DATABASE_URL` | string | - | Yes | Uses Docker network hostname |

Example for Docker:
```env
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/cravecart?schema=public"
```

### Frontend Container

Inherits all frontend environment variables plus:

| Variable | Type | Default | Required | Description |
|----------|------|---------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | string | - | Yes | Uses Docker service name |

Example for Docker:
```env
NEXT_PUBLIC_API_URL=http://backend:5000/api/v1
```

## Security Considerations

### Critical Security Variables

These variables must be changed in production:

1. **JWT Secrets**
   - Never use default values
   - Generate using: `openssl rand -base64 32`
   - Rotate periodically (every 3-6 months)

2. **Database Password**
   - Use strong passwords (16+ characters)
   - Include uppercase, lowercase, numbers, symbols
   - Never use default `postgres` password

3. **API Keys**
   - Store in secure vaults (AWS Secrets Manager, HashiCorp Vault)
   - Use environment-specific keys
   - Implement key rotation

### Best Practices

1. **Never commit secrets**
   ```bash
   # Add to .gitignore
   .env
   .env.local
   .env.production
   ```

2. **Use different values per environment**
   ```bash
   # Development
   JWT_SECRET=dev-secret-key

   # Staging
   JWT_SECRET=staging-secret-key

   # Production
   JWT_SECRET=production-secret-key
   ```

3. **Validate required variables on startup**
   ```typescript
   // Example validation in backend
   const required = ['DATABASE_URL', 'JWT_SECRET'];
   for (const variable of required) {
     if (!process.env[variable]) {
       throw new Error(`Missing required environment variable: ${variable}`);
     }
   }
   ```

4. **Use secret management tools**
   - Development: `.env` files
   - CI/CD: GitHub Secrets, GitLab CI variables
   - Production: AWS Secrets Manager, Azure Key Vault, etc.

## Environment-Specific Configurations

### Development Environment

```env
# apps/backend/.env
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cravecart?schema=public"
JWT_SECRET="dev-secret-change-this"
JWT_REFRESH_SECRET="dev-refresh-secret-change-this"
LOG_LEVEL=debug
RATE_LIMIT_MAX_REQUESTS=1000

# apps/frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### Production Environment

```env
# apps/backend/.env.production
NODE_ENV=production
PORT=5000
DATABASE_URL="${DATABASE_URL}"  # From secrets manager
JWT_SECRET="${JWT_SECRET}"       # From secrets manager
JWT_REFRESH_SECRET="${JWT_REFRESH_SECRET}"
LOG_LEVEL=error
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN="https://cravecart.com"

# apps/frontend/.env.production
NEXT_PUBLIC_API_URL=https://api.cravecart.com/api/v1
NEXT_PUBLIC_SOCKET_URL=wss://api.cravecart.com
NEXT_PUBLIC_RAZORPAY_KEY_ID="${RAZORPAY_LIVE_KEY}"
```

### Testing Environment

```env
# apps/backend/.env.test
NODE_ENV=test
PORT=5001
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cravecart_test?schema=public"
JWT_SECRET="test-secret"
LOG_LEVEL=silent
```

## Variable Validation Script

Create a script to validate environment variables:

```javascript
// scripts/validate-env.js
const requiredBackend = [
  'NODE_ENV',
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET'
];

const requiredFrontend = [
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_SOCKET_URL',
  'JWT_SECRET'
];

function validateEnv(variables, envFile) {
  const missing = variables.filter(v => !process.env[v]);
  if (missing.length > 0) {
    console.error(`Missing environment variables in ${envFile}:`);
    missing.forEach(v => console.error(`  - ${v}`));
    process.exit(1);
  }
  console.log(`✓ All required variables present in ${envFile}`);
}

// Usage
validateEnv(requiredBackend, 'backend/.env');
validateEnv(requiredFrontend, 'frontend/.env.local');
```

## Troubleshooting

### Common Environment Issues

1. **Variable not loading**
   - Ensure file is named correctly (`.env` or `.env.local`)
   - Check file location
   - Restart the application after changes

2. **Connection refused**
   - Verify DATABASE_URL host and port
   - Check if services are running
   - Ensure network connectivity

3. **CORS errors**
   - Check ALLOWED_ORIGINS includes your frontend URL
   - Ensure URLs don't have trailing slashes
   - Verify protocol (http vs https)

4. **JWT errors**
   - Ensure JWT_SECRET matches between frontend and backend
   - Check token expiration times
   - Verify token format in requests

---

**Note**: Always follow the principle of least privilege when setting environment variables. Only expose what's necessary, and keep sensitive values secure.