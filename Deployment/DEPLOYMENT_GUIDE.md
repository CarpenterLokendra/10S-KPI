# 10S Card Game - Deployment Guide

## Architecture Overview

- **Backend**: FastAPI service running on port 8000
- **Bot Engine**: FastAPI service running on port 8001
- **Database**: AWS RDS PostgreSQL (db-10s-game)
- **Container Registry**: Amazon ECR (ap-southeast-2)
- **Secret Management**: AWS Parameter Store
- **Deployment Target**: EC2 instance with Docker & Docker Compose

## Repositories

| Service | Location | GitHub |
|---------|----------|--------|
| Backend | `/10S-backend` | `CarpenterLokendra/10S-backend` |
| Bot Engine | `/10S-bot-engine` | `CarpenterLokendra/10S-bot-engine` |

## Secret Management

### AWS Parameter Store (ap-southeast-2)
```
/10s/backend/JWT_SECRET_KEY              → SecureString
/10s/backend/DATABASE_URL                → SecureString
/10s/backend/ALLOWED_ORIGINS             → String
/10s/bot-engine/BOT_ENGINE_API_KEY       → SecureString
```

**Note:** Secrets are fetched at runtime by `entrypoint.sh`. Never committed to git.

## EC2 Setup

### IAM Role: `10s-backend-ec2-role`
**Policies Required:**
- `AmazonEC2ContainerRegistryPowerUser` (or custom ECR policy)
- `AmazonSSMReadOnlyAccess` (for Parameter Store)

### Cloned Repositories
```bash
/home/ec2-user/10S-bot-engine
/home/ec2-user/10S-backend
```

## Deployment Process

### Prerequisites
- AWS CLI configured on EC2
- Docker & Docker Compose installed
- IAM role with ECR + Parameter Store permissions

### One-Command Deployment

```bash
cd /home/ec2-user/10S-bot-engine
./deploy.sh
```

### What deploy.sh Does
1. Fetches 4 secrets from Parameter Store
2. Creates `.env.bot-engine` and `.env.backend`
3. Stops old containers
4. Builds both Docker images
5. Starts containers with docker-compose
6. Verifies health endpoints
7. Logs into ECR
8. Pushes both images to ECR with `latest` + timestamp tags
9. Displays completion summary

### Deploy Output

```
✅ Secrets fetched
✅ Environment files created
✅ Images built
✅ Containers started (healthy)
✅ Endpoints verified
✅ Images pushed to ECR
```

## Container Management

### View Running Containers
```bash
docker ps
docker-compose -f /home/ec2-user/10S-bot-engine/docker-compose.dev.yml ps
```

### View Logs
```bash
docker logs 10s-bot-engine
docker logs 10s-backend
docker-compose -f docker-compose.dev.yml logs -f
```

### Stop Services
```bash
cd /home/ec2-user/10S-bot-engine
docker-compose -f docker-compose.dev.yml down
```

### Manual Restart (if needed)
```bash
docker-compose -f docker-compose.dev.yml up -d
```

## Health Checks

### Endpoints
```bash
# Backend
curl http://localhost:8000/api/v1/admin/health

# Bot Engine
BOT_API_KEY=$(cat /home/ec2-user/10S-bot-engine/.env.bot-engine | grep BOT_ENGINE_API_KEY | cut -d= -f2)
curl http://localhost:8001/health -H "X-API-Key: $BOT_API_KEY"
```

### Expected Response
```json
Backend:    {"status":"healthy","database":"connected","environment":"development"}
Bot Engine: {"status":"healthy","version":"1.0.0","workers_available":4}
```

## ECR Registry

### AWS Account
```
Account ID: 891377337813
Region: ap-southeast-2
Registry URI: 891377337813.dkr.ecr.ap-southeast-2.amazonaws.com
```

### Repositories
```
10s-bot-engine     (latest + YYYYMMDD-HHMMSS tags)
10s-backend        (latest + YYYYMMDD-HHMMSS tags)
```

### View Images in AWS Console
```
https://ap-southeast-2.console.aws.amazon.com/ecr/repositories
```

