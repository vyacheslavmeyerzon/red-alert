import { useEffect, useRef, useState, useCallback } from "react";
import type { AlertData } from "../types/alert";

const SSE_URL = "/api/alerts/stream";
const MAX_ALERTS = 100;
const QUIET_GAP_MS = 20000;

export function useAlertStream(onAlert?: (alert: AlertData) => void) {
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onAlertRef = useRef(onAlert);
  onAlertRef.current = onAlert;

  const resetClearTimer = useCallback(() => {
    if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    clearTimerRef.current = setTimeout(() => {
      setAlerts([]);
    }, QUIET_GAP_MS);
  }, []);

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource(SSE_URL);
    eventSourceRef.current = es;

    es.onopen = () => setConnected(true);

    es.addEventListener("alert", (e: MessageEvent) => {
      try {
        const raw = JSON.parse(e.data);
        const alert: AlertData = {
          id: raw.id,
          category: parseInt(raw.cat, 10),
          category_desc: raw.title || "",
          title: raw.title || "",
          description: raw.desc,
          cities: raw.data || [],
          alerted_at: new Date().toISOString(),
        };

        setAlerts((prev) => {
          if (prev.some((a) => a.id === alert.id)) return prev;
          return [alert, ...prev].slice(0, MAX_ALERTS);
        });
        resetClearTimer();

        // Notify parent for sound handling
        onAlertRef.current?.(alert);
      } catch {}
    });

    es.onerror = () => {
      setConnected(false);
      es.close();
      setTimeout(connect, 3000);
    };
  }, [resetClearTimer]);

  useEffect(() => {
    connect();
    return () => {
      eventSourceRef.current?.close();
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    };
  }, [connect]);

  return { alerts, connected };
}
