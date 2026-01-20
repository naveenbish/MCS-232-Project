# Technology Stack Reference

Complete reference of all technologies, frameworks, libraries, and tools used in the CraveCart project.

## Table of Contents

1. [Core Technologies](#core-technologies)
2. [Backend Dependencies](#backend-dependencies)
3. [Frontend Dependencies](#frontend-dependencies)
4. [Development Tools](#development-tools)
5. [DevOps & Infrastructure](#devops--infrastructure)
6. [Version Requirements](#version-requirements)

## Core Technologies

### Programming Languages

| Technology | Version | Usage | Files |
|------------|---------|-------|-------|
| **TypeScript** | 5.6.3 (backend), 5.x (frontend) | Primary language for type safety | `*.ts`, `*.tsx` |
| **JavaScript** | ES2022+ | Configuration files | `*.js`, `*.mjs` |
| **SQL** | PostgreSQL dialect | Database queries via Prisma | `*.sql` |
| **JSON** | - | Configuration and data | `*.json` |
| **YAML** | - | Docker Compose | `*.yml` |
| **Markdown** | - | Documentation | `*.md` |

### Runtime Environments

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18.0.0+ | JavaScript runtime |
| **npm** | 10.2.3+ | Package management |
| **Docker** | 20.10.0+ | Containerization |
| **Docker Compose** | 2.0.0+ | Multi-container orchestration |

## Backend Dependencies

### Core Framework & Runtime

| Package | Version | Purpose |
|---------|---------|---------|
| **express** | 4.21.1 | Web framework |
| **typescript** | 5.6.3 | TypeScript compiler |
| **ts-node** | 10.9.2 | TypeScript execution |
| **nodemon** | 3.1.7 | Development hot reload |
| **dotenv** | 16.4.5 | Environment variables |

### Database & ORM

| Package | Version | Purpose |
|---------|---------|---------|
| **@prisma/client** | 5.22.0 | Database client |
| **prisma** | 5.22.0 | ORM and migrations |
| **postgresql** | 15 | Database system |

### Authentication & Security

| Package | Version | Purpose |
|---------|---------|---------|
| **jsonwebtoken** | 9.0.2 | JWT token generation |
| **bcrypt** | 5.1.1 | Password hashing |
| **helmet** | 8.0.0 | Security headers |
| **cors** | 2.8.5 | CORS handling |
| **express-rate-limit** | 7.4.1 | Rate limiting |
| **express-validator** | 7.2.0 | Input validation |
| **cookie-parser** | 1.4.6 | Cookie parsing |

### Real-time Communication

| Package | Version | Purpose |
|---------|---------|---------|
| **socket.io** | 4.8.1 | WebSocket server |

### Payment Integration

| Package | Version | Purpose |
|---------|---------|---------|
| **razorpay** | 2.9.4 | Payment gateway |
| **crypto** | Built-in | Signature verification |

### File Upload

| Package | Version | Purpose |
|---------|---------|---------|
| **multer** | 1.4.5-lts.1 | File upload handling |

### Logging

| Package | Version | Purpose |
|---------|---------|---------|
| **winston** | 3.17.0 | Logging framework |
| **winston-daily-rotate-file** | 5.0.0 | Log rotation |

### Development Tools

| Package | Version | Purpose |
|---------|---------|---------|
| **@types/node** | 22.9.3 | Node.js types |
| **@types/express** | 5.0.0 | Express types |
| **@types/bcrypt** | 5.0.2 | bcrypt types |
| **@types/jsonwebtoken** | 9.0.7 | JWT types |
| **@types/cors** | 2.8.17 | CORS types |
| **@types/multer** | 1.4.12 | Multer types |
| **@types/cookie-parser** | 1.4.7 | Cookie parser types |
| **eslint** | 9.15.0 | Code linting |
| **prettier** | 3.3.3 | Code formatting |

## Frontend Dependencies

### Core Framework

| Package | Version | Purpose |
|---------|---------|---------|
| **next** | 15.0.2 | React framework |
| **react** | 18.2.0 | UI library |
| **react-dom** | 18.2.0 | React DOM rendering |
| **typescript** | 5.x | TypeScript compiler |

### State Management

| Package | Version | Purpose |
|---------|---------|---------|
| **@reduxjs/toolkit** | 2.0.1 | Redux with utilities |
| **react-redux** | 9.1.0 | React Redux bindings |
| **redux-persist** | 6.0.0 | State persistence |

### UI Components & Styling

| Package | Version | Purpose |
|---------|---------|---------|
| **tailwindcss** | 4.0.0 | Utility-first CSS |
| **tailwindcss-animate** | 1.0.7 | Animation utilities |
| **tailwind-merge** | 2.2.0 | Merge Tailwind classes |
| **@tailwindcss/postcss** | 4.0.0-alpha.30 | PostCSS plugin |

### UI Component Library (shadcn/ui)

| Package | Version | Purpose |
|---------|---------|---------|
| **@radix-ui/react-avatar** | 1.0.4 | Avatar component |
| **@radix-ui/react-checkbox** | 1.3.3 | Checkbox component |
| **@radix-ui/react-dialog** | 1.0.5 | Dialog/Modal component |
| **@radix-ui/react-dropdown-menu** | 2.0.6 | Dropdown menu |
| **@radix-ui/react-label** | 2.1.8 | Label component |
| **@radix-ui/react-select** | 2.0.0 | Select component |
| **@radix-ui/react-separator** | 1.1.8 | Separator component |
| **@radix-ui/react-slot** | 1.2.3 | Slot component |
| **@radix-ui/react-switch** | 1.2.6 | Switch component |
| **@radix-ui/react-tabs** | 1.1.13 | Tabs component |
| **class-variance-authority** | 0.7.0 | Component variants |
| **clsx** | 2.1.0 | Class name utility |
| **lucide-react** | 0.312.0 | Icon library |

### Forms & Validation

| Package | Version | Purpose |
|---------|---------|---------|
| **react-hook-form** | 7.49.3 | Form management |
| **@hookform/resolvers** | 3.3.4 | Validation resolvers |
| **zod** | 3.22.4 | Schema validation |

### Authentication & Security

| Package | Version | Purpose |
|---------|---------|---------|
| **jose** | 5.2.0 | JWT verification |
| **jwt-decode** | 4.0.0 | JWT decoding |
| **js-cookie** | 3.0.5 | Cookie management |

### Real-time Communication

| Package | Version | Purpose |
|---------|---------|---------|
| **socket.io-client** | 4.6.1 | WebSocket client |

### Utilities

| Package | Version | Purpose |
|---------|---------|---------|
| **async-mutex** | 0.4.1 | Async mutex lock |
| **sonner** | 1.3.1 | Toast notifications |
| **next-themes** | 0.2.1 | Theme management |
| **date-fns** | - | Date utilities (optional) |

### Development Tools

| Package | Version | Purpose |
|---------|---------|---------|
| **@types/react** | 18.x | React types |
| **@types/node** | 20.x | Node.js types |
| **@types/js-cookie** | 3.x | Cookie types |
| **eslint** | 8.x | Code linting |
| **eslint-config-next** | 15.0.2 | Next.js ESLint config |
| **@eslint/eslintrc** | 3.2.0 | ESLint configuration |
| **postcss** | 8.x | CSS processing |

## Development Tools

### Code Quality

| Tool | Version | Purpose | Configuration |
|------|---------|---------|---------------|
| **ESLint** | 9.15.0 | JavaScript linting | `eslint.config.mjs` |
| **Prettier** | 3.3.3 | Code formatting | `.prettierrc` |
| **TypeScript** | 5.6.3 | Type checking | `tsconfig.json` |
| **Husky** | - | Git hooks (optional) | `.husky/` |

### Build Tools

| Tool | Version | Purpose |
|------|---------|---------|
| **Turborepo** | 2.0.0 | Monorepo build system |
| **Webpack** | Built into Next.js | Module bundling |
| **PostCSS** | 8.x | CSS processing |
| **SWC** | Built into Next.js | JavaScript compilation |

### Database Tools

| Tool | Purpose | Access |
|------|---------|--------|
| **Prisma Studio** | Database GUI | `npm run prisma:studio` |
| **pgAdmin** | PostgreSQL management | Optional install |
| **TablePlus** | Database client | Optional install |

### API Development

| Tool | Purpose | Usage |
|------|---------|-------|
| **Postman** | API testing | Import collection |
| **Insomnia** | API testing | Alternative to Postman |
| **Thunder Client** | VS Code extension | In-editor testing |
| **REST Client** | VS Code extension | `.http` files |

### Version Control

| Tool | Purpose |
|------|---------|
| **Git** | Version control |
| **GitHub** | Code repository |
| **GitLens** | VS Code extension |

## DevOps & Infrastructure

### Containerization

| Technology | Version | Purpose | Files |
|------------|---------|---------|-------|
| **Docker** | 20.10.0+ | Container runtime | `Dockerfile` |
| **Docker Compose** | 2.0.0+ | Multi-container | `docker-compose.yml` |
| **Alpine Linux** | 3.18 | Base image | - |

### Docker Images Used

| Image | Version | Service | Size |
|-------|---------|---------|------|
| **node** | 18-alpine | Backend/Frontend build | ~176MB |
| **postgres** | 15-alpine | Database | ~240MB |

### Cloud Services (Production)

| Service | Provider | Purpose |
|---------|----------|---------|
| **Compute** | AWS EC2 / GCP Compute | Application hosting |
| **Database** | AWS RDS / GCP Cloud SQL | Managed PostgreSQL |
| **Storage** | AWS S3 / GCP Storage | File storage |
| **CDN** | CloudFront / Cloudflare | Static assets |
| **DNS** | Route53 / Cloud DNS | Domain management |

### CI/CD Tools (Recommended)

| Tool | Purpose |
|------|---------|
| **GitHub Actions** | CI/CD pipeline |
| **Docker Hub** | Container registry |
| **Vercel** | Frontend deployment |
| **Railway** | Full-stack deployment |

### Monitoring & Logging (Recommended)

| Tool | Purpose |
|------|---------|
| **Sentry** | Error tracking |
| **LogRocket** | Session replay |
| **DataDog** | APM monitoring |
| **Grafana** | Metrics visualization |
| **Prometheus** | Metrics collection |

## Version Requirements

### Minimum Versions

| Requirement | Minimum Version | Recommended | Check Command |
|-------------|----------------|-------------|---------------|
| **Node.js** | 18.0.0 | 18.20.0+ | `node --version` |
| **npm** | 10.2.3 | 10.5.0+ | `npm --version` |
| **PostgreSQL** | 14.0 | 15.0+ | `psql --version` |
| **Docker** | 20.10.0 | 24.0.0+ | `docker --version` |
| **Git** | 2.0.0 | 2.40.0+ | `git --version` |

### Browser Support

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| **Chrome** | 90+ | Full support |
| **Firefox** | 88+ | Full support |
| **Safari** | 14+ | Full support |
| **Edge** | 90+ | Full support |
| **Mobile Safari** | iOS 14+ | Full support |
| **Chrome Mobile** | Android 10+ | Full support |

### Package Manager Versions

```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=10.2.3"
  },
  "packageManager": "npm@10.2.3"
}
```

## Dependency Management

### Update Commands

```bash
# Check outdated packages
npm outdated

# Update dependencies (minor/patch)
npm update

# Update specific package
npm install package@latest

# Update all to latest (major)
npx npm-check-updates -u
npm install

# Update Prisma
npm install prisma@latest @prisma/client@latest
npx prisma generate
```

### Security Audit

```bash
# Run security audit
npm audit

# Fix vulnerabilities
npm audit fix

# Force fix (use with caution)
npm audit fix --force

# Check specific package
npm ls package-name
```

### Lock File Management

```bash
# Regenerate lock file
rm package-lock.json
npm install

# Clean install from lock file
npm ci

# Update lock file only
npm install --package-lock-only
```

## License Information

### Open Source Licenses

Most dependencies use one of these licenses:
- **MIT**: Most npm packages
- **Apache 2.0**: Some enterprise tools
- **BSD**: PostgreSQL
- **ISC**: Some npm packages

### Commercial Licenses

- **Razorpay**: Commercial service (free tier available)
- **Vercel**: Commercial deployment (free tier available)

## Bundle Size Analysis

### Frontend Bundle Sizes

| Category | Size (gzipped) | Notes |
|----------|---------------|-------|
| **Base Next.js** | ~90KB | Framework core |
| **React + DOM** | ~45KB | React library |
| **Redux + RTK** | ~40KB | State management |
| **UI Components** | ~30KB | shadcn/ui components |
| **Utilities** | ~20KB | Various utilities |
| **Total** | ~225KB | Initial load |

### Optimization Strategies

1. **Code Splitting**: Automatic in Next.js
2. **Tree Shaking**: Enabled in production
3. **Dynamic Imports**: For large components
4. **Image Optimization**: Next.js Image component
5. **Font Optimization**: Next.js Font optimization

---

**Note**: Keep dependencies updated regularly for security patches and performance improvements. Always test thoroughly after major updates.