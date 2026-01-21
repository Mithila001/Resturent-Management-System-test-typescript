# 🔄 Complete Step-by-Step Project Construction Guide

This guide provides the exact "recipe" to build the Restaurant Management System from scratch. It is divided into **10 Phases**, where each team member has specific tasks.

**IMPORTANT**: ALWAYS start by pulling the latest changes!

---

## 🏁 Phase 1: Project Initialization (Danidu)

**Goal**: Initialize the project, setup Docker, and prepare the repository.

1.  **Create Branch**:
    ```bash
    git checkout main
    git pull origin main
    git checkout -b chore/danidu-initial-setup
    ```

2.  **Action: Setup Project Structure**:
    -   Initialize React Client: `npm create vite@latest client -- --template react-ts`
    -   Initialize Node Server: `npm init -y` (inside server folder)
    -   **COPY**: `package.json` dependencies from source to new `client` and `server` folders.
    -   **RUN**: `npm install` in both folders.

3.  **Action: Docker Setup**:
    -   **CREATE**: `docker-compose.yml` in root.
    -   **CREATE**: `server/Dockerfile` and `client/Dockerfile`.
    -   *Copy content from the provided DOCKER_GUIDE.md*.

4.  **Commit & Push**:
    ```bash
    git add .
    git commit -m "chore(danidu): initialize project and docker setup"
    git push origin chore/danidu-initial-setup
    ```

5.  **Merge**: Create PR -> Merge to `main`.

---

## 🚀 Phase 2: CI/CD Setup (Mithila)

**Goal**: Setup automated testing and deployment pipelines.

1.  **Create Branch**:
    ```bash
    git checkout main
    git pull origin main
    git checkout -b devops/mithila-cicd
    ```

2.  **Action: Create Workflow**:
    -   **CREATE FOLDER**: `.github/workflows/`
    -   **CREATE FILE**: `.github/workflows/ci-cd.yml`
    -   *Copy content from the source `.github/workflows/ci-cd.yml`*.

3.  **Commit & Push**:
    ```bash
    git add .
    git commit -m "chore(mithila): setup ci/cd pipeline"
    git push origin devops/mithila-cicd
    ```

4.  **Merge**: Create PR -> Merge to `main`.

---

## 🛡️ Phase 3: Auth & User Management (Sadew)

**Goal**: Implement Login, Registration, and User Management.

1.  **Create Branch**:
    ```bash
    git checkout main
    git pull origin main
    git checkout -b feat/sadew-auth-system
    ```

2.  **Action: Backend Migration**:
    -   **CREATE**: `server/src/controllers/authController.ts`
    -   **CREATE**: `server/src/routes/authRoutes.ts`
    -   *Copy relevant code from source*.

3.  **Action: Frontend Migration**:
    -   **CREATE**: `client/src/pages/Login.tsx`
    -   **CREATE**: `client/src/pages/Register.tsx`
    -   **CREATE**: `client/src/pages/Settings.tsx`

4.  **Commit & Push**:
    ```bash
    git add .
    git commit -m "feat(sadew): implement authentication and user settings"
    git push origin feat/sadew-auth-system
    ```

5.  **Merge**: Create PR -> Merge to `main` (or `develop` if setup).

---

## 🍽️ Phase 4: Customer & Menu (Mithila)

**Goal**: Menu browsing and customer order placement.

1.  **Create Branch**:
    ```bash
    git checkout main
    git pull origin main
    git checkout -b feat/mithila-customer-menu
    ```

2.  **Action: Backend Migration**:
    -   **CREATE**: `server/src/controllers/customerController.ts`
    -   **CREATE**: `server/src/controllers/menuController.ts`

3.  **Action: Frontend Migration**:
    -   **CREATE**: `client/src/pages/customer/Menu.tsx`
    -   **CREATE**: `client/src/pages/customer/OrderTracking.tsx`

4.  **Commit & Push**:
    ```bash
    git add .
    git commit -m "feat(mithila): implement menu and order tracking"
    git push origin feat/mithila-customer-menu
    ```

5.  **Merge**: Create PR -> Merge to `main`.

---

## 🤵 Phase 5: Waiter System (Danidu)

**Goal**: Table allocation and order delivery.

1.  **Create Branch**:
    ```bash
    git checkout main
    git pull origin main
    git checkout -b feat/danidu-waiter-dashboard
    ```

2.  **Action: Backend Migration**:
    -   **CREATE**: `server/src/controllers/orderController.ts`
    -   **CREATE**: `server/src/controllers/tableController.ts`

