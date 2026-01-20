# CraveCart Architecture Overview

## System Architecture

CraveCart is a modern food delivery platform built with a microservices-inspired monorepo architecture, emphasizing scalability, maintainability, and developer experience.

## High-Level Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                         Internet                              │
└──────────────────┬───────────────────────────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │   Load Balancer       │
        │   (nginx/CloudFlare)  │
        └──────────┬───────────┘
                   │
      ┌────────────┴────────────┐
      │                          │
      ▼                          ▼
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API    │
│   (Next.js)     │───▶│   (Express.js)   │
│   Port: 3000    │    │   Port: 5000     │
└─────────────────┘    └──────┬──────────┘
                              │
                    ┌─────────┴──────────┐
                    │                     │
                    ▼                     ▼
            ┌──────────────┐     ┌──────────────┐
            │  PostgreSQL  │     │   Socket.IO   │
            │  Database    │     │   Real-time   │
            │  Port: 5432  │     │   Events      │
            └──────────────┘     └──────────────┘
                    │
                    ▼
            ┌──────────────┐
            │   Prisma ORM │
            │   Migration  │
            └──────────────┘
```

## Architecture Principles

### 1. Separation of Concerns
- **Frontend**: Handles UI/UX, client-side logic
- **Backend**: Business logic, data processing, API
- **Database**: Data persistence, relationships
- **Real-time**: WebSocket connections for live updates

### 2. Monorepo Benefits
- Shared dependencies and configurations
- Atomic commits across services
- Simplified CI/CD pipeline
- Consistent tooling and standards

### 3. API-First Design
- RESTful API with clear contracts
- Frontend agnostic backend
- Versioned API endpoints
- Comprehensive documentation

### 4. Security Layers
- JWT authentication with refresh tokens
- Role-based access control (RBAC)
- Input validation at multiple levels
- Rate limiting and CORS protection

## Component Architecture

### Frontend (Next.js 15)

```
┌─────────────────────────────────────────┐
│           Next.js Application           │
├─────────────────────────────────────────┤
│          App Router (Pages)             │
├─────────────────────────────────────────┤
│     Redux Toolkit (State Management)    │
├─────────────────────────────────────────┤
│       RTK Query (Data Fetching)         │
├─────────────────────────────────────────┤
│     React Components (shadcn/ui)        │
├─────────────────────────────────────────┤
│       Middleware (Auth, Routes)         │
└─────────────────────────────────────────┘
```

**Key Features**:
- Server-side rendering for SEO
- Client-side routing for SPA experience
- Optimistic UI updates
- Progressive enhancement

### Backend (Express.js)

```
┌─────────────────────────────────────────┐
│         Express Application             │
├─────────────────────────────────────────┤
│           Middleware Stack              │
│  (Auth, Validation, CORS, Rate Limit)   │
├─────────────────────────────────────────┤
│            Route Handlers               │
├─────────────────────────────────────────┤
│            Controllers                  │
│         (Request/Response)              │
├─────────────────────────────────────────┤
│           Service Layer                 │
│         (Business Logic)                │
├─────────────────────────────────────────┤
│          Data Access Layer              │
│           (Prisma ORM)                  │
└─────────────────────────────────────────┘
```

**Design Pattern**: MVC with Service Layer
- **Models**: Prisma schema definitions
- **Views**: JSON responses
- **Controllers**: HTTP request handlers
- **Services**: Business logic isolation

### Database (PostgreSQL)

```
┌─────────────────────────────────────────┐
│          PostgreSQL Database            │
├─────────────────────────────────────────┤
│   Tables: users, orders, food_items,    │
│   categories, payments, reviews, etc.   │
├─────────────────────────────────────────┤
│     Relationships & Constraints         │
├─────────────────────────────────────────┤
│         Indexes & Optimizations         │
└─────────────────────────────────────────┘
```

**Key Design Decisions**:
- Normalized schema for data integrity
- Foreign key constraints for referential integrity
- Composite indexes for query optimization
- JSONB fields for flexible data (future)

## Data Flow

### 1. User Request Flow

```
User → Browser → Next.js → API Call → Express →
Service → Prisma → PostgreSQL → Response
```

### 2. Real-time Update Flow

```
Event Trigger → Socket.IO Server → Broadcast →
Connected Clients → UI Update
```

### 3. Authentication Flow

```
Login → Validate → Generate Tokens → Store in Cookies →
Request with Token → Verify → Authorized Access
```

## Deployment Architecture

### Docker Containerization

```yaml
Services:
  - PostgreSQL Container (postgres:15-alpine)
  - Backend Container (Node.js Alpine)
  - Frontend Container (Node.js Alpine)
