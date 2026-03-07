import { useCallback } from "react";

export function useVibrate() {
  const vibrate = useCallback((isSaved: boolean) => {
    if (!navigator.vibrate) return;
    try {
      if (isSaved) {
        navigator.vibrate([300, 100, 300, 100, 600]);
      } else {
        navigator.vibrate([200, 100, 200]);
      }
    } catch {}
  }, []);

  return { vibrate };
}
