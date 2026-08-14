# 10S Analytics Dashboard - Deployment Guide

## Overview

This document covers deploying the 10S Analytics Dashboard to an EC2 instance as a standalone Docker container on the shared `10s-net` bridge network (same network as bot-engine and other services).

## Prerequisites

- EC2 instance with Docker & Docker Compose installed
- AWS credentials configured on EC2 with SSM Parameter Store read access
- RDS instance with `analytics_readonly` role created (see README.md)
- Admin access to AWS Parameter Store

## Step-by-Step Deployment

### 1. On Your Local Machine: Create Secrets in Parameter Store

```bash
# Define variables
ADMIN_HASH='$2b$12$8PNDC08W76xvrYgx1ux4jOWuCxV/aB.3UfvRdb.8r9XoIhN4aUMw2'  # bcrypt hash
JWT_SECRET='generate-long-random-secret-here'
DB_URL='postgresql://analytics_readonly:PASSWORD@db10s-game-v3.cvgyyk8coe1d.ap-southeast-2.rds.amazonaws.com:5432/10s'

# Add to Parameter Store
aws ssm put-parameter \
  --name /10s/analytics/DATABASE_URL \
  --value "$DB_URL" \
  --type SecureString \
  --region ap-southeast-2 \
  --overwrite

aws ssm put-parameter \
  --name /10s/analytics/ADMIN_EMAIL \
  --value "CarpenterLokendra@gmail.com" \
  --type SecureString \
  --region ap-southeast-2 \
  --overwrite

aws ssm put-parameter \
  --name /10s/analytics/ADMIN_PASSWORD_HASH \
  --value "$ADMIN_HASH" \
  --type SecureString \
  --region ap-southeast-2 \
  --overwrite

aws ssm put-parameter \
  --name /10s/analytics/JWT_SECRET \
  --value "$JWT_SECRET" \
  --type SecureString \
  --region ap-southeast-2 \
  --overwrite

# Verify
aws ssm get-parameter --name /10s/analytics/DATABASE_URL --region ap-southeast-2
```

### 2. On RDS: Create Read-Only Role

```bash
# Option A: Using psql locally
psql -h db10s-game-v3.cvgyyk8coe1d.ap-southeast-2.rds.amazonaws.com \
  -U admin \
  -d 10s \
  -f scripts/create_readonly_role.sql

# Option B: SSH into EC2 and run from there
ssh ec2-user@<ec2-host>
psql -h db10s-game-v3.cvgyyk8coe1d.ap-southeast-2.rds.amazonaws.com \
  -U admin \
  -d 10s \
  < /path/to/scripts/create_readonly_role.sql
```

Verify the role:
```sql
SELECT * FROM pg_roles WHERE rolname = 'analytics_readonly';
```

### 3. On EC2: Clone and Deploy

```bash
# SSH into EC2
ssh -i /path/to/key.pem ec2-user@<ec2-host>

# Navigate to projects directory
cd ~/10S

# Clone the analytics repo
git clone https://github.com/CarpenterLokendra/10S-KPI.git
cd 10S-KPI

# Verify shared network exists (created by bot-engine setup)
docker network ls | grep 10s-net
# If not present, create it:
# docker network create --driver bridge 10s-net

# Start the service in background
docker-compose up -d

# Check logs
docker-compose logs -f analytics

# Verify health
curl http://localhost:8002/health
```

### 4. Verify Deployment

```bash
# On EC2
docker ps | grep 10s-analytics

# Check network connectivity
docker network inspect 10s-net

# Test database connection
docker-compose exec analytics python -c "
from src.database import check_health
print('DB OK' if check_health() else 'DB Failed')
"
```

### 5. Access Dashboard

**From your local machine:**

```bash
# Create SSH tunnel
ssh -L 8002:localhost:8002 -i /path/to/key.pem ec2-user@<ec2-host>

# In another terminal, open browser
# http://localhost:8002/login
# Email: CarpenterLokendra@gmail.com
# Password: LcKsAc@2024
```

