export interface AlertData {
  id: string;
  category: number;
  category_desc: string;
  title: string;
  description?: string;
  cities: string[];
  alerted_at: string;
}

export type AlertType = "ended" | "early_warning" | "active";

export function getAlertType(alert: AlertData): AlertType {
  if ((alert.title || "").includes("\u05D4\u05E1\u05EA\u05D9\u05D9\u05DD")) return "ended";
  if ((alert.title || "").includes("\u05D1\u05D3\u05E7\u05D5\u05EA \u05D4\u05E7\u05E8\u05D5\u05D1\u05D5\u05EA")) return "early_warning";
  return "active";
}

export interface AlertStats {
  total_alerts: number;
  daily: { day: string; category: number; count: number }[];
  top_cities: { city: string; count: number }[];
  categories: Record<number, string>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  metadata: { total: number; page: number; limit: number };
}
