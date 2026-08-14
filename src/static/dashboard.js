// Chart.js instances
let signupsChart, engagementChart, revenueChart, healthChart;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    setDefaultDateRange();
    loadAllKPIs();
});

function setDefaultDateRange() {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    document.getElementById('dateFrom').valueAsDate = thirtyDaysAgo;
    document.getElementById('dateTo').valueAsDate = today;
}

function applyDateRange() {
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;

    if (!dateFrom || !dateTo) {
        alert('Please select both start and end dates');
        return;
    }

    // Calculate days between dates
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    const days = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;

    if (days < 1) {
        alert('End date must be after start date');
        return;
    }

    loadAllKPIs(days);
}

async function fetchKPI(endpoint) {
    try {
        const response = await fetch(`/api/kpi${endpoint}`);
        if (response.status === 401) {
            window.location.href = '/login';
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        return null;
    }
}

async function loadAllKPIs(days = 30) {
    // Show loading state
    document.querySelectorAll('.kpi-value').forEach(el => {
        el.style.opacity = '0.6';
        el.textContent = '...';
    });

    // Acquisition KPIs
    const totalSignups = await fetchKPI('/acquisition/total-signups');
    if (totalSignups) {
        document.getElementById('total-signups').textContent = formatNumber(totalSignups.total_signups);
    }

    const growthRate = await fetchKPI('/acquisition/growth-rate');
    if (growthRate) {
        document.getElementById('signups-7d').textContent = formatNumber(growthRate.this_week);
        document.getElementById('wow-rate').textContent = formatPercent(growthRate.wow_percent);
        document.getElementById('mom-rate').textContent = formatPercent(growthRate.mom_percent);
    }

    // Load signups chart
    const signupsDaily = await fetchKPI(`/acquisition/signups-daily?days=${days}`);
    if (signupsDaily) {
        renderSignupsChart(signupsDaily);
    }

    // Engagement KPIs
    const dau = await fetchKPI(`/engagement/dau?days=${Math.min(days, 30)}`);
    if (dau && dau.length > 0) {
        document.getElementById('dau').textContent = formatNumber(dau[dau.length - 1].count);
    }

    const weeks = Math.max(1, Math.ceil(days / 7));
    const wau = await fetchKPI(`/engagement/wau?weeks=${weeks}`);
    if (wau && wau.length > 0) {
        document.getElementById('wau').textContent = formatNumber(wau[wau.length - 1].count);
    }

    const months = Math.max(1, Math.ceil(days / 30));
    const mau = await fetchKPI(`/engagement/mau?months=${months}`);
    if (mau && mau.length > 0) {
        document.getElementById('mau').textContent = formatNumber(mau[mau.length - 1].count);
    }

    const avgDuration = await fetchKPI(`/engagement/avg-game-duration?days=${days}`);
    if (avgDuration) {
        document.getElementById('avg-duration').textContent = Math.round(avgDuration.avg_duration_minutes) + ' min';
    }

    // Load engagement chart
    const gamesDaily = await fetchKPI(`/engagement/games-played-daily?days=${days}`);
    if (gamesDaily) {
        renderEngagementChart(gamesDaily);
    }

    // Retention KPIs
    const retentionDays = Math.max(90, days);
    const d1 = await fetchKPI(`/retention/d1?days=${retentionDays}`);
    if (d1) {
        document.getElementById('d1-retention').textContent = formatPercent(d1.retention_rate_percent);
    }

    const d7 = await fetchKPI(`/retention/d7?days=${retentionDays}`);
    if (d7) {
        document.getElementById('d7-retention').textContent = formatPercent(d7.retention_rate_percent);
    }

    const d30 = await fetchKPI(`/retention/d30?days=${retentionDays}`);
    if (d30) {
        document.getElementById('d30-retention').textContent = formatPercent(d30.retention_rate_percent);
    }

    const churn = await fetchKPI('/retention/churn-rate?inactive_days=7');
    if (churn) {
        document.getElementById('churn-rate').textContent = formatPercent(churn.churn_rate_percent);
    }

    // Monetization KPIs
    const totalRevenue = await fetchKPI(`/monetization/total-revenue?days=${days}`);
    if (totalRevenue) {
        document.getElementById('total-revenue').textContent = '$' + formatNumber(totalRevenue.total_revenue_usd);
    }

    const premiumConversion = await fetchKPI('/monetization/premium-conversion');
    if (premiumConversion) {
        document.getElementById('premium-conversion').textContent = formatPercent(premiumConversion.conversion_rate_percent);
    }

    const arpu = await fetchKPI(`/monetization/arpu?days=${days}`);
    if (arpu) {
        document.getElementById('arpu').textContent = '$' + arpu.arpu.toFixed(2);
    }

    const adEngagement = await fetchKPI(`/monetization/ad-engagement?days=${days}`);
    if (adEngagement && adEngagement.length > 0) {
        const avgCompletion = adEngagement.reduce((sum, item) => sum + item.completion_rate_percent, 0) / adEngagement.length;
        document.getElementById('ad-completion').textContent = formatPercent(avgCompletion);
    }

    // Load revenue chart
    const revenueDaily = await fetchKPI(`/monetization/revenue-daily?days=${days}`);
    if (revenueDaily) {
        renderRevenueChart(revenueDaily);
    }

    // Product Health KPIs
    const healthScore = await fetchKPI(`/health/health-score?days=${days}`);
    if (healthScore) {
        document.getElementById('health-score').textContent = healthScore.health_score.toFixed(0) + '/100';
    }

    const gameCompletion = await fetchKPI(`/health/game-completion?days=${days}`);
    if (gameCompletion) {
        document.getElementById('game-completion').textContent = formatPercent(gameCompletion.completion_rate_percent);
    }

    const disconnectRate = await fetchKPI(`/health/disconnect-rate?days=${days}`);
    if (disconnectRate) {
        document.getElementById('disconnect-rate').textContent = formatPercent(disconnectRate.disconnect_rate_percent);
    }

    const avgPlayers = await fetchKPI(`/health/avg-players-per-game?days=${days}`);
    if (avgPlayers) {
        document.getElementById('avg-players').textContent = avgPlayers.avg_players.toFixed(1);
    }

    // Load health chart
    const healthTrend = await fetchKPI(`/health/health-trend?days=${days}`);
    if (healthTrend) {
        renderHealthChart(healthTrend);
    }

    // Remove loading state
    document.querySelectorAll('.kpi-value').forEach(el => {
        el.style.opacity = '1';
    });
}

function renderSignupsChart(data) {
    const ctx = document.getElementById('signupsChart').getContext('2d');
    if (signupsChart) signupsChart.destroy();

    signupsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(item => new Date(item.date).toLocaleDateString()),
            datasets: [{
                label: 'New Signups',
                data: data.map(item => item.count),
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    labels: { usePointStyle: true }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

function renderEngagementChart(data) {
    const ctx = document.getElementById('engagementChart').getContext('2d');
    if (engagementChart) engagementChart.destroy();

    const botData = data.map(item => item.bot || 0);
    const lobbyData = data.map(item => item.lobby || 0);

    engagementChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => new Date(item.date).toLocaleDateString()),
            datasets: [
                {
                    label: 'Bot Games',
                    data: botData,
                    backgroundColor: '#f39c12',
                },
                {
                    label: 'Lobby Games',
                    data: lobbyData,
                    backgroundColor: '#667eea',
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    labels: { usePointStyle: true }
                }
            },
            scales: {
                x: { stacked: false },
                y: { stacked: false, beginAtZero: true }
            }
        }
    });
}

function renderRevenueChart(data) {
    const ctx = document.getElementById('revenueChart').getContext('2d');
    if (revenueChart) revenueChart.destroy();

    revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(item => new Date(item.date).toLocaleDateString()),
            datasets: [{
                label: 'Daily Revenue (USD)',
                data: data.map(item => item.revenue),
                borderColor: '#27ae60',
                backgroundColor: 'rgba(39, 174, 96, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#27ae60',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    labels: { usePointStyle: true }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toFixed(0);
                        }
                    }
                }
            }
        }
    });
}

function renderHealthChart(data) {
    const ctx = document.getElementById('healthChart').getContext('2d');
    if (healthChart) healthChart.destroy();

    healthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(item => new Date(item.date).toLocaleDateString()),
            datasets: [{
                label: 'Health Score',
                data: data.map(item => item.health_score),
                borderColor: '#e74c3c',
                backgroundColor: 'rgba(231, 76, 60, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#e74c3c',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    labels: { usePointStyle: true }
                }
            },
            scales: {
                y: {
                    min: 0,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(0);
                        }
                    }
                }
            }
        }
    });
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

function formatPercent(percent) {
    return percent.toFixed(1) + '%';
}
