# 🔄 Complete Migration & Git Workflow Guide

This guide provides step-by-step instructions for **EVERY** team member to migrate their specific features from the old code to the new repository.

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

1.  **Update & Branch**:
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

1.  **Update & Branch**:
    ```bash
    git checkout main
    git pull origin main
    git checkout -b feat/sadew-auth-system
    ```

2.  **Action: Backend Migration**:
    -   **CREATE**: `server/src/controllers/authController.ts`
    -   **COPY CODE**: Copy code from source `server/src/controllers/authController.ts` to this new file.
    -   **CREATE**: `server/src/routes/authRoutes.ts`
    -   **COPY CODE**: Copy code from source `server/src/routes/authRoutes.ts`.

3.  **Action: Frontend Migration**:
    -   **CREATE**: `client/src/pages/Login.tsx`
    -   **COPY CODE**: Copy code from source `client/src/pages/Login.tsx`.
    -   **CREATE**: `client/src/pages/Register.tsx`
    -   **COPY CODE**: Copy code from source `client/src/pages/Register.tsx`.
    -   **CREATE**: `client/src/pages/Settings.tsx`
    -   **COPY CODE**: Copy code from source `client/src/pages/Settings.tsx`.

4.  **Commit & Push**:
    ```bash
    git add .
    git commit -m "feat(sadew): implement authentication and user settings"
    git push origin feat/sadew-auth-system
    ```

5.  **Merge**: Create PR -> Merge to `main`.

---

## 🍽️ Phase 4: Customer & Menu (Mithila)

**Goal**: Menu browsing and customer order placement.

1.  **Update & Branch**:
    ```bash
    git checkout main
    git pull origin main
    git checkout -b feat/mithila-customer-menu
    ```

2.  **Action: Backend Migration**:
    -   **CREATE**: `server/src/controllers/customerController.ts`
    -   **COPY CODE**: From source `customerController.ts`.
    -   **CREATE**: `server/src/controllers/menuController.ts`
    -   **COPY CODE**: From source `menuController.ts`.

3.  **Action: Frontend Migration**:
    -   **CREATE**: `client/src/pages/Menu.tsx`
    -   **COPY CODE**: Copy code from source `client/src/pages/Menu.tsx`.
    -   **CREATE**: `client/src/pages/OrderTracking.tsx`
    -   **COPY CODE**: Copy code from source `client/src/pages/OrderTracking.tsx`.

4.  **Commit & Push**:
    ```bash
    git add .
    git commit -m "feat(mithila): implement menu and order tracking"
    git push origin feat/mithila-customer-menu
    ```

5.  **Merge**: Create PR -> Merge to `main`.

---

## �️ Phase 5: Waiter System (Danidu)

**Goal**: Table allocation and order delivery.

1.  **Update & Branch**:
    ```bash
    git checkout main
    git pull origin main
    git checkout -b feat/danidu-waiter-dashboard
    ```

2.  **Action: Backend Migration**:
    -   **CREATE**: `server/src/controllers/orderController.ts`
    -   **COPY CODE**: From source `orderController.ts`.
    -   **CREATE**: `server/src/controllers/tableController.ts`
    -   **COPY CODE**: From source `tableController.ts`.

3.  **Action: Frontend Migration**:
    -   **CREATE**: `client/src/pages/waiter/WaiterDashboard.tsx`
    -   **COPY CODE**: Copy code from source `client/src/pages/waiter/WaiterDashboard.tsx`.

4.  **Commit & Push**:
    ```bash
    git add .
    git commit -m "feat(danidu): implement waiter dashboard and table management"
    git push origin feat/danidu-waiter-dashboard
    ```

5.  **Merge**: Create PR -> Merge to `main`.

---

## 👨‍� Phase 6: Chef Dashboard (Sithila)

**Goal**: Kitchen display system.

1.  **Update & Branch**:
    ```bash
    git checkout main
    git pull origin main
    git checkout -b feat/sithila-chef-dashboard
    ```

2.  **Action: Backend Migration**:
    -   **CREATE**: `server/src/controllers/chefController.ts`
    -   **COPY CODE**: From source `chefController.ts`.
    -   **CREATE**: `server/src/routes/chefRoutes.ts`
    -   **COPY CODE**: From source `chefRoutes.ts`.

