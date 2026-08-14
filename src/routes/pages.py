from fastapi import APIRouter, Depends, HTTPException, status, Form, Response, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from datetime import timedelta
from src.database import get_db
from src.auth import (
    hash_password,
    verify_password,
    create_access_token,
    verify_token,
    limiter,
)
from src.config import settings

router = APIRouter()


def get_user_from_cookie(request):
    """Extract and verify JWT from cookie"""
    token = request.cookies.get("access_token")
    if not token:
        return None
    try:
        payload = verify_token(token)
        return payload
    except:
        return None


@router.post("/login")
@limiter.limit("5/minute")
async def login(
    request: Request,
    email: str = Form(...),
    password: str = Form(...),
    response: Response = None,
):
    if email != settings.ADMIN_EMAIL:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(password, settings.ADMIN_PASSWORD_HASH):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(
        data={"email": email},
        expires_delta=timedelta(hours=settings.JWT_EXPIRATION_HOURS),
    )

    response = RedirectResponse(url="/", status_code=302)
    response.set_cookie(
        "access_token",
        access_token,
        httponly=True,
        secure=settings.ENVIRONMENT == "production",
        samesite="strict",
        max_age=settings.JWT_EXPIRATION_HOURS * 3600,
    )
    return response


@router.get("/logout")
async def logout(response: Response = None):
    response = RedirectResponse(url="/login", status_code=302)
    response.delete_cookie("access_token")
    return response


