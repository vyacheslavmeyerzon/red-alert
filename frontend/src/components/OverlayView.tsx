import { useCallback, useState } from "react";
import { useAlertStream } from "../hooks/useAlertStream";
import { useSavedCities } from "../hooks/useSavedCities";
import { useLang } from "../context/LanguageContext";
import { getShelterTime, formatShelterTime, shelterUrgencyColor } from "../data/shelterTimes";
import CityCarousel from "./CityCarousel";
import type { AlertData } from "../types/alert";

export default function OverlayView() {
  const { hasMatch } = useSavedCities();
  const { t } = useLang();
  const [recentAlerts, setRecentAlerts] = useState<{ title: string; cities: string[]; time: string }[]>([]);

  const onAlert = useCallback(
    (alert: AlertData) => {
      setRecentAlerts((prev) =>
        [{ title: alert.title, cities: alert.cities, time: new Date().toLocaleTimeString(t.locale) }, ...prev].slice(0, 8)
      );
    },
    [t.locale]
  );

  const { alerts } = useAlertStream(onAlert);

  const allCities = alerts.flatMap((a) => a.cities);
  const shelterTimes = allCities.map(getShelterTime).filter((t): t is number => t !== null);
  const minShelter = shelterTimes.length > 0 ? Math.min(...shelterTimes) : null;

  return (
    <div className="overlay-view">
      {alerts.length > 0 && (
        <div className="overlay-alerts">
          {minShelter !== null && (
            <div className="overlay-shelter" style={{ background: shelterUrgencyColor(minShelter) }}>
              {t.shelterTime}{formatShelterTime(minShelter)}
            </div>
          )}
          {alerts.map((alert, i) => {
            const isSaved = hasMatch(alert.cities);
            return (
              <div key={`${alert.id}-${i}`} className={`overlay-card ${isSaved ? "overlay-card-saved" : ""}`}>
                <div className="overlay-card-title">{alert.title}</div>
                <div className="overlay-card-cities">
                  <CityCarousel
                    cities={alert.cities}
                    renderCity={(city) => <span>{city}</span>}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {alerts.length === 0 && recentAlerts.length > 0 && (
        <div className="overlay-recent">
          {recentAlerts.slice(0, 3).map((a, i) => (
            <div key={i} className="overlay-recent-item">
              <span className="overlay-recent-time">{a.time}</span>
              <span>{a.title} — {a.cities.slice(0, 3).join(", ")}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
