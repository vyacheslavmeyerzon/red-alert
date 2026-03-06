export interface AlertData {
  id: string;
  category: number;
  category_desc: string;
  title: string;
  description?: string;
  cities: string[];
  alerted_at: string;
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
