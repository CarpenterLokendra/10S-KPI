# STEP 6: Post-Deployment Verification

**Status**: Ready to execute on EC2 instance (ap-south-1)
**Target**: https://catchtheten.com
**Estimated Time**: 20-30 minutes

## Pre-Flight Checklist

Run these from your EC2 instance (via SSH):

### 1. Verify Services Are Running

```bash
# SSH into EC2 instance
ssh -i /path/to/your/key.pem ec2-user@35.154.157.247

# Check all containers
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Expected output:
# 10s-frontend    Up X seconds (healthy)  127.0.0.1:8080->80/tcp
# 10s-backend     Up X seconds (healthy)  127.0.0.1:8000->8000/tcp
# 10s-bot-engine  Up X seconds (healthy)  127.0.0.1:8001->8001/tcp
```

### 2. Verify HTTPS Certificate

Run from your **local machine**:

```bash
# Check certificate validity
curl -I https://catchtheten.com

# Expected: 200 status, valid certificate (not self-signed)

# View certificate details
openssl s_client -connect catchtheten.com:443 -brief

# Check certificate expiration
openssl s_client -connect catchtheten.com:443 2>/dev/null | grep "Verify return code"
# Expected: "Verify return code: 0 (ok)"
```

### 3. Test Backend Health Check

```bash
# From your local machine
curl -s https://catchtheten.com/api/v1/admin/health | jq .

# Expected response:
# {
#   "status": "healthy",
#   "database": "connected",
#   "redis": "connected" (if ENABLE_REDIS=true)
# }

# Alternative if curl doesn't support -s flag:
curl https://catchtheten.com/api/v1/admin/health
```

### 4. Verify Backend Is NOT Publicly Accessible (Security Check)

```bash
# From your local machine - this should FAIL/TIMEOUT
curl -I http://35.154.157.247:8000/

# Expected: Connection refused or timeout
# This verifies backend is only reachable through nginx frontend
```

### 5. Test WebSocket Connection

Run from your **local machine** in the browser console:

```javascript
// Open browser DevTools (F12) on https://catchtheten.com
// Paste in console:

const ws = new WebSocket('wss://catchtheten.com/ws/test-connection');
ws.onopen = () => console.log('✅ WebSocket connected');
ws.onmessage = (e) => console.log('Message:', e.data);
ws.onerror = (e) => console.log('❌ Error:', e);
ws.onclose = () => console.log('Closed');

// Expected: ✅ WebSocket connected
```

### 6. Test Login → Game Flow

**Manual test via web app:**

1. Open https://catchtheten.com in browser
2. Click "Create Account"
3. Register with test credentials
4. Login with created account
5. Create a game or join a lobby
6. Verify game state updates in real-time
7. Make a move and confirm it broadcasts to all players

**Expected behaviors:**
- ✅ Login redirects properly (no 301 loops)
- ✅ Game state loads
- ✅ WebSocket messages appear in browser DevTools (Network → WS)
- ✅ Game updates appear instantly (no polling delays)
- ✅ No console errors

### 7. Verify Rate Limiting Works

Run from your **local machine**:

```bash
# Hit the auth endpoint repeatedly to trigger rate limit
for i in {1..30}; do
  curl -s -o /dev/null -w "%{http_code}\n" https://catchtheten.com/api/v1/auth/login -X POST -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"wrong"}'
done

# Expected: First N requests return 400/401, then requests return 429 (Too Many Requests)
# This proves rate limiting is active
```

### 8. Verify Redis Pub/Sub (Multi-Instance Simulation)

**If you have Redis configured:**

```bash
# From EC2 instance, check Redis connection
nc -zv redis-10s-rfzdi7.serverless.aps1.cache.amazonaws.com 6379

# Expected: Connection successful

# Check backend logs for Redis connection
docker logs 10s-backend 2>&1 | grep -i redis

# Expected lines like:
# ✅ Redis connected
# 🔄 Redis pub/sub subscribed to game:xxx
```

### 9. Database Connection Verification

```bash
# From your local machine (if you have psql installed):
psql -h db-10s-game.cghp73tg0vhg.ap-south-1.rds.amazonaws.com -U postgres -d 10s_game -c "SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema='public';"

# Expected: Returns number of tables (should be > 10)

# Or check via backend logs:
docker logs 10s-backend 2>&1 | grep -i "database connected"
```

## Verification Report Template

Fill this out after running all tests:

```
✅ STEP 6 VERIFICATION REPORT

Test Date: [YYYY-MM-DD HH:MM]
Tester: [Your name]

HTTPS Certificate:
  [ ] Certificate valid (not self-signed)
  [ ] Certificate covers *.catchtheten.com
  [ ] Expiration date: _____ days remaining

Services:
  [ ] 10s-frontend healthy
  [ ] 10s-backend healthy
  [ ] 10s-bot-engine healthy
  [ ] Backend NOT publicly accessible on :8000
  
Functionality:
  [ ] Health check endpoint returns 200
  [ ] WebSocket connection successful
  [ ] Login → game flow works end-to-end
  [ ] Game updates broadcast in real-time
  [ ] No console errors in browser
  
Security:
  [ ] Rate limiting returns 429 after limit
  [ ] Redis connected (if enabled)
  [ ] Database queries working

Issues Found: [List any failures]
```

## Troubleshooting

**If health check fails:**
```bash
# Check backend logs
docker logs 10s-backend --tail 50

# Check for Parameter Store connectivity
# From EC2: aws ssm get-parameter --name /10s/backend/DATABASE_URL --with-decryption --region ap-south-1

# Check database connectivity
# From EC2: psql postgresql://postgres:Ultratech5556@db-10s-game.cghp73tg0vhg.ap-south-1.rds.amazonaws.com:5432/10s_game
```

**If WebSocket fails:**
```bash
# Check nginx logs
sudo tail -f /var/log/nginx/access.log | grep ws

# Check backend WebSocket handler
docker logs 10s-backend --tail 50 | grep -i websocket

# Verify nginx config has WebSocket headers
sudo cat /etc/nginx/conf.d/catchtheten.conf | grep -A5 "proxy_set_header"
```

**If frontend shows blank page:**
```bash
# Check frontend container logs
docker logs 10s-frontend --tail 50

# Verify frontend build had correct VITE_API_URL
docker inspect 10s-frontend | grep -i vite

# Check browser console for errors (F12)
```

**If rate limiting doesn't work:**
```bash
# Check if Redis is reachable
redis-cli -h redis-10s-rfzdi7.serverless.aps1.cache.amazonaws.com ping

# Verify backend has ENABLE_REDIS=true
docker inspect 10s-backend | grep ENABLE_REDIS

# Check slowapi configuration
docker logs 10s-backend | grep -i "slowapi\|rate"
```

## Next Steps After Verification

✅ If all tests pass → Proceed to **STEP 7: Mobile App Release**
   - Update mobile API URLs to https://catchtheten.com
   - Build and deploy Android/iOS via EAS

⚠️ If any test fails → Debug using troubleshooting guide above, then re-run verification

---

**Remember**: All secrets are now stored in AWS Parameter Store (encrypted). Backend/frontend repos have clean git history with no exposed credentials.
