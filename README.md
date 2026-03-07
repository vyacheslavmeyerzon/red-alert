# Red Alert Dashboard — Pikud HaOref

Real-time missile and threat alert dashboard for Israel's Home Front Command (Pikud HaOref).
Runs entirely on local Docker Desktop. Installable as a Progressive Web App (PWA) on desktop and mobile.

## Features

### Core Alert System
- **Live alert map** — Dark-themed interactive map with real Israeli municipal boundary polygons (282 areas from OpenStreetMap) as threat zones, color-coded by alert category. Falls back to 3km circles for cities without polygon data.
- **Dual map engine** — MapLibre GL (vector tiles, GPU-accelerated) for desktop map, Leaflet (raster tiles) for Smart TV mode
- **Drone/aircraft icons** — Category 5 alerts (hostile aircraft) display animated SVG drone markers instead of polygon/circle zones
- **Shelter time countdown** — Per-region countdown timers (MM:SS) on map markers with urgency color coding (red < 15s, orange < 60s, green). Hidden for "event ended" alerts since shelter is no longer needed.
- **Alert feed** — Real-time alert cards with category-specific icons and colors, shelter badges, and saved city highlighting
- **City carousel** — Each alert card cycles through cities one at a time (1.5s rotation) with CSS fade animation and counter (e.g., "2/5")
- **Alert deduplication** — Backend deduplicates via PostgreSQL `INSERT ... ON CONFLICT DO NOTHING` on `oref_id`; frontend checks `alert.id` before adding to state
- **Auto-clear** — Active alerts clear from the feed and map after 20 seconds of silence

### Alert Categories

| Code | Icon | Color | Hebrew | Description |
|------|------|-------|--------|-------------|
| 1 | 🚀 | Red | ירי רקטות וטילים | Rockets and missiles |
| 2 | ☢️ | Amber | אירוע רדיולוגי | Radiological event |
| 3 | 🌍 | Purple | רעידת אדמה | Earthquake |
| 4 | 🌊 | Blue | צונאמי | Tsunami |
| 5 | ✈️ | Orange | חדירת כלי טיס עוין | Hostile aircraft intrusion (drones) |
| 6 | ⚠️ | Green | חומרים מסוכנים | Hazardous materials |
| 7 | 🔴 | Dark Red | חדירת מחבלים | Terrorist intrusion |
| 10 | ⏳ | Yellow | התרעה מוקדמת | Early warning ("alerts expected soon") |
| 13 | ℹ️ | Indigo | עדכון מיוחד | Special update |
| 14 | ⏳ | Yellow | התרעה מוקדמת | Early warning ("alerts expected soon") |

### Sound System

The dashboard uses different sounds depending on the alert type and whether it matches your saved cities:

| Alert Type | Sound | TTS | Vibration |
|------------|-------|-----|-----------|
| **Saved city match** | Selected alarm sound (loops up to 20s) | Announces alert type + matched city names | Long pattern |
| **General alert** (no match or no saved cities) | Short beep | None | Short pulse |
| **Early warning** ("בדקות הקרובות") | Steady 5-second warning tone (740Hz) | None | None |
| **Event ended** ("האירוע הסתיים") | Soft two-tone chime (C5 + E5) | None | None |

**Available alarm sounds** (selectable in Settings):
1. Red Alert (TzvAdom.mp3) — classic siren
2. Red Alert Short — shortened siren
3. Bell — synthesized bell tone
4. Alarm — rapid square wave beeps
5. Warning — rising sawtooth tone
6. Secondary — triangle wave double beep
7. Urgent — fast staccato pulses
8. Calm — gentle sine wave

Sounds 3-8 are synthesized using Web Audio API oscillators — no extra audio files needed.

### TTS (Text-to-Speech)
- **Enabled by default** — toggleable in Settings
- **Saved cities only** — TTS announces alert type and city names only when the alert matches a saved city
- **Hebrew voice** — Uses browser SpeechSynthesis API with `he-IL` locale. Requires Hebrew language pack installed in Windows (Settings > Time & Language > Add language > עברית > Text-to-Speech)
- **Chrome unlock** — Silent utterance on first click to bypass Chrome's autoplay policy
- **1.5s delay** — TTS starts after the alarm sound to avoid audio conflicts
- **Voices preloaded** — `voiceschanged` event listener ensures Chrome async voice loading completes

