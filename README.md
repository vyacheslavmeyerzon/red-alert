# Red Alert Dashboard — Pikud HaOref

Real-time missile and threat alert dashboard for Israel's Home Front Command (Pikud HaOref).
Runs entirely on local Docker Desktop. Installable as a Progressive Web App (PWA) on desktop and mobile.

## Features

### Core Alert System
- **Live alert map** — Dark-themed interactive map with real Israeli municipal boundary polygons (282 areas from OpenStreetMap) as threat zones, color-coded by alert category
- **Dual map engine** — MapLibre GL (vector tiles, GPU-accelerated) for desktop, Leaflet (raster tiles) for Smart TV
- **Drone/aircraft icons** — Category 5 alerts (hostile aircraft) display animated drone markers instead of zones
- **Shelter time** — Per-region countdown timers on map markers with urgency color coding (red/orange/green)
- **Alert feed** — Real-time alert cards with category icons, shelter badges, and saved city highlighting
- **City carousel** — Each alert card cycles through cities one at a time (1.5s rotation) with fade animation and counter
- **Category color coding** — Each threat type (rockets, drones, earthquakes, etc.) gets a distinct color across map and UI
- **Alert deduplication** — Backend deduplicates via PostgreSQL `ON CONFLICT` on `oref_id`; frontend checks `alert.id` before adding to state
- **Auto-clear** — Active alerts clear from the feed after 20 seconds of silence

### Progressive Web App (PWA)
- **Install as app** — One-click install from Chrome/Edge on desktop and mobile
- **Offline support** — Service Worker caches the UI shell; loads instantly even with poor connection
- **Background notifications** — Service Worker maintains SSE connection and shows system notifications when the app is closed
- **Home screen icon** — Launches in standalone mode without browser chrome
- **Auto-update** — Service Worker updates silently in the background
- **HTTPS with auto-generated CA** — Self-signed CA certificate + server certificate generated automatically at container startup, covering the entire /24 subnet for DHCP flexibility

### Multilingual (3 Languages)
- **Hebrew** (עברית) — default, RTL
- **English** — LTR
- **Russian** (Русский) — LTR
- Automatic RTL/LTR direction switching via CSS logical properties

### Sounds & TTS
- **8 alert sounds** — Red Alert (TzvAdom.mp3), Red Alert Short, Bell, Alarm, Warning, Secondary, Urgent, Calm
- **All synthesized** — Bell through Calm use Web Audio API oscillators; no extra audio files needed
- **Sound preview** — Listen to each sound before selecting in Settings
- **"Event ended" soft chime** — When alert type contains "האירוע הסתיים" (event ended), a gentle two-tone chime plays instead of the alarm
- **TTS (Text-to-Speech)** — Announces alert type and city names aloud using browser SpeechSynthesis API (Hebrew, toggleable in Settings)
- **Saved city alarm** — Saved city alerts trigger the selected alarm sound looping for up to 20 seconds; general alerts get a short beep

### Notifications & Vibration
- **Browser notifications** — Notification API alerts when tab is hidden, with alert title and city list
- **Service Worker notifications** — Push-like notifications even when the app is completely closed
- **Vibration patterns** — Long pattern (300-100-300-100-600ms) for saved cities, short for general alerts

### Statistics & History
- **Alert history** — Paginated list with city search and category filter
- **Statistics dashboard** — Period selector (7/14/30/90 days)
- **Area timeline chart** — Daily alert counts as Recharts area chart
- **Hourly heatmap** — 7-day x 24-hour grid showing alert frequency with heat-mapped colors
- **Top cities** — Pie chart of most-alerted cities
- **CSV export** — Download alert data as CSV file

### TV & Streaming Modes
- **TV / Smart TV mode** — Fullscreen dark map at `/#/tv` with:
  - Auto-zoom to active threat zones
  - Idle state showing recent alerts and today's count
  - City carousel in alert cards
  - Real municipal boundary polygons (GeoJSON) with circle fallback
- **Cast to TV** — Auto-detects LAN IP via WebRTC ICE candidates; shows both HTTP and HTTPS URLs
- **Live Overlay (OBS)** — Green-screen page at `/#/overlay` with `#00ff00` background for chroma key compositing
- **Wake Lock** — Prevents display sleep on all modes

### Browser Extension (Chrome/Edge)
- Located in `extension/` directory — Chrome manifest v3
- **Background SSE listener** — Connects to server, shows desktop notifications
- **Popup** — Shows current active alerts
- **Configurable server URL** — Options page to set custom server address
- **Keep-alive alarm** — Maintains connection even when popup is closed

