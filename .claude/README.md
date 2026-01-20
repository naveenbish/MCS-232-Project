# CraveCart - Complete Project Documentation

Welcome to the comprehensive documentation for **CraveCart**, a production-ready food ordering and delivery platform built with modern technologies in a Turborepo monorepo structure.

## ⚠️ Important Development Rules

### Application Execution
- **DO NOT run the application autonomously** - The user will handle all application execution
- Never use `npm run dev`, `npm start`, or similar commands without explicit user request
- Focus on code implementation and explanation rather than execution

## Project Overview

CraveCart is a full-stack food delivery application that enables customers to browse menus, place orders, make payments, and track deliveries in real-time, while providing administrators with comprehensive management tools and analytics.

### Key Technologies

- **Backend**: Node.js, Express.js, TypeScript, PostgreSQL, Prisma ORM
- **Frontend**: Next.js 15, React 18, Redux Toolkit, Tailwind CSS
- **Real-time**: Socket.IO for live order tracking
- **Payments**: Razorpay integration
- **Deployment**: Docker, Docker Compose
- **Architecture**: Monorepo with Turborepo

## Quick Navigation

### 📚 Documentation Sections

#### Architecture Documentation
- [System Overview](docs/architecture/overview.md) - High-level architecture and design decisions
- [Backend Architecture](docs/architecture/backend-architecture.md) - Express.js application structure
- [Frontend Architecture](docs/architecture/frontend-architecture.md) - Next.js and Redux implementation
- [Database Design](docs/architecture/database-design.md) - PostgreSQL schema and relationships
- [Deployment Strategy](docs/architecture/deployment.md) - Docker and production setup

#### API Documentation
- [API Endpoints](docs/api/endpoints.md) - Complete reference for all 30+ endpoints
- [Authentication](docs/api/authentication.md) - JWT implementation and security
- [WebSocket Events](docs/api/websocket.md) - Real-time communication
- [Payment Integration](docs/api/payment-integration.md) - Razorpay payment flow

#### Development Guides
- [Getting Started](docs/guides/getting-started.md) - Quick setup and first run
- [Development Setup](docs/guides/development-setup.md) - IDE and tools configuration
- [Testing Guide](docs/guides/testing.md) - Testing strategies and setup
- [Debugging Guide](docs/guides/debugging.md) - Common debugging scenarios
- [Troubleshooting](docs/guides/troubleshooting.md) - Solutions to common issues

#### Feature Documentation
- [Customer Features](docs/features/customer-features.md) - User-facing functionality
- [Admin Features](docs/features/admin-features.md) - Administrative capabilities
- [Order Management](docs/features/order-management.md) - Order lifecycle and processing
- [Real-time Tracking](docs/features/real-time-tracking.md) - Live order updates

#### Reference Documentation
- [Technology Stack](docs/reference/tech-stack.md) - Complete list of dependencies
- [File Structure](docs/reference/file-structure.md) - Project organization
- [Environment Variables](docs/reference/environment-variables.md) - Configuration reference
- [Database Schema](docs/reference/database-schema.md) - Tables and relationships
- [Commands Reference](docs/reference/commands.md) - NPM scripts and utilities

## Quick Start

### Prerequisites
- Node.js 18+ and npm 10+
- Docker and Docker Compose
- Git

### Installation

```bash
# 1. Clone the repository
git clone [repository-url]
cd MCS-232-Project

# 2. Install dependencies
npm install

# 3. Start PostgreSQL with Docker
cd apps/backend
docker-compose up -d

# 4. Setup database
npm run prisma:migrate
npm run prisma:seed

# 5. Start development servers
cd ../..
npm run dev
```

### Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api/v1
- **Prisma Studio**: http://localhost:5555 (run `npm run prisma:studio`)

### Test Credentials

**Admin Account:**
- Email: `admin@cravecart.com`
- Password: `Admin@123456`

