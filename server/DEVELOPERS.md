# Developer Assignment Guide

This document maps each developer to their specific modules to avoid merge conflicts during collaborative development.

## Project Structure Overview

The server follows a **modular MVC architecture** with role-based separation:

- **Models**: Database schemas (shared across modules)
- **Controllers**: Business logic for each role
- **Routes**: API endpoint definitions
- **Middleware**: Authentication and authorization

---

## Developer 1: Waiter Module

**Focus**: Table Allocation, Order Tracking, and Order Delivery

### Assigned Files

- **Controller**: `server/src/controllers/waiterController.ts`
- **Routes**: `server/src/routes/waiterRoutes.ts`
- **Model** (Shared): `server/src/models/Table.ts`

### Responsibilities

- Manage table assignments (assign self to tables)
- Update table status (available, occupied, reserved)
- View orders for assigned tables
- Mark orders as delivered
- Track order status for specific tables

### API Endpoints

```
GET    /api/waiter/tables                    - Get my assigned tables
PUT    /api/waiter/tables/:id/assign         - Assign self to a table
PUT    /api/waiter/tables/:id/status         - Update table status
GET    /api/waiter/orders                    - Get orders for my tables
GET    /api/waiter/orders/table/:tableNumber - Get orders by table number
PUT    /api/waiter/orders/:id/deliver        - Mark order as delivered
```

### Key Features

- RBAC: Only waiter role can access these routes
- Waiters can only manage their assigned tables
- Real-time socket updates on order delivery

---

## Developer 2: Customer Module

**Focus**: Menu Browsing, Cart Management, and Checkout/Ordering

### Assigned Files

- **Controller**: `server/src/controllers/customerController.ts`
- **Routes**: `server/src/routes/customerRoutes.ts`
- **Models** (Shared): `server/src/models/MenuItem.ts`, `server/src/models/Order.ts`

### Responsibilities

- Browse menu with filters (category, vegetarian, spicy, availability)
- Get detailed menu item information
- Create new orders (checkout process)
- View order history
- Cancel pending orders
- (Future) Add reviews/ratings

### API Endpoints

```
GET    /api/customer/menu                - Browse menu items (public)
GET    /api/customer/menu/:id            - Get menu item details (public)
GET    /api/customer/categories          - Get all categories (public)
POST   /api/customer/orders              - Create new order (customer only)
GET    /api/customer/orders              - Get my orders (customer only)
GET    /api/customer/orders/:id          - Get order details (customer only)
DELETE /api/customer/orders/:id          - Cancel order (customer only)
POST   /api/customer/menu/:id/review     - Add review (placeholder)
```

### Key Features

- Public menu browsing (no auth required)
- Order creation with validation
- Support for delivery and dine-in orders
- Customer-specific order history

---

## Developer 3: Chef Module

**Focus**: Kitchen Display System (KDS) and Order Ready Notifications

### Assigned Files

- **Controller**: `server/src/controllers/chefController.ts`
- **Routes**: `server/src/routes/chefRoutes.ts`
- **Models** (Shared): `server/src/models/Order.ts`, `server/src/models/MenuItem.ts`

### Responsibilities

- View Kitchen Display System (KDS) orders
- Confirm order receipt
- Start preparing orders
- Mark orders as ready
- Update menu item availability
- View kitchen statistics

### API Endpoints

```
GET /api/chef/kds                         - Get kitchen orders (pending, confirmed, preparing)
GET /api/chef/stats                       - Get kitchen statistics
GET /api/chef/orders/:id                  - Get order details
PUT /api/chef/orders/:id/confirm          - Confirm order
PUT /api/chef/orders/:id/start            - Start preparing order
PUT /api/chef/orders/:id/ready            - Mark order as ready
PUT /api/chef/menu/:id/availability       - Update menu item availability
```

### Key Features

- Real-time order updates via Socket.IO
- FIFO order processing (oldest first)
- Order status workflow: pending → confirmed → preparing → ready
- Notification triggers when order is ready

---

## Developer 4: Cashier Module

**Focus**: Point of Sale (POS) System and Payment Processing

### Assigned Files

- **Controller**: `server/src/controllers/cashierController.ts`
- **Routes**: `server/src/routes/cashierRoutes.ts`
- **Model** (Shared): `server/src/models/Order.ts`

### Responsibilities

