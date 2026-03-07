import { useEffect, useMemo, useRef, useState } from "react";
import Map, { Source, Layer, Marker, Popup, type MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import React from "react";
import type { AlertData } from "../types/alert";
import { getShelterTime, formatShelterTime, shelterUrgencyColor } from "../data/shelterTimes";

// Approximate coordinates for Israeli cities/regions
export const CITY_COORDS: Record<string, [number, number]> = {
  // Major cities
  "תל אביב": [32.0853, 34.7818],
  "תל אביב - מרכז העיר": [32.0653, 34.7818],
  "תל אביב - מזרח": [32.0753, 34.8],
  "תל אביב - דרום העיר": [32.05, 34.77],
  "תל אביב - יפו": [32.0553, 34.7618],
  "ירושלים": [31.7683, 35.2137],
  "חיפה": [32.794, 34.9896],
  "חיפה - כרמל ועיר תחתית": [32.79, 34.98],
  "חיפה - נווה שאנן והדר": [32.8, 34.99],
  "באר שבע": [31.253, 34.7915],
  "באר שבע - מזרח": [31.253, 34.81],
  "באר שבע - מערב": [31.253, 34.77],
  // Gush Dan
  "רמת גן": [32.0684, 34.8248],
  "גבעתיים": [32.0717, 34.8124],
  "חולון": [32.0117, 34.7749],
  "בת ים": [32.0231, 34.7515],
  "בני ברק": [32.0834, 34.8344],
  "פתח תקווה": [32.0841, 34.8878],
  "ראשון לציון": [31.9714, 34.7925],
  "רחובות": [31.8928, 34.8113],
  "הרצליה": [32.1629, 34.8445],
  "כפר סבא": [32.1751, 34.9066],
  "רעננה": [32.184, 34.871],
  "הוד השרון": [32.153, 34.888],
  "לוד": [31.9515, 34.8953],
  "רמלה": [31.9275, 34.8625],
  "יהוד": [32.033, 34.876],
  "אור יהודה": [32.03, 34.856],
  "מודיעין": [31.8969, 35.0101],
  "מודיעין עילית": [31.933, 35.043],
  // South
  "אשדוד": [31.8014, 34.6435],
  "אשקלון": [31.6688, 34.5743],
  "שדרות": [31.525, 34.5967],
  "נתיבות": [31.4218, 34.5879],
  "אופקים": [31.3133, 34.6185],
  "קריית גת": [31.61, 34.7642],
  "דימונה": [31.0688, 35.0338],
  "ערד": [31.2589, 35.2126],
  "אילת": [29.5577, 34.9519],
  "מצפה רמון": [30.61, 34.8],
  "ירוחם": [31.025, 34.93],
  // Gaza border area
  "איבים": [31.388, 34.524],
  "ניר עם": [31.4917, 34.5583],
  "כיסופים": [31.375, 34.395],
  "נחל עוז": [31.48, 34.48],
  "כרם אבו סאלם": [31.217, 34.275],
  "כרם שלום": [31.226, 34.276],
  "עין השלושה": [31.35, 34.39],
  "ניר יצחק": [31.28, 34.33],
  "נירים": [31.35, 34.41],
  "סעד": [31.45, 34.53],
  "תקומה": [31.42, 34.56],
  "אורים": [31.33, 34.52],
  "גבולות": [31.3, 34.46],
  "רעים": [31.38, 34.44],
  "בארי": [31.41, 34.47],
  "עלומים": [31.4, 34.54],
  "מפלסים": [31.47, 34.54],
  "יד מרדכי": [31.59, 34.56],
  "זיקים": [31.62, 34.54],
  "כרמיה": [31.64, 34.56],
  // Sharon & center
  "נתניה": [32.3215, 34.8532],
  "חדרה": [32.44, 34.92],
  "עפולה": [32.61, 35.29],
  "יקנעם": [32.66, 35.11],
  // North
  "עכו": [32.9272, 35.0764],
  "נהריה": [33.0039, 35.0955],
  "כרמיאל": [32.9143, 35.3018],
  "נצרת": [32.6996, 35.3035],
  "טבריה": [32.7922, 35.5312],
  "קריית שמונה": [33.2075, 35.5713],
  "צפת": [32.9646, 35.4961],
  "מעלות תרשיחא": [33.0175, 35.2724],
  "שלומי": [33.077, 35.139],
  "קריית אתא": [32.8, 35.1],
  "קריית ביאליק": [32.83, 35.08],
  "קריית מוצקין": [32.84, 35.08],
  "קריית ים": [32.85, 35.07],
  "נשר": [32.77, 35.04],
  "טירת כרמל": [32.76, 34.97],
  // Northern border
  "מנרה": [33.24, 35.55],
  "מרגליות": [33.23, 35.56],
  "מטולה": [33.28, 35.58],
  "כפר גלעדי": [33.245, 35.57],
  "דפנה": [33.23, 35.64],
  "שאר ישוב": [33.24, 35.63],
  "הגושרים": [33.22, 35.62],
  "דן": [33.25, 35.65],
  "סנהדריה": [33.21, 35.62],
  "אדמית": [33.08, 35.23],
  "אילון": [33.06, 35.21],
  "חניתה": [33.09, 35.18],
  "יערה": [33.05, 35.25],
  "מצובה": [33.08, 35.15],
  "עבדון": [33.03, 35.22],
  "ראש הנקרה": [33.09, 35.1],
  "שתולה": [33.09, 35.27],
  "זרעית": [33.08, 35.28],
  "אביבים": [33.17, 35.47],
  "יפתח": [33.18, 35.48],
  "מלכיה": [33.24, 35.53],
  "ברעם": [33.06, 35.45],
  "יראון": [33.09, 35.37],
  "דובב": [33.11, 35.36],
  "שומרה": [33.07, 35.16],
  // Golan
  "קצרין": [32.99, 35.69],
  "מג'דל שמס": [33.27, 35.77],
  "אל רום": [33.23, 35.77],
  "מסעדה": [33.27, 35.75],
  "בוקעתא": [33.24, 35.77],
  "נווה אטיב": [33.28, 35.78],
};

const ISRAEL_CENTER = { longitude: 34.9, latitude: 31.5 };
const MAP_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

const CATEGORY_COLORS: Record<number, string> = {
  1: "#ef4444", 2: "#f59e0b", 3: "#8b5cf6", 4: "#3b82f6",
  5: "#f97316", 6: "#10b981", 7: "#dc2626", 13: "#6366f1",
};

const FALLBACK_RADIUS = 3000;

function resolveCoords(city: string): [number, number] | null {
  if (CITY_COORDS[city]) return CITY_COORDS[city];
  const key = Object.keys(CITY_COORDS).find(
    (k) => city.includes(k) || k.includes(city)
  );
  return key ? CITY_COORDS[key] : null;
}

/** Create a GeoJSON circle polygon (fallback when no real polygon). */
function createCircle(lat: number, lng: number, radiusMeters: number, points = 64, color = "#ef4444"): GeoJSON.Feature {
  const coords: [number, number][] = [];
  const km = radiusMeters / 1000;
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    const dLat = (km / 111.32) * Math.cos(angle);
    const dLng = (km / (111.32 * Math.cos((lat * Math.PI) / 180))) * Math.sin(angle);
    coords.push([lng + dLng, lat + dLat]);
  }
  return { type: "Feature", geometry: { type: "Polygon", coordinates: [coords] }, properties: { color } };
}

