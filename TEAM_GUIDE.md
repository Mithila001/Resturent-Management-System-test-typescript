# Team Collaboration & Project Setup Guide

## 🚀 Quick Start: Setting Up From Scratch

### Prerequisites
- Git installed
- Node.js 20.x or higher
- Docker & Docker Compose (optional, for containerized development)
- MongoDB Compass or MongoDB installed locally (if not using Docker)

---

## 📋 Step 1: Clone the Repository

Each team member should clone the repository:

```bash
# Clone the repository
git clone https://github.com/YOUR_ORG/Restaurant-Management-System.git
cd Restaurant-Management-System

# Create your feature branch
git checkout -b feature/your-name-feature-description
```

---

## 🔧 Step 2: Environment Setup

### Option A: Local Development (Without Docker)

1. **Setup Server**:
```bash
cd server
cp .env.example .env
# Edit .env and update MongoDB connection string if needed
npm install
```

2. **Setup Client**:
```bash
cd ../client
npm install
```

3. **Start MongoDB** (if not using Docker):
- Install MongoDB locally or use MongoDB Atlas
- Update `MONGO_URI` in `server/.env`

4. **Run Development Servers**:
```bash
# Terminal 1 - Start server
cd server
npm run dev

# Terminal 2 - Start client
cd client
npm run dev
```

### Option B: Docker Development (Recommended)

1. **Copy environment file**:
```bash
cp .env.example .env
# Edit .env if needed
```

2. **Build and start containers**:
```bash
# Start all services (MongoDB, Server, Client)
docker-compose up --build

# Or run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f
```

3. **Stop containers**:
```bash
docker-compose down

# Stop and remove volumes (clears database)
docker-compose down -v
```

---

## 👥 Team Workflow: How to Commit Changes

### General Git Workflow

```bash
# 1. Make sure you're on your branch
git checkout feature/your-name-feature-description

# 2. Pull latest changes from main
git checkout main
git pull origin main
git checkout feature/your-name-feature-description
git merge main

# 3. Make your changes and test them

# 4. Stage your changes
git add .

# 5. Commit with a descriptive message
git commit -m "feat: add description of your feature"

# 6. Push to your branch
git push origin feature/your-name-feature-description

# 7. Create Pull Request on GitHub
# Go to GitHub and create a PR from your branch to main
```

### Commit Message Convention

Use conventional commits format:

```
feat: add new feature
fix: fix bug description
docs: update documentation
style: code formatting changes
refactor: code refactoring
test: add or update tests
chore: build/config changes
```

**Examples**:
```
feat: add inventory management dashboard
fix: resolve null reference error in admin dashboard
docs: update Docker setup instructions
chore: add CI/CD pipeline configuration
```

---

## 📝 Who Works on What?

### Team Member Responsibilities

| Team Member | Backend Controllers | Frontend Pages | Additional Tasks |
|-------------|-------------------|----------------|------------------|
| **Danidu** | orderController, tableController, waiterController | Waiter Dashboard (Table Allocation, Order Tracking, Delivery) | Docker setup, CI/CD pipeline |
| **Mithila** | customerController, menuController | Customer Pages (Browse Menu, Cart, Orders) | Docker configuration, CI/CD workflows |
| **Sithila** | chefController | Chef Dashboard (Real-time Orders, Kitchen Display) | - |
| **StatMember** | cashierController | Cashier POS (Point of Sale system) | - |
| **Mihan** | inventoryController | Inventory Management | - |
| **Eshini** | managerController | Manager Dashboard (Efficiency Management) | - |
| **Nadeesha** | ownerController | Owner Dashboard (Admin panel) | - |
| **Sadew** | authController | Login, Settings, Employee Management | - |

### Commit Responsibility by Feature

#### Infrastructure & DevOps (Danidu & Mithila)
```bash
# Danidu's commits
git commit -m "chore: add docker-compose configuration"
git commit -m "chore: update server Dockerfile with multi-stage build"
git commit -m "docs: create team collaboration guide"

# Mithila's commits
git commit -m "chore: add GitHub Actions CI/CD pipeline"
git commit -m "chore: configure Docker build workflow"
git commit -m "docs: add deployment documentation"
```

#### Backend API Development
```bash
# Each member commits their assigned controllers
git commit -m "feat(danidu): implement order management API"
git commit -m "feat(mithila): add customer menu browsing endpoints"
git commit -m "feat(sithila): create chef order tracking system"
```

