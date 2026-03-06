import AlertMap from "./AlertMap";
import { useAlertStream } from "../hooks/useAlertStream";
import { useAlarm } from "../hooks/useAlarm";
import { useSavedCities } from "../hooks/useSavedCities";
import { useWakeLock } from "../hooks/useWakeLock";
import { useCallback, useEffect, useRef, useState } from "react";
import { getShelterTime, formatShelterTime, shelterUrgencyColor } from "../data/shelterTimes";
import { useLang } from "../context/LanguageContext";
import type { AlertData } from "../types/alert";

export default function TvView() {
  const { cities, hasMatch } = useSavedCities();
  const { playAlarm, playBeep } = useAlarm();
  const { t } = useLang();

  useWakeLock();

  const onAlert = useCallback(
    (alert: AlertData) => {
      if (hasMatch(alert.cities)) {
        playAlarm();
      } else {
        playBeep();
      }
    },
    [hasMatch, playAlarm, playBeep]
  );

  const { alerts, connected } = useAlertStream(onAlert);

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Force Leaflet to recalculate size after mount (TV browsers may be slow to layout)
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const timer = setTimeout(() => {
      const mapEl = containerRef.current?.querySelector(".leaflet-container");
      if (mapEl) {
        // Trigger Leaflet's invalidateSize via resize event
        window.dispatchEvent(new Event("resize"));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Get the minimum shelter time across all active alerts
  const allCities = alerts.flatMap((a) => a.cities);
  const shelterTimes = allCities.map(getShelterTime).filter((t): t is number => t !== null);
  const minShelter = shelterTimes.length > 0 ? Math.min(...shelterTimes) : null;

  return (
    <div className="tv-view" ref={containerRef}>
      <div className="tv-map-wrapper">
        <AlertMap alerts={alerts} />
      </div>

      {/* Top bar overlay */}
      <div className="tv-topbar">
        <div className="tv-title">
          🚨 Red Alert
        </div>
        <div className="tv-status">
          <span className={`status-dot ${connected ? "connected" : "disconnected"}`} />
          <span>{now.toLocaleTimeString(t.locale)}</span>
        </div>
      </div>

      {/* Active alerts overlay */}
      {alerts.length > 0 && (
        <div className="tv-alerts-overlay">
          {minShelter !== null && (
            <div
              className="tv-shelter"
              style={{ background: shelterUrgencyColor(minShelter) }}
            >
              {t.shelterTime}{formatShelterTime(minShelter)}
            </div>
          )}
          {alerts.map((alert, i) => {
            const isSaved = hasMatch(alert.cities);
            return (
              <div key={`${alert.id}-${i}`} className={`tv-alert-card ${isSaved ? "tv-alert-saved" : ""}`}>
                <div className="tv-alert-title">{alert.title}</div>
                <div className="tv-alert-cities">
                  {alert.cities.join(" • ")}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No alerts — show waiting state */}
      {alerts.length === 0 && (
        <div className="tv-waiting">
          <div className="tv-waiting-dot" />
          <span>{t.waitingForAlerts}</span>
        </div>
      )}
    </div>
  );
}