### Pull Image Locally
```bash
aws ecr get-login-password --region ap-southeast-2 | \
  docker login --username AWS --password-stdin 891377337813.dkr.ecr.ap-southeast-2.amazonaws.com

docker pull 891377337813.dkr.ecr.ap-southeast-2.amazonaws.com/10s-bot-engine:latest
```

## Files Reference

### Configuration Files (in repos)
```
Dockerfile                    → Container image definition
docker-compose.dev.yml       → Service orchestration
entrypoint.sh                → Secret fetching + app startup
.env.bot-engine.example      → Template (committed to git)
.env.backend.example         → Template (committed to git)
DEPLOYMENT.md                → Detailed deployment guide
```

### Local Files (on EC2, gitignored)
```
/home/ec2-user/10S-bot-engine/.env.bot-engine      → Runtime secrets
/home/ec2-user/10S-backend/.env.backend            → Runtime secrets
```

## Workflow: Code to Production

### 1. Make Code Changes (Local)
```bash
git commit -m "your message"
git push
```

### 2. Deploy to EC2
```bash
cd /home/ec2-user/10S-bot-engine
git pull
./deploy.sh
```

### 3. Verify Deployment
```bash
docker ps
curl http://localhost:8000/api/v1/admin/health
curl http://localhost:8001/health -H "X-API-Key: $(cat /home/ec2-user/10S-bot-engine/.env.bot-engine | grep BOT_ENGINE_API_KEY | cut -d= -f2)"
```

## Troubleshooting

### Images Won't Push to ECR
**Error:** `HTTP 403` during push
- **Fix:** Verify IAM role has `ecr:PutImage`, `ecr:CompleteLayerUpload` permissions
- **Check:** `aws iam get-role-policy --role-name 10s-backend-ec2-role --policy-name AmazonEC2ContainerRegistryPowerUser`

### Container Unhealthy
**Error:** `(unhealthy)` in docker ps
```bash
docker logs 10s-bot-engine
docker logs 10s-backend
```
- **Common:** Secrets not loaded, check Parameter Store values
- **Check:** `cat /home/ec2-user/10S-bot-engine/.env.bot-engine`

### Health Endpoint Returns 503
**Cause:** Database connection failed
- **Check:** `curl http://localhost:8000/api/v1/admin/health -v`
- **Verify:** DATABASE_URL in Parameter Store is correct

### Containers Crash on Start
```bash
docker-compose -f docker-compose.dev.yml logs
# Check for import errors, missing dependencies, or failed secret fetch
```

## Quick Reference Commands

```bash
# Deploy
cd /home/ec2-user/10S-bot-engine && ./deploy.sh

# Check status
docker ps
docker-compose -f docker-compose.dev.yml ps

# View logs
docker logs 10s-bot-engine | tail -50
docker logs 10s-backend | tail -50

# Test endpoints
curl http://localhost:8000/api/v1/admin/health
curl http://localhost:8001/health -H "X-API-Key: $(cat /home/ec2-user/10S-bot-engine/.env.bot-engine | grep BOT_ENGINE_API_KEY | cut -d= -f2)"

# Stop services
docker-compose -f docker-compose.dev.yml down

# View ECR images
aws ecr describe-images --repository-name 10s-bot-engine --region ap-southeast-2
aws ecr describe-images --repository-name 10s-backend --region ap-southeast-2

# Restart specific container
docker-compose -f docker-compose.dev.yml restart 10s-bot-engine
```

## Security Notes

- ✅ Secrets never in git (Parameter Store only)
- ✅ `.env` files gitignored (created at runtime)
- ✅ ECR repositories private (IAM controlled)
- ✅ Entrypoint scripts public (no secrets hardcoded)
- ✅ Docker network isolated (bridge network)

## Future Enhancements

- [ ] Automated CI/CD with GitHub Actions
- [ ] Load balancer (ALB) for high availability
- [ ] CloudFront for frontend caching
- [ ] RDS read replicas for database scaling
- [ ] CloudWatch monitoring & alarms