@router.get("/login", response_class=HTMLResponse)
async def login_page(request=None):
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>10S Analytics - Login</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .login-container {
                background: white;
                border-radius: 12px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                padding: 40px;
                width: 100%;
                max-width: 400px;
            }
            .login-container h1 {
                color: #333;
                margin-bottom: 8px;
                font-size: 28px;
            }
            .login-container .subtitle {
                color: #666;
                font-size: 14px;
                margin-bottom: 30px;
            }
            .form-group {
                margin-bottom: 20px;
            }
            .form-group label {
                display: block;
                color: #333;
                font-weight: 600;
                margin-bottom: 8px;
                font-size: 14px;
            }
            .form-group input {
                width: 100%;
                padding: 12px 16px;
                border: 1px solid #ddd;
                border-radius: 8px;
                font-size: 14px;
                transition: all 0.3s ease;
                font-family: inherit;
            }
            .form-group input:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }
            .login-btn {
                width: 100%;
                padding: 12px 16px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-top: 20px;
            }
            .login-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
            }
            .login-btn:active {
                transform: translateY(0);
            }
            .error {
                color: #e74c3c;
                font-size: 14px;
                margin-top: 12px;
                text-align: center;
            }
        </style>
    </head>
    <body>
        <div class="login-container">
            <h1>📊 10S Analytics</h1>
            <p class="subtitle">Growth & Performance Dashboard</p>

            <form method="post" action="/login">
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" required autofocus>
                </div>

                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" required>
                </div>

                <button type="submit" class="login-btn">Sign In</button>
            </form>
        </div>
    </body>
    </html>
    """


@router.get("/", response_class=HTMLResponse)
async def dashboard(request=None):
    # Check for token in cookie - simplified for now
    # In production, middleware would handle this
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>10S Analytics Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="/static/chart.min.js"></script>
        <link rel="stylesheet" href="/static/style.css">
    </head>
    <body>
        <div class="dashboard">
            <header class="dashboard-header">
                <div class="header-content">
                    <h1>📊 10S Game Analytics</h1>
                    <div class="header-controls">
                        <input type="date" id="dateFrom" class="date-picker">
                        <input type="date" id="dateTo" class="date-picker">
                        <button class="btn-secondary" onclick="applyDateRange()">Apply</button>
                        <a href="/logout" class="btn-logout">Logout</a>
                    </div>
                </div>
            </header>

            <main class="dashboard-main">
                <!-- Acquisition Section -->
                <section class="kpi-section">
                    <h2>📈 Acquisition</h2>
                    <div class="kpi-grid">
                        <div class="kpi-card">
                            <h3>Total Signups</h3>
                            <p class="kpi-value" id="total-signups">--</p>
                        </div>
                        <div class="kpi-card">
                            <h3>Signups (7d)</h3>
                            <p class="kpi-value" id="signups-7d">--</p>
                        </div>
                        <div class="kpi-card">
                            <h3>Growth Rate (WoW)</h3>
                            <p class="kpi-value" id="wow-rate">--</p>
                        </div>
                        <div class="kpi-card">
                            <h3>Growth Rate (MoM)</h3>
                            <p class="kpi-value" id="mom-rate">--</p>
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="signupsChart"></canvas>
                    </div>
                </section>

                <!-- Engagement Section -->
                <section class="kpi-section">
                    <h2>👥 Engagement</h2>
                    <div class="kpi-grid">
                        <div class="kpi-card">
                            <h3>Daily Active Users</h3>
                            <p class="kpi-value" id="dau">--</p>
                        </div>
                        <div class="kpi-card">
                            <h3>Weekly Active Users</h3>
                            <p class="kpi-value" id="wau">--</p>
                        </div>
                        <div class="kpi-card">
                            <h3>Monthly Active Users</h3>
                            <p class="kpi-value" id="mau">--</p>
                        </div>
                        <div class="kpi-card">
                            <h3>Avg Game Duration</h3>
                            <p class="kpi-value" id="avg-duration">--</p>
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="engagementChart"></canvas>
                    </div>
                </section>

                <!-- Retention Section -->
                <section class="kpi-section">
                    <h2>🎯 Retention</h2>
                    <div class="kpi-grid">
                        <div class="kpi-card">
                            <h3>D1 Retention</h3>
                            <p class="kpi-value" id="d1-retention">--</p>
                        </div>
                        <div class="kpi-card">
                            <h3>D7 Retention</h3>
                            <p class="kpi-value" id="d7-retention">--</p>
                        </div>
                        <div class="kpi-card">
                            <h3>D30 Retention</h3>
                            <p class="kpi-value" id="d30-retention">--</p>
                        </div>
                        <div class="kpi-card">
                            <h3>Churn Rate</h3>
                            <p class="kpi-value" id="churn-rate">--</p>
                        </div>
                    </div>
                </section>

                <!-- Monetization Section -->
                <section class="kpi-section">
                    <h2>💰 Monetization</h2>
                    <div class="kpi-grid">
                        <div class="kpi-card">
                            <h3>Total Revenue (30d)</h3>
                            <p class="kpi-value" id="total-revenue">--</p>
                        </div>
                        <div class="kpi-card">
                            <h3>Premium Conversion</h3>
                            <p class="kpi-value" id="premium-conversion">--</p>
                        </div>
                        <div class="kpi-card">
                            <h3>ARPU</h3>
                            <p class="kpi-value" id="arpu">--</p>
                        </div>
                        <div class="kpi-card">
                            <h3>Ad Completion</h3>
                            <p class="kpi-value" id="ad-completion">--</p>
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="revenueChart"></canvas>
                    </div>
                </section>

                <!-- Health Section -->
                <section class="kpi-section">
                    <h2>💚 Product Health</h2>
                    <div class="kpi-grid">
                        <div class="kpi-card">
                            <h3>Health Score</h3>
                            <p class="kpi-value" id="health-score">--</p>
                        </div>
                        <div class="kpi-card">
                            <h3>Game Completion</h3>
                            <p class="kpi-value" id="game-completion">--</p>
                        </div>
                        <div class="kpi-card">
                            <h3>Disconnect Rate</h3>
                            <p class="kpi-value" id="disconnect-rate">--</p>
                        </div>
                        <div class="kpi-card">
                            <h3>Avg Players/Game</h3>
                            <p class="kpi-value" id="avg-players">--</p>
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="healthChart"></canvas>
                    </div>
                </section>
            </main>
        </div>
        <script src="/static/dashboard.js"></script>
    </body>
    </html>
    """
