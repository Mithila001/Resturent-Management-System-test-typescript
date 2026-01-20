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

**Example Commits:**
```bash
git commit -m "feat(danidu): implement waiter table allocation system"
git commit -m "feat(danidu): add order tracking real-time updates"
git commit -m "chore(danidu): configure docker-compose for multi-container setup"
git commit -m "docs(danidu): create team collaboration guide"
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

**Example Commits:**
```bash
git commit -m "feat(mithila): create customer menu browsing interface"
git commit -m "feat(mithila): implement shopping cart functionality"
git commit -m "chore(mithila): add GitHub Actions CI/CD pipeline"
git commit -m "chore(mithila): configure automated Docker builds"
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

**Example Commits:**
```bash
git commit -m "feat(sithila): implement real-time kitchen order display"
git commit -m "feat(sithila): add order ready notification system"
git commit -m "fix(sithila): resolve WebSocket connection issues in chef dashboard"
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

**Example Commits:**
```bash
git commit -m "feat(cashier): create point-of-sale interface"
git commit -m "feat(cashier): implement counter order entry system"
git commit -m "fix(cashier): resolve payment calculation errors"
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

**Example Commits:**
```bash
git commit -m "feat(mihan): implement inventory dashboard with stock tracking"
git commit -m "feat(mihan): add low stock alert notifications"
git commit -m "fix(mihan): resolve inventory quantity update issues"
```

---

### **Eshini**
**Backend Controllers:**
- `managerController.ts` - Manager dashboard API

**Frontend Pages:**
- Manager Dashboard (`client/src/pages/manager/`)
  - Restaurant Efficiency Metrics
  - Order Analytics
  - Staff Performance
  - Inventory Overview

**Git Commit Prefixes:**
```
feat(eshini): ...
fix(eshini): ...
```

**Example Commits:**
```bash
git commit -m "feat(eshini): create manager efficiency dashboard"
git commit -m "feat(eshini): implement order analytics visualization"
git commit -m "feat(eshini): add staff performance metrics"
```

---

### **Nadeesha**
**Backend Controllers:**
- `ownerController.ts` - Owner/admin operations

**Frontend Pages:**
- Owner/Admin Dashboard (`client/src/pages/admin/`)
  - Complete System Overview
  - Order Management (Edit/Modify)
  - Menu Item Management
  - Full Inventory Control
  - User Management

**Git Commit Prefixes:**
```
feat(nadeesha): ...
fix(nadeesha): ...
```

**Example Commits:**
```bash
git commit -m "feat(nadeesha): create owner dashboard with system overview"
git commit -m "feat(nadeesha): implement comprehensive order management"
git commit -m "fix(nadeesha): resolve admin menu item editing issues"
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
  - Assign Roles

**Git Commit Prefixes:**
```
feat(sadew): ...
fix(sadew): ...
```

**Example Commits:**
```bash
git commit -m "feat(sadew): implement JWT-based authentication"
git commit -m "feat(sadew): create role-based access control system"
git commit -m "feat(sadew): add employee management interface"
git commit -m "fix(sadew): resolve login session persistence issues"
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

**Commit Prefix:** Use your name or `shared`
```
feat(shared): update navigation component with new menu items
fix(danidu): resolve cart quantity update bug
```

### Models & Schemas (Backend)
Located in `server/src/models/`:
- Coordinate with team if changes affect multiple features
- Document schema changes in commit messages

**Commit Format:**
```
feat(schema): add new field to Order model for delivery notes
refactor(models): update Inventory schema for better tracking
```

### API Routes (Backend)
Located in `server/src/routes/`:
- Each developer maintains their assigned route files
- Cross-feature routes require team coordination

---

## 📋 DevOps & Infrastructure Commits

### Danidu's DevOps Tasks
```bash
git commit -m "chore(danidu): add docker-compose configuration"
git commit -m "chore(danidu): optimize server Dockerfile build stages"
git commit -m "docs(danidu): create environment variable documentation"
git commit -m "chore(danidu): add development Docker setup"
```

### Mithila's DevOps Tasks
```bash
git commit -m "chore(mithila): create GitHub Actions CI/CD workflow"
git commit -m "chore(mithila): add automated testing pipeline"
git commit -m "chore(mithila): configure Docker image builds in CI"
git commit -m "docs(mithila): document deployment process"
```

---

## 🌲 Branch Naming Convention

### Feature Branches
Format: `feature/{name}-{description}`

**Examples:**
```
feature/danidu-waiter-dashboard
feature/mithila-customer-menu
feature/sithila-chef-notifications
feature/cashier-pos-system
feature/mihan-inventory-alerts
feature/eshini-manager-analytics
feature/nadeesha-admin-panel
feature/sadew-auth-system
```

### Fix Branches
Format: `fix/{name}-{issue-description}`

**Examples:**
```
fix/danidu-table-allocation-bug
fix/mithila-cart-calculation-error
```

### DevOps Branches
Format: `devops/{name}-{task}`

**Examples:**
```
devops/danidu-docker-setup
devops/mithila-ci-cd-pipeline
```

---

## ✅ Code Review Assignments

### Suggested Reviewers
- **Frontend Reviews**: Cross-review (e.g., Danidu reviews Mithila's code and vice versa)
- **Backend Reviews**: Adjacent feature developers review each other
- **DevOps**: Danidu and Mithila review each other's infrastructure code

### Review Checklist
- [ ] Code follows project conventions
- [ ] Linters pass
- [ ] Features tested locally
- [ ] No breaking changes to other features
- [ ] Documentation updated if needed

---

## 🎯 Workflow Summary

1. **Create Feature Branch**: `git checkout -b feature/{name}-{description}`
2. **Develop**: Make changes in your assigned areas
3. **Commit**: Use proper commit format with your prefix
4. **Push**: `git push origin feature/{name}-{description}`
5. **Pull Request**: Create PR from your branch to `develop`
6. **Review**: Wait for code review and approval
7. **Merge**: After approval, merge to `develop`

---

## 📊 Progress Tracking

Team members should update their progress by:
1. Moving tasks in the project board (if using GitHub Projects)
2. Commenting on related GitHub Issues
3. Keeping commit messages descriptive and clear

---

## 🤝 Collaboration Guidelines

- **Communicate**: Notify team before making changes to shared files
- **Review**: Review others' code promptly
- **Test**: Always test your changes before pushing
- **Document**: Update README and docs as needed
- **Help**: Assist team members when they're stuck

---

**Last Updated**: 2026-01-20  
**Maintained By**: Danidu & Mithila
