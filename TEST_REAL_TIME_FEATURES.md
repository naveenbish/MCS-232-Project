# Testing Real-Time Order Tracking Features

## Setup Instructions

### 1. Start the Application
```bash
# Make sure both backend and frontend are running
npm run dev
```

### 2. Open Two Browser Windows

**Window 1 - Admin View:**
- Go to: http://localhost:3000/admin/login
- Login with admin credentials:
  - Email: admin@cravecart.com
  - Password: Admin@123456
- Navigate to: http://localhost:3000/admin/orders

**Window 2 - User View:**
- Go to: http://localhost:3000/login
- Login with user credentials (either one):
  - Email: john.doe@example.com
  - Password: User@123456
  OR
  - Email: jane.smith@example.com
  - Password: User@123456
- Go to: http://localhost:3000/orders (to see your orders)

## What You'll See

### On Admin Orders Page (http://localhost:3000/admin/orders)

Look for these NEW visual elements:

1. **Connection Status Indicator** (Top of page, next to "Manage Orders")
   - 🟢 Green dot + "Connected" = Socket.IO is connected
   - 🔴 Red dot + "Disconnected" = No connection

2. **Unread Badge** (Appears when there are new updates)
   - Blue badge showing count like "2 new updates"
   - Click to clear the count

### Testing Scenarios

## Test 1: Order Status Update
1. **User**: Open an existing order detail page (click on any order from /orders)
2. **Admin**: Find the same order in admin panel
3. **Admin**: Change the order status dropdown (e.g., from PENDING to CONFIRMED)
4. **User**: You'll instantly see:
   - Toast notification: "Order Update: Order status updated to CONFIRMED"
   - Order status badge updates without refresh
   - Progress bar updates automatically

## Test 2: New Order Notification (Admin)
1. **User**: Go to menu page (/menu)
2. **User**: Add items to cart and checkout
3. **User**: Complete the order
4. **Admin**: You'll instantly see:
   - Toast notification: "New order received! Order #ABC12345 from John Doe"
   - Blue badge appears/increments: "1 new update"
   - Orders list refreshes automatically

## Test 3: Payment Updates
1. **User**: Start a new order
2. **User**: Proceed to payment
3. **User**: Complete payment (use Razorpay test mode)
4. **Both User & Admin** will see:
   - Toast: "Payment successful"
   - Toast: "Order confirmed, preparing your food"
   - Order status changes to CONFIRMED

## Test 4: Connection Recovery
1. **Admin**: Keep the orders page open
2. **Backend**: Stop the backend server (Ctrl+C in terminal)
3. **Admin**: Connection indicator turns red "Disconnected"
4. **Backend**: Restart the server (npm run dev)
5. **Admin**: Connection automatically recovers (turns green "Connected")

## Test 5: Order Cancellation
1. **User**: Open an order in PENDING status
2. **User**: Click "Cancel Order"
3. **Admin**: Will see:
   - Toast: "Order Update: Order has been cancelled"
   - Badge counter increases
   - Order status in list updates to CANCELLED

## Visual Indicators

### Toast Notifications
- Appear in bottom-right corner
- Auto-dismiss after a few seconds
- Different types:
  - ℹ️ Blue for status updates
  - ✅ Green for successful payments
  - 🎉 Green for new orders (admin)

### Real-Time Updates Without Refresh
- Order status badges update instantly
- Order lists refresh automatically
- Payment status changes immediately
- No page refresh needed!

## Debugging Tips

### Check Socket Connection
1. Open Browser DevTools (F12)
2. Go to Console tab
3. You should see:
   - "Socket connected" when connection establishes
   - "Socket disconnected" if connection drops

### Monitor Network Activity
1. DevTools → Network tab
2. Filter by "WS" (WebSocket)
3. Click on "socket.io" connection
4. Go to "Messages" tab
5. You'll see real-time events like:
   - `order:status-update`
   - `order:new`
   - `payment:update`

## Common Issues

### Not Seeing Updates?
1. Check both servers are running (port 3000 for frontend, 5000 for backend)
2. Verify Socket URL in frontend: Should connect to `http://localhost:5000`
3. Check browser console for errors
4. Ensure you're logged in (socket needs auth token)

### Badge Not Appearing?
- Badge only shows when `unreadCount > 0`
- Click the badge to reset count to 0
- Perform an action that triggers an update (change order status)

### Connection Shows Disconnected?
1. Backend might not be running
2. Check if port 5000 is accessible
3. Look for CORS errors in console
4. Verify JWT token is valid (try logging out and back in)

## Summary of New Features

✅ **What's Working Now:**
- Real-time order status updates
- New order notifications for admin
- Payment status updates
- Connection status indicator
- Unread notifications badge
- Toast notifications
- Automatic UI refresh
- Socket reconnection on network issues
- Room-based updates (users only see their order updates)

🎯 **Key Files to Check:**
- Backend: `orderService.ts`, `paymentService.ts` (socket emissions)
- Frontend: `SocketContext.tsx` (main logic)
- Admin: `/admin/orders/page.tsx` (connection status + badge)
- User: `/orders/[id]/page.tsx` (order room joining)