### Progressive Web App (PWA)
- **Install as app** — One-click install from Chrome/Edge on desktop and mobile
- **Offline support** — Service Worker caches the UI shell (HTML, JS, icons); loads instantly even with poor connection
- **Background notifications** — Service Worker maintains its own SSE connection to `/api/alerts/stream` and shows system notifications even when the app is completely closed
- **Home screen icon** — Launches in standalone mode without browser chrome
- **Auto-update** — Service Worker updates silently in the background
- **HTTPS with auto-generated CA** — Two-tier certificate system: CA cert (install once on phone) + server cert (auto-regenerated per IP, covers entire /24 subnet)

### Multilingual (3 Languages)
- **Hebrew** (עברית) — default, RTL layout
- **English** — LTR layout
- **Russian** (Русский) — LTR layout
- Automatic RTL/LTR direction switching via CSS logical properties
- Language selector in Settings with 3 buttons

### Notifications & Vibration
- **Browser notifications** — Notification API alerts when tab is hidden, with alert title and city list
- **Service Worker notifications** — Push-like notifications even when the app is completely closed, with vibration pattern and app icon
- **Vibration patterns** — Long pattern (300-100-300-100-600ms) for saved city alerts, short pattern (200-100-200ms) for general alerts. No vibration for event-ended or early warning.

### Statistics & History
- **Alert history** — Paginated list with city search filter and category dropdown filter
- **Statistics dashboard** — Period selector (7/14/30/90 days)
- **Area timeline chart** — Daily alert counts rendered as Recharts area chart
- **Hourly heatmap** — 7-day (DOW) x 24-hour grid showing alert frequency with heat-mapped colors
- **Top cities** — Pie chart of most-alerted cities
- **CSV export** — Download filtered alert data as CSV file via `/api/alerts/export`

### TV & Streaming Modes
- **TV / Smart TV mode** (`/#/tv`) — Fullscreen dark map with:
  - Auto-zoom to active threat zones, fly-back to Israel overview when idle
  - Real municipal boundary polygons (GeoJSON) with circle fallback for unmatched cities
  - Idle state showing clock, recent alerts list, and today's alert count
  - City carousel in alert overlay cards
  - Same sound logic as main dashboard (saved cities alarm, early warning tone, etc.)
- **Cast to TV** — Auto-detects LAN IP via WebRTC ICE candidates and backend API; shows both HTTP and HTTPS URLs with copy buttons. Manual IP entry fallback.
- **Live Overlay for OBS** (`/#/overlay`) — Green-screen page (`#00ff00` background) for chroma key compositing. Alert cards slide in when alerts arrive, shows recent alerts when idle.
- **Wake Lock** — Prevents display sleep on all modes

### Browser Extension (Chrome/Edge)
- Located in `extension/` directory — Chrome manifest v3
- **Background SSE listener** — Connects to server, shows desktop notifications for all alerts
- **Popup** — Shows current active alerts in extension popup
- **Configurable server URL** — Options page to set custom server address
- **Keep-alive alarm** — Chrome alarm API maintains connection even when popup is closed

### Saved Cities
- **Priority alerts** — Save cities in Settings for louder alarm sound + TTS announcement + visual highlighting in feed
- **Smart matching** — Partial city name matching (e.g., "תל אביב" matches "תל אביב - מרכז העיר")
- **Persistent** — Saved to localStorage, survives browser restarts
- **Feed highlighting** — Matched cities show 🔔 icon and colored banner in alert cards
- **Onboarding** — First-time welcome screen unlocks audio context (browser autoplay policy)

## Architecture

```
┌──────────────────┐
│  Pikud HaOref    │
│  oref.org.il     │
│  (alerts JSON)   │
└────────┬─────────┘
         │ HTTP GET every 2s
         ▼
┌──────────────────┐     ┌──────────────┐
│    Backend       │────>│    Redis     │
│   FastAPI        │     │   pub/sub    │
│                  │     │  channel:    │
│  poller.py       │     │ alerts:live  │
│  (poll loop)     │     └──────┬───────┘
│        │         │            │
│        ▼         │            │ subscribe
│  PostgreSQL      │            ▼
│  +PostGIS        │     ┌──────────────┐
│  (store+dedup)   │     │  SSE Stream  │
│                  │     │ /api/alerts/ │
│  REST API        │     │   stream     │
│  /api/*          │     └──────┬───────┘
└──────────────────┘            │
                                │ EventSource
         ┌──────────────────────┘
         ▼
┌──────────────────┐     ┌──────────────┐
│    Nginx         │────>│  Frontend    │
│  reverse proxy   │     │  React SPA   │
│                  │     │              │
│  :80  HTTP       │     │ MapLibre GL  │
│  :443 HTTPS      │     │ Leaflet      │
│  /api -> backend │     │ Web Audio    │
│  /    -> frontend│     │ SpeechSynth  │
│  /cert.pem -> CA │     │ Service Worker│
│  auto-SSL certs  │     │ Recharts     │
└──────────────────┘     └──────────────┘
```

