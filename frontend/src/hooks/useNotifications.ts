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
    // For saved cities, always show notification (emergency); otherwise only when tab hidden
    if (!isSaved && document.visibilityState === "visible") return;

    try {
      const title = isSaved
        ? `🔴 ${alert.title}`
        : `⚠️ ${alert.title}`;
      const body = alert.cities.join(", ");
      const n = new Notification(title, {
        body,
        icon: "/icon-192.png",
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
