import { useState, useCallback } from "react";
import AlertMap from "./components/AlertMap";
import AlertFeed from "./components/AlertFeed";
import AlertHistory from "./components/AlertHistory";
import StatsPanel from "./components/StatsPanel";
import SavedCities from "./components/SavedCities";
import TvView from "./components/TvView";
import CastPanel from "./components/CastPanel";
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
import { LanguageProvider, useLang } from "./context/LanguageContext";
import type { AlertData } from "./types/alert";

type Tab = "live" | "history" | "stats" | "settings";

const isTvMode = window.location.hash === "#/tv" || window.location.pathname === "/tv";

function Dashboard() {
  const [tab, setTab] = useState<Tab>("live");
  const [fullscreen, setFullscreen] = useState(false);
  const { cities, addCity, removeCity, hasMatch } = useSavedCities();
  const { playAlarm, playBeep } = useAlarm();
  const { requestPermission, notify } = useNotifications();
  const { vibrate } = useVibrate();
  const history = useAlertHistory(24);
  const { stats, lastUpdated: statsUpdated } = useAlertStats(7);
  const { t, lang, toggleLang } = useLang();
  const { showOnboarding, dismiss: dismissOnboarding } = useOnboarding();

  useWakeLock();

  const onAlert = useCallback(
    (alert: AlertData) => {
      const isSaved = hasMatch(alert.cities);
      if (isSaved) {
        playAlarm();
      } else {
        playBeep();
      }
      notify(alert, isSaved);
      vibrate(isSaved);
    },
    [hasMatch, playAlarm, playBeep, notify, vibrate]
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
              <StatsPanel stats={stats} />
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
                    onClick={() => lang !== "he" && toggleLang()}
                  >
                    {t.langHe}
                  </button>
                  <button
                    className={`lang-btn ${lang === "en" ? "active" : ""}`}
                    onClick={() => lang !== "en" && toggleLang()}
                  >
                    {t.langEn}
                  </button>
                </div>
              </div>
              <SavedCities cities={cities} onAdd={addCity} onRemove={removeCity} />
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
      {isTvMode ? <TvView /> : <Dashboard />}
    </LanguageProvider>
  );
}