### Data Flow

1. **Poller** (`backend/app/poller.py`) polls Oref API every 2 seconds
2. New alert arrives → stored in **PostgreSQL** via `INSERT ... ON CONFLICT DO NOTHING` (dedup by `oref_id`)
3. If new (not duplicate) → published to **Redis** channel `alerts:live`
4. **SSE endpoint** (`/api/alerts/stream`) subscribes to Redis → pushes event to all connected browsers
5. **Frontend** `useAlertStream` hook receives SSE event → deduplicates on client → triggers sound/TTS/notification chain
6. **Service Worker** independently listens to SSE → shows system notifications when app is in background

### Services

| Service | Tech | Port | Role |
|---------|------|------|------|
| **Backend** | FastAPI (Python 3.11), uvicorn | 8000 | Polls Oref API, stores to DB, Redis pub/sub, SSE stream, REST API |
| **Frontend** | React 18 + TypeScript + Vite, nginx | 3000 (internal 80) | Dark-themed SPA/PWA with maps, charts, audio, TTS |
| **Database** | PostgreSQL 16 + PostGIS | 5432 | Alert storage, deduplication via unique `oref_id`, spatial centroid column |
| **Cache** | Redis 7 Alpine | 6379 | Pub/sub channel between poller and SSE subscribers |
| **Proxy** | Nginx Alpine | 80, 443 | Reverse proxy, SSE-optimized (`proxy_buffering off`, 24h timeout), auto-generated HTTPS |

## Quick Start

### Option A: Auto-detect LAN IP (recommended)

```bash
bash start.sh
```

The script detects your LAN IP via PowerShell (Windows) or `ip route` (Linux/macOS), sets `HOST_LAN_IP`, and starts all services. It prints the dashboard URL and PWA install instructions.

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
| `https://<lan-ip>` | HTTPS (required for PWA on mobile) |
| `http://localhost/#/tv` | TV fullscreen mode |
| `http://localhost/#/overlay` | OBS streaming overlay (green screen) |
| `http://localhost:8000/docs` | FastAPI Swagger UI (interactive API docs) |
| `http://<lan-ip>/cert.pem` | Download CA certificate for mobile |

**Requirements**: Docker Desktop, Israeli IP address (for real Oref API data).

### Demo Mode

Set `DEMO_MODE=true` to get simulated alerts without an Israeli IP. The demo cycles through 3 sample alerts (rockets, drones) with ~30% probability each poll cycle:
```bash
DEMO_MODE=true docker compose up -d
```

## Install as App (PWA)

### Desktop (Chrome / Edge)
1. Open `http://localhost` in your browser
2. Click the install icon in the address bar (or menu > "Install Red Alert Dashboard")
3. The dashboard opens as a standalone app with its own window and taskbar icon

### Mobile (Android) — Full PWA with notifications
1. Download the CA certificate: open `http://<lan-ip>/cert.pem` on your phone
2. Install it: **Settings > Security > Install certificate > CA Certificate** > select downloaded file
3. Open `https://<lan-ip>/` in Chrome
4. Wait ~30 seconds (Chrome engagement requirement), then tap three-dot menu > **"Install app"**
5. The app icon appears on your home screen with background notifications

### Mobile (iOS)
1. Open `http://<lan-ip>` in Safari
2. Tap Share > **"Add to Home Screen"**
3. Note: iOS does not support background notifications via Service Worker

### HTTPS Certificate System

The system uses a two-tier certificate architecture for portability:

1. **CA Certificate** — Generated once on first startup, persisted in Docker volume `nginx-ssl`. This is what you install on your phone **one time**.
2. **Server Certificate** — Signed by the CA, regenerated automatically when the detected IP changes. Covers the entire /24 subnet (e.g., all 192.168.1.2–254 addresses) so DHCP changes within the subnet don't break HTTPS.

**How it works at startup:**
- Nginx entrypoint checks if CA exists → generates if not
- Reads `HOST_LAN_IP` env var → builds SAN (Subject Alternative Name) list with the IP + all IPs in its /24 subnet
- Checks if existing server cert already covers those IPs → skips regeneration if yes
- Signs new server cert with the CA → nginx starts with valid HTTPS

**When moving to a new computer or network:**
- Set the new `HOST_LAN_IP` and restart → new server cert generated, signed by same CA
- If Docker volume is fresh (new machine) → new CA generated, install it on phone once
- If only the IP changed within the same /24 subnet → nothing to do, already covered

### TTS Setup (Windows)