// Normalize Hebrew name for matching (remove dashes, maqaf, etc.)
function normalizeName(name: string): string {
  return name.replace(/[-–־׳'"]/g, " ").replace(/\s+/g, " ").trim();
}

interface ThreatZone {
  city: string;
  coords: [number, number];
  alert: AlertData;
}

interface Props {
  alerts: AlertData[];
}

// Polygon data cache
let polygonCache: GeoJSON.FeatureCollection | null = null;
let polygonLoading = false;
const polygonCallbacks: Array<(data: GeoJSON.FeatureCollection) => void> = [];

function loadPolygons(cb: (data: GeoJSON.FeatureCollection) => void) {
  if (polygonCache) { cb(polygonCache); return; }
  polygonCallbacks.push(cb);
  if (polygonLoading) return;
  polygonLoading = true;
  fetch("/israel-polygons.json")
    .then((r) => r.json())
    .then((data: GeoJSON.FeatureCollection) => {
      polygonCache = data;
      for (const fn of polygonCallbacks) fn(data);
      polygonCallbacks.length = 0;
    })
    .catch(() => {
      polygonLoading = false;
    });
}

function findPolygon(city: string, polygons: GeoJSON.FeatureCollection): GeoJSON.Feature | null {
  const norm = normalizeName(city);
  // Exact match
  let feature = polygons.features.find((f) => f.properties?.name === city);
  if (feature) return feature;
  // Normalized match
  feature = polygons.features.find((f) => normalizeName(f.properties?.name || "") === norm);
  if (feature) return feature;
  // Partial match
  feature = polygons.features.find((f) => {
    const pName = normalizeName(f.properties?.name || "");
    return pName.includes(norm) || norm.includes(pName);
  });
  return feature || null;
}

function ShelterCountdown({ city }: { city: string }) {
  const seconds = getShelterTime(city);
  const [elapsed, setElapsed] = React.useState(0);

  React.useEffect(() => {
    if (seconds === null) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [seconds]);

  if (seconds === null) return null;
  const remaining = Math.max(0, seconds - elapsed);
  if (remaining <= 0) return <span className="shelter-countdown expired">00:00</span>;
  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  return (
    <span className={`shelter-countdown ${remaining <= 15 ? "urgent" : ""}`}>
      {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </span>
  );
}

export default function AlertMap({ alerts }: Props) {
  const mapRef = useRef<MapRef>(null);
  const prevCountRef = useRef(0);
  const [polygons, setPolygons] = useState<GeoJSON.FeatureCollection | null>(null);

  useEffect(() => {
    loadPolygons(setPolygons);
  }, []);

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

  // Build GeoJSON — use real polygons when available, circles as fallback
  const zonesGeoJson = useMemo<GeoJSON.FeatureCollection>(() => {
    const features: GeoJSON.Feature[] = [];
    for (const z of zones) {
      const color = CATEGORY_COLORS[z.alert.category] || "#ef4444";
      const poly = polygons ? findPolygon(z.city, polygons) : null;
      if (poly) {
        features.push({
          ...poly,
          properties: { ...poly.properties, color },
        });
      } else {
        features.push(createCircle(z.coords[0], z.coords[1], FALLBACK_RADIUS, 64, color));
      }
    }
    return { type: "FeatureCollection", features };
  }, [zones, polygons]);

  // Auto-fit map to alert bounds
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (zones.length > 0 && zones.length !== prevCountRef.current) {
      if (zones.length === 1) {
        map.flyTo({ center: [zones[0].coords[1], zones[0].coords[0]], zoom: 11, duration: 1000 });
      } else {
        const lngs = zones.map((z) => z.coords[1]);
        const lats = zones.map((z) => z.coords[0]);
        map.fitBounds(
          [[Math.min(...lngs) - 0.2, Math.min(...lats) - 0.2],
           [Math.max(...lngs) + 0.2, Math.max(...lats) + 0.2]],
          { padding: 60, maxZoom: 12, duration: 1000 }
        );
      }
    } else if (zones.length === 0 && prevCountRef.current > 0) {
      map.flyTo({ center: [ISRAEL_CENTER.longitude, ISRAEL_CENTER.latitude], zoom: 8, duration: 1000 });
    }
    prevCountRef.current = zones.length;
  }, [zones]);

  const [popupInfo, setPopupInfo] = React.useState<ThreatZone | null>(null);

  return (
    <Map
      ref={mapRef}
      initialViewState={{ ...ISRAEL_CENTER, zoom: 8 }}
      style={{ width: "100%", height: "100%" }}
      mapStyle={MAP_STYLE}
      attributionControl={false}
    >
      {/* Threat zone polygons/circles */}
      <Source id="threat-zones" type="geojson" data={zonesGeoJson}>
        <Layer
          id="threat-zone-fill"
          type="fill"
          paint={{
            "fill-color": ["get", "color"],
            "fill-opacity": 0.3,
          }}
        />
        <Layer
          id="threat-zone-border"
          type="line"
          paint={{
            "line-color": ["get", "color"],
            "line-width": 2,
            "line-opacity": 0.8,
          }}
        />
      </Source>

      {/* City markers */}
      {zones.map((z, i) => {
        const isDrone = z.alert.category === 5;
        const catColor = CATEGORY_COLORS[z.alert.category] || "#ef4444";
        return (
          <Marker
            key={`marker-${z.city}-${i}`}
            longitude={z.coords[1]}
            latitude={z.coords[0]}
            anchor="center"
            onClick={(e) => { e.originalEvent.stopPropagation(); setPopupInfo(z); }}
          >
            <div className="map-marker-group">
              {isDrone ? (
                <div className="drone-icon-wrapper" style={{ cursor: "pointer" }}>
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
                  </svg>
                </div>
              ) : (
                <div className="alert-dot-marker" style={{ background: catColor, boxShadow: `0 0 12px ${catColor}cc` }} />
              )}
              <ShelterCountdown city={z.city} />
            </div>
          </Marker>
        );
      })}

      {/* Popup */}
      {popupInfo && (
        <Popup
          longitude={popupInfo.coords[1]}
          latitude={popupInfo.coords[0]}
          anchor="bottom"
          onClose={() => setPopupInfo(null)}
          closeOnClick={false}
          maxWidth="280px"
        >
          <div style={{ direction: "rtl", textAlign: "right" }}>
            <div style={{
              background: popupInfo.alert.category === 5 ? "#f97316" : "#ef4444",
              color: "#fff", padding: "4px 8px", borderRadius: 4, marginBottom: 6,
              fontWeight: 700, fontSize: 13,
            }}>
              {popupInfo.alert.category === 5 ? "✈️ חדירת כלי טיס עוין" : "🔴 אזעקה פעילה"}
            </div>
            <strong>{popupInfo.alert.title}</strong><br />
            <span style={{ fontSize: 14 }}>{popupInfo.city}</span><br />
            <small style={{ color: "#666" }}>
              {new Date(popupInfo.alert.alerted_at).toLocaleTimeString("he-IL")}
            </small>
            {(() => {
              const shelter = getShelterTime(popupInfo.city);
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
            {popupInfo.alert.description && (
              <div style={{
                marginTop: 6, padding: "4px 6px", background: "#fff3f3",
                borderRadius: 4, fontSize: 12,
              }}>
                {popupInfo.alert.description}
              </div>
            )}
          </div>
        </Popup>
      )}
    </Map>
  );
}
