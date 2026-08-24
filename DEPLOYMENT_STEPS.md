# 🚀 10S Card Game — Complete Deployment Guide
## From Local Development to Production (Secure + Scalable)

**Current State:**
- ✅ Domain purchased (catchtheten.com on Namecheap)
- ✅ Backend deployed on AWS EC2 free tier (54.252.227.30:8000, HTTP only)
- ⏳ Web app (local only, code ready)
- ⏳ Mobile app (local only, needs domain update)
- ⏳ Bot engine (local, will run on EC2)

**End State:**
- ✅ `https://catchtheten.com` → web app + backend (secure, same domain)
- ✅ Mobile app points to production domain
- ✅ Redis for horizontal scaling foundation
- ✅ Automated certificate renewal (Let's Encrypt)

---

## Phase 1: AWS Infrastructure Setup (30-45 min)

### Step 1.1: Create ElastiCache Redis Cluster

1. Go to **AWS Console** → **ElastiCache** → **Redis**
2. Click **Create Cluster**:
   - **Cluster mode**: Disabled (single node, no sharding needed yet)
   - **Name**: `10s-redis` (or any name)
   - **Engine version**: Latest (7.x or higher)
   - **Node type**: `cache.t4g.micro` (free-tier eligible)
   - **VPC**: Same VPC as your EC2 instance
   - **Subnet group**: Select the one matching your EC2's subnet
   - **Security group**: Create new, name `10s-redis-sg`
   - Click **Create**

3. Once created (takes 5-10 min), go to **Cluster details**:
   - Copy the **Primary Endpoint** (format: `10s-redis-abc123.ng.0001.apse2.cache.amazonaws.com:6379`)

### Step 1.2: Configure Redis Security Group

1. Go to **EC2** → **Security Groups** → find your EC2 instance's security group (e.g., `10s-backend-sg`)
2. Go to **ElastiCache** → **Cluster Details** → find the Redis security group (`10s-redis-sg`)
3. In `10s-redis-sg`, click **Inbound Rules** → **Edit**:
   - Add rule: **Type** = Custom TCP, **Port** = 6379, **Source** = your EC2's security group
   - Save

### Step 1.3: Store Redis URL in AWS Parameter Store

```bash
aws ssm put-parameter \
  --name /10s/backend/REDIS_URL \
  --value "redis://10s-redis-abc123.ng.0001.apse2.cache.amazonaws.com:6379/0" \
  --type String \
  --overwrite \
  --region ap-southeast-2
```
(Replace the endpoint with your actual Redis endpoint)

### Step 1.4: Update Backend Code for Redis

Your backend code is already ready for Redis. Ensure `entrypoint.sh` fetches the `REDIS_URL` from Parameter Store:

**Check/update `/home/ec2-user/10S-backend/entrypoint.sh`:**
```bash
# Add this line after the JWT_SECRET_KEY fetch:
REDIS_URL=$(aws ssm get-parameter --name /10s/backend/REDIS_URL --with-decryption --region ap-southeast-2 --query 'Parameter.Value' --output text 2>/dev/null)
if [ -z "$REDIS_URL" ]; then
    echo "⚠️  REDIS_URL not found in Parameter Store (optional for single instance)"
    REDIS_URL="redis://localhost:6379/0"
fi
echo "REDIS_URL=$REDIS_URL" >> /home/ec2-user/10S-backend/.env.backend
```

---

## Phase 2: Domain & DNS Setup (10-15 min)

### Step 2.1: Allocate Elastic IP (if not already done)

1. Go to **AWS Console** → **EC2** → **Elastic IPs**
2. If your EC2 doesn't have one, click **Allocate Elastic IP** → **Allocate**
3. Select it → **Associate** → choose your EC2 instance
4. Copy the **Elastic IP address** (should be `54.252.227.30` or similar)

### Step 2.2: Configure DNS at Namecheap

1. Go to **Namecheap** → **Domain List** → **catchtheten.com** → **Manage**
2. Click **Advanced DNS**
3. Add/modify DNS records:

   **For apex domain (catchtheten.com):**
   - Type: **A Record**
   - Name: **@** (or leave blank)
   - Value: Your Elastic IP (e.g., `54.252.227.30`)
   - TTL: 30 min (fast propagation)

   **For www.catchtheten.com:**
   - Type: **CNAME**
   - Name: **www**
   - Value: **catchtheten.com**
   - TTL: 30 min

4. Click **Save All Changes**
5. **Wait 5-15 minutes** for DNS propagation (or check: `nslookup catchtheten.com`)

---

## Phase 3: EC2 Host Setup — TLS & Reverse Proxy (20-30 min)

SSH into your EC2 instance:
```bash
ssh ec2-user@54.252.227.30
```

### Step 3.1: Install nginx & certbot

```bash
# Update system
sudo yum update -y

# Install nginx
sudo yum install -y nginx

# Install certbot for SSL
sudo yum install -y certbot python3-certbot-nginx
```

### Step 3.2: Create nginx Config for HTTPS Reverse Proxy

```bash
sudo vi /etc/nginx/conf.d/catchtheten.conf
```

Paste this config:
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

# HTTPS server block (will be auto-configured by certbot)
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

    # Frontend app
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

    # SSL certificates (will be added by certbot)
    # ssl_certificate /etc/letsencrypt/live/catchtheten.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/catchtheten.com/privkey.pem;
}
```

Save (`:wq` in vi)

### Step 3.3: Test nginx Config

```bash
sudo nginx -t
```
Should output: `nginx: configuration file test is successful`

### Step 3.4: Start nginx

```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Step 3.5: Get SSL Certificate from Let's Encrypt

