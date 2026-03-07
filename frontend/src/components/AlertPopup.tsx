import type { AlertData } from "../types/alert";
import { getShelterTime, formatShelterTime, shelterUrgencyColor } from "../data/shelterTimes";

interface AlertPopupContentProps {
  city: string;
  alert: AlertData;
  color: string;
  showDescription?: boolean;
}

export default function AlertPopupContent({ city, alert, color, showDescription = false }: AlertPopupContentProps) {
  const isDrone = alert.category === 5;
  const headerBg = isDrone ? "#f97316" : color;

  return (
    <div style={{ direction: "rtl", textAlign: "right", minWidth: 180 }}>
      <div style={{
        background: headerBg, color: "#fff", padding: "4px 8px",
        borderRadius: 4, marginBottom: 6, fontWeight: 700, fontSize: 13,
      }}>
        {isDrone ? "✈️ חדירת כלי טיס עוין" : "🔴 אזעקה פעילה"}
      </div>
      <strong>{alert.title}</strong><br />
      <span style={{ fontSize: 14 }}>{city}</span><br />
      <small style={{ color: "#666" }}>
        {new Date(alert.alerted_at).toLocaleTimeString("he-IL")}
      </small>
      {(() => {
        if ((alert.title || "").includes("הסתיים")) return null;
        const shelter = getShelterTime(city);
        if (shelter === null) return null;
        return (
          <div style={{
            marginTop: 6, padding: "5px 8px", background: shelterUrgencyColor(shelter),
            borderRadius: 4, fontSize: 13, fontWeight: 700, color: "#fff", textAlign: "center",
          }}>
            🛡️ זמן מיגון: {formatShelterTime(shelter)}
          </div>
        );
      })()}
      {showDescription && alert.description && (
        <div style={{
          marginTop: 6, padding: "4px 6px", background: "#fff3f3",
          borderRadius: 4, fontSize: 12,
        }}>
          {alert.description}
        </div>
      )}
    </div>
  );
}