- View orders ready for payment
- Process payments (cash, card, online)
- Update payment status
- View payment statistics
- Handle table billing
- Issue refunds

### API Endpoints

```
GET  /api/cashier/orders                      - Get orders ready for payment
GET  /api/cashier/orders/:id                  - Get order details for POS
POST /api/cashier/orders/:id/payment          - Process payment
PUT  /api/cashier/orders/:id/payment-status   - Update payment status
POST /api/cashier/orders/:id/refund           - Issue refund
GET  /api/cashier/stats                       - Get payment statistics
GET  /api/cashier/tables/:tableNumber/orders  - Get table billing info
```

### Key Features

- Payment processing with change calculation
- Revenue tracking by payment method
- Daily payment statistics
- Refund management

---

## Developer 5: Inventory Module

**Focus**: Stock Level Management and Ingredient Tracking

### Assigned Files

- **Controller**: `server/src/controllers/inventoryController.ts`
- **Routes**: `server/src/routes/inventoryRoutes.ts`
- **Model**: `server/src/models/Inventory.ts`

### Responsibilities

- View all inventory items
- Add new inventory items
- Update stock quantities
- Delete inventory items
- Track low-stock items

### API Endpoints

```
GET    /api/inventory     - Get all inventory items
POST   /api/inventory     - Add new inventory item
PUT    /api/inventory/:id - Update inventory item
DELETE /api/inventory/:id - Delete inventory item
```

### Key Features

- Low stock threshold tracking
- Categorized inventory management
- Chef can update inventory during usage
- Manager/Owner oversight

---

## Developer 6: Manager Module

**Focus**: Analytics Dashboard for Restaurant Efficiency

### Assigned Files

- **Controller**: `server/src/controllers/managerController.ts`
- **Routes**: `server/src/routes/managerRoutes.ts`
- **Models** (Shared): All models for analytics

### Responsibilities

- View comprehensive analytics dashboard
- Monitor staff performance
- Track inventory status
- Analyze table occupancy
- Generate daily/weekly/monthly reports
- View customer insights
- Manage menu items

### API Endpoints

```
GET /api/manager/analytics          - Get comprehensive analytics
GET /api/manager/reports            - Get period reports (daily/weekly/monthly)
GET /api/manager/staff-performance  - Get staff performance metrics
GET /api/manager/inventory-status   - Get inventory status with low stock alerts
GET /api/manager/table-occupancy    - Get table occupancy statistics
GET /api/manager/customer-insights  - Get customer analytics
PUT /api/manager/menu/:id           - Update menu items
```

### Key Features

- Revenue analytics by order type
- Popular menu items tracking
- Staff performance metrics (waiters, chefs)
- Inventory insights (low stock, out of stock)
- Customer retention metrics
- Comparative analysis

---

## Developer 7: Owner/Admin Module

**Focus**: High-Level Admin Dashboard and Financial Overviews

### Assigned Files

- **Controller**: `server/src/controllers/ownerController.ts`
- **Routes**: `server/src/routes/ownerRoutes.ts`
- **Models** (Shared): All models for financial reporting

### Responsibilities

- View financial overview (revenue, profits)
- Analyze profit margins
- View business metrics and KPIs
- Access system-wide statistics
- Perform comparative analysis
- Export financial reports

### API Endpoints

```
GET /api/owner/financial-overview    - Get financial overview (yearly/monthly)
GET /api/owner/profit-analysis       - Get profit analysis
GET /api/owner/business-metrics      - Get business KPIs
GET /api/owner/system-stats          - Get system-wide statistics
GET /api/owner/comparative-analysis  - Compare current vs previous period
GET /api/owner/export-report         - Export financial reports (placeholder)
```

### Key Features

- Monthly/yearly revenue breakdown
- Refund and cancellation tracking
- Customer retention metrics
- Growth analysis (period-over-period)
- Payment method distribution
- High-level business intelligence

---

## Developer 8: System/HR Module (Authentication & Access Control)

**Focus**: Role-Based Access Control (RBAC), Login/Auth, Settings, and Employee Management

### Assigned Files

- **Controller**: `server/src/controllers/authController.ts`
- **Routes**: `server/src/routes/authRoutes.ts`
- **Middleware**: `server/src/middleware/authMiddleware.ts`
- **Model**: `server/src/models/User.ts`

### Responsibilities

- User registration and login
- JWT token generation and validation
- User profile management
- Employee management (CRUD operations)
- Role-based authorization
- Password hashing and security

