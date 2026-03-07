import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import type { AlertStats } from "../types/alert";
import { useLang } from "../context/LanguageContext";

const COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981", "#8b5cf6", "#f97316"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const PERIODS = [7, 14, 30, 90] as const;

interface Props {
  stats: AlertStats | null;
  days: number;
  onDaysChange: (days: number) => void;
}

interface HourlyData {
  dow: number;
  hour: number;
  count: number;
}

export default function StatsPanel({ stats, days, onDaysChange }: Props) {
  const { t } = useLang();
  const [hourly, setHourly] = useState<HourlyData[]>([]);
  const [timeline, setTimeline] = useState<{ day: string; count: number }[]>([]);
  const [chartsLoading, setChartsLoading] = useState(false);

  useEffect(() => {
    setChartsLoading(true);
    Promise.all([
      fetch(`/api/alerts/stats/hourly?days=${days}`)
        .then((r) => r.json())
        .then((j) => setHourly(j.data || []))
        .catch(() => {}),
      fetch(`/api/alerts/stats/timeline?days=${days}`)
        .then((r) => r.json())
        .then((j) => setTimeline(j.data || []))
        .catch(() => {}),
    ]).finally(() => setChartsLoading(false));
  }, [days]);

  const periodKeys: Record<number, string> = {
    7: t.statsPeriod7,
    14: t.statsPeriod14,
    30: t.statsPeriod30,
    90: t.statsPeriod90,
  };

  if (!stats) {
    return (
      <div className="stats-panel">
        <h2>{t.statistics}</h2>
        <p className="loading">{t.loadingData}</p>
      </div>
    );
  }

  const dailyMap = new Map<string, number>();
  for (const d of stats.daily) {
    dailyMap.set(d.day, (dailyMap.get(d.day) || 0) + d.count);
  }
  const dailyData = Array.from(dailyMap.entries())
    .map(([day, count]) => ({ day, count }))
    .reverse();

  const cityData = stats.top_cities.slice(0, 10);

  // Build heatmap grid: 7 rows (days) × 24 cols (hours)
  const heatmapGrid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  for (const h of hourly) {
    heatmapGrid[h.dow][h.hour] = h.count;
  }
  const maxHeat = Math.max(1, ...hourly.map((h) => h.count));

  const handleExport = () => {
    window.open(`/api/alerts/export?days=${days}`, "_blank");
  };

  return (
    <div className="stats-panel">
      <div className="stats-header">
        <h2>{t.statistics}</h2>
        <div className="stats-controls">
          <div className="stats-period-group">
            {PERIODS.map((p) => (
              <button
                key={p}
                className={`stats-period-btn ${days === p ? "active" : ""}`}
                onClick={() => onDaysChange(p)}
              >
                {periodKeys[p]}
              </button>
            ))}
          </div>
          <button className="stats-export-btn" onClick={handleExport}>
            {t.statsExportCsv}
          </button>
        </div>
      </div>

      <div className="stats-summary">
        <div className="stat-card">
          <span className="stat-value">{stats.total_alerts}</span>
          <span className="stat-label">{t.totalAlertsLabel}</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.top_cities.length}</span>
          <span className="stat-label">{t.affectedAreas}</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{dailyData.length}</span>
          <span className="stat-label">{t.activeDays}</span>
        </div>
      </div>

      {chartsLoading && <p className="loading">{t.loadingData}</p>}

      {!chartsLoading && timeline.length > 0 && (
        <div className="chart-container">
          <h3>{t.dailyAlerts}</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={timeline}>
              <defs>
                <linearGradient id="alertGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: "#94a3b8", fontSize: 10 }} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0" }}
              />
              <Area type="monotone" dataKey="count" stroke="#ef4444" fill="url(#alertGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {!chartsLoading && hourly.length > 0 && (
        <div className="chart-container">
          <h3>{t.statsHourlyHeatmap}</h3>
          <div className="heatmap">
            <div className="heatmap-row heatmap-header">
              <span className="heatmap-label" />
              {Array.from({ length: 24 }, (_, h) => (
                <span key={h} className="heatmap-cell heatmap-hour-label">{h}</span>
              ))}
            </div>
            {heatmapGrid.map((row, dow) => (
              <div key={dow} className="heatmap-row">
                <span className="heatmap-label">{DAYS[dow]}</span>
                {row.map((count, hour) => (
                  <span
                    key={hour}
                    className="heatmap-cell"
                    style={{
                      background: count > 0
                        ? `rgba(239, 68, 68, ${0.15 + 0.85 * (count / maxHeat)})`
                        : "rgba(255,255,255,0.03)",
                    }}
                    title={`${DAYS[dow]} ${hour}:00 — ${count}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {cityData.length > 0 && (
        <div className="chart-container">
          <h3>{t.topCities}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={cityData}
                dataKey="count"
                nameKey="city"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ city }) => city}
              >
                {cityData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
