import { useState, useCallback } from "react";
import AlertMap from "./components/AlertMap";
import AlertFeed from "./components/AlertFeed";
import AlertHistory from "./components/AlertHistory";
import StatsPanel from "./components/StatsPanel";
import SavedCities from "./components/SavedCities";
import TvView from "./components/TvView";
import OverlayView from "./components/OverlayView";
import CastPanel from "./components/CastPanel";
import SoundSettings from "./components/SoundSettings";
import Onboarding, { useOnboarding } from "./components/Onboarding";
import UpdatedAgo from "./components/UpdatedAgo";
import { useAlertStream } from "./hooks/useAlertStream";
import { useAlertHistory } from "./hooks/useAlertHistory";
import { useAlertStats } from "./hooks/useAlertStats";
import { useWakeLock } from "./hooks/useWakeLock";
import { useSavedCities } from "./hooks/useSavedCities";
import { useAlarm } from "./hooks/useAlarm";
import { useNotifications } from "./hooks/useNotifications";
import { useVibrate } from "./hooks/useVibrate";
import { useTTS } from "./hooks/useTTS";
import { usePWAInstall } from "./hooks/usePWAInstall";
import { LanguageProvider, useLang } from "./context/LanguageContext";
import type { AlertData } from "./types/alert";

type Tab = "live" | "history" | "stats" | "settings";

const isTvMode = window.location.hash === "#/tv" || window.location.pathname === "/tv";
const isOverlayMode = window.location.hash === "#/overlay" || window.location.pathname === "/overlay";

