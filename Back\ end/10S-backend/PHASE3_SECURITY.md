# Phase 3: Advanced Security Hardening

## Overview
Production-grade security measures to protect against OWASP Top 10 vulnerabilities and advanced attack vectors.

## Phase 3.1: API Rate Limiting (All Endpoints)

### Current Status
- ✅ Auth endpoints rate limited (5 attempts/15 min per IP)
- ❌ General API endpoints NOT rate limited

### Implementation
- Apply global rate limit: 100 requests/minute per IP
- Apply endpoint-specific limits:
  - Game creation: 10/min
  - Lobby join: 20/min
  - Message send: 30/min
  - Leaderboard queries: 60/min
- Use Redis-backed limiter for distributed scaling

### Files to Update
- `src/main.py` - Add rate limit decorators to all routes
- `src/config.py` - Add rate limit configuration

---

## Phase 3.2: CORS Policy Hardening

### Current Status
- ⚠️ ALLOWED_ORIGINS set to "*" (allows any domain)

### Implementation
- Whitelist only production domain: `https://catchtheten.com`
- Remove wildcard (*) access
- Add strict CORS validation

### Files to Update
- `src/config.py` - Restrict ALLOWED_ORIGINS
- `src/main.py` - Update CORS middleware

---

## Phase 3.3: SQL Injection Prevention

### Current Status
- ✅ Using SQLAlchemy ORM (parameterized queries)
- ⚠️ Need to audit any raw SQL queries

### Implementation
- Audit all `.execute(text(...))` calls
- Add input validation on all endpoints
- Implement prepared statements for any raw SQL

### Files to Update
- `src/routes/` - Review all endpoints
- `src/models.py` - Add validators

---

## Phase 3.4: XSS Protection & Security Headers

### Current Status
- ❌ No Content Security Policy (CSP)
- ❌ No X-Frame-Options
- ❌ No X-Content-Type-Options

### Implementation
- Add CSP header (restrict script sources)
- Add X-Frame-Options: DENY
- Add X-Content-Type-Options: nosniff
- Add X-XSS-Protection: 1; mode=block
- Add Strict-Transport-Security

### Files to Update
- `src/main.py` - Add security headers middleware

---

## Phase 3.5: CSRF Protection

### Current Status
- ✅ Using SameSite=Strict on cookies
- ❌ No explicit CSRF tokens

### Implementation
- Add CSRF token validation for state-changing operations
- Generate tokens on login
- Validate on POST/PUT/DELETE/PATCH
- Return token in response

### Files to Update
- `src/security.py` - Add CSRF token generation
- `src/routes/auth.py` - Return CSRF token on login
- `src/main.py` - Add CSRF middleware

---

## Phase 3.6: Dependency Vulnerability Scanning

### Current Status
- ❌ Not scanning dependencies

### Implementation
- Run `pip audit` to identify vulnerable packages
- Update vulnerable packages
- Set up automated scanning

### Commands
```bash
pip install pip-audit
pip-audit
pip-audit --fix
```

---

## Phase 3.7: Secrets Rotation

### Current Status
- ❌ No automated rotation

### Implementation
- Implement JWT secret rotation strategy
- Store old secrets temporarily
- Validate tokens with both old and new secrets
- Rotate on deployment

### Files to Update
- `src/security.py` - Add rotation support
- `src/config.py` - Add rotation configuration

---

## Priority Order
1. ✅ API Rate Limiting (Phase 3.1)
2. ✅ CORS Hardening (Phase 3.2)
3. ✅ Security Headers (Phase 3.4)
4. ✅ Input Validation (Phase 3.3)
5. ✅ CSRF Protection (Phase 3.5)
6. ✅ Dependency Scanning (Phase 3.6)
7. ✅ Secrets Rotation (Phase 3.7)
