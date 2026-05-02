# Docker Setup Guide - 10S Card Game

Complete guide for building, running, and deploying the 10S card game using Docker.

---

## Architecture Overview

```
Docker Compose Setup:
┌─────────────────────────────────────────────────────┐
│              Docker Host / Network                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │  Frontend    │  │   Backend    │  │Database  │ │
│  │  (Nginx)     │  │  (FastAPI)   │  │(Postgres)│ │
│  │              │  │              │  │          │ │
│  │ Port 80      │  │ Port 8000    │  │ Port    │ │
│  │              │  │              │  │ 5432    │ │
│  └──────────────┘  └──────────────┘  └──────────┘ │
│       ↓                  ↓                ↑        │
│    Browser     REST API + WebSocket      │        │
│                                          │        │
│              (All connected via          │        │
│              10s_network bridge)         │        │
└─────────────────────────────────────────────────────┘
```

---

## Prerequisites

- **Docker**: v20.10+ ([Install](https://docs.docker.com/get-docker/))
- **Docker Compose**: v2.0+ (usually included with Docker Desktop)
- **Git**: For cloning the repository

Verify installation:
```bash
docker --version
docker-compose --version
```

---

## Quick Start (Development)

### 1. Clone and Navigate
```bash
cd /Users/lokendracarpenter/Documents/Projects/10S/App
```

### 2. Create Environment File
```bash
cp .env.docker.dev .env
```

### 3. Build and Run
```bash
docker-compose up --build
```

This will:
- ✅ Build the backend image
- ✅ Build the frontend image
- ✅ Start PostgreSQL database
- ✅ Start FastAPI backend (port 8000)
- ✅ Start Nginx frontend (port 80)
- ✅ Initialize the database automatically

### 4. Access the Application
- **Frontend**: http://localhost
- **API Docs**: http://localhost:8000/docs
- **Database**: localhost:5432

---

## Commands Reference

### Build Images
```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend

# Build without cache
docker-compose build --no-cache
```

### Run Services
```bash
# Start services (foreground)
docker-compose up

# Start services (background/detached)
docker-compose up -d

# Start with automatic rebuild
docker-compose up --build

# Restart services
docker-compose restart

# Stop services
docker-compose down

# Stop and remove volumes (WARNING: deletes database!)
docker-compose down -v

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Interact with Containers
```bash
# Execute command in container
docker-compose exec backend python -m pytest

# Open shell in container
docker-compose exec backend /bin/bash
docker-compose exec frontend /bin/sh
docker-compose exec db psql -U postgres

# View container status
docker-compose ps

# Inspect container
docker inspect 10s_backend
```

---

## Configuration Files

### `.env.docker.dev` (Development)
Local development configuration with:
- Relaxed security (default JWT secret)
- Reload enabled
- Debug logging
- Wildcard CORS

**Setup**:
```bash
cp .env.docker.dev .env
```

### `.env.docker.prod` (Production)
Production configuration with:
- Strong security requirements
- Auto-reload disabled
- INFO logging
- Strict CORS

**Setup**:
```bash
cp .env.docker.prod .env
# Edit .env with real secrets and domain
```

---

## File Structure

```
App/
├── docker-compose.yml          # Service orchestration
├── .env.docker.dev             # Dev environment template
├── .env.docker.prod            # Prod environment template
├── DOCKER.md                   # This file
│
├── backend/
│   ├── Dockerfile              # Python 3.12 + FastAPI
│   ├── .dockerignore           # Build context exclusions
│   ├── src/
│   │   ├── main.py
│   │   ├── requirements.txt
│   │   ├── config.py
│   │   └── ...
│   └── logs/                   # Mounted volume
│
└── frontend/
    ├── Dockerfile              # Node 20 + Nginx
    ├── .dockerignore           # Build context exclusions
    ├── nginx.conf              # Nginx configuration
    ├── src/
    ├── package.json
    └── public/
```

---

## Dockerfiles Explained

### Backend Dockerfile
```dockerfile
FROM python:3.12-slim          # Lightweight Python image

# Install system dependencies
RUN apt-get install -y gcc postgresql-client

# Copy requirements and install
COPY src/requirements.txt .
RUN pip install -r requirements.txt

# Copy application
COPY src/ .

# Expose API port
EXPOSE 8000

# Health check
HEALTHCHECK ...

# Run FastAPI with uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Why this approach:**
- `python:3.12-slim`: Minimal image (~150MB vs 1GB)
- Single stage: Simpler for FastAPI (no build step)
- Health check: Docker monitors application health
- Uvicorn: Production-grade ASGI server

### Frontend Dockerfile
```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Why this approach:**
- Multi-stage: Build artifacts aren't included in final image
- `node:20-alpine`: Minimal Node image for build
- `nginx:alpine`: Minimal Nginx for serving (~50MB total)
- `npm ci`: Exact dependency versions (better than npm install)
- Result: ~100MB final image vs 1.5GB with full build tools

---

## Docker Compose Configuration

### Services

#### Database (PostgreSQL)
```yaml
db:
  image: postgres:16-alpine
  environment:
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: postgres
    POSTGRES_DB: postgres
  volumes:
    - postgres_data:/var/lib/postgresql/data
  healthcheck: # Waits for DB to be ready
    test: ["CMD-SHELL", "pg_isready -U postgres"]
```

**Key points:**
- Volume persists data between restarts
- Health check ensures availability before other services start
- Alpine image: ~40MB vs 300MB (postgres:latest)

#### Backend (FastAPI)
```yaml
backend:
  build: ./backend
  environment:
    DATABASE_URL: postgresql://...  # Connects to db service
    ALLOWED_ORIGINS: ...
  ports:
    - "8000:8000"
  depends_on:
    db:
      condition: service_healthy  # Waits for DB to be ready
  volumes:
    - ./backend/logs:/app/logs  # Persist logs
```

**Key points:**
- Builds from `./backend/Dockerfile`
- Environment variables injected from `.env`
- Waits for database health check before starting
- Logs volume: Check container logs even if it crashes

#### Frontend (Nginx)
```yaml
frontend:
  build: ./frontend
  ports:
    - "80:80"
  depends_on:
    - backend
```

**Key points:**
- Builds from `./frontend/Dockerfile` (includes multi-stage build)
- Nginx serves React app and proxies API calls
- Port 80: Standard HTTP

### Networking

```yaml
networks:
  10s_network:
    driver: bridge
```

**How it works:**
- All services connected to `10s_network` bridge
- Services communicate by hostname: `http://backend:8000`, `postgresql://db:5432`
- External access only through exposed ports (80, 8000, 5432)

### Volumes

```yaml
volumes:
  postgres_data:
    driver: local
```

**Persists data between container restarts:**
```bash
docker-compose down  # Stops containers (data persists)
docker-compose up    # Restarts with same database state

docker-compose down -v  # Removes volumes (deletes database!)
```

---

## Nginx Configuration

Frontend container includes Nginx with custom config (`nginx.conf`):

### Static File Serving
```nginx
root /usr/share/nginx/html;

location / {
    try_files $uri $uri/ /index.html;  # SPA routing
}
```
- Serves React build files from `/app/dist`
- Redirects all routes to `index.html` (client-side routing)

### API Proxy
```nginx
location /api/ {
    proxy_pass http://backend:8000;  # Forward to backend service
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```
- Frontend requests to `/api/*` forwarded to backend
- Headers preserved for logging and security

### WebSocket Proxy
```nginx
location /ws/ {
    proxy_pass http://backend:8000;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_read_timeout 7d;  # Long-lived connections
}
```
- WebSocket connections forwarded to backend
- Special headers for protocol upgrade
- Long timeout for persistent connections

### Caching
```nginx
# Cache static assets 1 year
location ~* ^.+\.(js|css|png|jpg|...)$ {
    expires 365d;
    add_header Cache-Control "public, immutable";
}

# Don't cache HTML
location ~* ^.+\.html$ {
    expires -1;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}
```

### Security Headers
```nginx
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
```

---

## Common Tasks

### Database Management

#### Access Database Shell
```bash
docker-compose exec db psql -U postgres
```

#### Create Backup
```bash
docker-compose exec db pg_dump -U postgres postgres > backup.sql
```

#### Restore from Backup
```bash
docker-compose exec -T db psql -U postgres < backup.sql
```

#### Reset Database (WARNING: Deletes all data!)
```bash
docker-compose down -v
docker-compose up --build
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service (last 100 lines)
docker-compose logs -f --tail=100 backend

# Frontend logs
docker-compose logs -f frontend

# Real-time with timestamps
docker-compose logs -f --timestamps
```

### Testing

```bash
# Run backend tests
docker-compose exec backend python -m pytest

# Run tests with coverage
docker-compose exec backend python -m pytest --cov

# Run specific test file
docker-compose exec backend python -m pytest src/tests/test_auth.py
```

### Debugging

```bash
# Inspect container
docker-compose exec backend /bin/bash

# Check environment variables
docker-compose exec backend env

# View application logs
docker-compose logs backend

# Check container resource usage
docker stats

# Inspect network
docker network inspect app_10s_network
```

---

## Production Deployment

### Pre-deployment Checklist

- [ ] `.env` file with production secrets (NOT in git)
- [ ] `JWT_SECRET_KEY` changed from default
- [ ] `DATABASE_URL` points to managed database (e.g., AWS RDS)
- [ ] `ALLOWED_ORIGINS` set to your domain
- [ ] `ENVIRONMENT=production`
- [ ] `SERVER_RELOAD=false`
- [ ] HTTPS/TLS configured (reverse proxy like CloudFlare)
- [ ] Health checks passing
- [ ] Tests passing locally

### Build Production Images

```bash
# Build optimized images
docker-compose -f docker-compose.yml build

# Tag for registry (e.g., Docker Hub)
docker tag 10s_backend your-registry/10s-backend:1.0.0
docker tag 10s_frontend your-registry/10s-frontend:1.0.0

# Push to registry
docker push your-registry/10s-backend:1.0.0
docker push your-registry/10s-frontend:1.0.0
```

### Deploy to Cloud

#### AWS ECS
```bash
# Push to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin <account>.dkr.ecr.<region>.amazonaws.com

docker tag 10s_backend <account>.dkr.ecr.<region>.amazonaws.com/10s-backend:latest
docker push <account>.dkr.ecr.<region>.amazonaws.com/10s-backend:latest

# Create ECS task definition, service, cluster
# (Use AWS Console or infrastructure-as-code like Terraform)
```

#### Google Cloud Run
```bash
# Configure
gcloud auth configure-docker

# Build and push
docker tag 10s_backend gcr.io/your-project/10s-backend
docker push gcr.io/your-project/10s-backend

# Deploy
gcloud run deploy 10s-backend --image gcr.io/your-project/10s-backend
```

#### Docker Swarm
```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml 10s
```

#### Kubernetes
```bash
# Use docker-compose to Kubernetes converter
kompose convert -f docker-compose.yml -o k8s/

# Or write Kubernetes manifests manually
# See: kubernetes/ directory for examples

# Deploy
kubectl apply -f k8s/
```

---

## Troubleshooting

### Container Won't Start

```bash
# View full logs
docker-compose logs backend

# Check if port is in use
lsof -i :8000
lsof -i :80

# Kill process using port
kill -9 <PID>
```

### Database Connection Failed

```bash
# Check database is running
docker-compose ps db

# Test connection
docker-compose exec db pg_isready -U postgres

# Check DATABASE_URL in .env
cat .env | grep DATABASE_URL
```

### Frontend Shows API Errors

```bash
# Check VITE_API_URL
docker-compose logs frontend

# Test API connectivity
docker-compose exec frontend wget -O- http://backend:8000/docs

# Check Nginx config
docker-compose exec frontend cat /etc/nginx/conf.d/default.conf
```

### Out of Disk Space

```bash
# Clean up Docker
docker system prune -a  # Remove unused images/containers

# Remove volumes
docker volume prune

# Check disk usage
docker system df
```

---

## Performance Tips

### Development
- Use `--build` sparingly (rebuilds even unchanged services)
- Use `docker-compose up -d` to run in background
- Mount source code as volume for hot reload (optional)

### Production
- Use Alpine images (smaller, faster)
- Enable Gzip compression in Nginx ✅
- Use health checks ✅
- Set resource limits:
  ```yaml
  deploy:
    resources:
      limits:
        cpus: '1'
        memory: 512M
      reservations:
        cpus: '0.5'
        memory: 256M
  ```
- Use named volumes (better performance than bind mounts)

---

## Security Best Practices

✅ **Implemented:**
- Multi-stage build (no build tools in final image)
- Alpine images (smaller attack surface)
- Non-root user possible in Python/Nginx
- Security headers in Nginx
- CORS configuration
- Health checks

⚠️ **To Add:**
- Run containers as non-root:
  ```dockerfile
  RUN useradd -m -u 1000 appuser
  USER appuser
  ```
- Read-only file systems (advanced)
- Secrets management (Vault, AWS Secrets Manager)
- Network policies
- Image scanning (Trivy, Snyk)

---

## References

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Specification](https://github.com/compose-spec/compose-spec/blob/master/README.md)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/docker/)
- [React in Docker Best Practices](https://www.docker.com/blog/containerized-react-frontend-development/)

---

**Last Updated**: 2026-05-02  
**Version**: 1.0.0