### Saved Cities
- **Priority alerts** — Save cities in Settings for louder alarm + visual highlighting
- **Smart matching** — Partial city name matching (e.g., "תל אביב" matches "תל אביב - מרכז העיר")
- **Persistent** — Saved to localStorage

## Architecture

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Oref    │────>│ Backend  │────>│  Redis   │
│  API     │     │ (FastAPI)│     │ (pub/sub)│
└──────────┘     └────┬─────┘     └────┬─────┘
                      │                │
                      v                v
                ┌──────────┐     ┌──────────┐
                │PostgreSQL│     │ Frontend │
                │ +PostGIS │     │ (React)  │
                └──────────┘     └────┬─────┘
                                      │
                                ┌─────v─────┐
                                │   Nginx   │
                                │ HTTP/HTTPS│
                                └───────────┘
```

| Service | Tech | Role |
|---------|------|------|
| **Backend** | FastAPI (Python 3.11) | Polls Oref API every 2s, stores alerts to PostgreSQL, broadcasts via Redis pub/sub, serves SSE stream and REST API |
| **Frontend** | React 18 + TypeScript + Vite | Dark-themed SPA/PWA with MapLibre GL / Leaflet maps, Recharts, SSE client, Web Audio, SpeechSynthesis |
| **Database** | PostgreSQL 16 + PostGIS | Alert history with spatial centroid column, deduplication via unique `oref_id` index |
| **Cache** | Redis 7 Alpine | Pub/sub channel between poller and SSE subscribers |
| **Proxy** | Nginx Alpine | Reverse proxy (`/api/*` -> backend, `/` -> frontend), SSE-optimized config, auto-generated HTTPS with CA cert |

## Quick Start

### Option A: Auto-detect LAN IP (recommended)

```bash
bash start.sh
```

This detects your LAN IP automatically and starts all services with proper HTTPS certificates.

### Option B: Manual IP

```bash
HOST_LAN_IP=192.168.1.100 docker compose up -d --build
```

### Option C: Using .env file

Create a `.env` file in the project root:
```env
HOST_LAN_IP=192.168.1.100
```

Then:
```bash
docker compose up -d --build
```

### Access Points

| URL | Description |
|-----|-------------|
| `http://localhost` | Main dashboard |
| `https://<lan-ip>` | HTTPS (for PWA on mobile) |
| `http://localhost/#/tv` | TV fullscreen mode |
| `http://localhost/#/overlay` | OBS streaming overlay |
| `http://localhost:8000/docs` | FastAPI Swagger UI |

**Requirements**: Docker Desktop, Israeli IP address (for real Oref API data).

### Demo Mode

Set `DEMO_MODE=true` in `.env` or environment to get simulated alerts without an Israeli IP:
```bash
DEMO_MODE=true docker compose up -d
```

## Install as App (PWA)

### Desktop (Chrome / Edge)
1. Open `http://localhost` in your browser
2. Click the install icon in the address bar (or menu > "Install Red Alert Dashboard")
3. The dashboard opens as a standalone app with its own window and taskbar icon

### Mobile (Android)
1. Download the CA certificate: `http://<lan-ip>/cert.pem`
2. Install it on the phone: **Settings > Security > Install certificate > CA Certificate**
3. Open `https://<lan-ip>/` in Chrome
4. Wait ~30 seconds, then tap the three-dot menu > **"Install app"**
5. The app icon appears on your home screen with background notifications

### Mobile (iOS)
1. Open `http://<lan-ip>` in Safari
2. Tap Share > **"Add to Home Screen"**

### HTTPS Certificate System

The system uses a two-tier certificate architecture for portability:

1. **CA Certificate** — Generated once on first startup, persisted in Docker volume `nginx-ssl`. This is what you install on your phone **one time**.
2. **Server Certificate** — Signed by the CA, regenerated automatically when IP changes. Covers the entire /24 subnet (e.g., all 192.168.1.x addresses) so DHCP changes don't break it.

**When moving to a new computer or network:**
- Set the new `HOST_LAN_IP` and restart
- The CA stays in the Docker volume — if the volume is fresh (new machine), a new CA generates and you install it on the phone once
- If only the IP changed within the same subnet, nothing needs to be done

## Smart TV Setup

1. Open the dashboard > Settings > **"Cast to TV"**
2. The system auto-detects your LAN IP via WebRTC
3. Open the displayed URL (HTTP or HTTPS) on your Smart TV's browser
4. If auto-detection fails, click **"Enter manually"** and enter your IP (find it via `ipconfig`)
5. Windows Firewall — allow inbound TCP ports 80 and 443:
   ```powershell
   New-NetFirewallRule -DisplayName 'RedAlert HTTP' -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow -Profile Private
   New-NetFirewallRule -DisplayName 'RedAlert HTTPS' -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow -Profile Private
   ```

## OBS / Streaming Overlay

1. In OBS, add a **Browser Source**
2. Set URL to `http://localhost/#/overlay`
3. Set resolution to 1920x1080
4. Add a **Chroma Key** filter (Key Color: `#00ff00` Green)
5. Alert cards slide in over your stream when alerts arrive

Alternative — use transparency directly with custom CSS:
```css
body, .overlay-view { background: transparent !important; }
```

## Chrome Extension

1. Open `chrome://extensions/` in Chrome or Edge
2. Enable **"Developer mode"**
3. Click **"Load unpacked"** and select the `extension/` folder
4. Click the extension icon > Settings to set your server URL (e.g., `http://192.168.1.100`)
5. Desktop notifications appear for all alerts

> The PWA provides the same notification functionality without manual extension loading. The extension is an alternative for users who prefer not to install the PWA.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/alerts/stream` | GET | SSE stream — real-time alerts (event type: `alert`) |
| `/api/alerts/live` | GET | Current active alerts (last 60 seconds) |
| `/api/alerts/history` | GET | Paginated history. Query: `?page=1&limit=50&hours=24&city=...&category=...` |
| `/api/alerts/cities` | GET | City name autocomplete. Query: `?q=תל` |
| `/api/alerts/stats` | GET | Aggregated stats (daily breakdown, top cities, categories). Query: `?days=7` |
| `/api/alerts/stats/hourly` | GET | Hourly heatmap data (DOW x hour). Query: `?days=7` |
| `/api/alerts/stats/timeline` | GET | Daily counts for timeline chart. Query: `?days=30` |
| `/api/alerts/export` | GET | CSV download. Query: `?days=7&category=1` |
| `/api/shelter-time` | GET | Shelter time in seconds. Query: `?city=שדרות` or omit for all |
| `/api/network-info` | GET | LAN IP for TV casting auto-detection |
| `/api/health` | GET | Health check (`{"status": "ok"}`) |
| `/cert.pem` | GET | Download CA certificate for mobile HTTPS (served by nginx) |

## Alert Categories (from Pikud HaOref)

| Code | Hebrew | Description |
|------|--------|-------------|
| 1 | ירי רקטות וטילים | Rockets and missiles |
| 2 | אירוע רדיולוגי | Radiological event |
| 3 | רעידת אדמה | Earthquake |
| 4 | צונאמי | Tsunami |
| 5 | חדירת כלי טיס עוין | Hostile aircraft intrusion (drones) |
| 6 | חומרים מסוכנים | Hazardous materials |
| 7 | חדירת מחבלים | Terrorist intrusion |
| 13 | עדכון מיוחד | Special update |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `HOST_LAN_IP` | _(auto-detect)_ | Host machine LAN IP for HTTPS cert generation and TV casting |
| `DEMO_MODE` | `false` | Enable simulated alerts without Israeli IP |
| `POLL_INTERVAL_MS` | `2000` | Oref API polling interval in milliseconds |
| `DATABASE_URL` | `postgresql+asyncpg://redalert:changeme@db:5432/redalert` | PostgreSQL connection string |
| `REDIS_URL` | `redis://redis:6379` | Redis connection string |
| `DB_PASSWORD` | `changeme` | PostgreSQL password |
| `POSTGRES_DB` | `redalert` | PostgreSQL database name |
| `POSTGRES_USER` | `redalert` | PostgreSQL username |

## Data Source

Unofficial Pikud HaOref API (`oref.org.il`). Requires Israeli IP address for real data.
- Real-time: `https://www.oref.org.il/WarningMessages/alert/alerts.json`
- History: `https://www.oref.org.il/warningMessages/alert/History/AlertsHistory.json`

Map polygons: Israeli municipal boundaries from OpenStreetMap (Overpass API), simplified to 1.1MB GeoJSON (282 areas).

## License

This project is licensed under the [MIT License](LICENSE).
