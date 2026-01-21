# Project Task Separation & Commit Responsibilities

## 🎯 Overview

This document outlines the division of work among team members for the Restaurant Management System project. Each team member is responsible for specific backend controllers and frontend pages.

---

## 👥 Team Member Assignments

### **Danidu**
**Backend Controllers:**
- `orderController.ts` - Order management API
- `tableController.ts` - Table management API
- `waiterController.ts` - Waiter-specific operations

**Frontend Pages:**
- Waiter Dashboard (`client/src/pages/waiter/`)
  - Table Allocation
  - Order Tracking
  - Order Delivery

**DevOps Tasks:**
- Docker Compose configuration
- Server Dockerfile optimization
- Environment variable setup
- Team collaboration documentation

**Git Commit Prefixes:**
```
feat(danidu): ...
fix(danidu): ...
docs(danidu): ...
```

---

### **Mithila**
**Backend Controllers:**
- `customerController.ts` - Customer-facing API
- `menuController.ts` - Menu browsing and search

**Frontend Pages:**
- Customer Pages (`client/src/pages/customer/`)
  - Browse Menu
  - Add to Cart
  - Place Order
  - Order History

**DevOps Tasks:**
- GitHub Actions CI/CD pipeline
- Docker build workflows
- Automated testing configuration
- Deployment documentation

**Git Commit Prefixes:**
```
feat(mithila): ...
fix(mithila): ...
chore(mithila): ...
```

---

### **Sithila**
**Backend Controllers:**
- `chefController.ts` - Kitchen operations API

**Frontend Pages:**
- Chef Dashboard (`client/src/pages/kitchen/`)
  - Real-time Order Updates in Kitchen
  - Order Ready Alert System
  - Kitchen Order Queue

**Git Commit Prefixes:**
```
feat(sithila): ...
fix(sithila): ...
```

---

### **StatMember**
**Backend Controllers:**
- `cashierController.ts` - Cashier/POS operations

**Frontend Pages:**
- Cashier POS (`client/src/pages/cashier/`)
  - Point of Sale Interface
  - Counter Order Management
  - Payment Processing

**Git Commit Prefixes:**
```
feat(cashier): ...
fix(cashier): ...
```

---

### **Mihan**
**Backend Controllers:**
- `inventoryController.ts` - Inventory management API

**Frontend Pages:**
- Inventory Management (`client/src/pages/inventory/`)
  - Stock Level Tracking
  - Low Stock Alerts
  - Inventory Updates

**Git Commit Prefixes:**
```
feat(mihan): ...
fix(mihan): ...
```

---

### **Eshini** (Manager & Owner)
**Backend Controllers:**
- `managerController.ts` - Manager dashboard API
- `ownerController.ts` - Business Owner API (Revenue, High-level strategy)

**Frontend Pages:**
- **Manager Dashboard** (`client/src/pages/manager/`)
  - Restaurant Efficiency Metrics
  - Staff Performance
  - Daily/Weekly Reports
- **Owner Dashboard** (`client/src/pages/owner/`)
  - Total Business Overview (Revenue, Profit)
  - Business Settings (Tax rates, Branch management)
  - High-level Decision Support

**Git Commit Prefixes:**
```
feat(eshini): ...
fix(eshini): ...
```

**Example Commits:**
```bash
git commit -m "feat(eshini): create owner revenue dashboard"
git commit -m "feat(eshini): implement manager staff performance report"
```

---

### **Nadeesha** (System Admin)
**Backend Controllers:**
- `adminController.ts` - System Administration

**Frontend Pages:**
- **Admin Dashboard** (`client/src/pages/admin/`)
  - User Role Management (Create/Delete Users)
  - System Configuration
  - Audit Logs
  - Database Backups/Maintenance

**Git Commit Prefixes:**
```
feat(nadeesha): ...
fix(nadeesha): ...
```

**Example Commits:**
```bash
git commit -m "feat(nadeesha): implement user role assignment interface"
git commit -m "feat(nadeesha): add system audit log viewer"
```

---

### **Sadew**
**Backend Controllers:**
- `authController.ts` - Authentication and authorization
- User management endpoints

**Frontend Pages:**
- Authentication (`client/src/pages/login/`)
  - Login Page
  - Register Page
  - Password Reset
- Settings (`client/src/pages/Settings.tsx`)
  - User Profile
  - Role Management
- Employee Management
  - Create/Edit Employees

**Git Commit Prefixes:**
```
feat(sadew): ...
fix(sadew): ...
```

---

## 🔄 Shared Responsibilities

### Common Components (Any Developer Can Contribute)
Located in `client/src/components/`:
- ErrorBoundary
- ProtectedRoute
- Cart Component
- Navigation
- Theme Toggle

### Models & Schemas (Backend)
Located in `server/src/models/`:
- Coordinate with team if changes affect multiple features
- Document schema changes in commit messages

---

## 🎯 Workflow Summary (Detailed in GIT_WORKFLOW_GUIDE.md)

1. **Clone**: `git clone <repo>`
2. **Branch**: `git checkout -b feature/<name>-<task>` (from `develop`)
3. **Code**: Implement your feature.
4. **Push**: `git push origin feature/<name>-<task>`
5. **PR**: Create Pull Request to `develop`.
6. **Merge**: DevOps leads merge `develop` to `main` for release.

---

**Last Updated**: 2026-01-20
**Maintained By**: Danidu & Mithila
