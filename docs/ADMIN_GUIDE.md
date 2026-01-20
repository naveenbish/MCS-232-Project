# 🔧 CraveCart Admin Guide

Complete administration and management guide for CraveCart platform administrators.

## Table of Contents

1. [Admin Overview](#admin-overview)
2. [Getting Started](#getting-started)
3. [Dashboard](#dashboard)
4. [Order Management](#order-management)
5. [Food Items Management](#food-items-management)
6. [Category Management](#category-management)
7. [Reports & Analytics](#reports--analytics)
8. [User Management](#user-management)
9. [Real-time Monitoring](#real-time-monitoring)
10. [System Settings](#system-settings)
11. [Best Practices](#best-practices)
12. [Troubleshooting](#troubleshooting)

## 👨‍💼 Admin Overview

### Admin Role & Responsibilities

As a CraveCart administrator, you have complete control over:
- Order processing and status updates
- Menu management (items and categories)
- User oversight
- Analytics and reporting
- System configuration

### Admin Access Levels

```
Super Admin (Full Access)
├── Dashboard Analytics
├── Order Management
├── Menu Management
├── User Management
├── Reports
└── System Settings
```

## 🚀 Getting Started

### Admin Login

#### Step 1: Access Admin Login
- Navigate to `/login`
- Use admin credentials

#### Step 2: Admin Credentials
```
Default Admin Account:
Email: admin@cravecart.com
Password: Admin@123456

⚠️ IMPORTANT: Change default password after first login
```

#### Step 3: Automatic Redirect
- Admin users automatically redirect to `/admin` dashboard
- Regular login page handles both user and admin authentication

### First Time Setup

1. **Change Default Password** (Feature coming soon)
2. **Configure Business Settings**
3. **Set Operating Hours**
4. **Add Food Categories**
5. **Add Food Items**
6. **Test Order Flow**

## 📊 Dashboard

### Dashboard Overview (`/admin`)

The admin dashboard provides a comprehensive overview of your platform's performance.

### Key Metrics Cards

#### Revenue Metrics
```
💰 Total Revenue
   - All-time earnings
   - Daily/Weekly/Monthly views
   - Growth percentage

📈 Revenue Trend
   - 7-day chart
   - Peak hours identification
   - Comparison with previous period
```

#### Order Metrics
```
📦 Total Orders
   - Lifetime order count
   - Daily average
   - Growth trends

🚀 Active Orders
   - Currently processing
   - Requires attention
   - Delayed orders alert
```

#### User Metrics
```
👥 Total Users
   - Registered customers
   - Active users
   - New registrations

⭐ User Activity
   - Orders per user
   - Repeat customers
   - Engagement rate
```

### Dashboard Features

#### Real-time Updates
- Live order notifications
- Status change alerts
- Payment confirmations
- Connection status indicator

#### Quick Actions Grid
```
Quick Access Buttons:
- Manage Orders → /admin/orders
- Food Items → /admin/food-items
- Categories → /admin/categories
- View Reports → /admin/reports
```

#### Recent Orders Table
- Last 5 orders overview
- Quick status view
- Direct order access
- Customer information

#### Charts & Visualizations

**Revenue Chart**
- Area chart showing daily revenue
- 7-day rolling view
- Interactive tooltips
- Responsive design

**Order Distribution**
- Pie chart by status
- Pending vs Completed
- Cancellation rate
- Visual indicators

**Popular Items**
- Bar chart of top sellers
- Order frequency
- Revenue contribution
- Trend indicators

## 📦 Order Management

### Orders Page (`/admin/orders`)

Comprehensive order management interface with real-time updates.

### Order List Features

#### Status Tabs
```
Filter by Status:
├── All Orders
├── Pending (Requires Action)
├── Confirmed
├── Preparing
├── Out for Delivery
├── Delivered
└── Cancelled
```

#### Order Information Display
```
Each Order Shows:
- Order ID (8-char unique)
- Customer Name & Email
- Items Count
- Total Amount
- Payment Status
- Order Date/Time
- Current Status
- Action Dropdown
```

### Managing Order Status

#### Status Workflow
```
Order Flow:
PENDING → CONFIRMED → PREPARING → OUT_FOR_DELIVERY → DELIVERED
         ↘ CANCELLED (Can cancel at any stage except delivered)
```

#### Updating Status

**Method 1: Quick Update**
1. Find order in list
2. Click status dropdown
3. Select new status
4. Automatic save & notification

**Method 2: Bulk Update** (Coming soon)
1. Select multiple orders
2. Choose bulk action
3. Apply status change
4. Confirm operation

### Order Details

Click any order to view:
- Complete order information
- Customer details
- Delivery address
- Items with quantities
- Payment information
- Status history
- Notes/Instructions

### Real-time Features

#### Live Updates
- WebSocket connection
- Instant status changes
- New order notifications
- No page refresh needed

#### Notification System
```
Notifications for:
✅ New orders placed
📋 Payment confirmed
⏰ Delayed orders
❌ Cancellations
🚚 Delivery completed
```

## 🍕 Food Items Management

### Food Items Page (`/admin/food-items`)

Complete CRUD operations for menu items.

### Adding New Food Item

#### Step 1: Click "Add New Item"

#### Step 2: Fill Item Details
```
Required Information:
📝 Name
   - Item title
   - SEO friendly

📄 Description
   - Brief description
   - Ingredients highlight

💰 Price
   - In INR
   - Without currency symbol

📁 Category
   - Select from dropdown
   - Must exist first

🥗 Dietary Type
   - Vegetarian
   - Non-vegetarian

📸 Image URL
   - Direct image link
   - CDN preferred

✅ Availability
   - Available/Unavailable
   - Toggle anytime
```

#### Step 3: Save Item
- Validation checks
- Success confirmation
- Appears in menu immediately

### Editing Food Items

1. **Find Item**: Search or browse
2. **Click Edit**: Opens edit modal
3. **Modify Details**: Change any field
4. **Save Changes**: Instant update
5. **Verify**: Check on menu page

### Deleting Food Items

⚠️ **Warning**: Deletion is permanent

1. Select item to delete
2. Click delete button
3. Confirm deletion
4. Item removed from menu

### Bulk Operations

**Available Actions:**
- Mark multiple as unavailable
- Change category bulk
- Update prices (percentage)
- Export item list

### Food Item Best Practices

✅ **DO:**
- Use high-quality images
- Write clear descriptions
- Keep prices updated
- Mark unavailable when out of stock
- Categorize properly

❌ **DON'T:**
- Delete items with order history
- Use misleading images
- Forget to update availability
- Leave descriptions empty

## 📁 Category Management

### Categories Page (`/admin/categories`)

Organize your menu with categories.

### Category Structure
```
Menu Categories:
├── Starters
│   ├── Soups
│   └── Salads
├── Main Course
│   ├── Vegetarian
│   └── Non-Vegetarian
├── Desserts
└── Beverages
    ├── Hot
    └── Cold
```

### Creating Categories

#### Add New Category
```
Required Fields:
📝 Name
   - Category title
   - Unique identifier

📄 Description (Optional)
   - Brief description
   - Display subtitle

🎨 Display Order
   - Sorting priority
   - Lower number = higher position

✅ Status
   - Active/Inactive
   - Controls visibility
```

### Managing Categories

#### Edit Category
1. Select category
2. Modify details
3. Save changes
4. Items auto-reorganize

#### Delete Category
⚠️ **Note**: Cannot delete if items exist
1. Move/delete all items first
2. Select empty category
3. Confirm deletion

### Category Organization

**Best Practices:**
- Logical grouping
- Clear naming
- Consistent hierarchy
- Regular cleanup
- Seasonal categories

## 📈 Reports & Analytics

### Reports Page (`/admin/reports`)

Comprehensive business intelligence and analytics.

### Available Reports

#### Sales Reports
```
📊 Daily Sales Report
   - Today's performance
   - Hourly breakdown
   - Payment methods
   - Average order value

📅 Weekly/Monthly Reports
   - Trend analysis
   - Peak days
   - Growth metrics
   - Comparative analysis
```

#### Order Analytics
```
📦 Order Metrics
   - Total orders
   - Completion rate
   - Cancellation reasons
   - Average preparation time

⏱️ Time Analysis
   - Peak hours
   - Delivery times
   - Kitchen efficiency
   - Service quality
```

#### Customer Analytics
```
👥 Customer Behavior
   - New vs Returning
   - Order frequency
   - Average spend
   - Preferred items

🌍 Geographic Data
   - Delivery zones
   - Area performance
   - Expansion opportunities
```

#### Product Performance
```
🍕 Item Analytics
   - Best sellers
   - Low performers
   - Profit margins
   - Inventory turnover

📁 Category Performance
   - Popular categories
   - Revenue distribution
   - Cross-selling opportunities
```

### Generating Reports

1. **Select Report Type**
2. **Choose Date Range**
3. **Apply Filters** (Optional)
4. **Generate Report**
5. **Export Options**:
   - PDF
   - Excel
   - CSV
   - Print

### Dashboard Widgets

Customizable widgets for:
- Real-time metrics
- Goal tracking
- Alerts & thresholds
- Performance indicators

## 👥 User Management

### User Overview

View and manage customer accounts.

### User Information

```
Available Data:
- User ID
- Name & Email
- Registration Date
- Order Count
- Total Spent
- Last Activity
- Account Status
```

### User Actions

#### View User Details
- Order history
- Favorite items
- Delivery addresses
- Payment methods

#### Account Management
- Reset password (Coming soon)
- Suspend account
- Delete account
- Send notifications

### Customer Support

#### Handling User Issues
1. Search user by email/ID
2. View account details
3. Check order history
4. Resolve issue
5. Log interaction

## 🔔 Real-time Monitoring

### Live Dashboard

Real-time monitoring capabilities:

#### Connection Status
```
🟢 Connected - All systems operational
🟡 Degraded - Partial connectivity
🔴 Disconnected - Connection lost
```

#### Live Metrics
- Orders per minute
- Current active orders
- Kitchen capacity
- Delivery fleet status

#### Alert System

**Automatic Alerts for:**
- New orders
- Payment confirmations
- Order delays
- System issues
- Low inventory

### Notification Management

#### Configure Alerts
```
Notification Settings:
├── New Orders (🔔 On/Off)
├── Status Changes (🔔 On/Off)
├── Payment Issues (🔔 On/Off)
├── System Alerts (🔔 On/Off)
└── Reports Ready (🔔 On/Off)
```

## ⚙️ System Settings

### Configuration Options

#### Business Settings
```
Restaurant Information:
- Business Name
- Address
- Contact Details
- Operating Hours
- Holiday Schedule
```

#### Order Settings
```
Order Configuration:
- Min Order Value
- Delivery Radius
- Preparation Time
- Auto-cancel Duration
- Order Limits
```

#### Payment Settings
```
Payment Options:
- Accepted Methods
- Gateway Config
- Tax Settings
- Service Charges
- Refund Policy
```

#### Notification Settings
```
Communication:
- Email Templates
- SMS Configuration
- Push Notifications
- Alert Thresholds
```

## 💡 Best Practices

### Daily Operations

#### Morning Checklist
- [ ] Check pending orders
- [ ] Verify item availability
- [ ] Review yesterday's report
- [ ] Update menu if needed
- [ ] Check system alerts

#### Throughout the Day
- Monitor active orders
- Update order statuses promptly
- Respond to issues quickly
- Keep inventory updated
- Communicate with delivery team

#### End of Day
- [ ] Review daily performance
- [ ] Clear completed orders
- [ ] Update tomorrow's menu
- [ ] Check pending payments
- [ ] Generate daily report

### Order Management Tips

✅ **Best Practices:**
1. Update status immediately
2. Communicate delays
3. Handle cancellations promptly
4. Verify payment status
5. Track preparation times

### Menu Management

**Keep Menu Fresh:**
- Regular updates
- Seasonal items
- Price adjustments
- Clear descriptions
- Accurate images

### Customer Service

**Excellence Standards:**
- Quick response times
- Clear communication
- Problem resolution
- Follow-up actions
- Service recovery

## 🔧 Troubleshooting

### Common Issues

#### Orders Not Appearing
```
Solutions:
1. Check connection status
2. Refresh browser
3. Clear cache
4. Check filters
5. Verify payment
```

#### Cannot Update Status
```
Solutions:
1. Check permissions
2. Verify order state
3. Refresh page
4. Check for locks
5. Contact support
```

#### Reports Not Loading
```
Solutions:
1. Check date range
2. Reduce data scope
3. Clear browser cache
4. Try different browser
5. Check server status
```

#### Real-time Not Working
```
Solutions:
1. Check WebSocket connection
2. Verify firewall settings
3. Refresh connection
4. Check browser console
5. Contact IT support
```

### Error Messages

#### "Unauthorized Access"
- Verify admin role
- Check login status
- Clear cookies and re-login

#### "Operation Failed"
- Check internet connection
- Verify data validity
- Retry operation
- Check server logs

#### "Data Not Found"
- Verify filters
- Check date range
- Refresh data
- Check deletions

### Support Channels

**For Technical Issues:**
- 📧 Email: admin-support@cravecart.com
- 📞 Priority Hotline: 1-800-ADMIN-00
- 💬 Slack Channel: #admin-support
- 📚 Knowledge Base: docs.cravecart.com

**Response Times:**
- Critical: < 1 hour
- High: < 4 hours
- Medium: < 24 hours
- Low: < 48 hours

## 🚀 Advanced Features

### API Integration
- Webhook configuration
- Third-party integrations
- Custom reporting
- Automation rules

### Performance Optimization
- Cache management
- Database optimization
- CDN configuration
- Load balancing

### Security Management
- Access logs
- Security alerts
- Backup management
- Audit trails

---

*For additional support or feature requests, contact the development team.*