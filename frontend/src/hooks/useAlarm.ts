import { useRef, useCallback } from "react";
import { getSavedSound, playSoundById } from "../data/alertSounds";

const ALARM_DURATION_MS = 20000;

export function useAlarm() {
  const stopRef = useRef<(() => void) | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopAlarm = useCallback(() => {
    if (stopRef.current) {
      stopRef.current();
      stopRef.current = null;
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const playAlarm = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (!stopRef.current) {
      const soundId = getSavedSound();
      const { stop } = playSoundById(soundId, true);
      stopRef.current = stop;
    }

    timerRef.current = setTimeout(stopAlarm, ALARM_DURATION_MS);
  }, [stopAlarm]);

  const playBeep = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = "square";
      gain.gain.value = 0.3;
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {}
  }, []);

  return { playAlarm, playBeep, stopAlarm };
}
