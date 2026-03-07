import { useCallback } from "react";
import type { AlertData } from "../types/alert";
import { getAudioContext } from "../utils/audioContext";

interface AlertSoundHandlerDeps {
  hasMatch: (cities: string[]) => boolean;
  getMatchedCities?: (cities: string[]) => string[];
  playAlarm: () => void;
  playBeep: () => void;
  notify: (alert: AlertData, isSaved: boolean) => void;
  vibrate: (isSaved: boolean) => void;
  speak?: (title: string, cities: string[]) => void;
}

function checkEventEnded(alert: AlertData): boolean {
  return (alert.title || "").includes("הסתיים");
}

function checkEarlyWarning(alert: AlertData): boolean {
  return (alert.title || "").includes("בדקות הקרובות");
}

function playEventEndedChime(): void {
  try {
    const ctx = getAudioContext();
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
}

function playEarlyWarningBeep(): void {
  try {
    const ctx = getAudioContext();
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
}

export function useAlertSoundHandler(deps: AlertSoundHandlerDeps) {
  const {
    hasMatch,
    getMatchedCities,
    playAlarm,
    playBeep,
    notify,
    vibrate,
    speak,
  } = deps;

  const onAlert = useCallback(
    (alert: AlertData) => {
      if (checkEventEnded(alert)) {
        playEventEndedChime();
      } else if (checkEarlyWarning(alert)) {
        playEarlyWarningBeep();
      } else {
        if (getMatchedCities && speak) {
          const matched = getMatchedCities(alert.cities);
          if (matched.length > 0) {
            playAlarm();
            speak(alert.title, matched);
          } else {
            playBeep();
          }
          vibrate(matched.length > 0);
        } else {
          const isSaved = hasMatch(alert.cities);
          if (isSaved) {
            playAlarm();
          } else {
            playBeep();
          }
          vibrate(isSaved);
        }
      }
      notify(alert, hasMatch(alert.cities));
    },
    [hasMatch, getMatchedCities, playAlarm, playBeep, notify, vibrate, speak]
  );

  return { onAlert, isEventEnded: checkEventEnded, isEarlyWarning: checkEarlyWarning };
}
