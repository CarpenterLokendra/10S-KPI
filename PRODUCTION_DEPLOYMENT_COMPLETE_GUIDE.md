# 🚀 10S Card Game — Complete Production Deployment Guide
## Comprehensive Step-by-Step Instructions for Infrastructure, EC2, Redis, and Domain Setup

**Document Version:** 1.0  
**Created:** 2026-07-23  
**Status:** Ready for Execution  
**Estimated Time:** 3-4 hours total

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [EC2 Instance Upgrade](#step-1-ec2-instance-upgrade)
3. [Namecheap DNS Configuration](#step-2-namecheap-dns-configuration)
4. [AWS Infrastructure Setup (Redis)](#step-3-aws-infrastructure-setup-redis)
5. [EC2 Host Setup (nginx + TLS)](#step-4-ec2-host-setup-nginx--tls)
6. [Deploy Services](#step-5-deploy-services)
7. [Post-Deployment Verification](#step-6-post-deployment-verification)
8. [Mobile App Release](#step-7-mobile-app-release)
9. [Monitoring & Maintenance](#step-8-monitoring--maintenance)
10. [Cost Breakdown & Optimization](#cost-breakdown)

---

## Pre-Deployment Checklist

Before starting, ensure you have:

- ✅ AWS Account with EC2 instance running at `54.252.227.30`
- ✅ Domain `catchtheten.com` registered at Namecheap
- ✅ All code changes committed and pushed (completed)
- ✅ Terminal access with AWS CLI configured
- ✅ SSH key for EC2 instance
- ✅ Namecheap account access

---

## STEP 1: EC2 Instance Upgrade

### Current Status
- **Current Instance Type:** t2.micro or t3.micro (free tier)
- **Current RAM:** 512 MB - 1 GB
- **Problem:** Cannot handle production load (frontend + backend + bot-engine + Redis)

### Target
- **New Instance Type:** t3.medium
- **New RAM:** 4 GB
- **Cost:** ~$20/month
- **Supports:** 500+ concurrent players

### 1.1 Preparation

```bash
# SSH into current instance
ssh ec2-user@54.252.227.30

# Verify current instance type
ec2-metadata --instance-type

# Gracefully stop services
sudo systemctl stop docker

# Exit SSH
exit
```

### 1.2 Upgrade Process (AWS Console)

1. Go to **AWS Console** → **EC2** → **Instances**
2. Select your instance (should be running)
3. Right-click → **Instance Settings** → **Change Instance Type**
4. Select `t3.medium` from the dropdown
5. Click **Apply**

### 1.3 Restart Instance

In AWS Console:
1. Select instance → **Instance State** → **Stop**
2. Wait for status: "Stopped" (30 seconds)
3. Select instance → **Instance State** → **Start**
4. Wait for status: "Running" (1 minute)
5. **Verify:** Elastic IP should still be `54.252.227.30`

### 1.4 Verify Services

```bash
# SSH back in
ssh ec2-user@54.252.227.30

# Check Docker services auto-restarted
docker ps

# Should show 3 containers: frontend, backend, bot-engine
# If not, manually restart:
cd /home/ec2-user/10S-bot-engine
docker-compose -f docker-compose.dev.yml up -d

# Exit
exit
```

**Time:** ~5 minutes | **Status:** ✅ Complete

---

## STEP 2: Namecheap DNS Configuration

### 2.1 Access Namecheap

1. Go to https://namecheap.com and login
2. Click **Domain List** (left sidebar)
3. Find `catchtheten.com` → Click **Manage**

### 2.2 Configure DNS Records

Click **Advanced DNS** tab

#### Add Record 1: Apex Domain
- **Type:** `A Record`
- **Host:** `@`
- **Value:** `54.252.227.30`
- **TTL:** `30 min`
- Click **✓ Save**

#### Add Record 2: WWW Subdomain
- **Type:** `CNAME Record`
- **Host:** `www`
- **Value:** `catchtheten.com`
- **TTL:** `30 min`
- Click **✓ Save**

### 2.3 Verify DNS Propagation

```bash
# Check DNS every 2 minutes (should show 54.252.227.30)
nslookup catchtheten.com

# Or use dig
dig catchtheten.com

# Wait 5-15 minutes for full propagation
```

**Expected Output:**
```
Non-authoritative answer:
Name:   catchtheten.com
Address: 54.252.227.30
```

**Time:** ~5 min setup + 5-15 min propagation | **Status:** ✅ Complete

---

## STEP 3: AWS Infrastructure Setup (Redis)

### 3.1 Create ElastiCache Redis Cluster

1. Go to **AWS Console** → Search **ElastiCache**
2. Click **Clusters** (left sidebar) → **Create cluster**

### 3.2 Configure Redis Cluster

**Basic Settings:**
- **Engine:** Redis
- **Engine Version:** 7.x (latest)
- **Cluster Name:** `10s-redis`
- **Node Type:** `cache.t4g.micro`
- **Nodes:** 1 (single node, no replication needed yet)

**Network & Security:**
- **VPC:** Same as EC2 instance
- **Subnet Group:** Select your EC2's subnet
- **Publicly Accessible:** NO (internal only)
- **Security Group:** Create new → Name: `10s-redis-sg`

**Settings:**
- **Automatic Failover:** Disabled (not needed for single node)
- **Multi-AZ:** Disabled (cost optimization)
- **Encryption:** Disabled (internal traffic only)

Click **Create**

### 3.3 Wait for Redis Ready

Monitor **ElastiCache** → **Clusters**:
- Status should change to "Available" (5-10 minutes)
- Copy the **Primary Endpoint** (format: `10s-redis-abc123.ng.0001.apse2.cache.amazonaws.com:6379`)

### 3.4 Configure Redis Security Group

1. Go to **EC2** → **Security Groups** → find your EC2 instance's security group
   - Copy its **Security Group ID** (format: `sg-xxxxxxxxx`)

2. Go to **ElastiCache** → **Clusters** → `10s-redis` details
   - Click **Modify** → change security group to `10s-redis-sg` → **Apply immediately**

3. Go to **EC2** → **Security Groups** → `10s-redis-sg` → **Inbound Rules** → **Edit**
   - Add rule:
     - **Type:** Custom TCP
     - **Port:** 6379
     - **Source:** Paste EC2 security group ID
   - Click **Save rules**

### 3.5 Store Redis URL in Parameter Store

```bash
# Replace endpoint with your actual Redis endpoint
aws ssm put-parameter \
  --name /10s/backend/REDIS_URL \
  --value "redis://10s-redis-abc123.ng.0001.apse2.cache.amazonaws.com:6379/0" \
  --type String \
  --overwrite \
  --region ap-southeast-2

# Verify
aws ssm get-parameter --name /10s/backend/REDIS_URL --region ap-southeast-2
```

### 3.6 Update entrypoint.sh

SSH into EC2:

```bash
ssh ec2-user@54.252.227.30

# Edit entrypoint.sh to fetch Redis URL
vi /home/ec2-user/10S-backend/entrypoint.sh
```

Add this after JWT_SECRET_KEY fetch:

```bash
# Fetch Redis URL from Parameter Store
REDIS_URL=$(aws ssm get-parameter --name /10s/backend/REDIS_URL --with-decryption --region ap-southeast-2 --query 'Parameter.Value' --output text 2>/dev/null)
if [ -z "$REDIS_URL" ]; then
    echo "⚠️  REDIS_URL not found in Parameter Store (optional for single instance)"
    REDIS_URL="redis://localhost:6379/0"
fi
echo "REDIS_URL=$REDIS_URL" >> /home/ec2-user/10S-backend/.env.backend
```

**Time:** 20-30 minutes | **Status:** ✅ Complete

---

## STEP 4: EC2 Host Setup (nginx + TLS)

### 4.1 Install nginx & certbot

SSH into EC2:

```bash
ssh ec2-user@54.252.227.30

# Update system
sudo yum update -y

# Install nginx
sudo yum install -y nginx

# Install certbot (Let's Encrypt)
sudo yum install -y certbot python3-certbot-nginx
```

### 4.2 Create nginx Configuration

```bash
sudo nano /etc/nginx/conf.d/catchtheten.conf
```

**Paste this entire config:**

```nginx
upstream backend {
    server 127.0.0.1:8000;
}

upstream frontend {
    server 127.0.0.1:8080;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name catchtheten.com www.catchtheten.com;
    return 301 https://$host$request_uri;
}

# HTTPS server (SSL added by certbot)
server {
    listen 443 ssl http2;
    server_name catchtheten.com www.catchtheten.com;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css text/javascript application/json application/javascript;
    gzip_min_length 1000;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Frontend SPA app
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket
    location /ws/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;
    }
}
```

Save: `Ctrl+O` → `Enter` → `Ctrl+X`

### 4.3 Test nginx Configuration

```bash
sudo nginx -t
# Should output: "nginx: configuration file test is successful"
```

### 4.4 Start nginx

```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 4.5 Get SSL Certificate

```bash
sudo certbot --nginx -d catchtheten.com -d www.catchtheten.com
```

**Follow prompts:**
- Enter email
- Agree to terms (A)
- Email sharing (N is fine)

Certbot will auto-configure nginx with SSL.

### 4.6 Verify SSL Setup

```bash
sudo nginx -t
sudo systemctl reload nginx

# Test HTTPS
curl -I https://catchtheten.com
# Should return: 200 OK with valid cert
```

**Time:** 30-45 minutes | **Status:** ✅ Complete

---

## STEP 5: Deploy Services

### 5.1 Pull Latest Code

Still SSH'd into EC2:

```bash
cd /home/ec2-user/10S-backend
git pull origin main

cd /home/ec2-user/10S-bot-engine
git pull origin main
```

### 5.2 Clone Frontend

```bash
git clone https://github.com/CarpenterLokendra/10s-shared.git /home/ec2-user/10S-frontend
cd /home/ec2-user/10S-frontend
```

### 5.3 Deploy All Services

```bash
cd /home/ec2-user/10S-bot-engine

# Build and start all containers
docker-compose -f docker-compose.dev.yml up -d --build

# Wait for builds to complete
sleep 30

# Verify all containers running
docker ps

# Should show:
# 10s-frontend (port 8080, local only)
# 10s-bot-engine (port 8001, local only)
# 10s-backend (port 8000, local only)
```

### 5.4 Check Logs (if issues)

```bash
docker logs 10s-backend | tail -50
docker logs 10s-frontend | tail -50
docker logs 10s-bot-engine | tail -50
```

**Time:** 20-30 minutes | **Status:** ✅ Complete

---

## STEP 6: Post-Deployment Verification

### 6.1 Test Backend Health

```bash
# From your local machine (NOT SSH)
curl https://catchtheten.com/api/v1/admin/health

# Expected: {"status":"healthy","database":"connected",...}
```

### 6.2 Verify Backend NOT Directly Exposed

```bash
curl http://54.252.227.30:8000/api/v1/admin/health

# Expected: Connection refused (good! Backend is internal-only)
```

### 6.3 Test Web App

1. Open browser: `https://catchtheten.com`
2. Should load the web app
3. Login and play a game
4. Check browser Network tab (F12) — all requests should go to `https://catchtheten.com` (not the raw IP)
5. Verify WebSocket connects (check for `wss://catchtheten.com/ws/...` in Network tab)

### 6.4 Test HTTPS Enforcement

```bash
curl -I http://catchtheten.com

# Expected: 301 redirect to https://catchtheten.com
```

### 6.5 Verify DNS Resolution

```bash
nslookup catchtheten.com

# Expected: 54.252.227.30
```

**Time:** 10 minutes | **Status:** ✅ Complete

---

## STEP 7: Mobile App Release

**Only do this after verifying web app works!**

### 7.1 Build Mobile App

```bash
cd /Users/lokendracarpenter/Documents/Projects/10S/mobile-10s

# Build for production
eas build --platform android --profile production

# Watch the build (takes 10-15 minutes)
```

### 7.2 Submit to Google Play (if you have store account)

```bash
# Submit latest build
eas submit --platform android --latest
```

Or manually download APK from EAS and distribute.

**Time:** 15-20 minutes | **Status:** ✅ Complete

---

## STEP 8: Monitoring & Maintenance

### 8.1 Weekly Monitoring Checklist

```bash
# Check Docker resource usage
docker stats --no-stream

# Target: CPU < 60%, Memory < 70%
```

### 8.2 Monitor AWS Costs

AWS Console → **Billing and Cost Management**:
- Target: ~$45-50/month (stable, not growing)
- Watch for: Database, EC2, data transfer costs

### 8.3 SSL Certificate Renewal

```bash
# Certbot auto-renews, but verify:
sudo certbot renew --dry-run

# Logs: /var/log/letsencrypt/letsencrypt.log
```

### 8.4 Backup Strategy

**Daily backups (automated by AWS RDS):**
- Snapshots: 7-day retention
- Consider: Manual backup before major updates

---

## Cost Breakdown

### Monthly Infrastructure Cost

| Component | Cost | Notes |
|-----------|------|-------|
| EC2 t3.medium | ~$20 | Compute |
| RDS db.t3.micro | ~$6-10 | Database |
| ElastiCache Redis t4g.micro | ~$9 | Caching |
| VPC + Storage + Data Transfer | ~$5 | Supporting services |
| **TOTAL** | **~$45-50/month** | **Fixed cost** |

### Cost Optimization (Optional)

| Optimization | Saves | Trade-off |
|--------------|-------|-----------|
| Use Spot Instances | ~50% | Can be interrupted |
| Downgrade to t3.small | $10 | Fewer concurrent players |
| Remove Redis (single instance) | $9 | No horizontal scaling |
| Use S3 + CloudFront for frontend | $5 | Additional config |

### Per-Game Cost

- **Cost per player:** ~$0.05/month (cost is fixed regardless of gameplay volume)
- **Scaling to 2nd instance:** Add ~$45/month (but doubles capacity)

---

## Troubleshooting

### Services Won't Start

```bash
# Check Docker daemon
sudo systemctl status docker
sudo systemctl start docker

# View logs
docker logs 10s-backend
docker logs 10s-frontend
```

### High Memory Usage

```bash
docker stats --no-stream

# If one container using too much:
docker logs 10s-backend | grep -i "memory\|error"
```

### SSL Certificate Issues

```bash
# Check certificate validity
sudo certbot certificates

# Renew manually
sudo certbot renew --force-renewal
```

### Redis Connection Failed

```bash
# Verify parameter is stored
aws ssm get-parameter --name /10s/backend/REDIS_URL --region ap-southeast-2

# Test Redis connection
redis-cli -h <redis-endpoint> ping
```

---

## Execution Order

1. ✅ EC2 Upgrade (5 min)
2. ✅ Namecheap DNS (5 min setup + 5-15 min propagation)
3. ✅ AWS Redis (20-30 min)
4. ✅ EC2 Setup (30-45 min)
5. ✅ Deploy Services (20-30 min)
6. ✅ Verification (10 min)
7. ✅ Mobile App Release (15-20 min)

**Total Time: ~2.5-4 hours**

---

## Success Checklist

- ✅ EC2 upgraded to t3.medium
- ✅ DNS configured and propagated
- ✅ Redis ElastiCache created
- ✅ nginx installed with SSL cert
- ✅ All services deployed and running
- ✅ Web app accessible at https://catchtheten.com
- ✅ Backend health check passes
- ✅ Mobile app updated and released
- ✅ Monitoring in place

---

## Next Steps After Deployment

1. **Monitor first week** — CPU, memory, errors
2. **Collect user feedback** — gameplay experience, latency
3. **Plan horizontal scaling** — when to add 2nd instance
4. **Consider optimizations** — based on usage patterns

---

**Document Status:** Ready for Execution  
**Last Updated:** 2026-07-23  
**Maintained By:** Development Team