function Dashboard() {
  const [tab, setTab] = useState<Tab>("live");
  const [fullscreen, setFullscreen] = useState(false);
  const { cities, addCity, removeCity, hasMatch, getMatchedCities } = useSavedCities();
  const { playAlarm, playBeep } = useAlarm();
  const { requestPermission, notify } = useNotifications();
  const { vibrate } = useVibrate();
  const { ttsEnabled, toggleTTS, speak } = useTTS();
  const { canInstall, isInstalled, install } = usePWAInstall();
  const history = useAlertHistory(24);
  const [statsDays, setStatsDays] = useState(7);
  const { stats, lastUpdated: statsUpdated } = useAlertStats(statsDays);
  const { t, lang, setLang } = useLang();
  const { showOnboarding, dismiss: dismissOnboarding } = useOnboarding();

  useWakeLock();

  const isEventEnded = useCallback((alert: AlertData) => {
    return (alert.title || "").includes("הסתיים");
  }, []);

  const isEarlyWarning = useCallback((alert: AlertData) => {
    return (alert.title || "").includes("בדקות הקרובות");
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
      } else if (isEarlyWarning(alert)) {
        // Long steady 5-second warning beep for early warning
        try {
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = 740;
          osc.type = "sine";
          gain.gain.setValueAtTime(0.25, ctx.currentTime);
          gain.gain.setValueAtTime(0.25, ctx.currentTime + 4.5);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 5);
          osc.start();
          osc.stop(ctx.currentTime + 5);
        } catch {}
      } else {
        const matched = getMatchedCities(alert.cities);
        if (matched.length > 0) {
          playAlarm();
          speak(alert.title, matched);
        } else {
          playBeep();
        }
        vibrate(matched.length > 0);
      }
      notify(alert, hasMatch(alert.cities));
    },
    [isEventEnded, isEarlyWarning, hasMatch, getMatchedCities, playAlarm, playBeep, notify, vibrate, speak]
  );

  const { alerts, connected } = useAlertStream(onAlert);

  const handleOnboardingActivate = useCallback(() => {
    requestPermission();
    dismissOnboarding();
  }, [requestPermission, dismissOnboarding]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      const el = document.querySelector(".map-section");
      if (el) {
        el.requestFullscreen().then(() => setFullscreen(true)).catch(() => {});
      }
    } else {
      document.exitFullscreen().then(() => setFullscreen(false)).catch(() => {});
    }
  }, []);

  if (typeof document !== "undefined") {
    document.onfullscreenchange = () => {
      setFullscreen(!!document.fullscreenElement);
    };
  }

  if (showOnboarding) {
    return <Onboarding onActivate={handleOnboardingActivate} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-right">
          <h1>
            <span className="header-icon">🚨</span>
            Red Alert Dashboard
          </h1>
          <span className="header-subtitle">{t.headerSubtitle}</span>
        </div>
        <nav className="tab-nav">
          <button
            className={tab === "live" ? "active" : ""}
            onClick={() => setTab("live")}
          >
            {t.tabLive}
          </button>
          <button
            className={tab === "history" ? "active" : ""}
            onClick={() => setTab("history")}
          >
            {t.tabHistory}
          </button>
          <button
            className={tab === "stats" ? "active" : ""}
            onClick={() => setTab("stats")}
          >
            {t.tabStats}
          </button>
          <button
            className={tab === "settings" ? "active" : ""}
            onClick={() => setTab("settings")}
          >
            {cities.length > 0 ? `⚙️ (${cities.length})` : "⚙️"}
          </button>
        </nav>
      </header>

      <main className="app-main">
        <section className="map-section">
          <AlertMap alerts={alerts} />
          <div className="map-controls">
            <button
              className="fullscreen-btn"
              onClick={toggleFullscreen}
              title={fullscreen ? t.fullscreenExit : t.fullscreenEnter}
            >
              {fullscreen ? "✕" : "⛶"}
            </button>
            <div className="map-legend">
              <span className="legend-item">
                <span className="legend-dot live" /> {t.legendActiveAlert}
              </span>
            </div>
          </div>
          {fullscreen && (
            <div className="fullscreen-feed">
              <AlertFeed alerts={alerts} connected={connected} savedCities={cities} />
            </div>
          )}
        </section>

        <aside className="sidebar">
          {tab === "live" && <AlertFeed alerts={alerts} connected={connected} savedCities={cities} />}
          {tab === "history" && (
            <>
              <AlertHistory
                data={history.data}
                total={history.total}
                page={history.page}
                onPageChange={history.setPage}
                loading={history.loading}
                city={history.city}
                onCityChange={history.setCityFilter}
                category={history.category}
                onCategoryChange={history.setCategoryFilter}
              />
              <UpdatedAgo lastUpdated={history.lastUpdated} />
            </>
          )}
          {tab === "stats" && (
            <>
              <StatsPanel stats={stats} days={statsDays} onDaysChange={setStatsDays} />
              <UpdatedAgo lastUpdated={statsUpdated} />
            </>
          )}
          {tab === "settings" && (
            <div className="settings-panel">
              <div className="language-setting">
                <span className="language-setting-label">{t.settingsLanguage}</span>
                <div className="lang-toggle-group">
                  <button
                    className={`lang-btn ${lang === "he" ? "active" : ""}`}
                    onClick={() => setLang("he")}
                  >
                    {t.langHe}
                  </button>
                  <button
                    className={`lang-btn ${lang === "en" ? "active" : ""}`}
                    onClick={() => setLang("en")}
                  >
                    {t.langEn}
                  </button>
                  <button
                    className={`lang-btn ${lang === "ru" ? "active" : ""}`}
                    onClick={() => setLang("ru")}
                  >
                    {t.langRu}
                  </button>
                </div>
              </div>
              <SoundSettings />
              <div className="tts-setting">
                <div>
                  <h3>{t.ttsTitle}</h3>
                  <p className="tts-setting-desc">{t.ttsDesc}</p>
                </div>
                <button className={`tts-toggle ${ttsEnabled ? "active" : ""}`} onClick={toggleTTS}>
                  {ttsEnabled ? t.ttsOn : t.ttsOff}
                </button>
              </div>
              <SavedCities cities={cities} onAdd={addCity} onRemove={removeCity} />
              {(canInstall || isInstalled) && (
                <div className="pwa-install-section">
                  {canInstall ? (
                    <button className="pwa-install-btn" onClick={install}>
                      {t.pwaInstall}
                    </button>
                  ) : (
                    <span className="pwa-installed">{t.pwaInstalled}</span>
                  )}
                </div>
              )}
              <CastPanel />
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      {isOverlayMode ? <OverlayView /> : isTvMode ? <TvView /> : <Dashboard />}
    </LanguageProvider>
  );
}
