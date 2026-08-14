# 10S Analytics Dashboard

A standalone, password-protected analytics dashboard for monitoring the 10S card game's growth and performance metrics.

## Features

- **Acquisition Metrics**: Daily/weekly/monthly signups, growth rates
- **Engagement Metrics**: DAU, WAU, MAU, games played, game duration, lobby conversion
- **Retention Metrics**: D1/D7/D30 retention cohorts, churn rate
- **Monetization Metrics**: Revenue tracking, premium conversion, ARPU, ad engagement
- **Product Health**: Game completion rate, disconnect rate, health score trends

## Architecture

- **Backend**: FastAPI + SQLAlchemy (Python 3.11)
- **Frontend**: Server-rendered HTML with Chart.js visualizations
- **Database**: Read-only access to shared RDS PostgreSQL instance
- **Auth**: Single-admin bcrypt password + JWT cookies
- **Deployment**: Docker container on EC2 (independent start/stop)

## Local Setup

### Prerequisites

- Python 3.11+
- Docker & Docker Compose (for container deployment)
- AWS credentials configured (for Parameter Store access)

### Environment Variables

Create a `.env.analytics` file (already provided with placeholder values):

```bash
DATABASE_URL=postgresql://analytics_readonly:password@db-host:5432/10s
ADMIN_EMAIL=CarpenterLokendra@gmail.com
ADMIN_PASSWORD_HASH=<bcrypt_hash_here>
JWT_SECRET=<random_secret>
ENVIRONMENT=development
DEBUG=false
```

**Password Hash Generation** (one-time):
```bash
python3 -c "
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
print(pwd_context.hash('your-password-here'))
"
```

### Running Locally

```bash
# Install dependencies
pip install -r requirements.txt

# Start the server
python -m uvicorn src.main:app --host 0.0.0.0 --port 8002 --reload

# Access dashboard
# http://localhost:8002/login
# Email: CarpenterLokendra@gmail.com
# Password: LcKsAc@2024
```

## Docker Deployment

### Build Image

```bash
docker build -t 10s-analytics .
```

### Run with Docker Compose

```bash
# Start (in background)
docker-compose up -d

# Stop
docker-compose down

# Logs
docker-compose logs -f analytics
```

Container runs on `127.0.0.1:8002` (accessible only locally, as designed for SSH tunneling).

## Production Deployment on EC2

### 1. Create Read-Only Database Role

```bash
# From your local machine with PostgreSQL admin access to RDS
psql -h db10s-game-v3.cvgyyk8coe1d.ap-southeast-2.rds.amazonaws.com -U admin -d 10s \
  -f scripts/create_readonly_role.sql
```

### 2. Add Secrets to Parameter Store

```bash
# Store each secret in AWS Parameter Store
aws ssm put-parameter --name /10s/analytics/DATABASE_URL \
  --value "postgresql://analytics_readonly:password@db-host:5432/10s" \
  --type SecureString --region ap-southeast-2

aws ssm put-parameter --name /10s/analytics/ADMIN_EMAIL \
  --value "CarpenterLokendra@gmail.com" \
  --type SecureString --region ap-southeast-2

aws ssm put-parameter --name /10s/analytics/ADMIN_PASSWORD_HASH \
  --value "<bcrypt_hash>" \
  --type SecureString --region ap-southeast-2

aws ssm put-parameter --name /10s/analytics/JWT_SECRET \
  --value "<random_secret_key>" \
  --type SecureString --region ap-southeast-2
```

### 3. Deploy on EC2

```bash
# Clone repo on EC2
cd ~/10S
git clone https://github.com/CarpenterLokendra/10S-KPI.git
cd 10S-KPI

# Start service
docker-compose up -d

# Verify
docker-compose logs -f
curl http://localhost:8002/health
```

### 4. Access via SSH Tunnel

From your local machine:

```bash
ssh -L 8002:localhost:8002 ec2-user@<ec2-host>
# Then open: http://localhost:8002/login
```

## API Endpoints

All endpoints require JWT authentication via cookie.

### Health Check
- `GET /health` — No auth required

### Acquisition KPIs
- `GET /api/kpi/acquisition/signups-daily?days=30`
- `GET /api/kpi/acquisition/growth-rate`
- `GET /api/kpi/acquisition/total-signups`

### Engagement KPIs
- `GET /api/kpi/engagement/dau?days=30`
- `GET /api/kpi/engagement/wau?weeks=12`
- `GET /api/kpi/engagement/mau?months=12`
- `GET /api/kpi/engagement/games-played-daily?days=30`
- `GET /api/kpi/engagement/bot-vs-human?days=30`

### Retention KPIs
- `GET /api/kpi/retention/d1?days=90`
- `GET /api/kpi/retention/d7?days=90`
- `GET /api/kpi/retention/d30?days=90`
- `GET /api/kpi/retention/churn-rate?inactive_days=7`

### Monetization KPIs
- `GET /api/kpi/monetization/revenue-daily?days=30`
- `GET /api/kpi/monetization/total-revenue?days=30`
- `GET /api/kpi/monetization/premium-conversion`
- `GET /api/kpi/monetization/arpu?days=30`
- `GET /api/kpi/monetization/ad-engagement?days=30`

### Product Health KPIs
- `GET /api/kpi/health/health-score?days=30`
- `GET /api/kpi/health/game-completion?days=30`
- `GET /api/kpi/health/disconnect-rate?days=30`
- `GET /api/kpi/health/health-trend?days=30`

## Security

- **No plaintext passwords in git**: `.env.analytics` is gitignored
- **Bcrypt password hashing**: Cost factor 12
- **JWT tokens**: 24-hour expiration, `httpOnly` + `Secure` + `SameSite=Strict` cookies
- **Rate limiting**: 5 login attempts/minute, 10 API calls/minute
- **Read-only database role**: SELECT-only on specific tables
- **Parameter Store encryption**: All production secrets encrypted at rest

## Architecture Decisions

- **Single container**: Both backend and frontend in one Python process for simplicity
- **Server-rendered HTML**: No build step, no Node.js dependency
- **Chart.js**: Self-hosted (not CDN) to avoid external runtime dependencies
- **Direct DB queries**: No ORM layers, raw SQL for performance
- **SSH tunnel access**: Not internet-exposed to protect growth data

## Troubleshooting

### "Invalid credentials" on login
- Verify `ADMIN_PASSWORD_HASH` matches the bcrypt hash of your password
- Check `.env.analytics` or Parameter Store configuration

### "Database connection failed"
- Verify `DATABASE_URL` and analytics_readonly role exist on RDS
- Check security group allows EC2 to port 5432 on RDS
- Test: `psql <DATABASE_URL>`

### Charts not loading
- Ensure `/api/kpi/*` endpoints return valid JSON
- Check browser console for fetch errors
- Verify authentication token in cookies

### Container won't start
- Check logs: `docker-compose logs analytics`
- Verify environment variables are set
- Ensure port 8002 is available

## Future Enhancements

- Mobile-responsive dashboard improvements
- Forecast/trend analysis (linear regression)
- Custom date range filters (currently fixed 30/90 days)
- Email digest reports
- Real-time WebSocket updates
- Custom metric builder
