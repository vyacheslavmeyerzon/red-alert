# Red Alert Dashboard — Pikud HaOref

Real-time missile and threat alert dashboard for Israel's Home Front Command (Pikud HaOref).
Runs entirely on local Docker Desktop. Installable as a PWA on desktop and mobile.

## Features

### Core
- **Live alert map** — Dark-themed interactive map with color-coded threat zones that auto-clear after 20 seconds of silence
- **Dual map engine** — MapLibre GL (vector tiles, GPU) for desktop, Leaflet (raster tiles) for Smart TV compatibility
- **Drone/aircraft icons** — Category 5 alerts (hostile aircraft) show animated drone markers
- **Shelter time** — Per-region countdown timers (MM:SS) on map markers with urgency color coding
- **Scaled threat zones** — Zone radius adapts based on shelter time + outer pulse ring for visual impact
- **Alert feed** — Real-time alert cards with category icons, shelter badges, and saved city highlighting
- **City carousel** — Alert cards show cities one at a time (1.5s rotation) instead of a static list
- **Category color coding** — Different threat types get distinct colors on map and cards

### Progressive Web App (PWA)
- **Install as app** — One-click install from browser, works on desktop and mobile
- **Offline support** — Cached UI loads without internet, reconnects automatically
- **Background notifications** — Service Worker listens for alerts even when the app is closed
- **Home screen icon** — Launches in standalone mode without browser chrome
- **Auto-update** — Service Worker updates silently in the background

### Multilingual
- **3 languages** — Hebrew, English, Russian
- **RTL/LTR support** — Automatic direction switching via CSS logical properties
- **TTS city names** — Browser Speech Synthesis reads city names aloud on alerts (toggle in Settings)

### Sounds & Notifications
- **8 alert sounds** — Red Alert, Red Alert (short), Bell, Alarm, Warning, Secondary, Urgent, Calm
- **Sound preview** — Listen to each sound before selecting in Settings
- **Push notifications** — Browser Notification API when tab is hidden
- **Vibration** — Haptic feedback on mobile (long pattern for saved cities, short for general)

### Statistics & History
- **Alert history** — Paginated with city search and category filters
- **Statistics dashboard** — Period selector (7/14/30/90 days), area timeline chart, hourly heatmap, top cities pie chart
- **CSV export** — Download alert data as CSV file

### TV & Streaming
- **TV / Smart TV mode** — Fullscreen map at `/#/tv` with idle state and recent alerts
- **Cast to TV** — Auto-detects LAN IP via WebRTC for Smart TV connection (Settings > Cast)
- **Live Overlay (OBS)** — Green-screen page at `/#/overlay` for stream overlays with chroma key
- **Wake Lock** — Prevents display sleep

### Browser Extension
- **Chrome Extension** — `extension/` directory with manifest v3
- **Real-time notifications** — Background SSE listener with desktop notifications
- **Popup** — Current active alerts in extension popup
- **Configurable server** — Settings page to set custom server URL

### Saved Cities
- **Priority alerts** — Save cities for special alarm + visual highlighting
- **Smart matching** — Partial city name matching (e.g., "Tel Aviv" matches "Tel Aviv - Center")
- **Onboarding** — First-time welcome screen unlocks audio (browser autoplay policy)

## Architecture

| Service | Tech | Role |
|---------|------|------|
| **Backend** | FastAPI (Python) | Polls Oref API every 2s, stores to PostgreSQL, broadcasts via Redis pub/sub + SSE |
| **Frontend** | React + TypeScript + Vite | Dark-themed PWA with MapLibre GL / Leaflet, Recharts, SSE client |
| **Database** | PostgreSQL 16 + PostGIS | Alert history, spatial centroid column, GIN index on cities |
| **Cache** | Redis 7 | Pub/sub between poller and SSE subscribers |
| **Proxy** | Nginx | Reverse proxy: `/api/*` -> backend, `/` -> frontend, SSE-optimized config |

## Quick Start

