import { useEffect, useState, useCallback } from "react";
import type { AlertData, PaginatedResponse } from "../types/alert";

export function useAlertHistory(hours = 24) {
  const [data, setData] = useState<AlertData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState("");
  const [category, setCategory] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "50",
        hours: String(hours),
      });
      if (city) params.set("city", city);
      if (category !== null) params.set("category", String(category));

      const res = await fetch(`/api/alerts/history?${params}`);
      const json: PaginatedResponse<AlertData> = await res.json();
      setData(json.data);
      setTotal(json.metadata.total);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  }, [page, hours, city, category]);

  const setCityFilter = useCallback((v: string) => {
    setCity(v);
    setPage(1);
  }, []);

  const setCategoryFilter = useCallback((v: number | null) => {
    setCategory(v);
    setPage(1);
  }, []);

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 30000);
    return () => clearInterval(interval);
  }, [fetchHistory]);

  return {
    data, total, page, setPage, loading,
    city, setCityFilter, category, setCategoryFilter,
    lastUpdated,
  };
}
