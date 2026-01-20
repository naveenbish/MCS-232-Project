# 🚀 CraveCart - Quick Reference Guide

## 📁 Project Structure

```
MCS-232-Project/
├── backend/           ✅ 100% Complete - Production Ready
│   ├── src/
│   │   ├── config/         # Database, logger, Socket.IO, Razorpay
│   │   ├── controllers/    # Request handlers (6 files)
│   │   ├── middleware/     # Auth, validation, rate limiting
│   │   ├── routes/         # API routes (6 files)
│   │   ├── services/       # Business logic (6 files)
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Helpers
│   │   └── index.ts        # Main app
│   ├── prisma/
│   │   ├── schema.prisma   # 8 database tables
│   │   └── seed.ts         # Sample data
│   ├── .env               # Configuration
│   ├── docker-compose.yml # PostgreSQL
│   ├── README.md          # Full docs
│   └── QUICKSTART.md      # 5-min setup
│
└── frontend/         ✅ 70% Complete - Core Architecture Ready
    ├── src/
    │   ├── features/          # Redux slices (✅ auth, cart, userDetails)
    │   ├── services/          # RTK Query APIs (✅ auth, ⏳ food, order, etc.)
    │   ├── hooks/             # ✅ baseQuery, reauth, typed hooks
    │   ├── lib/               # ✅ utils.ts
    │   ├── types/             # ✅ Complete TypeScript types
    │   ├── components/        # ⏳ UI components to create
    │   ├── app/               # ⏳ Pages to create
    │   ├── store.ts           # ✅ Redux store
    │   └── middleware.ts      # ⏳ To create (code provided)
    ├── .env.local            # ✅ Configuration
    ├── package.json          # ✅ All dependencies installed
    └── FRONTEND_IMPLEMENTATION_GUIDE.md  # ✅ Complete templates
```

---

## ⚡ Quick Commands

### Start Backend:
```bash
cd backend
docker-compose up -d           # Start PostgreSQL
npm run prisma:migrate         # Create tables
npm run prisma:seed            # Add sample data
npm run dev                    # Start API (port 5000)
```

### Start Frontend:
```bash
cd frontend
npm run dev                    # Start Next.js (port 3000)
```

### Database Management:
```bash
cd backend
npm run prisma:studio          # Visual database editor
npm run prisma:generate        # Regenerate Prisma client
npx prisma migrate reset       # Reset database
```

---

## 🔐 Default Credentials

**Admin:**
```
Email: admin@cravecart.com
Password: Admin@123456
```

**Sample Users:**
```
Email: john.doe@example.com
Password: User@123456

Email: jane.smith@example.com
Password: User@123456
```

---

## 🔌 API Endpoints Reference

**Base URL:** `http://localhost:5000/api/v1`

### Auth Endpoints:
```bash
POST   /auth/register          # Register user
POST   /auth/login             # User login
POST   /auth/admin/login       # Admin login
GET    /auth/me                # Get current user (protected)
PUT    /auth/profile           # Update profile (protected)
```

### Food Endpoints:
```bash
GET    /food/categories        # Get all categories
GET    /food/items             # Get food items (with filters)
GET    /food/items/:id         # Get single food item
```

### Order Endpoints (Protected):
```bash
POST   /orders                 # Create order
GET    /orders                 # Get user's orders
GET    /orders/:id             # Get order details
POST   /orders/:id/cancel      # Cancel order
```

### Payment Endpoints (Protected):
```bash
POST   /payments/create        # Create Razorpay order
POST   /payments/verify        # Verify payment
GET    /payments/:orderId      # Get payment details
```

### Admin Endpoints (Admin Only):
```bash
# Categories
POST   /admin/categories
PUT    /admin/categories/:id
DELETE /admin/categories/:id

# Food Items
POST   /admin/food-items
PUT    /admin/food-items/:id
DELETE /admin/food-items/:id

# Orders
GET    /admin/orders
PUT    /admin/orders/:id/status

# Reports
GET    /admin/reports/sales
GET    /admin/reports/users
GET    /admin/reports/orders
GET    /admin/reports/payments
GET    /admin/dashboard/stats
```

---

## 📝 Common Code Patterns

### RTK Query Hook Usage:
```typescript
// In a component
import { useGetFoodItemsQuery } from '@/services/food'

function MenuPage() {
  const { data, isLoading, error } = useGetFoodItemsQuery({
    page: 1,
    limit: 20,
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error!</div>

  return <div>{data.data.map(...)}</div>
}
```

### Redux Actions:
```typescript
import { useAppDispatch } from '@/hooks'
import { addToCart } from '@/features/cart/cartSlice'

function FoodCard({ item }) {
  const dispatch = useAppDispatch()

  const handleAddToCart = () => {
    dispatch(addToCart({ foodItem: item, quantity: 1 }))
  }

  return <button onClick={handleAddToCart}>Add to Cart</button>
}
```

