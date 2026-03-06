/** Shelter time in seconds by city name (זמן מיגון) */
export const SHELTER_TIMES: Record<string, number> = {
  // Gaza envelope — 0 seconds (immediate)
  "כיסופים": 0, "כרם אבו סאלם": 0, "כרם שלום": 0, "נחל עוז": 0,
  "עין השלושה": 0, "ניר יצחק": 0, "נירים": 0, "רעים": 0, "בארי": 0,
  // Gaza envelope — 15 seconds
  "עלומים": 15, "מפלסים": 15, "סעד": 15, "תקומה": 15, "גבולות": 15,
  "אורים": 15, "איבים": 15, "ניר עם": 15, "יד מרדכי": 15,
  "זיקים": 15, "כרמיה": 15, "שדרות": 15, "נתיבות": 15,
  // South — 30-45 seconds
  "אופקים": 30, "אשקלון": 30, "אשדוד": 45, "קריית גת": 45,
  // Northern border — 0 seconds
  "מטולה": 0, "מנרה": 0, "מרגליות": 0, "כפר גלעדי": 0, "דפנה": 0,
  "שאר ישוב": 0, "הגושרים": 0, "דן": 0, "מלכיה": 0, "אדמית": 0,
  "אילון": 0, "חניתה": 0, "יערה": 0, "מצובה": 0, "עבדון": 0,
  "ראש הנקרה": 0, "שתולה": 0, "זרעית": 0, "אביבים": 0, "יפתח": 0,
  "ברעם": 0, "יראון": 0, "דובב": 0, "שומרה": 0, "תל חי": 0,
  // Northern — 15 seconds
  "שלומי": 15, "קריית שמונה": 15, "נהריה": 15, "רמות נפתלי": 15,
  // Golan — 15-30 seconds
  "מג'דל שמס": 15, "אל רום": 15, "מסעדה": 15, "בוקעתא": 15,
  "נווה אטיב": 15, "קצרין": 30, "צפת": 30, "מעלות תרשיחא": 30,
  "טבריה": 30,
  // Haifa area — 60 seconds
  "חיפה": 60, "חיפה - כרמל ועיר תחתית": 60, "חיפה - נווה שאנן והדר": 60,
  "קריית אתא": 60, "קריית ביאליק": 60, "קריית מוצקין": 60,
  "קריית ים": 60, "נשר": 60, "טירת כרמל": 60, "עכו": 60,
  "כרמיאל": 60, "נצרת": 60, "עפולה": 60, "יקנעם": 60,
  // Beer Sheva — 60 seconds
  "באר שבע": 60, "באר שבע - מזרח": 60, "באר שבע - מערב": 60,
  // Center — 90 seconds
  "תל אביב": 90, "תל אביב - מרכז העיר": 90, "תל אביב - מזרח": 90,
  "תל אביב - דרום העיר": 90, "תל אביב - יפו": 90,
  "רמת גן": 90, "גבעתיים": 90, "חולון": 90, "בת ים": 90,
  "בני ברק": 90, "פתח תקווה": 90, "ראשון לציון": 90, "רחובות": 90,
  "הרצליה": 90, "כפר סבא": 90, "רעננה": 90, "הוד השרון": 90,
  "לוד": 90, "רמלה": 90, "יהוד": 90, "אור יהודה": 90,
  "נתניה": 90, "חדרה": 90, "מודיעין": 90, "מודיעין עילית": 90,
  "ירושלים": 90,
  // Deep south — 90-180 seconds
  "דימונה": 90, "ערד": 90, "ירוחם": 90,
  "מצפה רמון": 180, "אילת": 180,
};

export function getShelterTime(city: string): number | null {
  if (SHELTER_TIMES[city] !== undefined) return SHELTER_TIMES[city];
  // Partial match
  for (const [key, val] of Object.entries(SHELTER_TIMES)) {
    if (city.includes(key) || key.includes(city)) return val;
  }
  return null;
}

export function formatShelterTime(seconds: number): string {
  if (seconds === 0) return "מיידי!";
  if (seconds < 60) return `${seconds} שניות`;
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  if (sec === 0) return `${min} דקות`;
  return `${min} דקות ${sec} שניות`;
}

export function shelterUrgencyColor(seconds: number): string {
  if (seconds <= 0) return "#dc2626";   // immediate — dark red
  if (seconds <= 15) return "#ef4444";  // 15s — red
  if (seconds <= 30) return "#f97316";  // 30s — orange
  if (seconds <= 60) return "#f59e0b";  // 60s — amber
  return "#eab308";                     // 90s+ — yellow
}