**Customer Account:**
- Email: `john.doe@example.com`
- Password: `User@123456`

## Key Features

### For Customers
- ✅ User registration and authentication
- ✅ Browse menu with category and dietary filters
- ✅ Shopping cart with persistence
- ✅ Secure checkout with delivery address
- ✅ Razorpay payment integration
- ✅ Real-time order status tracking
- ✅ Order history and details
- ✅ Review and rating system

### For Administrators
- ✅ Separate admin authentication
- ✅ Dashboard with analytics
- ✅ Category management (CRUD)
- ✅ Menu item management with images
- ✅ Order management and status updates
- ✅ Sales and revenue reports
- ✅ User analytics
- ✅ Payment tracking

### Technical Features
- ✅ JWT authentication with refresh tokens
- ✅ Cookie-based secure token storage
- ✅ Real-time updates via WebSocket
- ✅ Responsive design
- ✅ Dark mode support
- ✅ Type-safe with TypeScript
- ✅ Optimized Docker builds
- ✅ Database migrations and seeding
- ✅ Comprehensive error handling
- ✅ Request validation
- ✅ Rate limiting
- ✅ Security headers

## Project Statistics

- **Total Lines of Code**: ~10,000+
- **Backend Endpoints**: 30+
- **Database Tables**: 8
- **React Components**: 26+
- **Redux Services**: 8
- **Docker Services**: 3
- **Documentation Files**: 20+

## Technology Stack

### Backend
- Node.js 18+, Express.js 4.21.1, TypeScript 5.6.3
- PostgreSQL 15, Prisma 5.22.0
- JWT, bcrypt, Socket.IO 4.8.1
- Razorpay 2.9.4, Winston Logger

### Frontend
- Next.js 15.0.2, React 18.2.0, TypeScript 5+
- Redux Toolkit 2.0.1, RTK Query
- Tailwind CSS v4, shadcn/ui components
- Socket.IO Client, React Hook Form, Zod

### DevOps
- Docker & Docker Compose
- Turborepo for monorepo management
- Multi-stage Docker builds
- Environment-based configuration

## Project Structure

```
MCS-232-Project/
├── apps/
│   ├── backend/        # Express.js API server
│   └── frontend/       # Next.js web application
├── .claude/           # Project documentation
├── Media/             # Static assets and images
├── docker-compose.yml # Production deployment
├── turbo.json        # Turborepo configuration
└── package.json      # Root workspace configuration
```

## Development Workflow

### Common Commands

```bash
# Development
npm run dev              # Start all services in dev mode
npm run build           # Build all applications
npm run lint            # Run linting

# Database
npm run prisma:migrate  # Run migrations
npm run prisma:seed     # Seed database
npm run prisma:studio   # Open database GUI

# Docker
npm run docker:up       # Start containers
npm run docker:down     # Stop containers
npm run docker:logs     # View logs
```

## Support and Resources

### Documentation
All documentation is maintained in the `.claude/docs/` directory. Each document includes:
- Detailed explanations
- Code examples from the project
- Best practices
- Common patterns
- Troubleshooting tips

### Getting Help
1. Check the [Troubleshooting Guide](docs/guides/troubleshooting.md)
2. Review the [FAQ section](docs/guides/getting-started.md#faq)
3. Look through existing GitHub issues
4. Consult the API documentation

### Contributing
Please refer to the development guides and ensure you:
- Follow the established code patterns
- Add appropriate TypeScript types
- Update documentation for new features
- Test your changes thoroughly
- Follow the commit message conventions

## Academic Context

This project was developed as part of the MCS-232 course, demonstrating:
- Modern web development practices
- Microservices architecture
- Database design and optimization
- Security best practices
- Real-time communication
- Payment gateway integration
- Containerization and deployment

## License and Credits

This project is part of an academic submission for MCS-232.

---

**Last Updated**: November 2024
**Documentation Version**: 1.0.0
**Project Status**: Production-ready with ongoing enhancements