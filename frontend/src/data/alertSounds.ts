export type SoundId = "redalert" | "redalert-short" | "bell" | "alarm" | "warning" | "secondary" | "urgent" | "calm";

export interface SoundOption {
  id: SoundId;
  labelKey: string;
}

export const SOUND_OPTIONS: SoundOption[] = [
  { id: "redalert", labelKey: "soundRedAlert" },
  { id: "redalert-short", labelKey: "soundRedAlertShort" },
  { id: "bell", labelKey: "soundBell" },
  { id: "alarm", labelKey: "soundAlarm" },
  { id: "warning", labelKey: "soundWarning" },
  { id: "secondary", labelKey: "soundSecondary" },
  { id: "urgent", labelKey: "soundUrgent" },
  { id: "calm", labelKey: "soundCalm" },
];

const STORAGE_KEY = "ra-alert-sound";

export function getSavedSound(): SoundId {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && SOUND_OPTIONS.some((o) => o.id === stored)) return stored as SoundId;
  return "redalert";
}

export function saveSound(id: SoundId) {
  localStorage.setItem(STORAGE_KEY, id);
}

function createCtx(): AudioContext {
  return new AudioContext();
}

function synthTone(freq: number, duration: number, type: OscillatorType = "sine", volume = 0.3): void {
  const ctx = createCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = freq;
  osc.type = type;
  gain.gain.value = volume;
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

function synthBeeps(freq: number, count: number, onTime: number, offTime: number, type: OscillatorType = "sine", volume = 0.3): void {
  const ctx = createCtx();
  for (let i = 0; i < count; i++) {
    const start = ctx.currentTime + i * (onTime + offTime);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = type;
    gain.gain.value = volume;
    osc.start(start);
    osc.stop(start + onTime);
  }
}

export function previewSound(id: SoundId): void {
  switch (id) {
    case "redalert":
    case "redalert-short": {
      const audio = new Audio("/TzvAdom.mp3");
      audio.play().catch(() => {});
      setTimeout(() => { audio.pause(); audio.currentTime = 0; }, id === "redalert-short" ? 3000 : 5000);
      break;
    }
    case "bell":
      synthTone(1200, 1.0, "sine", 0.25);
      setTimeout(() => synthTone(1200, 1.0, "sine", 0.25), 300);
      break;
    case "alarm":
      synthBeeps(880, 4, 0.2, 0.15, "square", 0.25);
      break;
    case "warning":
      synthTone(600, 0.8, "sawtooth", 0.2);
      setTimeout(() => synthTone(800, 0.8, "sawtooth", 0.2), 400);
      break;
    case "secondary":
      synthBeeps(660, 2, 0.3, 0.2, "triangle", 0.3);
      break;
    case "urgent":
      synthBeeps(1000, 6, 0.1, 0.08, "square", 0.3);
      break;
    case "calm":
      synthTone(440, 1.5, "sine", 0.15);
      break;
  }
}

export function playSoundById(id: SoundId, loop: boolean): { stop: () => void } {
  let stopped = false;
  let audio: HTMLAudioElement | null = null;
  let intervalId: ReturnType<typeof setInterval> | null = null;

  const stop = () => {
    stopped = true;
    if (audio) { audio.pause(); audio.currentTime = 0; }
    if (intervalId) clearInterval(intervalId);
  };

  if (id === "redalert" || id === "redalert-short") {
    audio = new Audio("/TzvAdom.mp3");
    audio.loop = loop;
    audio.play().catch(() => {});
    if (id === "redalert-short" && !loop) {
      setTimeout(() => { if (!stopped) stop(); }, 5000);
    }
  } else {
    const playOnce = () => {
      if (stopped) return;
      switch (id) {
        case "bell":
          synthTone(1200, 0.8, "sine", 0.3);
          setTimeout(() => { if (!stopped) synthTone(1200, 0.8, "sine", 0.3); }, 250);
          break;
        case "alarm":
          synthBeeps(880, 4, 0.2, 0.15, "square", 0.3);
          break;
        case "warning":
          synthTone(600, 0.6, "sawtooth", 0.25);
          setTimeout(() => { if (!stopped) synthTone(800, 0.6, "sawtooth", 0.25); }, 350);
          break;
        case "secondary":
          synthBeeps(660, 2, 0.3, 0.2, "triangle", 0.3);
          break;
        case "urgent":
          synthBeeps(1000, 8, 0.08, 0.06, "square", 0.35);
          break;
        case "calm":
          synthTone(440, 1.2, "sine", 0.2);
          break;
      }
    };
    playOnce();
    if (loop) {
      intervalId = setInterval(playOnce, 2500);
    }
  }

  return { stop };
}
