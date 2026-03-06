import type { AlertData } from "../types/alert";
import { getShelterTime, formatShelterTime, shelterUrgencyColor } from "../data/shelterTimes";

const CATEGORY_COLORS: Record<number, string> = {
  1: "#ef4444", // rockets - red
  2: "#f59e0b", // radiological - amber
  3: "#8b5cf6", // earthquake - purple
  4: "#3b82f6", // tsunami - blue
  5: "#f97316", // hostile aircraft - orange
  6: "#10b981", // hazmat - green
  7: "#dc2626", // terror - dark red
};

const CATEGORY_ICONS: Record<number, string> = {
  1: "🚀",
  2: "☢️",
  3: "🌍",
  4: "🌊",
  5: "✈️",
  6: "⚠️",
  7: "🔴",
};

interface Props {
  alerts: AlertData[];
  connected: boolean;
  savedCities?: string[];
}

function ShelterBadge({ city }: { city: string }) {
  const seconds = getShelterTime(city);
  if (seconds === null) return null;
  const color = shelterUrgencyColor(seconds);
  return (
    <span className="shelter-badge" style={{ background: color }}>
      🛡️ {formatShelterTime(seconds)}
    </span>
  );
}

function isSavedMatch(city: string, saved: string[]): boolean {
  return saved.some((sc) => city === sc || city.includes(sc) || sc.includes(city));
}

export default function AlertFeed({ alerts, connected, savedCities = [] }: Props) {
  return (
    <div className="alert-feed">
      <div className="feed-header">
        <h2>התרעות חיות</h2>
        <span className={`status-dot ${connected ? "connected" : "disconnected"}`} />
      </div>

      {alerts.length === 0 ? (
        <div className="no-alerts">
          <p>אין התרעות פעילות</p>
          <small>המערכת מאזינה לעדכונים...</small>
        </div>
      ) : (
        <div className="alert-list">
          {alerts.map((alert, i) => {
            const shelterTimes = alert.cities
              .map(getShelterTime)
              .filter((t): t is number => t !== null);
            const minShelter = shelterTimes.length > 0 ? Math.min(...shelterTimes) : null;
            const hasSavedMatch = alert.cities.some((c) => isSavedMatch(c, savedCities));

            return (
              <div
                key={`${alert.id}-${i}`}
                className={`alert-card ${hasSavedMatch ? "alert-card-saved" : ""}`}
                style={{ borderRightColor: CATEGORY_COLORS[alert.category] || "#ef4444" }}
              >
                {hasSavedMatch && (
                  <div className="saved-match-banner">
                    🔔 התרעה בעיר שמורה!
                  </div>
                )}
                <div className="alert-card-header">
                  <span className="alert-icon">
                    {CATEGORY_ICONS[alert.category] || "🔴"}
                  </span>
                  <span className="alert-title">{alert.title}</span>
                  <span className="alert-time">
                    {new Date(alert.alerted_at).toLocaleTimeString("he-IL")}
                  </span>
                </div>

                {minShelter !== null && (
                  <div
                    className="shelter-banner"
                    style={{ background: shelterUrgencyColor(minShelter) }}
                  >
                    🛡️ זמן מיגון: {formatShelterTime(minShelter)}
                  </div>
                )}

                <div className="alert-cities">
                  {alert.cities.map((city, j) => (
                    <span key={j} className="city-tag-row">
                      <span className={`city-tag ${isSavedMatch(city, savedCities) ? "city-tag-saved" : ""}`}>
                        {isSavedMatch(city, savedCities) && "🔔 "}{city}
                      </span>
                      <ShelterBadge city={city} />
                    </span>
                  ))}
                </div>
                {alert.description && (
                  <p className="alert-desc">{alert.description}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
