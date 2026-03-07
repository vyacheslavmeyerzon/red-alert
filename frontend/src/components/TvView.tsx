import TvMap from "./TvMap";
import { useAlertStream } from "../hooks/useAlertStream";
import { useAlarm } from "../hooks/useAlarm";
import { useSavedCities } from "../hooks/useSavedCities";
import { useWakeLock } from "../hooks/useWakeLock";
import { useNotifications } from "../hooks/useNotifications";
import { useVibrate } from "../hooks/useVibrate";
import { useAlertSoundHandler } from "../hooks/useAlertSoundHandler";
import CityCarousel from "./CityCarousel";
import { useCallback, useEffect, useRef, useState } from "react";
import { getShelterTime, formatShelterTime, shelterUrgencyColor } from "../data/shelterTimes";
import { useLang } from "../context/LanguageContext";
import type { AlertData } from "../types/alert";
import Hls from "hls.js";

interface RecentAlert {
  title: string;
  cities: string[];
  time: string;
}

export default function TvView() {
  const { hasMatch } = useSavedCities();
  const { playAlarm, playBeep } = useAlarm();
  const { notify } = useNotifications();
  const { vibrate } = useVibrate();
  const { t } = useLang();

  useWakeLock();

  // Kan 11 HLS live stream
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const src = "/kan-live/hls/live/2105694/2105694/master.m3u8";
    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => { video.play().catch(() => {}); });
      return () => hls.destroy();
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      video.play().catch(() => {});
    }
  }, []);

  // Track recent alerts for idle display
  const [recentAlerts, setRecentAlerts] = useState<RecentAlert[]>([]);
  const [todayCount, setTodayCount] = useState(0);

  const { onAlert: handleAlertSound, isEventEnded } = useAlertSoundHandler({
    hasMatch, playAlarm, playBeep, notify, vibrate,
  });

  const onAlert = useCallback(
    (alert: AlertData) => {
      handleAlertSound(alert);
      // Track for idle display
      setRecentAlerts((prev) => [
        { title: alert.title, cities: alert.cities, time: new Date().toLocaleTimeString(t.locale) },
        ...prev,
      ].slice(0, 5));
      setTodayCount((n) => n + 1);
    },
    [handleAlertSound, t.locale]
  );

  const { alerts, connected } = useAlertStream(onAlert);

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const activeAlerts = alerts.filter((a) => !isEventEnded(a));
  const allCities = activeAlerts.flatMap((a) => a.cities);
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

      {/* Kan 11 live stream — bottom-left corner */}
      <div className="tv-live-stream">
        <video ref={videoRef} muted autoPlay playsInline />
      </div>

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