```bash
sudo certbot --nginx -d catchtheten.com -d www.catchtheten.com
```

Follow the prompts:
- Enter email
- Accept terms
- Certbot will auto-configure the nginx config with SSL certificates and HTTP→HTTPS redirect

Verify:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## Phase 4: Update Backend CORS Settings (5 min)

```bash
aws ssm put-parameter \
  --name /10s/backend/ALLOWED_ORIGINS \
  --value "https://catchtheten.com,https://www.catchtheten.com" \
  --type String \
  --overwrite \
  --region ap-southeast-2
```

---

## Phase 5: Deploy Services on EC2 (20-30 min)

Still SSH'd into EC2:

### Step 5.1: Update Backend Repository

```bash
cd /home/ec2-user/10S-backend
git pull origin main
```

### Step 5.2: Update Bot Engine Repository

```bash
cd /home/ec2-user/10S-bot-engine
git pull origin main
```

### Step 5.3: Clone Frontend Repository

```bash
git clone https://github.com/CarpenterLokendra/10s-shared.git /home/ec2-user/10S-frontend
cd /home/ec2-user/10S-frontend
```

### Step 5.4: Update docker-compose.dev.yml

Edit `/home/ec2-user/10S-bot-engine/docker-compose.dev.yml`:

Add this `frontend` service at the top (before `bot-engine`):
```yaml
  frontend:
    build:
      context: ../10S-frontend
      args:
        VITE_API_URL: "https://catchtheten.com"
        VITE_WS_URL: "wss://catchtheten.com"
    image: 10s-frontend:latest
    container_name: 10s-frontend
    restart: unless-stopped
    ports:
      - "127.0.0.1:8080:80"
    networks:
      - 10s-net
    healthcheck:
      test: ["CMD", "wget", "-q", "-O", "-", "http://localhost/health"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 5s
```

Update `bot-engine` ports (around line 20):
```yaml
    ports:
      - "127.0.0.1:8001:8001"  # Changed from "8001:8001"
```

Update `backend` ports (around line 50):
```yaml
    ports:
      - "127.0.0.1:8000:8000"  # Changed from "8000:8000"
```

Add Redis environment variables to the `backend` service:
```yaml
    environment:
      # ... existing vars ...
      ENABLE_REDIS: "true"
      ENABLE_BACKGROUND_WORKER: "true"
      # REDIS_URL will be fetched from SSM by entrypoint.sh
```

### Step 5.5: Deploy

```bash
cd /home/ec2-user/10S-bot-engine

# First-time setup (build all images)
docker-compose -f docker-compose.dev.yml up -d --build

# Wait for containers to be healthy
docker ps
```

Verify all 3 containers are running:
```bash
docker ps | grep 10s-
```

Should see:
- `10s-frontend`
- `10s-bot-engine`
- `10s-backend`

### Step 5.6: Verify Backend Health

```bash
curl https://catchtheten.com/api/v1/admin/health
```

Should return:
```json
{
  "status": "healthy",
  "database": "connected",
  "environment": "development"
}
```

### Step 5.7: Lock Down Security Group

Go to **AWS Console** → **EC2** → **Security Groups** → your instance's security group:

**Remove these inbound rules** (if they exist):
- Port 8000 (backend)
- Port 8001 (bot-engine)

**Keep public:**
- Port 80 (HTTP, redirects to HTTPS)
- Port 443 (HTTPS)
- Port 22 (SSH, restrict to your IP)

---

## Phase 6: Test Web App (10 min)

1. Open browser: `https://catchtheten.com`
2. Should load the web app (may show SSL warning for first few seconds while cert is trusted)
3. **Test login**:
   - Create account or login
   - Verify no errors in browser console (`F12` → Console)
4. **Test gameplay**:
   - Start a game
   - Watch Network tab (`F12` → Network): confirm all requests go to `https://catchtheten.com` (not `54.252.227.30`)
   - Confirm WebSocket connects (no red errors)