3.  **Action: Frontend Migration**:
    -   **CREATE**: `client/src/pages/kitchen/ChefDashboard.tsx`
    -   **COPY CODE**: Copy code from source `client/src/pages/kitchen/ChefDashboard.tsx`.

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

1.  **Update & Branch**:
    ```bash
    git checkout main
    git pull origin main
    git checkout -b feat/cashier-pos
    ```

2.  **Action: Backend Migration**:
    -   **CREATE**: `server/src/controllers/cashierController.ts`
    -   **COPY CODE**: From source `cashierController.ts`.

3.  **Action: Frontend Migration**:
    -   **CREATE**: `client/src/pages/cashier/CashierDashboard.tsx`
    -   **COPY CODE**: Copy from `client/src/pages/cashier/CashierDashboard.tsx`.
    -   **CREATE**: `client/src/pages/cashier/POS.tsx`
    -   **COPY CODE**: Copy from `client/src/pages/cashier/POS.tsx`.

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

1.  **Update & Branch**:
    ```bash
    git checkout main
    git pull origin main
    git checkout -b feat/mihan-inventory
    ```

2.  **Action: Backend Migration**:
    -   **CREATE**: `server/src/controllers/inventoryController.ts`
    -   **COPY CODE**: From source `inventoryController.ts`.
    -   **CREATE**: `server/src/models/Inventory.ts`
    -   **COPY CODE**: From source `models/Inventory.ts`.

3.  **Action: Frontend Migration**:
    -   **CREATE**: `client/src/pages/inventory/InventoryDashboard.tsx`
    -   **COPY CODE**: Copy from `client/src/pages/inventory/InventoryDashboard.tsx`.

4.  **Commit & Push**:
    ```bash
    git add .
    git commit -m "feat(mihan): implement inventory system"
    git push origin feat/mihan-inventory
    ```

5.  **Merge**: Create PR -> Merge to `main`.

---

## 📊 Phase 9: Manager Dashboard (Eshini)

**Goal**: Analytics and reports.

1.  **Update & Branch**:
    ```bash
    git checkout main
    git pull origin main
    git checkout -b feat/eshini-manager-dashboard
    ```

2.  **Action: Backend Migration**:
    -   **CREATE**: `server/src/controllers/managerController.ts`
    -   **COPY CODE**: From source `managerController.ts`.

3.  **Action: Frontend Migration**:
    -   **CREATE**: `client/src/pages/manager/ManagerDashboard.tsx`
    -   **COPY CODE**: Copy from `client/src/pages/manager/ManagerDashboard.tsx`.

4.  **Commit & Push**:
    ```bash
    git add .
    git commit -m "feat(eshini): implement manager dashboard"
    git push origin feat/eshini-manager-dashboard
    ```

5.  **Merge**: Create PR -> Merge to `main`.

---

## � Phase 10: Owner/Admin Dashboard (Nadeesha)

**Goal**: System Admin control.

1.  **Update & Branch**:
    ```bash
    git checkout main
    git pull origin main
    git checkout -b feat/nadeesha-admin-panel
    ```

2.  **Action: Backend Migration**:
    -   **CREATE**: `server/src/controllers/ownerController.ts`
    -   **COPY CODE**: From source `ownerController.ts`.

3.  **Action: Frontend Migration**:
    -   **CREATE**: `client/src/pages/admin/OwnerDashboard.tsx`
    -   **COPY CODE**: Copy from `client/src/pages/admin/OwnerDashboard.tsx`.
    -   **CREATE**: `client/src/pages/AdminDashboard.tsx`
    -   **COPY CODE**: Copy from `client/src/pages/AdminDashboard.tsx`.

4.  **Commit & Push**:
    ```bash
    git add .
    git commit -m "feat(nadeesha): implement owner and detailed admin dashboard"
    git push origin feat/nadeesha-admin-panel
    ```

5.  **Merge**: Create PR -> Merge to `main`.

---

## ⚠️ Important Notes for All Members

-   **Before Creating Files**: Always make sure you are inside the correct folder (`server/src/...` or `client/src/...`).
-   **Dependencies**: If your code uses a new npm package, run `npm install package-name` and include `package.json` updates in your commit.
-   **Conflicts**: If you cannot merge because of conflicts, run:
    ```bash
    git checkout main
    git pull
    git checkout your-branch
    git merge main
    # Fix conflicts in code editor
    git add .
    git commit -m "fix: resolve merge conflicts"
    git push
    ```