## Operations

### Start/Stop Service

```bash
# SSH into EC2
ssh -i /path/to/key.pem ec2-user@<ec2-host>
cd ~/10S/10S-KPI

# Start
docker-compose up -d

# Stop
docker-compose down

# Restart
docker-compose restart analytics

# View logs
docker-compose logs -f analytics --tail 50
```

### Update Service

```bash
cd ~/10S/10S-KPI

# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose up -d --build
```

### Monitor Health

```bash
# Quick health check
curl http://localhost:8002/health

# Full container status
docker-compose ps

# Resource usage
docker stats 10s-analytics

# Service logs
docker-compose logs analytics | tail -100
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs analytics

# Common issues:
# 1. Port 8002 already in use
docker ps | grep 8002

# 2. Network doesn't exist
docker network ls

# 3. Environment variables not set
docker-compose config

# 4. Database connection failed
# - Check RDS security group allows port 5432 from EC2
# - Verify analytics_readonly role exists and has permissions
# - Test manually:
# psql postgresql://analytics_readonly:password@db-host:5432/10s
```

### Login fails

```bash
# Verify credentials in Parameter Store
aws ssm get-parameter --name /10s/analytics/ADMIN_PASSWORD_HASH \
  --with-decryption --region ap-southeast-2

# Test password hash locally
python3 -c "
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
stored_hash = '<copy-from-parameter-store>'
result = pwd_context.verify('LcKsAc@2024', stored_hash)
print('Hash OK' if result else 'Hash Mismatch')
"
```

### Dashboard loads but shows no data

```bash
# Check database connectivity
docker-compose exec analytics python -c "
from src.database import SessionLocal
from sqlalchemy import text
db = SessionLocal()
result = db.execute(text('SELECT COUNT(*) FROM \"10s_schema\".users')).scalar()
print(f'Users in DB: {result}')
"

# Check API endpoint
curl -H "Authorization: Bearer <token>" http://localhost:8002/api/kpi/acquisition/total-signups

# View browser developer tools for errors
```

## Monitoring & Maintenance

### Automated Health Checks

The container includes a Docker HEALTHCHECK that runs every 30 seconds. View status:

```bash
docker ps --format "table {{.Names}}\t{{.Status}}"
```

### Log Rotation

Logs are rotated automatically:
- Max size: 10MB per file
- Max files: 3
- Configure in `docker-compose.yml` under `logging.options`

### Database Backups

The analytics service only reads from RDS, so no backup is needed for the analytics container itself. Ensure the main RDS instance has automated backups enabled.

## Security Checklist

- [ ] All secrets stored in Parameter Store with encryption
- [ ] No plaintext passwords in `.env.analytics` (on local dev only, gitignored)
- [ ] SSH tunnel only (port 8002 not exposed to internet)
- [ ] Database role is read-only (SELECT only on specific tables)
- [ ] EC2 security group restricts access to RDS from app instances only
- [ ] Container runs as non-root user (base image: python:3.11-slim)
- [ ] SSL/TLS for production (add reverse proxy if needed)

## Network Configuration

The analytics service runs on the `10s-net` bridge network alongside other services:

```
10s-net (bridge)
├── 10s-bot-engine (port 8001:127.0.0.1)
├── 10s-backend (port 8000:127.0.0.1)
├── 10s-analytics (port 8002:127.0.0.1) ← This service
└── 10s-frontend-builder (ephemeral, S3 deployment)
```

Each service can communicate internally via container name:
```bash
# From within another container
curl http://10s-analytics:8002/health
```

## Rollback Plan

```bash
# If deployment fails
cd ~/10S/10S-KPI

# Stop current version
docker-compose down

# Checkout previous version
git checkout HEAD~1

# Redeploy
docker-compose up -d
```

## Next Steps

1. Verify dashboard works with real game data
2. Set up automated health monitoring/alerts
3. Consider adding email digest reports
4. Plan for scaling to multiple read replicas if analytics queries slow down