### Protected API Calls:
```typescript
// Automatically includes Bearer token
const { data } = useGetUserOrdersQuery()
```

### Auth Check:
```typescript
import { useAppSelector } from '@/hooks'

function Header() {
  const user = useAppSelector((state) => state.userDetails)

  if (!user.id) {
    return <Link href="/login">Login</Link>
  }

  return <div>Welcome, {user.email}</div>
}
```

---

## 🎨 Tailwind Utility Classes

### Common Patterns:
```tsx
// Container
<div className="container mx-auto px-4 py-8">

// Card
<div className="border rounded-lg p-4 hover:shadow-lg transition">

// Button Primary
<button className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">

// Grid Layout
<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">

// Flex Center
<div className="flex items-center justify-center min-h-screen">

// Status Badge
<span className={getOrderStatusColor(status) + " px-2 py-1 rounded text-sm"}>
```

---

## 🔧 Debugging Tips

### Check Redux State:
```bash
# Install Redux DevTools Chrome extension
# View state in browser DevTools → Redux tab
```

### Check API Calls:
```bash
# Browser DevTools → Network tab
# Filter: XHR/Fetch
# Look for Authorization header
```

### Check Cookies:
```bash
# Browser DevTools → Application → Cookies
# Look for: access_token, refresh_token
```

### Backend Logs:
```bash
cd backend
tail -f logs/application-*.log
tail -f logs/error-*.log
```

---

## 🐛 Common Issues & Solutions

### Issue: 401 Unauthorized
```bash
Solution: Token expired or missing
1. Check cookies in DevTools
2. Try logout and login again
3. Check middleware.ts is created
```

### Issue: CORS Error
```bash
Solution: Backend not running or wrong URL
1. Check backend is running on port 5000
2. Check .env.local has correct API_URL
3. Check backend .env has frontend URL in ALLOWED_ORIGINS
```

### Issue: Database Connection Error
```bash
Solution:
cd backend
docker-compose restart
npm run prisma:generate
```

### Issue: Module Not Found
```bash
Solution:
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 📦 Add New RTK Query Service

**Template:**
```typescript
// src/services/example.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@/hooks/baseQuery';

export const exampleApi = createApi({
  reducerPath: 'exampleApi',
  baseQuery,
  tagTypes: ['Example'],
  endpoints: (build) => ({
    getExamples: build.query<any, void>({
      query: () => '/endpoint',
      providesTags: ['Example'],
    }),
    createExample: build.mutation<any, any>({
      query: (data) => ({
        url: '/endpoint',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Example'],
    }),
  }),
});

export const { useGetExamplesQuery, useCreateExampleMutation } = exampleApi;
```

**Add to store.ts:**
```typescript
import { exampleApi } from '@/services/example';

// In reducers:
[exampleApi.reducerPath]: exampleApi.reducer,

// In middleware:
.concat(exampleApi.middleware)
```

---

## 🎯 Testing Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Database accessible
- [ ] Can register new user
- [ ] Can login as user
- [ ] Can login as admin
- [ ] Can browse food items
- [ ] Can filter by category
- [ ] Can add to cart
- [ ] Cart persists on page refresh
- [ ] Can create order
- [ ] Protected routes redirect to login
- [ ] Token auto-refreshes on API calls
- [ ] Admin can manage food items
- [ ] Real-time order updates work

---

## 📖 Key Files Reference

| File | Purpose |
|------|---------|
| `backend/src/index.ts` | Express server entry |
| `backend/prisma/schema.prisma` | Database schema |
| `frontend/src/store.ts` | Redux store |
| `frontend/src/hooks/baseQueryWithReauth.ts` | Auto token refresh |
| `frontend/src/middleware.ts` | Route protection |
| `frontend/.env.local` | Frontend config |
| `backend/.env` | Backend config |

---

## 🚀 Deployment Checklist

### Backend:
- [ ] Set NODE_ENV=production
- [ ] Update JWT_SECRET
- [ ] Configure production database
- [ ] Set up Razorpay production keys
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain

### Frontend:
- [ ] Update NEXT_PUBLIC_API_URL
- [ ] Set JWT_SECRET (same as backend)
- [ ] Configure Razorpay production key
- [ ] Build: `npm run build`
- [ ] Deploy to Vercel/Netlify

---

## 💡 Pro Tips

1. **Use the browser DevTools!** Network tab shows all API calls
2. **Redux DevTools** shows state changes in real-time
3. **Prisma Studio** is great for viewing/editing database
4. **Follow the templates** in FRONTEND_IMPLEMENTATION_GUIDE.md
5. **Test auth first** - Everything else depends on it
6. **One feature at a time** - Don't build everything at once

---

**Need Help?** Check:
- PROJECT_SUMMARY.md - Overall project status
- FRONTEND_IMPLEMENTATION_GUIDE.md - Complete code templates
- backend/README.md - Backend API docs
- backend/QUICKSTART.md - Backend setup

**Happy Coding! 🎉**
