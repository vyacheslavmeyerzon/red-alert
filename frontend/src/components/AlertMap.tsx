import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useMemo, useRef } from "react";
import type { AlertData } from "../types/alert";
import { getShelterTime, formatShelterTime, shelterUrgencyColor } from "../data/shelterTimes";

// Approximate coordinates for Israeli cities/regions
const CITY_COORDS: Record<string, [number, number]> = {
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

const ISRAEL_CENTER: [number, number] = [31.5, 34.9];

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

// Resolve city name to coordinates with fuzzy matching
function resolveCoords(city: string): [number, number] | null {
  if (CITY_COORDS[city]) return CITY_COORDS[city];
  // Partial match
  const key = Object.keys(CITY_COORDS).find(
    (k) => city.includes(k) || k.includes(city)
  );
  return key ? CITY_COORDS[key] : null;
}

// Threat zone radius by category (meters)
const THREAT_RADIUS: Record<number, number> = {
  1: 3000,  // rockets
  2: 5000,  // radiological
  3: 8000,  // earthquake
  4: 10000, // tsunami
  5: 4000,  // hostile aircraft
  6: 3000,  // hazmat
  7: 2000,  // terror
  13: 2000, // update
};

interface ThreatZone {
  city: string;
  coords: [number, number];
  alert: AlertData;
}

interface Props {
  alerts: AlertData[];
}

function ThreatZones({ alerts }: Props) {
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

  // Auto-fit map when alerts appear, reset to Israel view when cleared
  useEffect(() => {
    if (zones.length > 0 && zones.length !== prevCountRef.current) {
      const bounds = L.latLngBounds(zones.map((z) => z.coords));
      map.fitBounds(bounds.pad(0.3), { maxZoom: 12, animate: true });
    } else if (zones.length === 0 && prevCountRef.current > 0) {
      // Alerts cleared — reset to full Israel view
      map.flyTo(ISRAEL_CENTER, 8, { animate: true, duration: 1 });
    }
    prevCountRef.current = zones.length;
  }, [zones, map]);

  return (
    <>
      {/* Red threat zone circles */}
      {zones.map((z, i) => {
        const radius = THREAT_RADIUS[z.alert.category] || 3000;
        return (
          <Circle
            key={`zone-${z.city}-${z.alert.id}-${i}`}
            center={z.coords}
            radius={radius}
            pathOptions={{
              color: "#ef4444",
              fillColor: "#ef4444",
              fillOpacity: 0.35,
              weight: 2,
              opacity: 0.8,
              className: "threat-zone-live",
            }}
          >
            <Popup>
              <div style={{ direction: "rtl", textAlign: "right", minWidth: 180 }}>
                <div
                  style={{
                    background: "#ef4444",
                    color: "#fff",
                    padding: "4px 8px",
                    borderRadius: 4,
                    marginBottom: 6,
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  🔴 אזעקה פעילה
                </div>
                <strong>{z.alert.title}</strong>
                <br />
                <span style={{ fontSize: 14 }}>{z.city}</span>
                <br />
                <small style={{ color: "#666" }}>
                  {new Date(z.alert.alerted_at).toLocaleTimeString("he-IL")}
                </small>
                {(() => {
                  const shelter = getShelterTime(z.city);
                  if (shelter === null) return null;
                  return (
                    <div
                      style={{
                        marginTop: 6,
                        padding: "5px 8px",
                        background: shelterUrgencyColor(shelter),
                        borderRadius: 4,
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#fff",
                        textAlign: "center",
                      }}
                    >
                      🛡️ זמן מיגון: {formatShelterTime(shelter)}
                    </div>
                  );
                })()}
                {z.alert.description && (
                  <div
                    style={{
                      marginTop: 6,
                      padding: "4px 6px",
                      background: "#fff3f3",
                      borderRadius: 4,
                      fontSize: 12,
                    }}
                  >
                    {z.alert.description}
                  </div>
                )}
              </div>
            </Popup>
          </Circle>
        );
      })}

      {/* Pulsing center dots (non-aircraft) */}
      {zones
        .filter((z) => z.alert.category !== 5)
        .map((z, i) => (
          <Circle
            key={`dot-${z.city}-${i}`}
            center={z.coords}
            radius={500}
            pathOptions={{
              color: "#fff",
              fillColor: "#ef4444",
              fillOpacity: 0.9,
              weight: 2,
              opacity: 1,
              className: "threat-dot-pulse",
            }}
          />
        ))}

      {/* Aircraft/drone icons for category 5 */}
      {zones
        .filter((z) => z.alert.category === 5)
        .map((z, i) => (
          <Marker
            key={`drone-${z.city}-${i}`}
            position={z.coords}
            icon={droneIcon}
          >
            <Popup>
              <div style={{ direction: "rtl", textAlign: "right", minWidth: 160 }}>
                <div
                  style={{
                    background: "#f97316",
                    color: "#fff",
                    padding: "4px 8px",
                    borderRadius: 4,
                    marginBottom: 6,
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  ✈️ חדירת כלי טיס עוין
                </div>
                <span style={{ fontSize: 14 }}>{z.city}</span>
                <br />
                <small style={{ color: "#666" }}>
                  {new Date(z.alert.alerted_at).toLocaleTimeString("he-IL")}
                </small>
              </div>
            </Popup>
          </Marker>
        ))}
    </>
  );
}

export default function AlertMap({ alerts }: Props) {
  return (
    <MapContainer
      center={ISRAEL_CENTER}
      zoom={8}
      style={{ width: "100%", height: "100%" }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <ThreatZones alerts={alerts} />
    </MapContainer>
  );
}
