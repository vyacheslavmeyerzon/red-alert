import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useMemo, useRef } from "react";
import type { AlertData } from "../types/alert";
import { CITY_COORDS } from "./AlertMap";
import { getShelterTime, formatShelterTime, shelterUrgencyColor } from "../data/shelterTimes";
import "leaflet/dist/leaflet.css";

const ISRAEL_CENTER: [number, number] = [31.5, 34.9];

const THREAT_RADIUS: Record<number, number> = {
  1: 3000, 2: 5000, 3: 8000, 4: 10000, 5: 4000, 6: 3000, 7: 2000, 13: 2000,
};

const CATEGORY_COLORS: Record<number, string> = {
  1: "#ef4444", 2: "#f59e0b", 3: "#8b5cf6", 4: "#3b82f6",
  5: "#f97316", 6: "#10b981", 7: "#dc2626", 13: "#6366f1",
};

function getScaledRadius(category: number, city: string): number {
  const base = THREAT_RADIUS[category] || 3000;
  const shelter = getShelterTime(city);
  if (shelter === null) return base;
  if (shelter === 0) return base * 0.6;
  if (shelter <= 15) return base * 0.8;
  if (shelter <= 30) return base;
  if (shelter <= 60) return base * 1.3;
  return base * 1.5;
}

const droneIcon = new L.DivIcon({
  className: "drone-marker",
  html: `<div class="drone-icon-wrapper">
    <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
    </svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function resolveCoords(city: string): [number, number] | null {
  if (CITY_COORDS[city]) return CITY_COORDS[city];
  const key = Object.keys(CITY_COORDS).find(
    (k) => city.includes(k) || k.includes(city)
  );
  return key ? CITY_COORDS[key] : null;
}

interface ThreatZone {
  city: string;
  coords: [number, number];
  alert: AlertData;
}

function ThreatZones({ alerts }: { alerts: AlertData[] }) {
  const map = useMap();
  const prevCountRef = useRef(0);

  const zones: ThreatZone[] = useMemo(() => {
    const result: ThreatZone[] = [];
    const seen = new Set<string>();
    for (const alert of alerts) {
      for (const city of alert.cities) {
        const coords = resolveCoords(city);
        if (coords && !seen.has(city)) {
          seen.add(city);
          result.push({ city, coords, alert });
        }
      }
    }
    return result;
  }, [alerts]);

  useEffect(() => {
    if (zones.length > 0 && zones.length !== prevCountRef.current) {
      const bounds = L.latLngBounds(zones.map((z) => z.coords));
      map.fitBounds(bounds.pad(0.3), { maxZoom: 12, animate: true });
    } else if (zones.length === 0 && prevCountRef.current > 0) {
      map.flyTo(ISRAEL_CENTER, 8, { animate: true, duration: 1 });
    }
    prevCountRef.current = zones.length;
  }, [zones, map]);

  // Force resize after mount for TV browsers
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 500);
    return () => clearTimeout(timer);
  }, [map]);

  return (
    <>
      {/* Outer pulse rings */}
      {zones.map((z, i) => {
        const radius = getScaledRadius(z.alert.category, z.city) * 1.5;
        const color = CATEGORY_COLORS[z.alert.category] || "#ef4444";
        return (
          <Circle
            key={`pulse-${z.city}-${i}`}
            center={z.coords}
            radius={radius}
            pathOptions={{
              color, fillColor: color, fillOpacity: 0.08,
              weight: 1, opacity: 0.3, dashArray: "8 8",
            }}
          />
        );
      })}

      {zones.map((z, i) => {
        const radius = getScaledRadius(z.alert.category, z.city);
        const color = CATEGORY_COLORS[z.alert.category] || "#ef4444";
        return (
          <Circle
            key={`zone-${z.city}-${z.alert.id}-${i}`}
            center={z.coords}
            radius={radius}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: 0.35,
              weight: 2,
              opacity: 0.8,
              className: "threat-zone-live",
            }}
          >
            <Popup>
              <div style={{ direction: "rtl", textAlign: "right", minWidth: 180 }}>
                <div style={{
                  background: "#ef4444", color: "#fff", padding: "4px 8px",
                  borderRadius: 4, marginBottom: 6, fontWeight: 700, fontSize: 13,
                }}>
                  🔴 אזעקה פעילה
                </div>
                <strong>{z.alert.title}</strong><br />
                <span style={{ fontSize: 14 }}>{z.city}</span><br />
                <small style={{ color: "#666" }}>
                  {new Date(z.alert.alerted_at).toLocaleTimeString("he-IL")}
                </small>
                {(() => {
                  const shelter = getShelterTime(z.city);
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
              </div>
            </Popup>
          </Circle>
        );
      })}

      {zones.filter((z) => z.alert.category !== 5).map((z, i) => (
        <Circle
          key={`dot-${z.city}-${i}`}
          center={z.coords}
          radius={500}
          pathOptions={{
            color: "#fff", fillColor: "#ef4444", fillOpacity: 0.9,
            weight: 2, opacity: 1, className: "threat-dot-pulse",
          }}
        />
      ))}

      {zones.filter((z) => z.alert.category === 5).map((z, i) => (
        <Marker key={`drone-${z.city}-${i}`} position={z.coords} icon={droneIcon} />
      ))}
    </>
  );
}

export default function TvMap({ alerts }: { alerts: AlertData[] }) {
  return (
    <MapContainer
      center={ISRAEL_CENTER}
      zoom={8}
      style={{ width: "100%", height: "100%" }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; CARTO'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <ThreatZones alerts={alerts} />
    </MapContainer>
  );
}
