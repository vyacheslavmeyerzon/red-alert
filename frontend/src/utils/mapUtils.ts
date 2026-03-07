import { CITY_COORDS } from "../components/AlertMap";

// Normalize Hebrew name for matching (remove dashes, maqaf, etc.)
export function normalizeName(name: string): string {
  return name.replace(/[-\u2013\u05BE\u05F3'"]/g, " ").replace(/\s+/g, " ").trim();
}

export function resolveCoords(city: string): [number, number] | null {
  if (CITY_COORDS[city]) return CITY_COORDS[city];
  const key = Object.keys(CITY_COORDS).find(
    (k) => city.includes(k) || k.includes(city)
  );
  return key ? CITY_COORDS[key] : null;
}

// Polygon data cache
let polygonCache: GeoJSON.FeatureCollection | null = null;
let polygonLoading = false;
const polygonCallbacks: Array<(data: GeoJSON.FeatureCollection) => void> = [];

export function loadPolygons(cb: (data: GeoJSON.FeatureCollection) => void) {
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

export function findPolygon(city: string, polygons: GeoJSON.FeatureCollection): GeoJSON.Feature | null {
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
