import TvMap from "./TvMap";
import { useAlertStream } from "../hooks/useAlertStream";
import { useAlarm } from "../hooks/useAlarm";
import { useSavedCities } from "../hooks/useSavedCities";
import { useWakeLock } from "../hooks/useWakeLock";
import { useNotifications } from "../hooks/useNotifications";
import { useVibrate } from "../hooks/useVibrate";
import CityCarousel from "./CityCarousel";
import { useCallback, useEffect, useState } from "react";
import { getShelterTime, formatShelterTime, shelterUrgencyColor } from "../data/shelterTimes";
import { useLang } from "../context/LanguageContext";
import type { AlertData } from "../types/alert";

interface RecentAlert {
  title: string;
  cities: string[];
  time: string;
}

export default function TvView() {
  const { cities, hasMatch } = useSavedCities();
  const { playAlarm, playBeep } = useAlarm();
  const { notify } = useNotifications();
  const { vibrate } = useVibrate();
  const { t } = useLang();

  useWakeLock();

  // Track recent alerts for idle display
  const [recentAlerts, setRecentAlerts] = useState<RecentAlert[]>([]);
  const [todayCount, setTodayCount] = useState(0);

  const isEventEnded = useCallback((alert: AlertData) => {
    const title = (alert.title || "").toLowerCase();
    return title.includes("הסתיים") || title.includes("האירוע הסתיים");
  }, []);

  const onAlert = useCallback(
    (alert: AlertData) => {
      if (isEventEnded(alert)) {
        // Soft chime for "event ended"
        try {
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = 523;
          osc.type = "sine";
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
          osc.start();
          osc.stop(ctx.currentTime + 1.5);
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.frequency.value = 659;
          osc2.type = "sine";
          gain2.gain.setValueAtTime(0.1, ctx.currentTime + 0.3);
          gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);
          osc2.start(ctx.currentTime + 0.3);
          osc2.stop(ctx.currentTime + 1.8);
        } catch {}
      } else {
        const isSaved = hasMatch(alert.cities);
        if (isSaved) {
          playAlarm();
        } else {
          playBeep();
        }
        vibrate(isSaved);
      }
      notify(alert, hasMatch(alert.cities));
      // Track for idle display
      setRecentAlerts((prev) => [
        { title: alert.title, cities: alert.cities, time: new Date().toLocaleTimeString(t.locale) },
        ...prev,
      ].slice(0, 5));
      setTodayCount((n) => n + 1);
    },
    [isEventEnded, hasMatch, playAlarm, playBeep, notify, vibrate, t.locale]
  );

  const { alerts, connected } = useAlertStream(onAlert);

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const allCities = alerts.flatMap((a) => a.cities);
  const shelterTimes = allCities.map(getShelterTime).filter((t): t is number => t !== null);
  const minShelter = shelterTimes.length > 0 ? Math.min(...shelterTimes) : null;

  return (
    <div className="tv-view">
      <div className="tv-map-wrapper">
        <TvMap alerts={alerts} />
      </div>

      {/* Top bar overlay — bigger clock */}
      <div className="tv-topbar">
        <div className="tv-title">🚨 Red Alert</div>
        <div className="tv-status">
          <span className={`status-dot ${connected ? "connected" : "disconnected"}`} />
          <span className="tv-clock">{now.toLocaleTimeString(t.locale)}</span>
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

      {/* Idle state — show recent alerts + today stats */}
      {alerts.length === 0 && (
        <div className="tv-idle">
          <div className="tv-idle-header">
            <div className="tv-waiting-dot" />
            <span>{t.waitingForAlerts}</span>
            {todayCount > 0 && (
              <span className="tv-today-count">{t.tvIdleTodayStats(todayCount)}</span>
            )}
          </div>
          {recentAlerts.length > 0 && (
            <div className="tv-recent">
              <div className="tv-recent-title">{t.tvIdleLastAlerts}</div>
              {recentAlerts.map((a, i) => (
                <div key={i} className="tv-recent-item">
                  <span className="tv-recent-time">{a.time}</span>
                  <span className="tv-recent-text">{a.title} — {a.cities.slice(0, 3).join(", ")}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
