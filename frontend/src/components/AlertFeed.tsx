import type { AlertData } from "../types/alert";
import { getShelterTime, formatShelterTime, shelterUrgencyColor } from "../data/shelterTimes";
import { useLang } from "../context/LanguageContext";
import CityCarousel from "./CityCarousel";

const CATEGORY_COLORS: Record<number, string> = {
  1: "#ef4444", // rockets - red
  2: "#f59e0b", // radiological - amber
  3: "#8b5cf6", // earthquake - purple
  4: "#3b82f6", // tsunami - blue
  5: "#f97316", // hostile aircraft - orange
  6: "#10b981", // hazmat - green
  7: "#dc2626", // terror - dark red
  10: "#eab308", // early warning - yellow
  13: "#6366f1", // special update - indigo
  14: "#eab308", // early warning - yellow
};

const CATEGORY_ICONS: Record<number, string> = {
  1: "🚀",
  2: "☢️",
  3: "🌍",
  4: "🌊",
  5: "✈️",
  6: "⚠️",
  7: "🔴",
  10: "⏳",
  13: "ℹ️",
  14: "⏳",
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
  const { t } = useLang();

  return (
    <div className="alert-feed">
      <div className="feed-header">
        <h2>{t.liveAlerts}</h2>
        <span className={`status-dot ${connected ? "connected" : "disconnected"}`} />
      </div>

      {alerts.length === 0 ? (
        <div className="no-alerts">
          <p>{t.noActiveAlerts}</p>
          <small>{t.listeningForUpdates}</small>
        </div>
      ) : (
        <div className="alert-list">
          {alerts.map((alert, i) => {
            const isEnded = (alert.title || "").includes("הסתיים");
            const shelterTimes = isEnded ? [] : alert.cities
              .map(getShelterTime)
              .filter((t): t is number => t !== null);
            const minShelter = shelterTimes.length > 0 ? Math.min(...shelterTimes) : null;
            const hasSavedMatch = alert.cities.some((c) => isSavedMatch(c, savedCities));

            return (
              <div
                key={`${alert.id}-${i}`}
                className={`alert-card ${hasSavedMatch ? "alert-card-saved" : ""}`}
                style={{ borderInlineStartColor: CATEGORY_COLORS[alert.category] || "#ef4444" }}
              >
                {hasSavedMatch && (
                  <div className="saved-match-banner">
                    {t.savedCityAlert}
                  </div>
                )}
                <div className="alert-card-header">
                  <span className="alert-icon">
                    {CATEGORY_ICONS[alert.category] || "🔴"}
                  </span>
                  <span className="alert-title">{alert.title}</span>
                  <span className="alert-time">
                    {new Date(alert.alerted_at).toLocaleTimeString(t.locale)}
                  </span>
                </div>

                {minShelter !== null && (
                  <div
                    className="shelter-banner"
                    style={{ background: shelterUrgencyColor(minShelter) }}
                  >
                    {t.shelterTime}{formatShelterTime(minShelter)}
                  </div>
                )}

                <div className="alert-cities">
                  <CityCarousel
                    cities={alert.cities}
                    renderCity={(city) => (
                      <span className="city-tag-row">
                        <span className={`city-tag ${isSavedMatch(city, savedCities) ? "city-tag-saved" : ""}`}>
                          {isSavedMatch(city, savedCities) && "🔔 "}{city}
                        </span>
                        {!isEnded && <ShelterBadge city={city} />}
                      </span>
                    )}
                  />
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
