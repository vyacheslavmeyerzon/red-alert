# Red Alert Dashboard — Pikud HaOref

Real-time missile and threat alert dashboard for Israel's Home Front Command (פיקוד העורף).
Runs entirely on local Docker Desktop.

## Features

- **Live alert map** — Dark-themed Leaflet map with red pulsing threat zones that auto-clear after 20 seconds of silence
- **Drone/aircraft icons** — Category 5 alerts (hostile aircraft) show animated drone markers
- **Shelter time (זמן מיגון)** — Per-region shelter time display with urgency color coding
- **Alert feed** — Real-time alert cards with category icons, shelter badges, and saved city highlighting
- **History search** — Paginated alert history with city and category filters, clickable city names
- **Statistics** — Daily alert charts and top cities pie chart (Recharts)
- **Saved cities** — Save cities for priority alerts with custom TzvAdom siren (20s silence gap logic)
- **Sound alerts** — Short beep for general alerts, full TzvAdom.mp3 alarm loop for saved city matches
- **TV / Smart TV mode** — Fullscreen map optimized for TV display at `/#/tv`
- **Cast to TV** — Auto-detects LAN IP via WebRTC for easy Smart TV connection (Settings > Cast)
- **Fullscreen map** — Expand the map to full screen with alert overlay
- **Wake Lock** — Prevents display sleep while the dashboard is open

## Architecture

| Service | Tech | Role |
|---------|------|------|
| **Backend** | FastAPI (Python) | Polls Oref API every 2s, stores to PostgreSQL, broadcasts via Redis pub/sub + SSE |
| **Frontend** | React + TypeScript + Vite | Dark-themed dashboard with Leaflet map, Recharts, SSE client |
| **Database** | PostgreSQL 16 + PostGIS | Alert history, spatial centroid column, GIN index on cities, GIST index on centroid |
| **Cache** | Redis 7 | Pub/sub between poller and SSE subscribers |
| **Proxy** | Nginx | Reverse proxy: `/api/*` → backend, `/` → frontend, SSE-optimized config |

## Quick Start

```bash
# Launch everything
docker compose up --build

# Open in browser
# http://localhost        — dashboard (via nginx)
# http://localhost/#/tv   — TV-optimized fullscreen view
# http://localhost:8000/docs — FastAPI Swagger UI
```

**Requirements**: Docker Desktop, Israeli IP address (for real Oref API data).

## Demo Mode

To test without Israeli IP or during peacetime:

```env
# In .env, set:
DEMO_MODE=true
```

This cycles through simulated alerts for UI testing.

## Smart TV Setup

1. Open the dashboard → Settings (⚙️) → "שידור לטלוויזיה"
2. The system auto-detects your LAN IP address
3. Open the displayed URL on your Smart TV's browser
4. If auto-detection fails, click "שנה ידנית" and enter your IP (find it via `ipconfig`)
5. Windows Firewall: allow inbound TCP port 80 on Private network:
   ```powershell
   New-NetFirewallRule -DisplayName 'RedAlert Dashboard HTTP' -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow -Profile Private
   ```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/alerts/stream` | SSE stream of real-time alerts |
| `GET /api/alerts/live` | Current active alerts (last 60s) |
| `GET /api/alerts/history` | Paginated history (`?page=1&limit=50&hours=24&city=...&category=...`) |
| `GET /api/alerts/cities` | City name autocomplete (`?q=תל`) |
| `GET /api/alerts/stats` | Aggregated statistics (`?days=7`) |
| `GET /api/shelter-time` | Shelter time per city or all (`?city=...`) |
| `GET /api/network-info` | LAN IP for TV casting |
| `GET /api/health` | Health check |

## Saved Cities & Alarms

- Go to Settings (⚙️) → "ערים שמורות" to add cities
- General alerts: short beep sound
- Saved city alerts: TzvAdom.mp3 siren loops for up to 20 seconds
- If a new alert arrives within the 20s window, the timer resets
- After 20 seconds of silence, all alerts clear and the alarm stops

## Data Source

Unofficial Pikud HaOref API (`oref.org.il`). Requires Israeli IP address.
Real-time endpoint: `https://www.oref.org.il/WarningMessages/alert/alerts.json`
History endpoint: `https://www.oref.org.il/warningMessages/alert/History/AlertsHistory.json`

## License

This project is licensed under the [MIT License](LICENSE).
