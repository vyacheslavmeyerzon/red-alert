import { useState, useCallback } from "react";
import { useLang } from "../context/LanguageContext";

const STORAGE_KEY = "ra-onboarded";

export function useOnboarding() {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(STORAGE_KEY) === "1"
  );
  const dismiss = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "1");
    setDismissed(true);
  }, []);
  return { showOnboarding: !dismissed, dismiss };
}

interface Props {
  onActivate: () => void;
}

export default function Onboarding({ onActivate }: Props) {
  const { t } = useLang();

  const handleActivate = () => {
    // Create a silent AudioContext to unlock audio on mobile
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.gain.value = 0;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.01);
    } catch {}
    // Also pre-load the alarm audio
    try {
      const audio = new Audio("/TzvAdom.mp3");
      audio.volume = 0;
      audio.play().then(() => audio.pause()).catch(() => {});
    } catch {}
    onActivate();
  };

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card">
        <div className="onboarding-icon">🚨</div>
        <h1>Red Alert Dashboard</h1>
        <p className="onboarding-subtitle">{t.headerSubtitle}</p>

        <div className="onboarding-steps">
          <div className="onboarding-step">
            <span className="step-icon">🔊</span>
            <span>{t.onboardingSound}</span>
          </div>
          <div className="onboarding-step">
            <span className="step-icon">📍</span>
            <span>{t.onboardingCities}</span>
          </div>
          <div className="onboarding-step">
            <span className="step-icon">🔔</span>
            <span>{t.onboardingNotifications}</span>
          </div>
        </div>

        <button className="onboarding-btn" onClick={handleActivate}>
          {t.onboardingActivate}
        </button>
      </div>
    </div>
  );
}