#### Frontend Development
```bash
# Each member commits their assigned pages
git commit -m "feat(danidu): create waiter dashboard with table allocation"
git commit -m "feat(mithila): build customer menu browsing interface"
git commit -m "feat(mihan): develop inventory management UI"
```

---

## 🔀 Branch Strategy

### Main Branches
- `main` - Production-ready code
- `develop` - Integration branch for features

### Feature Branches
Create feature branches from `develop`:

```bash
# Format: feature/{your-name}-{feature-description}
feature/danidu-waiter-dashboard
feature/mithila-customer-menu
feature/sithila-chef-orders
```

### Workflow
1. Create feature branch from `develop`
2. Make changes and commit regularly
3. Push to remote and create Pull Request to `develop`
4. After code review and approval, merge to `develop`
5. Periodically, `develop` is merged to `main` for releases

---

## 🧪 Testing Your Changes

### Before Committing:

1. **Run linters**:
```bash
# Client
cd client && npm run lint

# Server
cd server && npm run lint
```

2. **Test locally**:
- Start the application
- Test your specific feature
- Check console for errors

3. **Run tests** (if available):
```bash
cd server && npm test
```

### CI/CD Automated Checks:
Every push and pull request triggers:
- ✅ Lint checks
- ✅ Build verification
- ✅ Automated tests
- ✅ Security vulnerability scan
- ✅ Docker image build (on main/develop)

---

## 🐛 Common Issues & Solutions

### Issue: MongoDB Connection Failed
**Solution**:
- If using Docker: Make sure MongoDB container is running (`docker-compose ps`)
- If local: Check MongoDB is running and `MONGO_URI` is correct in `.env`

### Issue: Port Already in Use
**Solution**:
```bash
# Find and kill process on port 5000 (server)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port in .env file
SERVER_PORT=5001
```

### Issue: Docker Build Fails
**Solution**:
```bash
# Clear Docker cache and rebuild
docker-compose down -v
docker system prune -a
docker-compose up --build
```

### Issue: npm install fails
**Solution**:
```bash
# Clear npm cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## 📦 Project Structure

```
Restaurant-Management-System/
├── .github/
│   └── workflows/
│       └── ci-cd.yml          # CI/CD pipeline
├── client/                     # React frontend
│   ├── src/
│   │   ├── api/               # API client functions
│   │   ├── components/        # Reusable components
│   │   ├── context/           # React contexts
│   │   ├── pages/             # Page components
│   │   │   ├── waiter/        # Waiter dashboard (Danidu)
│   │   │   ├── customer/      # Customer pages (Mithila)
│   │   │   ├── kitchen/       # Chef dashboard (Sithila)
│   │   │   ├── cashier/       # Cashier POS (StatMember)
│   │   │   ├── inventory/     # Inventory (Mihan)
│   │   │   ├── manager/       # Manager dashboard (Eshini)
│   │   │   └── admin/         # Owner dashboard (Nadeesha)
│   │   └── ...
│   ├── Dockerfile
│   └── package.json
├── server/                     # Express backend
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   ├── models/            # MongoDB schemas
│   │   ├── routes/            # API routes
│   │   └── middleware/        # Auth, error handling
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml          # Multi-container setup
├── .env.example                # Environment template
└── README.md
```

---

## 🎯 Next Steps for Each Team Member

### After Setup:
1. ✅ Clone repository
2. ✅ Create your feature branch
3. ✅ Install dependencies
4. ✅ Start development servers
5. ✅ Review your assigned tasks in `project-seperation.md`
6. ✅ Start coding your assigned features
7. ✅ Commit regularly with descriptive messages
8. ✅ Create Pull Requests when features are complete

### Communication:
- Use GitHub Issues for bug reports and feature requests
- Comment on Pull Requests for code review
- Update project board/Kanban with task status
- Coordinate with team on shared components

---

## 📞 Getting Help

- Check existing documentation in `/docs` folder
- Review code comments in similar features
- Ask team members for guidance
- Create GitHub issues for questions

---

## ✅ Checklist Before Creating Pull Request

- [ ] Code follows project style guidelines
- [ ] All linters pass (`npm run lint`)
- [ ] Features tested locally
- [ ] No console errors or warnings
- [ ] Commit messages are descriptive
- [ ] Branch is up-to-date with develop/main
- [ ] Documentation updated if needed
- [ ] Screenshots/videos added for UI changes

---

**Happy Coding! 🎉**
