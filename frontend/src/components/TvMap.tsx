import { useMemo } from "react";
import type { AlertData } from "../types/alert";
import { resolveCoords } from "../utils/mapUtils";

// Viewport bounds matching zoom-8 view of Israel
const LAT_MIN = 29.2;
const LAT_MAX = 33.6;
const LNG_MIN = 33.7;
const LNG_MAX = 36.3;

const CATEGORY_COLORS: Record<number, string> = {
  1: "#ef4444", 2: "#f59e0b", 3: "#8b5cf6", 4: "#3b82f6",
  5: "#f97316", 6: "#10b981", 7: "#dc2626", 10: "#eab308",
  13: "#6366f1", 14: "#eab308",
};

// Simplified Israel border outline (lat, lng pairs)
const ISRAEL_BORDER: [number, number][] = [
  [29.49, 34.88], [29.52, 34.95], [29.56, 34.96], [29.93, 34.82],
  [30.32, 34.56], [30.52, 34.48], [30.85, 34.36], [31.08, 34.22],
  [31.22, 34.24], [31.32, 34.27], [31.50, 34.39], [31.68, 34.56],
  [31.82, 34.62], [32.00, 34.72], [32.16, 34.78], [32.33, 34.83],
  [32.55, 34.87], [32.75, 34.95], [32.82, 35.01], [32.92, 35.06],
  [33.05, 35.11], [33.15, 35.18], [33.28, 35.62],
  [33.10, 35.65], [32.92, 35.63], [32.75, 35.58], [32.60, 35.55],
  [32.45, 35.52], [32.30, 35.55], [32.10, 35.57], [31.80, 35.53],
  [31.50, 35.47], [31.30, 35.45], [31.10, 35.40], [30.80, 35.25],
  [30.50, 35.15], [30.15, 35.05], [29.55, 34.97], [29.49, 34.88],
];

function toSvg(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * 100;
  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * 100;
  return { x, y };
}

const borderPath = ISRAEL_BORDER
  .map((p, i) => {
    const { x, y } = toSvg(p[0], p[1]);
    return `${i === 0 ? "M" : "L"}${x},${y}`;
  })
  .join(" ") + " Z";

interface ThreatZone {
  city: string;
  coords: [number, number];
  alert: AlertData;
}

export default function TvMap({ alerts }: { alerts: AlertData[] }) {
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

  return (
    <div className="tv-svg-map">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="tv-svg-map-svg">
        {/* Israel border outline */}
        <path
          d={borderPath}
          fill="rgba(255,255,255,0.03)"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="0.3"
        />

        {/* Alert zones — glow circles */}
        {zones.map((z, i) => {
          const { x, y } = toSvg(z.coords[0], z.coords[1]);
          const color = CATEGORY_COLORS[z.alert.category] || "#ef4444";
          const isDrone = z.alert.category === 5;
          return (
            <g key={`${z.city}-${z.alert.id}-${i}`}>
              {/* Outer glow */}
              <circle cx={x} cy={y} r={isDrone ? 2.5 : 2} fill={color} opacity={0.25}>
                <animate attributeName="r" values={isDrone ? "2;3.5;2" : "1.5;2.8;1.5"} dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
              </circle>
              {/* Inner dot */}
              <circle cx={x} cy={y} r={isDrone ? 1.2 : 0.8} fill={color} stroke="#fff" strokeWidth="0.15" opacity={0.9}>
                <animate attributeName="opacity" values="1;0.6;1" dur="1.5s" repeatCount="indefinite" />
              </circle>
              {isDrone && (
                <text x={x} y={y + 0.4} textAnchor="middle" fontSize="1.5" fill="#f97316">✈</text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