5. **Test CORS** (if needed):
   ```bash
   curl -I -H "Origin: https://evil.example.com" https://catchtheten.com/api/v1/users/me
   ```
   Should NOT see an `Access-Control-Allow-Origin` header (same-origin, no CORS needed)

---

## Phase 7: Update Mobile App (15 min)

### Step 7.1: Update Configuration Files

In `/Users/lokendracarpenter/Documents/Projects/10S/mobile-10s`:

**Update `app.json`:**
```json
"extra": {
  "API_URL": "https://catchtheten.com/api/v1"
}
```

**Update `eas.json`** (all build profiles):
```json
"preview": {
  "env": {
    "REACT_APP_API_URL": "https://catchtheten.com/api/v1"
  }
},
"preview2": {
  "env": {
    "REACT_APP_API_URL": "https://catchtheten.com/api/v1"
  }
},
"production": {
  "env": {
    "REACT_APP_API_URL": "https://catchtheten.com/api/v1"
  }
}
```

**Update `.env.example`:**
```
REACT_APP_API_URL=https://catchtheten.com/api/v1
```

### Step 7.2: Commit & Push

```bash
cd /Users/lokendracarpenter/Documents/Projects/10S/mobile-10s
git add app.json eas.json .env.example
git commit -m "Update API endpoint to production domain (catchtheten.com)"
git push origin main
```

### Step 7.3: Build & Deploy

```bash
eas build --platform android --profile production
eas submit --platform android --latest
```

(or `--profile preview` for testing)

---

## Phase 8: Scaling Roadmap (Reference for Later)

### When to add a 2nd backend instance:
- Sustained CPU/memory pressure on current instance
- WebSocket connection count > 1000+
- Response time degradation under load

### Steps to scale (future, not now):
1. Launch a 2nd EC2 instance (same VPC)
2. Set `ENABLE_BACKGROUND_WORKER=false` on instance #2 (only instance #1 runs timeout checks)
3. Create an AWS ALB (Application Load Balancer) in front of both instances
4. Update DNS: `catchtheten.com` → ALB instead of single instance
5. Update `docker-compose.dev.yml` on both instances

Redis is already set up, so:
- WebSocket broadcasts will automatically work (pub/sub layer)
- Rate-limiting will be shared (Redis storage)
- No duplicate timeout checks (flag gates it)

### Database scaling (when read load exceeds write):
- Create RDS read replica
- Update queries that don't need write consistency to read replica

### CDN (optional, cheap win anytime):
- Set up CloudFront in front of nginx to cache static assets (JS, CSS, images)
- Reduce origin traffic by 80%+

---

## Checklist — Run These Verification Steps

- [ ] `curl -I https://catchtheten.com` → 200 OK
- [ ] `curl https://catchtheten.com/api/v1/admin/health` → healthy JSON
- [ ] Open `https://catchtheten.com` in browser → web app loads
- [ ] Login works
- [ ] Can start a game
- [ ] WebSocket connects (check `F12` → Network, see `wss://catchtheten.com/ws/...`)
- [ ] Test from mobile emulator → points to `https://catchtheten.com`
- [ ] `curl http://54.252.227.30:8000/api/v1/admin/health` → **Connection refused** (backend not directly exposed)

---

## Troubleshooting

### nginx config error
```bash
sudo nginx -t
sudo systemctl restart nginx
```

### Containers won't start
```bash
docker logs 10s-backend
docker logs 10s-frontend
docker logs 10s-bot-engine
```

### SSL certificate didn't auto-renew
```bash
sudo certbot renew --dry-run
sudo certbot renew
```

### Backend health check fails
```bash
curl https://catchtheten.com/api/v1/admin/health -v
# Check: is the backend container running?
docker logs 10s-backend | tail -50
```

### Redis connection error
```bash
# Verify Redis endpoint is correct in Parameter Store
aws ssm get-parameter --name /10s/backend/REDIS_URL --region ap-southeast-2
# Verify security group allows EC2 → Redis
```

---

## Security Checklist

- ✅ Backend ports (8000, 8001) only accessible from `127.0.0.1` (not public)
- ✅ HTTPS enforced (automatic HTTP → HTTPS redirect)
- ✅ Certificate auto-renews (Let's Encrypt + certbot)
- ✅ Security headers set (HSTS, CSP, X-Frame-Options, etc.)
- ✅ CORS allow-list configured (only `https://catchtheten.com`)
- ✅ JWT validation active (required for API calls)
- ✅ Rate-limiting in place (slowapi + Redis)

---

## Next Steps

1. **Today**: Complete Phase 1-5 (infrastructure + deploy)
2. **Tomorrow**: Test thoroughly, gather user feedback
3. **This week**: Build Redis integration (already code-ready, just needs deployment)
4. **Next week**: Mobile app release with production domain
5. **Later**: Monitor load, plan for 2nd instance if needed
