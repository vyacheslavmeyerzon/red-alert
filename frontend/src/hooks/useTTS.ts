import { useCallback, useState } from "react";

const STORAGE_KEY = "ra-tts-enabled";

export function useTTS() {
  const [enabled, setEnabled] = useState(() => localStorage.getItem(STORAGE_KEY) === "true");

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  const speak = useCallback(
    (title: string, cities: string[]) => {
      if (!enabled || !window.speechSynthesis) return;
      // Announce alert type first, then cities
      const text = `${title}. ${cities.join(", ")}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "he-IL";
      utterance.rate = 0.9;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    },
    [enabled]
  );

  return { ttsEnabled: enabled, toggleTTS: toggle, speak };
}