3.  **Action: Frontend Migration**:
    -   **CREATE**: `client/src/pages/waiter/WaiterDashboard.tsx`
    -   **CREATE**: `client/src/pages/waiter/TableAllocation.tsx`

4.  **Commit & Push**:
    ```bash
    git add .
    git commit -m "feat(danidu): implement waiter dashboard and table management"
    git push origin feat/danidu-waiter-dashboard
    ```

5.  **Merge**: Create PR -> Merge to `main`.

---

## 👨‍🍳 Phase 6: Chef Dashboard (Sithila)

**Goal**: Kitchen display system.

1.  **Create Branch**:
    ```bash
    git checkout main
    git pull origin main
    git checkout -b feat/sithila-chef-dashboard
    ```

2.  **Action: Backend Migration**:
    -   **CREATE**: `server/src/controllers/chefController.ts`
    -   **CREATE**: `server/src/routes/chefRoutes.ts`

3.  **Action: Frontend Migration**:
    -   **CREATE**: `client/src/pages/kitchen/ChefDashboard.tsx`

4.  **Commit & Push**:
    ```bash
    git add .
    git commit -m "feat(sithila): implement chef dashboard"
    git push origin feat/sithila-chef-dashboard
    ```

5.  **Merge**: Create PR -> Merge to `main`.

---

## 💰 Phase 7: Cashier POS (StatMember)

**Goal**: Point of Sale system.

1.  **Create Branch**:
    ```bash
    git checkout main
    git pull origin main
    git checkout -b feat/cashier-pos
    ```

2.  **Action: Backend Migration**:
    -   **CREATE**: `server/src/controllers/cashierController.ts`

3.  **Action: Frontend Migration**:
    -   **CREATE**: `client/src/pages/cashier/CashierDashboard.tsx`
    -   **CREATE**: `client/src/pages/cashier/POS.tsx`

4.  **Commit & Push**:
    ```bash
    git add .
    git commit -m "feat(cashier): implement POS system"
    git push origin feat/cashier-pos
    ```

5.  **Merge**: Create PR -> Merge to `main`.

---

## 📦 Phase 8: Inventory (Mihan)

**Goal**: Inventory management.

1.  **Create Branch**:
    ```bash
    git checkout main
    git pull origin main
    git checkout -b feat/mihan-inventory
    ```

2.  **Action: Backend Migration**:
    -   **CREATE**: `server/src/controllers/inventoryController.ts`
    -   **CREATE**: `server/src/models/Inventory.ts`

3.  **Action: Frontend Migration**:
    -   **CREATE**: `client/src/pages/inventory/InventoryDashboard.tsx`

4.  **Commit & Push**:
    ```bash
    git add .
    git commit -m "feat(mihan): implement inventory system"
    git push origin feat/mihan-inventory
    ```

5.  **Merge**: Create PR -> Merge to `main`.

---

## 💼 Phase 9: Owner & Manager Dashboard (Eshini)

**Goal**: Business Overview, Analytics, and Reports.

1.  **Create Branch**:
    ```bash
    git checkout main
    git pull origin main
    git checkout -b feat/eshini-owner-manager-dashboard
    ```

2.  **Action: Backend Migration**:
    -   **CREATE**: `server/src/controllers/managerController.ts` (Reports/Analytics)
    -   **CREATE**: `server/src/controllers/ownerController.ts` (Revenue/Settings)

3.  **Action: Frontend Migration**:
    -   **CREATE**: `client/src/pages/manager/ManagerDashboard.tsx`
    -   **CREATE**: `client/src/pages/owner/OwnerDashboard.tsx`
    -   *Connect charts and metric cards*.

4.  **Commit & Push**:
    ```bash
    git add .
    git commit -m "feat(eshini): implement owner and manager dashboards"
    git push origin feat/eshini-owner-manager-dashboard
    ```

5.  **Merge**: Create PR -> Merge to `main`.

---

## 🛡️ Phase 10: System Admin Dashboard (Nadeesha)

**Goal**: User Management and System Administration.

1.  **Create Branch**:
    ```bash
    git checkout main
    git pull origin main
    git checkout -b feat/nadeesha-admin-panel
    ```

2.  **Action: Backend Migration**:
    -   **CREATE**: `server/src/controllers/adminController.ts`

3.  **Action: Frontend Migration**:
    -   **CREATE**: `client/src/pages/admin/AdminDashboard.tsx`
    -   *Implement User Role Management and System Logs*.

4.  **Commit & Push**:
    ```bash
    git add .
    git commit -m "feat(nadeesha): implement system admin panel"
    git push origin feat/nadeesha-admin-panel
    ```

5.  **Merge**: Create PR -> Merge to `main`.

---

**Last Updated**: 2026-01-20
