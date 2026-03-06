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
} from "recharts";
import type { AlertStats } from "../types/alert";
import { useLang } from "../context/LanguageContext";

const COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981", "#8b5cf6", "#f97316"];

interface Props {
  stats: AlertStats | null;
}

export default function StatsPanel({ stats }: Props) {
  const { t } = useLang();

  if (!stats) {
    return (
      <div className="stats-panel">
        <h2>{t.statistics}</h2>
        <p className="loading">{t.loadingData}</p>
      </div>
    );
  }

  // Aggregate daily counts
  const dailyMap = new Map<string, number>();
  for (const d of stats.daily) {
    dailyMap.set(d.day, (dailyMap.get(d.day) || 0) + d.count);
  }
  const dailyData = Array.from(dailyMap.entries())
    .map(([day, count]) => ({ day, count }))
    .reverse();

  const cityData = stats.top_cities.slice(0, 10);

  return (
    <div className="stats-panel">
      <h2>{t.statistics}</h2>

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

      {dailyData.length > 0 && (
        <div className="chart-container">
          <h3>{t.dailyAlerts}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dailyData}>
              <XAxis dataKey="day" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: 8,
                  color: "#e2e8f0",
                }}
              />
              <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
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
                contentStyle={{
                  background: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: 8,
                  color: "#e2e8f0",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
