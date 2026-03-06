import { useRef, useCallback } from "react";

const ALARM_DURATION_MS = 20000;

export function useAlarm() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopAlarm = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const playAlarm = useCallback(() => {
    // If already playing, just reset the 20s stop timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (!audioRef.current) {
      audioRef.current = new Audio("/TzvAdom.mp3");
      audioRef.current.loop = true;
    }

    // Start playing if not already
    if (audioRef.current.paused) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }

    // Stop after 20 seconds of silence (timer resets on each call)
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
