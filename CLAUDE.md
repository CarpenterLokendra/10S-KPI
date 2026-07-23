# 10S Card Game - Project Configuration

## Repository Structure

**DO NOT USE 10S-SHARED REPO** - This has been deleted and should not be referenced.

### Correct Repositories:

1. **Backend**: `CarpenterLokendra/10S-backend`
   - Location: `/Users/lokendracarpenter/Documents/Projects/10S/Back end/10S-backend`
   - URL: https://github.com/CarpenterLokendra/10S-backend

2. **Bot Engine**: `CarpenterLokendra/10S-bot-engine`
   - Location: `/Users/lokendracarpenter/Documents/Projects/10S/Bot/10S-bot-engine`
   - URL: https://github.com/CarpenterLokendra/10S-bot-engine

3. **Web Frontend**: `CarpenterLokendra/10S-frontend`
   - Location: `/Users/lokendracarpenter/Documents/Projects/10S/Front end/10S-frontend`
   - URL: https://github.com/CarpenterLokendra/10S-frontend

4. **Mobile App**: `CarpenterLokendra/10s-mobile` (PRIMARY)
   - Location: `/Users/lokendracarpenter/Documents/Projects/10S/mobile-10s`
   - URL: https://github.com/CarpenterLokendra/10s-mobile

## Important Notes

- **Projects/10S** subdirectory is shared/deprecated - ignore it
- Always push mobile changes to **10s-mobile**, NOT projects/10S
- Frontend is in **10S-frontend** repository (10s-shared has been deleted)

## AWS Deployment

### Database
- RDS PostgreSQL: `db-10s-game`
- Status: Available
- Endpoint: db-10s-game.xxxxx.us-east-1.rds.amazonaws.com:5432

### Security Configuration
All 4 security waves completed:
- ✅ Wave 1: Backend hardening (API keys, production validation)
- ✅ Wave 2: WebSocket authentication
- ✅ Wave 3: Authorization header token transport
- ✅ Wave 4: Mobile secure token storage (SecureStore)

## Next Steps

1. Deploy backend to EC2 instance
2. Configure environment variables with AWS RDS endpoint
3. Deploy web frontend to S3 + CloudFront
4. Build and distribute mobile app

## 🔐 Security Configuration

### Secrets Management
All sensitive data is stored in **AWS Parameter Store**:
- Database credentials
- JWT secret keys
- API keys
- CORS origins

**CRITICAL**: Never commit secrets to git. Use `.gitignore` and AWS Parameter Store.

See `SECURITY.md` in each repository for detailed security guidelines.

### Environment Files
- `docker-compose.dev.yml` - **NOT IN GIT** (use .example as template)
- `.env` files - **NEVER COMMITTED** (local development only)
- Parameter Store - **PRODUCTION SOURCE** (encrypted, auditable)

