# 📚 CraveCart Documentation

Welcome to the official documentation for **CraveCart** - a modern food delivery platform built with cutting-edge technologies.

## 🚀 Quick Navigation

| Documentation | Description |
|--------------|-------------|
| 📘 [User Guide](./USER_GUIDE.md) | Complete guide for customers using CraveCart |
| 🔧 [Admin Guide](./ADMIN_GUIDE.md) | Administration and management documentation |
| ⚡ [Features](./FEATURES.md) | Detailed feature documentation and capabilities |
| 🔌 [API Reference](./API_REFERENCE.md) | API endpoints and integration guide |
| 💻 [Tech Stack](./TECH_STACK.md) | Technical architecture and development setup |

## 🍕 About CraveCart

CraveCart is a comprehensive food delivery platform that connects customers with restaurants, offering a seamless ordering experience with real-time tracking, secure payments, and efficient order management.

### Key Highlights

- **Real-time Order Tracking** - Live updates using Socket.IO
- **Secure Payments** - Integrated with Razorpay payment gateway
- **Modern UI/UX** - Responsive design with dark mode support
- **Admin Dashboard** - Comprehensive management interface
- **Performance Optimized** - Built with Next.js 15 and optimized for speed

## 🎯 Documentation Overview

### For Users
If you're a customer looking to order food:
- Start with the [User Guide](./USER_GUIDE.md)
- Learn about [Features](./FEATURES.md) available to you
- Check FAQs and troubleshooting

### For Administrators
If you're managing the platform:
- Read the [Admin Guide](./ADMIN_GUIDE.md)
- Understand [API endpoints](./API_REFERENCE.md)
- Learn about system management

### For Developers
If you're working on the codebase:
- Review the [Tech Stack](./TECH_STACK.md)
- Check [API Reference](./API_REFERENCE.md)
- Understand the architecture

## 🏗️ Project Structure

```
CraveCart/
├── apps/
│   ├── frontend/     # Next.js 15 application
│   └── backend/      # Express.js API server
├── docs/            # Documentation
├── docker/          # Docker configurations
└── package.json     # Monorepo configuration
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn package manager

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MCS-232-Project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Configure database and API keys

4. **Run the application**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Frontend: `http://localhost:3000`
   - Backend: `http://localhost:5000`

## 📋 Documentation Contents

### 1. [User Guide](./USER_GUIDE.md)
- Registration and login process
- Browsing and searching menu
- Cart management
- Checkout and payment
- Order tracking
- Profile management

### 2. [Admin Guide](./ADMIN_GUIDE.md)
- Dashboard overview
- Order management
- Food items and categories
- Reports and analytics
- User management
- System settings

### 3. [Features](./FEATURES.md)
- User features
- Admin features
- Real-time capabilities
- Payment integration
- Authentication system
- Search and filtering

### 4. [API Reference](./API_REFERENCE.md)
- Authentication endpoints
- User management
- Food items and categories
- Order management
- Payment processing
- WebSocket events

### 5. [Tech Stack](./TECH_STACK.md)
- Frontend technologies
- Backend architecture
- Database design
- Third-party integrations
- Development tools

## 🔑 Key Features

### For Customers
- 🔐 Secure authentication
- 🍔 Browse food menu with filters
- 🛒 Shopping cart management
- 💳 Secure payment processing
- 📦 Real-time order tracking
- 📱 Mobile-responsive design

### For Administrators
- 📊 Comprehensive dashboard
- 📦 Order management system
- 🍕 Food item CRUD operations
- 📈 Analytics and reporting
- 👥 User management
- 🔔 Real-time notifications

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Real-time**: Socket.IO Client

### Backend
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Real-time**: Socket.IO
- **Payment**: Razorpay

## 📞 Support & Contact

### For Users
- Check the [User Guide](./USER_GUIDE.md) for common issues
- Review FAQs in the documentation
- Contact support at: support@cravecart.com

### For Developers
- Review the [Tech Stack](./TECH_STACK.md) documentation
- Check [API Reference](./API_REFERENCE.md) for integration
- Submit issues on GitHub

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines before submitting pull requests.

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 🆕 Recent Updates

### November 2024 - Cart Enhancements

#### Bug Fixes
- ✅ Fixed critical cart quantity update bug (updateQuantity parameter mismatch)
- ✅ Resolved cart page quantity controls not working

#### New Features
- ✅ **Inline Quantity Controls**: Add/remove items directly from menu without navigating to cart
- ✅ **Smooth Animations**: Integrated Framer Motion for delightful user experience
- ✅ **Micro-interactions**: Button scale effects, spring animations, and transitions
- ✅ **Improved Cart UI**: Stagger effects, exit animations, and price counter animations

#### Technical Improvements
- ✅ Optimistic UI updates for instant feedback
- ✅ Better state management with Redux Toolkit
- ✅ Enhanced mobile experience with touch-friendly controls
- ✅ Improved performance with React optimization

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with Next.js and Express.js
- UI components from shadcn/ui
- Animations powered by Framer Motion
- Payment processing by Razorpay
- Real-time updates powered by Socket.IO

---

*Last updated: November 2024*