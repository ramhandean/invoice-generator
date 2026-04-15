# 🐳 Docker Setup & Deployment Guide

This guide explains how to run the entire **Multi-Step Invoice Generator** system (Backend, Frontend, and Database) using Docker and Docker Compose.

## Prerequisites

- **Docker** (v20.10+)
- **Docker Compose** (v1.29+)

If you don't have them installed, visit:
- [Install Docker](https://docs.docker.com/get-docker/)
- [Install Docker Compose](https://docs.docker.com/compose/install/)

## Quick Start (One Command!)

```bash
cd /home/dean/Documents/project/invoice-generator
docker-compose up
```

That's it! The entire system will:
1. ✅ Start PostgreSQL (with auto-initialization)
2. ✅ Run Go Backend (auto-migration + seeder)
3. ✅ Run Next.js Frontend
4. ✅ Wait for all services to be healthy

## What Happens When You Run `docker-compose up`

```
PostgreSQL starts
    ↓
Wait for DB to be ready (healthy)
    ↓
Backend starts (auto-migrate, auto-seed)
    ↓
Wait for Backend to be healthy
    ↓
Frontend starts
    ↓
Everything is ready!
```

### Access the Application

| Service | URL | Details |
|---------|-----|---------|
| Frontend | [http://localhost:3000](http://localhost:3000) | Main application UI |
| Backend API | [http://localhost:8080/api](http://localhost:8080/api) | Backend API base URL |
| PostgreSQL | `localhost:5432` | Database connection |

## 🔐 Default Credentials

### Frontend Login (Demo Users)

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | Admin (full payload) |
| `kerani` | `kerani123` | Kerani (prices stripped) |

### Database

| Setting | Value |
|---------|-------|
| Username | `postgres` |
| Password | `postgres` |
| Database | `invoice_generator` |
| Host | `postgres` (inside Docker) / `localhost` (from host) |
| Port | `5432` |

## Configuration

### Environment Variables

Create or modify `.env` file in the root directory to override defaults:

```env
# Database
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=invoice_generator

# Backend
SERVER_PORT=8080
JWT_SECRET=your-secret-key-here
WEBHOOK_URL=http://localhost:9000/webhook

# Frontend
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

**Note**: If `.env` doesn't exist, Docker Compose will use defaults from `.env.docker`.

### Custom Configuration

To use custom environment variables:

```bash
# Set environment variable before running docker-compose
export DB_PASSWORD=my-secure-password
docker-compose up

# Or override in .env file (recommended)
echo "DB_PASSWORD=my-secure-password" > .env
docker-compose up
```

## Common Commands

### Start All Services

```bash
docker-compose up
```

### Start in Background

```bash
docker-compose up -d
```

### Stop All Services

```bash
docker-compose down
```

### Stop and Remove Volumes (Clean Slate)

```bash
docker-compose down -v
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Check Service Status

```bash
docker-compose ps
```

Example output:
```
NAME                        STATUS              PORTS
invoice_generator_db        Up (healthy)        5432/tcp
invoice_generator_backend   Up (healthy)        0.0.0.0:8080->8080/tcp
invoice_generator_frontend  Up (healthy)        0.0.0.0:3000->3000/tcp
```

### Restart a Service

```bash
docker-compose restart backend
docker-compose restart frontend
```

### View Database (Optional)

If you want to access the database directly:

```bash
# Using psql from Docker
docker-compose exec postgres psql -U postgres -d invoice_generator

# List tables
\dt

# View items
SELECT * FROM items;

# Exit
\q
```

## 🔍 Troubleshooting

### "Port already in use"

If port 3000 or 8080 is already in use:

```bash
# Change port mapping in docker-compose.yml
# Example: Change frontend port to 3001
ports:
  - "3001:3000"  # Access at http://localhost:3001
```

Or kill the process using the port:

```bash
# Find process using port 3000
lsof -i :3000

# Kill it
kill -9 <PID>
```

### "Backend cannot connect to database"

If the backend fails to connect:

1. Check if postgres is running:
   ```bash
   docker-compose ps postgres
   ```

2. Check postgres logs:
   ```bash
   docker-compose logs postgres
   ```

3. Ensure database credentials match in docker-compose.yml and backend .env

4. Rebuild and restart:
   ```bash
   docker-compose down
   docker-compose up --build
   ```

### "Frontend shows API connection errors"

1. Check if backend is running:
   ```bash
   docker-compose ps backend
   ```

2. Check backend logs:
   ```bash
   docker-compose logs backend
   ```

3. Verify `NEXT_PUBLIC_API_BASE_URL` in .env:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
   ```

4. Restart frontend:
   ```bash
   docker-compose restart frontend
   ```

### "Hydration errors" in frontend console

This is expected on first load. The frontend uses Zustand with client-side hydration. Simply refresh the page:

```
F5 or Ctrl+R
```

### Services won't start after system restart

Try rebuilding the images:

```bash
docker-compose down
docker-compose up --build
```

## 📊 Service Health Checks

Each service includes health checks. View health status:

```bash
docker-compose ps
```

Health check details:

| Service | Check | Interval | Timeout | Retries |
|---------|-------|----------|---------|---------|
| PostgreSQL | `pg_isready` | 10s | 5s | 5 |
| Backend | `curl /api/items` | 30s | 10s | 3 |
| Frontend | `curl /` | 30s | 10s | 3 |

### Manual Health Check

```bash
# Check if backend is healthy
curl -f http://localhost:8080/api/items?code=ITEM

# Check if frontend is running
curl -f http://localhost:3000

# Check if database is ready
docker-compose exec postgres pg_isready
```

## 🏗️ Docker Images

### Backend Image

- **Base**: `golang:1.25-alpine` (builder) → `alpine:latest` (runtime)
- **Size**: ~50-60MB (multi-stage optimization)
- **Features**: Health checks, signal handling
- **Files**: `backend/Dockerfile`

### Frontend Image

- **Base**: `node:18-alpine` (builder) → `node:18-alpine` (runtime)
- **Size**: ~300-400MB
- **Features**: Production build, dumb-init for signals, health checks
- **Files**: `frontend/Dockerfile`

### Database Image

- **Base**: `postgres:15-alpine`
- **Size**: ~80-100MB
- **Features**: Health checks, persistent volume

## 📁 Docker Volumes

Persistent data is stored in Docker volumes:

```bash
# List volumes
docker volume ls

# Inspect postgres volume
docker volume inspect invoice_generator_postgres_data
```

To backup the database:

```bash
docker-compose exec postgres pg_dump -U postgres invoice_generator > backup.sql
```

To restore:

```bash
cat backup.sql | docker-compose exec -T postgres psql -U postgres invoice_generator
```

## 🚀 Production Considerations

### Security

1. **Change default passwords** in `.env`:
   ```env
   DB_PASSWORD=strong-random-password-here
   JWT_SECRET=strong-random-secret-here
   ```

2. **Use environment variables**, don't commit `.env` to git:
   ```bash
   echo ".env" >> .gitignore
   ```

3. **Use secrets management** (Docker Secrets, Kubernetes, etc.) for production

### Performance

1. **Limit resource usage**:
   ```yaml
   services:
     backend:
       deploy:
         resources:
           limits:
             cpus: '1'
             memory: 512M
   ```

2. **Use separate database volumes** for large deployments

3. **Add reverse proxy** (Nginx, Traefik) for production

### Monitoring

1. **Log aggregation** (ELK Stack, Splunk, etc.)
2. **Container monitoring** (Prometheus, Grafana)
3. **Uptime monitoring** (health checks + alerting)

## 📚 Further Reading

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres/)
- [Node.js Docker Image](https://hub.docker.com/_/node/)
- [Go Docker Image](https://hub.docker.com/_/golang/)

## 🆘 Support

For issues or questions:

1. Check logs: `docker-compose logs -f`
2. Review this guide
3. Check individual service README files
4. Review source code comments

---

**Happy Invoicing!** 🎉

Ready to start? Just run:
```bash
docker-compose up
```
