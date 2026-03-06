import { useEffect, useState } from "react";
import type { AlertStats } from "../types/alert";

export function useAlertStats(days = 7) {
  const [stats, setStats] = useState<AlertStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/alerts/stats?days=${days}`);
        const json = await res.json();
        setStats(json.data);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, [days]);

  return stats;
}
