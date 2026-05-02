# Environment Setup Guide

## Prerequisites

- Python 3.12+ (not 3.14)
- PostgreSQL 12+ running on localhost:5432
- Git

## Quick Start (5 minutes)

### 1. Activate Virtual Environment

```bash
cd /Users/lokendracarpenter/Documents/Projects/10S/App
source venv/bin/activate
```

You should see `(venv)` in your terminal prompt.

### 2. Start the Server

```bash
cd src
python3 main.py
```

Expected output:
```
INFO:     Initializing database...
INFO:     Database tables created successfully
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

### 3. Test the Connection

In another terminal:
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "websocket": "ready"
}
```

## Fresh Installation

If starting from scratch:

### Step 1: Create Virtual Environment

```bash
cd /Users/lokendracarpenter/Documents/Projects/10S/App
python3.13 -m venv venv
source venv/bin/activate
```

### Step 2: Upgrade pip

```bash
pip install --upgrade pip setuptools wheel
```

### Step 3: Install Dependencies

```bash
pip install -r src/requirements.txt
```

### Step 4: Verify Installation

```bash
cd src
python3 -c "import fastapi; import sqlalchemy; import psycopg; print('✅ All imports successful')"
```

### Step 5: Configure Environment

Create/update `.env` file in `src/` directory:

```
DATABASE_URL=postgresql://postgres:postgres@localhost/postgres
JWT_SECRET_KEY=your_secret_key_here
SERVER_HOST=0.0.0.0
SERVER_PORT=8000
```

⚠️ **IMPORTANT**: Don't commit `.env` file! Add to `.gitignore`:

```bash
echo ".env" >> .gitignore
echo "venv/" >> .gitignore
```

## Troubleshooting

### Issue: "No module named 'fastapi'"

**Solution**: Make sure virtual environment is activated:
```bash
source venv/bin/activate
```

### Issue: "psycopg.OperationalError: Cannot connect to database"

**Checklist**:
1. PostgreSQL is running: `psql --version`
2. Connection details in `.env` are correct
3. Database exists: `psql -U postgres -d postgres -c "SELECT 1"`

### Issue: "Port 8000 already in use"

**Solution**: Use different port:
```bash
# In main.py, or pass to uvicorn
python3 src/main.py --port 8001
```

### Issue: "ImportError: cannot import name..."

**Solution**: Clean install:
```bash
pip install -r src/requirements.txt --force-reinstall
```

## Development Workflow

### Daily Start
```bash
cd /Users/lokendracarpenter/Documents/Projects/10S/App
source venv/bin/activate
cd src
python3 main.py
```

### Run Tests (when available)
```bash
pytest tests/ -v
```

### Code Formatting
```bash
black src/ --line-length 88
```

### Linting
```bash
flake8 src/ --max-line-length=88
```

### Type Checking
```bash
mypy src/ --ignore-missing-imports
```

## Project Structure

```
App/
├── venv/                    # Virtual environment (don't commit)
├── src/                   # Backend source code
│   ├── main.py             # FastAPI application
│   ├── models.py           # Database models
│   ├── database.py         # Database configuration
│   ├── schemas.py          # Request/response validation
│   ├── config.py           # Configuration
│   ├── game_rules.py       # Game logic
│   ├── game_constants.py   # Game constants
│   ├── __init__.py         # Package init
│   ├── requirements.txt    # Python dependencies
│   ├── .env                # Secrets (not committed)
│   └── test_database.py    # Database tests
├── .dev-history/           # Development documentation
└── README.md               # Project overview
```

## Environment Variables

All configuration comes from environment variables (or `.env` file):

| Variable | Default | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost/postgres` | PostgreSQL connection |
| `JWT_SECRET_KEY` | `your_secret_key_here` | JWT signing key |
| `SERVER_HOST` | `0.0.0.0` | Server bind address |
| `SERVER_PORT` | `8000` | Server port |
| `SERVER_RELOAD` | `True` | Hot reload on file changes |
| `JWT_ALGORITHM` | `HS256` | Token algorithm |
| `TURN_TIMEOUT_SECONDS` | `30` | Player turn timeout |

## Python Version

**Required**: Python 3.12 or 3.13  
**Why not 3.14**: Too new, some dependencies don't have prebuilt wheels yet

To check your Python version:
```bash
python3 --version
```

## Dependencies Management

### Add a New Dependency

1. Install it:
```bash
pip install package_name
```

2. Update requirements.txt:
```bash
pip freeze > src/requirements.txt
```

3. Commit both changes

### Upgrade a Dependency

```bash
pip install --upgrade package_name
pip freeze > src/requirements.txt
```

## IDE Setup

### VSCode

1. Install Python extension
2. Select interpreter: `./venv/bin/python`
3. Create `.vscode/settings.json`:

```json
{
  "python.linting.enabled": true,
  "python.linting.flake8Enabled": true,
  "python.formatting.provider": "black",
  "python.testing.pytestEnabled": true,
  "[python]": {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "ms-python.python"
  }
}
```

### PyCharm

1. Project → Settings → Python Interpreter
2. Click ⚙️ → Add → Existing Environment
3. Select `/App/venv/bin/python`
4. Enable pytest: Settings → Tools → Python Integrated Tools

## Production Deployment

These steps are for local development only. For production:

1. Use managed PostgreSQL (AWS RDS, Heroku, etc.)
2. Set strong `JWT_SECRET_KEY`
3. Change `SERVER_RELOAD` to False
4. Use production ASGI server (Gunicorn, etc.)
5. Configure proper CORS origins
6. Add monitoring and logging

See `ARCHITECTURE.md` for production considerations.

## Getting Help

- Check `.dev-history/` for decision documentation
- Review `DECISIONS.md` for architectural rationale
- See `DATABASE_DESIGN.md` for schema details
- Check recent `SESSION_*_SUMMARY.md` for context

## Next Steps After Setup

1. ✅ Verify database connection works
2. ⬜ Implement authentication routes
3. ⬜ Create game endpoints
4. ⬜ Set up WebSocket handlers
5. ⬜ Write tests
6. ⬜ Deploy

---

**Last Updated**: 2026-05-01  
**Python Version**: 3.13  
**Status**: Ready for development
