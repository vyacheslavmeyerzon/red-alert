import { useCallback } from "react";

export function useVibrate() {
  const vibrate = useCallback((isSaved: boolean) => {
    if (!navigator.vibrate) return;
    if (isSaved) {
      // Long pattern for saved city alert
      navigator.vibrate([300, 100, 300, 100, 600]);
    } else {
      // Short pulse for general alert
      navigator.vibrate([200, 100, 200]);
    }
  }, []);

  return { vibrate };
}
