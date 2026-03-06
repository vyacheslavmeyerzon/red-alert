import { useEffect, useRef } from "react";
import type { AlertData } from "../types/alert";

export function useNotifications() {
  const permissionRef = useRef<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) {
      permissionRef.current = Notification.permission;
    }
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) return;
    const perm = await Notification.requestPermission();
    permissionRef.current = perm;
  };

  const notify = (alert: AlertData, isSaved: boolean) => {
    if (permissionRef.current !== "granted") return;
    if (document.visibilityState === "visible") return; // Only when tab is hidden

    try {
      const title = isSaved
        ? `🔴 ${alert.title}`
        : `⚠️ ${alert.title}`;
      const body = alert.cities.join(", ");
      const n = new Notification(title, {
        body,
        icon: "/TzvAdom.mp3", // browsers ignore non-image, but it won't break
        tag: `alert-${alert.id}`,
        requireInteraction: isSaved,
      });
      n.onclick = () => {
        window.focus();
        n.close();
      };
    } catch {}
  };

  return { requestPermission, notify };
}
