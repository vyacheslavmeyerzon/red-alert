"""
Shelter times (זמן מיגון) per region in Israel.
Source: Pikud HaOref official guidelines.

Times represent seconds to reach a protected space after siren.
Regions closer to Gaza/Lebanon borders have shorter times.
"""

# Shelter time in seconds by city/region name
# Format: city_name -> seconds
SHELTER_TIMES: dict[str, int] = {
    # Gaza envelope (עוטף עזה) — 0-15 seconds
    "כיסופים": 0,
    "כרם אבו סאלם": 0,
    "כרם שלום": 0,
    "נחל עוז": 0,
    "עין השלושה": 0,
    "ניר יצחק": 0,
    "נירים": 0,
    "רעים": 0,
    "בארי": 0,
    "עלומים": 15,
    "מפלסים": 15,
    "סעד": 15,
    "תקומה": 15,
    "גבולות": 15,
    "אורים": 15,
    "איבים": 15,
    "ניר עם": 15,
    "יד מרדכי": 15,
    "זיקים": 15,
    "כרמיה": 15,

    # Sderot & area — 15 seconds
    "שדרות": 15,
    "נתיבות": 15,
    "אופקים": 30,

    # Ashkelon area — 30 seconds
    "אשקלון": 30,

    # Ashdod, Kiryat Gat — 45 seconds
    "אשדוד": 45,
    "קריית גת": 45,

    # Northern border (גבול לבנון) — 0-15 seconds
    "מטולה": 0,
    "מנרה": 0,
    "מרגליות": 0,
    "כפר גלעדי": 0,
    "דפנה": 0,
    "שאר ישוב": 0,
    "הגושרים": 0,
    "דן": 0,
    "מלכיה": 0,
    "אדמית": 0,
    "אילון": 0,
    "חניתה": 0,
    "יערה": 0,
    "מצובה": 0,
    "עבדון": 0,
    "שלומי": 15,
    "ראש הנקרה": 0,
    "שתולה": 0,
    "זרעית": 0,
    "אביבים": 0,
    "יפתח": 0,
    "ברעם": 0,
    "יראון": 0,
    "דובב": 0,
    "שומרה": 0,
    "רמות נפתלי": 15,
    "תל חי": 0,

    # Kiryat Shmona — 15 seconds
    "קריית שמונה": 15,

    # Upper Galilee — 15-30 seconds
    "צפת": 30,
    "נהריה": 15,
    "מעלות תרשיחא": 30,

    # Golan — 15-30 seconds
    "קצרין": 30,
    "מג'דל שמס": 15,
    "אל רום": 15,
    "מסעדה": 15,
    "בוקעתא": 15,
    "נווה אטיב": 15,

    # Haifa area — 60 seconds
    "חיפה": 60,
    "חיפה - כרמל ועיר תחתית": 60,
    "חיפה - נווה שאנן והדר": 60,
    "קריית אתא": 60,
    "קריית ביאליק": 60,
    "קריית מוצקין": 60,
    "קריית ים": 60,
    "נשר": 60,
    "טירת כרמל": 60,
    "עכו": 60,
    "כרמיאל": 60,

    # Tiberias, Nazareth — 30-60 seconds
    "טבריה": 30,
    "נצרת": 60,
    "עפולה": 60,
    "יקנעם": 60,

    # Center — 90 seconds
    "תל אביב": 90,
    "תל אביב - מרכז העיר": 90,
    "תל אביב - מזרח": 90,
    "תל אביב - דרום העיר": 90,
    "תל אביב - יפו": 90,
    "רמת גן": 90,
    "גבעתיים": 90,
    "חולון": 90,
    "בת ים": 90,
    "בני ברק": 90,
    "פתח תקווה": 90,
    "ראשון לציון": 90,
    "רחובות": 90,
    "הרצליה": 90,
    "כפר סבא": 90,
    "רעננה": 90,
    "הוד השרון": 90,
    "לוד": 90,
    "רמלה": 90,
    "יהוד": 90,
    "אור יהודה": 90,
    "נתניה": 90,
    "חדרה": 90,

    # Modiin, Jerusalem area — 90 seconds
    "מודיעין": 90,
    "מודיעין עילית": 90,
    "ירושלים": 90,

    # South deep — 60-90 seconds
    "באר שבע": 60,
    "באר שבע - מזרח": 60,
    "באר שבע - מערב": 60,
    "דימונה": 90,
    "ערד": 90,
    "ירוחם": 90,
    "מצפה רמון": 180,

    # Eilat — 180 seconds (3 minutes)
    "אילת": 180,
}

# Region-based fallback by latitude (approximate)
# Used when exact city not found
SHELTER_TIME_BY_LATITUDE: list[tuple[float, int]] = [
    (33.3, 0),    # Northern border
    (33.1, 15),   # Upper Galilee
    (32.9, 30),   # Lower Galilee
    (32.5, 60),   # Haifa / Valleys
    (32.0, 90),   # Center / Tel Aviv
    (31.6, 45),   # Ashkelon area
    (31.4, 15),   # Sderot / Gaza envelope
    (31.2, 0),    # Gaza border
    (30.5, 90),   # Negev
    (29.5, 180),  # Eilat
]


def get_shelter_time(city: str, lat: float | None = None) -> int | None:
    """Get shelter time in seconds for a city. Returns None if unknown."""
    # Exact match
    if city in SHELTER_TIMES:
        return SHELTER_TIMES[city]

    # Partial match
    for key, seconds in SHELTER_TIMES.items():
        if city in key or key in city:
            return seconds

    # Fallback by latitude
    if lat is not None:
        for threshold_lat, seconds in SHELTER_TIME_BY_LATITUDE:
            if lat >= threshold_lat:
                return seconds

    return None