### API Endpoints

```
POST   /api/auth/register              - Register new user
POST   /api/auth/login                 - Login and get JWT token
GET    /api/auth/profile               - Get user profile (protected)
PUT    /api/auth/profile               - Update user profile (protected)
GET    /api/auth/users                 - Get all users (admin/owner/manager)
DELETE /api/auth/users/:id             - Delete user (admin/owner)
```

### Key Features

- JWT-based authentication
- Role-based access control (RBAC)
- Password encryption with bcryptjs
- Middleware: `protect` (auth) and `authorize` (role check)
- Support for roles: customer, waiter, chef, cashier, manager, owner, admin
- User address management

---

## Shared Components

### Models (All Developers Have Read Access)

- `server/src/models/User.ts` - User accounts and roles
- `server/src/models/Order.ts` - Order management
- `server/src/models/MenuItem.ts` - Menu items
- `server/src/models/Category.ts` - Menu categories
- `server/src/models/Table.ts` - Restaurant tables
- `server/src/models/Inventory.ts` - Inventory items

### Middleware (Used by All Routes)

- `server/src/middleware/authMiddleware.ts` - Authentication & authorization

### Core Files (Do NOT Modify)

- `server/src/app.ts` - Express app configuration
- `server/src/server.ts` - Server initialization
- `server/src/config/db.ts` - Database connection

---

## Collaboration Guidelines

### 1. File Ownership

- **Each developer owns specific controller and route files**
- Only modify files assigned to you to avoid merge conflicts
- Models are shared - coordinate changes through team lead

### 2. Git Workflow

```bash
# Create feature branch
git checkout -b dev1/waiter-module

# Work on your assigned files only
# Commit frequently with clear messages
git add server/src/controllers/waiterController.ts
git add server/src/routes/waiterRoutes.ts
git commit -m "feat(waiter): Add table assignment logic"

# Push to your branch
git push origin dev1/waiter-module

# Create Pull Request for review
```

### 3. Branch Naming Convention

- `dev1/waiter-*` - Waiter module features
- `dev2/customer-*` - Customer module features
- `dev3/chef-*` - Chef module features
- `dev4/cashier-*` - Cashier module features
- `dev5/inventory-*` - Inventory module features
- `dev6/manager-*` - Manager module features
- `dev7/owner-*` - Owner module features
- `dev8/auth-*` - Auth/HR module features

### 4. Communication

- Use Slack/Discord for real-time coordination
- Document API changes in team wiki
- Report model changes in team meetings
- Use GitHub Issues for bug tracking

### 5. Testing

- Test your endpoints using Postman/Thunder Client
- Verify authentication tokens work correctly
- Test role-based authorization
- Ensure socket events fire properly

---

## API Authentication

All protected routes require Bearer token authentication:

```javascript
Headers:
{
  "Authorization": "Bearer <JWT_TOKEN>",
  "Content-Type": "application/json"
}
```

### Role Hierarchy

- **Owner/Admin**: Access to all routes
- **Manager**: Access to analytics, inventory, staff management
- **Chef**: Kitchen orders, menu availability
- **Waiter**: Tables, order delivery
- **Cashier**: Payment processing, POS
- **Customer**: Menu browsing, order placement

---

## Socket.IO Events

### Events Emitted by Server

- `orderStatusUpdated` - When order status changes
- `orderReady` - When chef marks order as ready
- `paymentStatusUpdated` - When payment is processed

### Client Listeners

Frontend should listen to these events for real-time updates.

---

## Development Setup

1. **Install Dependencies**

```bash
cd server
npm install
```

2. **Environment Variables**
   Create `.env` file:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

3. **Run Development Server**

```bash
npm run dev
```

4. **Seed Database** (Optional)

```bash
npm run seed:all
```

---

## Code Standards

- Use TypeScript for type safety
- Follow existing code structure
- Add JSDoc comments for functions
- Use async/await for asynchronous operations
- Handle errors with try-catch blocks
- Return appropriate HTTP status codes
- Validate input data before processing

---

## Need Help?

- **Technical Lead**: Review architecture decisions
- **Backend Team Lead**: Coordinate model changes
- **DevOps**: Deployment and environment issues
- **QA Team**: Report bugs and testing issues

---

**Last Updated**: January 18, 2026

**Project**: Restaurant Management System
**Version**: 1.0.0
