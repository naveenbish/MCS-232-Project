# 📘 CraveCart User Guide

A complete guide for customers using the CraveCart food delivery platform.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Account Management](#account-management)
3. [Browsing Menu](#browsing-menu)
4. [Shopping Cart](#shopping-cart)
5. [Checkout & Payment](#checkout--payment)
6. [Order Management](#order-management)
7. [Profile Settings](#profile-settings)
8. [Real-time Features](#real-time-features)
9. [FAQs](#faqs)
10. [Troubleshooting](#troubleshooting)

## 🚀 Getting Started

### Accessing CraveCart

1. Open your web browser
2. Navigate to CraveCart website
3. You'll be automatically redirected to the menu page
4. Browse without login or sign up to unlock all features

### System Requirements

- **Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile**: iOS 12+, Android 8+
- **Internet**: Stable connection for real-time updates

## 🔐 Account Management

### Creating a New Account

#### Step 1: Navigate to Registration
- Click **"Sign Up"** button in the header
- Or visit `/register` directly

#### Step 2: Fill Registration Form
```
Required Information:
- Full Name
- Email Address
- Password (min 8 characters)
```

#### Step 3: Validate Your Information
- Email must be unique and valid
- Password must meet security requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one number

#### Step 4: Complete Registration
- Click "Create Account"
- You'll be automatically logged in
- Redirected to menu page

### Logging In

#### Step 1: Go to Login Page
- Click **"Login"** button
- Or visit `/login` directly

#### Step 2: Enter Credentials
```
Required:
- Email address
- Password
```

#### Step 3: Submit
- Click "Sign In"
- Processing spinner will show
- Redirected to menu or previously requested page

### Password Recovery
> ⚠️ **Note**: Password recovery feature is planned for future release

## 🍕 Browsing Menu

### Menu Navigation

The menu page (`/menu`) is your central hub for browsing food items.

### Search Functionality

#### Using the Search Bar
1. Click on the search input at the top
2. Type food name or keywords
3. Results update in real-time
4. Clear search to see all items

**Search Tips:**
- Search by dish name (e.g., "Pizza", "Burger")
- Partial matches work (e.g., "Piz" for Pizza)
- Case-insensitive searching

### Filter Options

#### Category Filter
```
Available Categories:
- All Items (default)
- Starters
- Main Course
- Desserts
- Beverages
- [Custom categories]
```

**How to use:**
1. Click on category pills below search bar
2. Selected category highlights
3. Only items from that category display
4. Click "All" to reset

#### Vegetarian Filter
- Toggle the **"Veg Only"** switch
- Green dot = Vegetarian
- Red dot = Non-vegetarian
- Filter persists with other filters

### Food Item Details

Each food card displays:
- **Image**: Visual representation
- **Name**: Dish title
- **Description**: Brief details
- **Price**: In INR (₹)
- **Veg/Non-veg**: Color indicator
- **Add to Cart**: Quick add button
- **Quantity**: If already in cart

### Pagination

- 12 items per page
- Navigation buttons at bottom
- Page number indicator
- Smooth transitions

## 🛒 Shopping Cart

### Adding Items

#### Method 1: From Menu - Initial Add
1. Click **"Add"** button on food card
2. Button transforms into quantity controls with smooth animation
3. Toast notification confirms addition
4. Cart count updates in header

#### Method 2: Inline Quantity Controls (NEW)
Once an item is added, you'll see:
- **Minus (-)** button to decrease quantity
- **Current quantity** display with spring animation
- **Plus (+)** button to increase quantity
- **Subtotal price** when quantity > 1

**Features:**
- No need to navigate to cart
- Smooth animations on every interaction
- Scale effect when pressing buttons
- Real-time price calculation
- Remove item by reducing to 0

#### Method 3: From Cart Page
- Use animated **+/-** buttons in cart
- Quantity changes with spring animations
- Real-time total updates
- Visual feedback on every action

### Cart Page Features

Access cart via header icon or `/cart` route.

#### View Cart Contents
```
Information shown:
- Item image and name
- Individual price
- Quantity controls
- Subtotal per item
- Total amount
- Free delivery badge
```

#### Manage Items

**Update Quantity:**
1. Click animated **+** button to increase (scales on tap)
2. Click animated **-** button to decrease (scales on tap)
3. Quantity number animates with spring effect
4. Price updates with smooth transition
5. Reaching 0 removes item with slide animation

**Remove Item:**
- Click **X** button
- Item slides out with exit animation
- Toast notification confirms
- Cart layout adjusts smoothly

**Clear Cart:**
1. Click "Clear Cart" button
2. Animated confirmation dialog appears
3. Confirm to empty cart
4. All items animate out simultaneously

**Visual Features:**
- Stagger effect when loading items
- Smooth height animations
- Price counter animations
- Spring physics on interactions
- Exit animations for removed items

### Cart Persistence

- Cart saved in browser storage
- Survives page refresh
- Maintains across sessions
- Clears on logout

## 💳 Checkout & Payment

### Pre-checkout Requirements

✅ **Must have:**
- Active user account (login required)
- Items in cart
- Delivery address ready
- Payment method available

### Checkout Process

#### Step 1: Review Order
- All cart items listed
- Quantities and prices shown
- Total amount displayed
- Delivery fee (FREE)

#### Step 2: Delivery Information

**Required Fields:**
```
📍 Delivery Address
   - Full street address
   - Include landmarks if helpful

📞 Contact Number
   - 10-digit mobile number
   - For delivery coordination

📝 Delivery Instructions (Optional)
   - Special directions
   - Gate codes
   - Preferred delivery time
```

#### Step 3: Payment

**Payment Gateway**: Razorpay Integration

**Supported Methods:**
- Credit Cards
- Debit Cards
- UPI
- Net Banking
- Digital Wallets

**Payment Flow:**
1. Click "Proceed to Pay"
2. Razorpay popup opens
3. Select payment method
4. Enter payment details
5. Complete authentication
6. Wait for confirmation

#### Step 4: Order Confirmation
- Success message displayed
- Order ID generated
- Redirect to order details
- Confirmation email sent

### Payment Security

🔒 **Security Features:**
- SSL encrypted transactions
- PCI DSS compliant
- No card details stored
- Secure tokenization
- 3D Secure authentication

## 📦 Order Management

### Order History

Access via **Profile → My Orders** or `/orders` directly.

#### View All Orders
```
Information displayed:
- Order ID (8 characters)
- Order date and time
- Items count
- Total amount
- Current status
- Payment status
```

#### Filter Orders

**Status Filters:**
- All Orders
- Pending
- Confirmed
- Preparing
- Out for Delivery
- Delivered
- Cancelled

**How to filter:**
1. Click status tab
2. Filtered results display
3. Pagination if many orders
4. Click "All" to reset

### Order Details Page

Click any order to view full details.

#### Information Available
```
📋 Order Summary
   - Order ID
   - Placement time
   - Current status
   - Progress tracker

🍕 Items Ordered
   - Item names
   - Quantities
   - Individual prices
   - Item totals

📍 Delivery Details
   - Delivery address
   - Contact number
   - Special instructions
   - Estimated time

💳 Payment Information
   - Payment method
   - Transaction status
   - Total amount paid
   - Invoice details
```

### Order Tracking

#### Real-time Status Updates

**Status Flow:**
1. **Order Placed** ✅
2. **Confirmed** ✅
3. **Preparing** 👨‍🍳
4. **Out for Delivery** 🚚
5. **Delivered** 📦

**Visual Indicators:**
- Progress bar shows current stage
- Color coding for status
- Live updates via Socket.IO
- No refresh required

#### Notifications
- Toast notifications for status changes
- Sound alerts (if enabled)
- Browser notifications (with permission)

### Order Actions

#### Cancel Order
**When available:** Only for "Pending" status

**How to cancel:**
1. Open order details
2. Click "Cancel Order"
3. Confirm cancellation
4. Order marked as cancelled
5. Refund initiated (if paid)

#### Reorder
1. Click "Order Again" on any past order
2. Items added to current cart
3. Redirect to cart page
4. Modify as needed
5. Proceed to checkout

## 👤 Profile Settings

### Accessing Profile

- Click profile icon in header
- Or navigate to `/profile`
- Login required

### Profile Information

**Displayed Details:**
- User name
- Email address
- User ID
- Account type (User/Admin)
- Member since date

### Quick Actions

#### Available Options
```
📦 My Orders
   - View order history
   - Track active orders

🎨 Theme Toggle
   - Switch dark/light mode
   - Preference saved

🔐 Logout
   - Secure sign out
   - Cart cleared
   - Return to login
```

### Settings & Preferences

#### Theme Selection
- **Light Mode**: Default bright theme
- **Dark Mode**: Eye-friendly dark theme
- **System**: Follow device settings

#### Notification Preferences
> ⚠️ **Coming Soon**: Email and push notification settings

## 🔔 Real-time Features

### Live Order Updates

**What updates in real-time:**
- Order status changes
- Delivery location (future)
- Estimated time updates
- Payment confirmations

### Connection Status

**Indicators:**
- 🟢 **Connected**: Real-time active
- 🔴 **Disconnected**: Reconnecting
- Located in order pages header

### How It Works

1. **WebSocket Connection**
   - Established on order pages
   - Maintains persistent connection
   - Auto-reconnects if lost

2. **Instant Updates**
   - No page refresh needed
   - Changes appear immediately
   - Toast notifications alert you

## ❓ FAQs

### Account & Login

**Q: Can I browse without an account?**
A: Yes, you can browse the menu and add items to cart without logging in. Login is only required at checkout.

**Q: Is my password secure?**
A: Yes, passwords are encrypted and never stored in plain text. We use industry-standard security measures.

**Q: Can I change my email address?**
A: This feature is coming soon. Contact support for assistance.

### Ordering

**Q: What's the minimum order value?**
A: Currently, there's no minimum order value. Free delivery on all orders!

**Q: Can I schedule orders for later?**
A: Scheduled ordering is planned for a future update.

**Q: How do I apply promo codes?**
A: Promo code feature is coming soon!

### Payment

**Q: Which payment methods are accepted?**
A: We accept all major credit/debit cards, UPI, net banking, and digital wallets via Razorpay.

**Q: Is online payment mandatory?**
A: Currently yes. Cash on delivery is planned for future.

**Q: How secure are payments?**
A: All payments are processed through Razorpay with bank-level encryption.

### Delivery

**Q: What are delivery hours?**
A: Check restaurant operating hours. Typically 11 AM - 11 PM.

**Q: Is there a delivery fee?**
A: No! Free delivery on all orders.

**Q: Can I change delivery address after ordering?**
A: Contact support immediately after placing order.

## 🔧 Troubleshooting

### Common Issues & Solutions

#### Can't Login

**Problem**: Login button not working
```
Solutions:
1. Check internet connection
2. Verify email and password
3. Clear browser cache
4. Try different browser
5. Reset password (coming soon)
```

#### Cart Issues

**Problem**: Items not adding to cart
```
Solutions:
1. Refresh the page
2. Check if item is available
3. Clear browser cookies
4. Try logging out and in
```

#### Payment Failed

**Problem**: Transaction not completing
```
Solutions:
1. Check card/account balance
2. Verify payment details
3. Try different payment method
4. Contact bank if card blocked
5. Retry after sometime
```

#### Order Not Updating

**Problem**: Status stuck or not changing
```
Solutions:
1. Check connection indicator
2. Refresh the page once
3. Check order in history
4. Contact support if persistent
```

### Browser Compatibility

**Recommended Browsers:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Mobile Browsers:**
- Chrome Mobile
- Safari iOS
- Samsung Internet

### Contact Support

**For urgent issues:**
- 📧 Email: support@cravecart.com
- 📞 Phone: 1-800-CRAVECAR
- 💬 Live Chat: Coming soon

**Support Hours:**
- Monday - Friday: 9 AM - 9 PM
- Saturday - Sunday: 10 AM - 8 PM

## 📝 Tips for Best Experience

### Optimize Your Ordering

1. **Save Time**
   - Use search for quick finding
   - Filter by your preferences
   - Reorder previous favorites

2. **Track Efficiently**
   - Keep order page open
   - Enable notifications
   - Note order ID

3. **Smooth Checkout**
   - Keep address ready
   - Ensure payment method works
   - Add delivery instructions

### Mobile Usage

- **Add to Home Screen**: For app-like experience
- **Enable Notifications**: For order updates
- **Use Portrait Mode**: Best layout experience
- **Update Browser**: For latest features

---

*Need more help? Contact our support team!*