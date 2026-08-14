from fastapi import FastAPI, Request, HTTPException, status
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from src.routes import api, pages
from src.database import check_health
from src.auth import verify_token
from src.config import settings

app = FastAPI(
    title="10S Analytics Dashboard",
    description="Game growth and performance analytics",
    version="1.0.0",
)

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter


@app.exception_handler(RateLimitExceeded)
async def rate_limit_exception_handler(request: Request, exc: RateLimitExceeded):
    return RedirectResponse(url="/login", status_code=429)


class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Public paths that don't require auth
        public_paths = ["/login", "/static"]
        current_path = request.url.path

        # Check if path is public
        is_public = any(current_path.startswith(path) for path in public_paths)

        if not is_public:
            # Check for valid token in cookie
            token = request.cookies.get("access_token")
            if not token:
                return RedirectResponse(url="/login", status_code=302)

            try:
                verify_token(token)
            except:
                return RedirectResponse(url="/login", status_code=302)

        response = await call_next(request)
        return response


app.add_middleware(AuthMiddleware)

# Include routers
app.include_router(pages.router)
app.include_router(api.router)


@app.get("/health")
async def health():
    db_ok = check_health()
    return {
        "status": "ok",
        "database": "connected" if db_ok else "disconnected",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8002,
        reload=settings.DEBUG,
    )