```bash
# Launch everything
docker compose up --build

# Open in browser
# http://localhost          — main dashboard
# http://localhost/#/tv     — TV fullscreen view
# http://localhost/#/overlay — OBS overlay (green screen)
# http://localhost:8000/docs — FastAPI Swagger UI
```

**Requirements**: Docker Desktop, Israeli IP address (for real Oref API data).

## Install as App (PWA)

### Desktop (Chrome / Edge)
1. Open `http://localhost` in your browser
2. Click the install icon in the address bar (or Settings > "Install as App")
3. The dashboard opens as a standalone app with its own window and taskbar icon

### Mobile (Android / iOS)
1. Open `http://<your-lan-ip>` in your phone's browser
2. **Android**: tap "Add to Home Screen" in the browser menu
3. **iOS**: tap Share > "Add to Home Screen"
4. The app icon appears on your home screen
5. Alerts arrive as system notifications even when the app is in the background

### What PWA gives you
- Works without opening the browser — launches like a native app
- Background alert notifications via Service Worker
- Cached interface loads instantly, even with poor connection
- No app store needed — install directly from the browser

## Demo Mode

To test without Israeli IP or during peacetime:

```env
# In .env, set:
DEMO_MODE=true
```

This cycles through simulated alerts for UI testing.

## Smart TV Setup

1. Open the dashboard -> Settings -> "Cast to TV"
2. The system auto-detects your LAN IP address
3. Open the displayed URL on your Smart TV's browser
4. If auto-detection fails, click "Enter manually" and enter your IP (find it via `ipconfig`)
5. Windows Firewall: allow inbound TCP port 80 on Private network:
   ```powershell
   New-NetFirewallRule -DisplayName 'RedAlert Dashboard HTTP' -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow -Profile Private
   ```

## OBS / Streaming Overlay

1. In OBS, add a **Browser Source**
2. Set URL to `http://localhost/#/overlay`
3. Set size to 1920x1080
4. Add a **Chroma Key** filter (Key Color: Green) to remove the green background
5. Alert cards will appear over your stream content

Alternative: set custom CSS in the Browser Source to use transparency directly:
```css
body, .overlay-view { background: transparent !important; }
```

## Chrome Extension

1. Open `chrome://extensions/` in Chrome/Edge
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `extension/` folder
4. Click the extension icon -> Settings to set your server URL
5. The extension will show desktop notifications for all alerts

> Note: The PWA (install as app) provides the same notification functionality without needing to load an extension manually. The extension is an alternative for users who prefer not to install the PWA.

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/alerts/stream` | SSE stream of real-time alerts |
| `GET /api/alerts/live` | Current active alerts (last 60s) |
| `GET /api/alerts/history` | Paginated history (`?page=1&limit=50&hours=24&city=...&category=...`) |
| `GET /api/alerts/cities` | City name autocomplete (`?q=...`) |
| `GET /api/alerts/stats` | Aggregated statistics (`?days=7`) |
| `GET /api/alerts/stats/hourly` | Hourly heatmap data (`?days=7`) |
| `GET /api/alerts/stats/timeline` | Daily timeline data (`?days=30`) |
| `GET /api/alerts/export` | CSV export (`?days=7&category=...`) |
| `GET /api/shelter-time` | Shelter time per city or all (`?city=...`) |
| `GET /api/network-info` | LAN IP for TV casting |
| `GET /api/health` | Health check |

## Saved Cities & Alarms

- Go to Settings -> "Saved Cities" to add cities
- General alerts: short beep sound
- Saved city alerts: selected alarm sound loops for up to 20 seconds
- Choose from 8 different alert sounds in Settings
- Enable TTS to hear city names announced on each alert
- If a new alert arrives within the 20s window, the timer resets
- After 20 seconds of silence, all alerts clear and the alarm stops

## Data Source

Unofficial Pikud HaOref API (`oref.org.il`). Requires Israeli IP address.
- Real-time: `https://www.oref.org.il/WarningMessages/alert/alerts.json`
- History: `https://www.oref.org.il/warningMessages/alert/History/AlertsHistory.json`

## License

This project is licensed under the [MIT License](LICENSE).