```

### Production Deployment

```
┌────────────────────────────────────┐
│         Cloud Provider             │
│        (AWS/GCP/Azure)             │
├────────────────────────────────────┤
│      Container Orchestration       │
│     (Kubernetes/Docker Swarm)      │
├────────────────────────────────────┤
│         Load Balancer              │
├────────────────────────────────────┤
│    Auto-scaling Groups             │
│   ┌──────────┬──────────┐         │
│   │Frontend  │Backend   │         │
│   │Instances │Instances │         │
│   └──────────┴──────────┘         │
├────────────────────────────────────┤
│      Managed PostgreSQL            │
│         (RDS/Cloud SQL)            │
├────────────────────────────────────┤
│         Redis Cache                │
│      (Session/Cache)               │
└────────────────────────────────────┘
```

## Scalability Considerations

### Horizontal Scaling
- Stateless backend services
- Database read replicas
- CDN for static assets
- Load balancing across instances

### Vertical Scaling
- Database optimization
- Query performance tuning
- Caching strategies
- Connection pooling

### Caching Strategy

```
┌─────────────┐
│   Browser   │ → localStorage (Cart)
│   Cache     │ → Service Worker (PWA)
└─────────────┘
       ↓
┌─────────────┐
│   CDN       │ → Static Assets
│   Cache     │ → Images, CSS, JS
└─────────────┘
       ↓
┌─────────────┐
│Application  │ → Redux Store
│   Cache     │ → RTK Query Cache
└─────────────┘
       ↓
┌─────────────┐
│   Redis     │ → Session Data
│   Cache     │ → Frequent Queries
└─────────────┘
       ↓
┌─────────────┐
│  Database   │ → Indexed Queries
│   Cache     │ → Query Plans
└─────────────┘
```

## Security Architecture

### Defense in Depth

1. **Network Layer**
   - HTTPS/TLS encryption
   - Firewall rules
   - DDoS protection

2. **Application Layer**
   - Input validation
   - SQL injection prevention
   - XSS protection
   - CSRF tokens

3. **Authentication Layer**
   - JWT with short expiry
   - Refresh token rotation
   - Session management
   - Password policies

4. **Authorization Layer**
   - Role-based access control
   - Resource-level permissions
   - API rate limiting

5. **Data Layer**
   - Encryption at rest
   - Encryption in transit
   - Backup encryption
   - PII data masking

## Monitoring & Observability

### Logging Strategy

```
Application Logs → Winston → Log Files
                            ↓
                    Log Aggregation
                    (ELK Stack/CloudWatch)
                            ↓
                    Alerts & Dashboards
```

### Metrics Collection

- **Application Metrics**: Response times, error rates
- **Business Metrics**: Orders, revenue, user activity
- **Infrastructure Metrics**: CPU, memory, disk usage
- **Real-time Metrics**: Active connections, message throughput

## Development Workflow

### CI/CD Pipeline

```
Code Push → GitHub → CI Pipeline → Tests →
Build → Docker Images → Deploy → Production
```

### Environment Strategy

1. **Development**: Local Docker setup
2. **Staging**: Production-like environment
3. **Production**: Live customer environment

## Technology Decisions

### Why Next.js?
- SEO-friendly SSR
- Excellent developer experience
- Built-in optimizations
- Strong TypeScript support

### Why Express.js?
- Mature ecosystem
- Flexible middleware
- Wide community support
- Easy to understand

### Why PostgreSQL?
- ACID compliance
- Complex queries support
- JSON support for flexibility
- Excellent performance

### Why Prisma?
- Type-safe database access
- Auto-generated types
- Migration management
- Great developer experience

### Why Docker?
- Consistent environments
- Easy deployment
- Isolated services
- Scalability

## Future Architecture Considerations

### Potential Enhancements

1. **Microservices Migration**
   - Separate order service
   - Payment service
   - Notification service

2. **Event-Driven Architecture**
   - Message queue (RabbitMQ/Kafka)
   - Event sourcing
   - CQRS pattern

3. **Performance Optimizations**
   - GraphQL for flexible queries
   - gRPC for service communication
   - Edge computing for global reach

4. **Advanced Features**
   - Machine learning for recommendations
   - Real-time analytics
   - Multi-tenant architecture

## Architecture Decision Records (ADRs)

### ADR-001: Monorepo Structure
**Decision**: Use Turborepo for monorepo management
**Rationale**: Simplified dependency management, atomic commits
**Consequences**: Single point of failure, larger repository

### ADR-002: Authentication Strategy
**Decision**: JWT with cookie storage
**Rationale**: Stateless, scalable, secure
**Consequences**: Token management complexity

### ADR-003: Real-time Updates
**Decision**: Socket.IO for WebSocket communication
**Rationale**: Wide browser support, fallback options
**Consequences**: Additional server resources

### ADR-004: Payment Gateway
**Decision**: Razorpay integration
**Rationale**: Indian market focus, good documentation
**Consequences**: Vendor lock-in

## Performance Benchmarks

### Target Metrics
- Page load time: < 2 seconds
- API response time: < 200ms (p95)
- Database query time: < 50ms (p95)
- WebSocket latency: < 100ms

### Capacity Planning
- Concurrent users: 10,000+
- Orders per minute: 100+
- Database connections: 100
- WebSocket connections: 5,000

---

This architecture provides a solid foundation for a scalable food delivery platform while maintaining simplicity and developer productivity. The modular design allows for future enhancements and scaling strategies as the platform grows.