# Docker Quick Start Guide

TL;DR - Get the app running in 3 steps.

---

## 30-Second Setup

```bash
# Step 1: Navigate to App directory
cd App

# Step 2: Copy dev environment file
cp .env.docker.dev .env

# Step 3: Start everything
docker-compose up --build
```

**Done!** 🎉

- Frontend: http://localhost
- Backend API: http://localhost:8000/docs
- Database: localhost:5432

Press `Ctrl+C` to stop.

---

## Essential Commands

```bash
# Start (background)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down

# Restart
docker-compose restart

# See what's running
docker-compose ps
```

---

## Common Tasks

### Rebuild After Code Changes
```bash
docker-compose up --build
```

### Run Tests
```bash
docker-compose exec backend python -m pytest
```

### Access Database
```bash
docker-compose exec db psql -U postgres
```

### Backend Shell
```bash
docker-compose exec backend /bin/bash
```

### View Logs (Specific Service)
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Reset Everything (WARNING: Deletes Database!)
```bash
docker-compose down -v
docker-compose up --build
```

---

## Ports

| Service | Port | URL |
|---------|------|-----|
| Frontend (Nginx) | 80 | http://localhost |
| Backend (FastAPI) | 8000 | http://localhost:8000 |
| Database (PostgreSQL) | 5432 | localhost:5432 |
| API Docs | 8000 | http://localhost:8000/docs |

---

## Troubleshooting

**Port already in use?**
```bash
# Kill process on port (e.g., 8000)
lsof -i :8000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Or use different ports in .env
```

**Can't connect to database?**
```bash
docker-compose logs db
docker-compose exec db pg_isready -U postgres
```

**Frontend showing errors?**
```bash
docker-compose logs frontend
# Check VITE_API_URL in .env is correct
```

**Want to delete all containers and start fresh?**
```bash
docker-compose down -v
docker-compose up --build
```

---

## Next Steps

- Read [DOCKER.md](./DOCKER.md) for complete guide
- Check logs: `docker-compose logs -f`
- Access API docs: http://localhost:8000/docs
- Deploy: See "Production Deployment" in DOCKER.md

---

**Happy coding!** 🚀