TTS requires a Hebrew voice installed in Windows:
1. **Win + I** > **Time & Language** > **Language & Region**
2. **Add a language** > search **עברית (Hebrew)**
3. Check **"Text-to-Speech"** during installation
4. Restart Chrome

Without the Hebrew voice pack, TTS will silently fail (27 English/Russian voices available by default, but no Hebrew).

## Smart TV Setup

1. Open the dashboard > Settings > **"Cast to TV"**
2. The system auto-detects your LAN IP via WebRTC ICE candidates + backend `/api/network-info`
3. Both HTTP and HTTPS URLs are displayed with copy buttons
4. Open the URL on your Smart TV's built-in browser
5. If auto-detection fails, click **"Enter manually"** and type your IP (find it via `ipconfig` on Windows)
6. Windows Firewall — allow inbound TCP ports 80 and 443:
   ```powershell
   New-NetFirewallRule -DisplayName 'RedAlert HTTP' -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow -Profile Private
   New-NetFirewallRule -DisplayName 'RedAlert HTTPS' -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow -Profile Private
   ```

## OBS / Streaming Overlay

1. In OBS, add a **Browser Source**
2. Set URL to `http://localhost/#/overlay`
3. Set resolution to 1920x1080
4. Add a **Chroma Key** filter (Key Color: `#00ff00` Green)
5. Alert cards slide in over your stream content when alerts arrive

Alternative — use transparency directly with custom CSS in the Browser Source:
```css
body, .overlay-view { background: transparent !important; }
```

## Chrome Extension

1. Open `chrome://extensions/` in Chrome or Edge
2. Enable **"Developer mode"**
3. Click **"Load unpacked"** and select the `extension/` folder from this project
4. Click the extension icon > Settings to configure your server URL (e.g., `http://192.168.1.100`)
5. Desktop notifications appear for all alerts automatically

> The PWA (install as app) provides the same notification functionality without manually loading an extension. The extension is an alternative for users who prefer not to install the PWA.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/alerts/stream` | GET | SSE stream — real-time alerts. Event type: `alert`, data: JSON `{id, cat, title, desc, data[]}` |
| `/api/alerts/live` | GET | Current active alerts (last 60 seconds) |
| `/api/alerts/history` | GET | Paginated history. Query: `?page=1&limit=50&hours=24&city=...&category=...` |
| `/api/alerts/cities` | GET | City name autocomplete for search. Query: `?q=תל` |
| `/api/alerts/stats` | GET | Aggregated stats: daily breakdown, top 20 cities, category map. Query: `?days=7` |
| `/api/alerts/stats/hourly` | GET | Hourly heatmap data (DOW x hour aggregation). Query: `?days=7` |
| `/api/alerts/stats/timeline` | GET | Daily alert counts for timeline chart. Query: `?days=30` |
| `/api/alerts/export` | GET | CSV file download. Query: `?days=7&category=1` |
| `/api/shelter-time` | GET | Shelter time in seconds per city. Query: `?city=שדרות` or omit for all |
| `/api/network-info` | GET | Returns `{lan_ip}` for TV casting auto-detection |
| `/api/health` | GET | Health check: `{"status": "ok"}` |
| `/cert.pem` | GET | Download CA certificate PEM file for mobile HTTPS (served by nginx) |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `HOST_LAN_IP` | _(empty)_ | Host machine LAN IP. Used for HTTPS cert generation (SAN covers entire /24 subnet) and TV casting. Auto-detected by `start.sh`. |
| `DEMO_MODE` | `false` | Enable simulated alerts without Israeli IP. Cycles through 3 sample alerts. |
| `POLL_INTERVAL_MS` | `2000` | Oref API polling interval in milliseconds |
| `DATABASE_URL` | `postgresql+asyncpg://redalert:changeme@db:5432/redalert` | PostgreSQL connection string |
| `REDIS_URL` | `redis://redis:6379` | Redis connection string |
| `DB_PASSWORD` | `changeme` | PostgreSQL password |
| `POSTGRES_DB` | `redalert` | PostgreSQL database name |
| `POSTGRES_USER` | `redalert` | PostgreSQL username |

## Data Source

Unofficial Pikud HaOref API (`oref.org.il`). Requires Israeli IP address for real data.
- **Real-time alerts**: `https://www.oref.org.il/WarningMessages/alert/alerts.json`
- **24h history**: `https://www.oref.org.il/warningMessages/alert/History/AlertsHistory.json`
- **Map polygons**: Israeli municipal boundaries from OpenStreetMap Overpass API, simplified to 1.1MB GeoJSON (282 areas, 4 decimal places, every 3rd point for large polygons)

## License

This project is licensed under the [MIT License](LICENSE).
