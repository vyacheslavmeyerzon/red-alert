import { useEffect, useRef } from "react";

/** Prevents the screen from sleeping using the Screen Wake Lock API. */
export function useWakeLock() {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    let active = true;

    const requestLock = async () => {
      try {
        if ("wakeLock" in navigator && active) {
          wakeLockRef.current = await navigator.wakeLock.request("screen");
        }
      } catch {}
    };

    requestLock();

    // Re-acquire on tab visibility change (lock is released when tab is hidden)
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        requestLock();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      active = false;
      document.removeEventListener("visibilitychange", onVisibility);
      wakeLockRef.current?.release().catch(() => {});
    };
  }, []);
}
