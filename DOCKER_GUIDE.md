# 🐳 Docker Setup Quick Reference

## Quick Start Commands

### Start Everything
```bash
# Build and start all services (MongoDB + Server + Client)
docker-compose up --build

# Start in background (detached mode)
docker-compose up -d

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f server
docker-compose logs -f client
```

### Stop Services
```bash
# Stop all containers
docker-compose down

# Stop and remove volumes (⚠️ This deletes database data)
docker-compose down -v
```

### Rebuild After Code Changes
```bash
# Rebuild and restart
docker-compose up --build

# Rebuild specific service
docker-compose build server
docker-compose build client
docker-compose up -d
```

---

## Services Overview

| Service | Port | URL | Description |
|---------|------|-----|-------------|
| MongoDB | 27017 | mongodb://localhost:27017 | Database |
| Server | 5000 | http://localhost:5000 | Backend API |
| Client | 3000 | http://localhost:3000 | Frontend App |

---

## Environment Variables

Copy `.env.example` to `.env` and customize:

```bash
cp .env.example .env
```

### Key Variables:
- `MONGO_ROOT_USERNAME` - MongoDB admin username
- `MONGO_ROOT_PASSWORD` - MongoDB admin password
- `JWT_SECRET` - Secret key for JWT tokens (change in production!)
- `SERVER_PORT` - Backend server port (default: 5000)
- `CLIENT_PORT` - Frontend app port (default: 3000)

---

## Useful Docker Commands

### View Running Containers
```bash
docker-compose ps
```

### Access Container Shell
```bash
# Access server container
docker-compose exec server sh

# Access MongoDB container
docker-compose exec mongodb mongosh admin -u admin -p password123
```

### View Resource Usage
```bash
docker-compose top
```

### Remove Everything (Clean Slate)
```bash
docker-compose down -v
docker system prune -a
```

---

## Troubleshooting

### Container Won't Start
```bash
# Check logs
docker-compose logs service-name

# Rebuild from scratch
docker-compose down -v
docker-compose up --build
```

### Port Already in Use
Edit `.env` and change the port:
```
SERVER_PORT=5001
CLIENT_PORT=3001
```

### Database Connection Issues
Make sure MongoDB is healthy:
```bash
docker-compose ps
# mongodb should show "healthy"
```

---

## Development Tips

### Hot Reload
Both server and client support hot reload in Docker:
- Server: Uses nodemon
- Client: Vite dev server

### Volume Mounts
Code changes are reflected immediately (no rebuild needed for development).

### Production Build
For production, Docker uses multi-stage builds:
- Smaller image sizes
- Only production dependencies
- Optimized builds

---

## Team Members: Danidu & Mithila

This Docker setup is maintained by Danidu and Mithila. For questions or improvements, contact them or create a GitHub issue.

**Commit Responsibilities**:
- **Danidu**: docker-compose.yml, server Dockerfile tweaks
- **Mithila**: CI/CD Docker builds, deployment configs
