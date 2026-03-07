import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "ra-tts-enabled";

export function useTTS() {
  const [enabled, setEnabled] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === null ? true : stored === "true";
  });

  // Unlock SpeechSynthesis on first user interaction (Chrome autoplay policy)
  // and preload voices (Chrome loads them asynchronously)
  useEffect(() => {
    const unlock = () => {
      const utterance = new SpeechSynthesisUtterance("");
      utterance.volume = 0;
      window.speechSynthesis.speak(utterance);
      document.removeEventListener("click", unlock);
    };
    document.addEventListener("click", unlock);
    // Force Chrome to load voice list
    window.speechSynthesis?.getVoices();
    window.speechSynthesis?.addEventListener?.("voiceschanged", () => {
      window.speechSynthesis.getVoices();
    });
    return () => document.removeEventListener("click", unlock);
  }, []);

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
      // Delay TTS so it doesn't compete with alarm sound
      setTimeout(() => {
        const text = `${title}. ${cities.join(", ")}`;
        const voices = window.speechSynthesis.getVoices();
        // Log all available voices for debugging
        console.log("[TTS] Available voices:", voices.map((v) => `${v.name} (${v.lang})`));

        // Priority: exact he-IL > he > name contains hebrew > Google he
        const heVoice =
          voices.find((v) => v.lang === "he-IL") ||
          voices.find((v) => v.lang === "he") ||
          voices.find((v) => v.lang.startsWith("he")) ||
          voices.find((v) => v.name.toLowerCase().includes("hebrew"));

        const utterance = new SpeechSynthesisUtterance(text);
        if (heVoice) {
          utterance.voice = heVoice;
          utterance.lang = heVoice.lang;
        } else {
          // No Hebrew voice — still try, Chrome may handle he-IL via network
          utterance.lang = "he-IL";
        }
        utterance.rate = 0.9;
        utterance.volume = 1;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);

        console.log("[TTS]", heVoice ? `Using: ${heVoice.name} (${heVoice.lang})` : "No Hebrew voice — trying he-IL anyway");
      }, 1500);
    },
    [enabled]
  );

  return { ttsEnabled: enabled, toggleTTS: toggle, speak };
}
