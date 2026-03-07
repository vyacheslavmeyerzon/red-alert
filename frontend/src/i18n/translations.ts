export type Lang = "he" | "en" | "ru";

export type Translations = {
  // App header
  headerSubtitle: string;
  tabLive: string;
  tabHistory: string;
  tabStats: string;
  fullscreenEnter: string;
  fullscreenExit: string;
  legendActiveAlert: string;
  // Language setting
  settingsLanguage: string;
  langHe: string;
  langEn: string;
  langRu: string;
  // AlertFeed
  liveAlerts: string;
  noActiveAlerts: string;
  listeningForUpdates: string;
  savedCityAlert: string;
  shelterTime: string;
  // AlertHistory
  alertHistory: string;
  searchPlaceholder: string;
  allCategories: string;
  totalAlerts: (n: number) => string;
  pageOf: (p: number, total: number) => string;
  loading: string;
  colTime: string;
  colType: string;
  colAreas: string;
  noAlertsFor: (city: string) => string;
  noData: string;
  prevPage: string;
  nextPage: string;
  // StatsPanel
  statistics: string;
  loadingData: string;
  totalAlertsLabel: string;
  affectedAreas: string;
  activeDays: string;
  dailyAlerts: string;
  topCities: string;
  // SavedCities
  savedCitiesTitle: string;
  savedCitiesDesc: string;
  addCityPlaceholder: string;
  noCitiesSelected: string;
  // CastPanel
  castTitle: string;
  castDesc: string;
  castOption1: string;
  castBroadcasting: string;
  castStart: string;
  castOption1Note: string;
  castOption2: string;
  castUrlLabel: string;
  castDetecting: string;
  castRedetect: string;
  castManualBtn: string;
  castManualIpDesc: string;
  castSave: string;
  castOption2Note: string;
  copyTitle: string;
  // TvView
  waitingForAlerts: string;
  tvIdleLastAlerts: string;
  tvIdleTodayStats: (n: number) => string;
  // Onboarding
  onboardingSound: string;
  onboardingCities: string;
  onboardingNotifications: string;
  onboardingActivate: string;
  // Updated ago
  updatedAgo: (seconds: number) => string;
  updatedNow: string;
  // Sound settings
  soundSettingTitle: string;
  soundSettingDesc: string;
  soundRedAlert: string;
  soundRedAlertShort: string;
  soundBell: string;
  soundAlarm: string;
  soundWarning: string;
  soundSecondary: string;
  soundUrgent: string;
  soundCalm: string;
  soundPreview: string;
  // PWA
  pwaInstall: string;
  pwaInstalled: string;
  // Stats enhanced
  statsPeriod: string;
  statsPeriod7: string;
  statsPeriod14: string;
  statsPeriod30: string;
  statsPeriod90: string;
  statsHourlyHeatmap: string;
  statsExportCsv: string;
  // TTS
  ttsTitle: string;
  ttsDesc: string;
  ttsOn: string;
  ttsOff: string;
  // Categories
  categories: Record<number, string>;
  // Locale string for date/time formatting
  locale: string;
};

export const translations: Record<Lang, Translations> = {
  he: {
    headerSubtitle: "לוח בקרה - פיקוד העורף",
    tabLive: "חי",
    tabHistory: "היסטוריה",
    tabStats: "סטטיסטיקות",
    fullscreenEnter: "מסך מלא",
    fullscreenExit: "יציאה ממסך מלא",
    legendActiveAlert: "אזעקה פעילה",
    settingsLanguage: "שפה",
    langHe: "עברית",
    langEn: "English",
    langRu: "Русский",
    liveAlerts: "התרעות חיות",
    noActiveAlerts: "אין התרעות פעילות",
    listeningForUpdates: "המערכת מאזינה לעדכונים...",
    savedCityAlert: "🔔 התרעה בעיר שמורה!",
    shelterTime: "🛡️ זמן מיגון: ",
    alertHistory: "היסטוריית התרעות",
    searchPlaceholder: "חיפוש לפי עיר או יישוב...",
    allCategories: "כל הסוגים",
    totalAlerts: (n) => `סה"כ: ${n} התרעות`,
    pageOf: (p, total) => `עמוד ${p} מתוך ${total}`,
    loading: "טוען...",
    colTime: "זמן",
    colType: "סוג",
    colAreas: "אזורים",
    noAlertsFor: (city) => `לא נמצאו התרעות עבור "${city}"`,
    noData: "אין נתונים",
    prevPage: "הבא ←",
    nextPage: "→ הקודם",
    statistics: "סטטיסטיקות",
    loadingData: "טוען נתונים...",
    totalAlertsLabel: 'סה"כ התרעות',
    affectedAreas: "אזורים מושפעים",
    activeDays: "ימים פעילים",
    dailyAlerts: "התרעות יומיות",
    topCities: "ערים מובילות",
    savedCitiesTitle: "🔔 ערים שמורות",
    savedCitiesDesc: "התרעה מיוחדת (צבע אדום) תישמע כאשר יש אזעקה באחת הערים השמורות",
    addCityPlaceholder: "הוסף עיר או יישוב...",
    noCitiesSelected: "לא נבחרו ערים",
    castTitle: "📺 שידור לטלוויזיה",
    castDesc: "ניתן לשדר את מפת ההתרעות לטלוויזיה חכמה ברשת המקומית",
    castOption1: "אפשרות 1: Cast ישיר",
    castBroadcasting: "🔴 משדר...",
    castStart: "📺 התחל שידור",
    castOption1Note: "דורש דפדפן Chrome/Edge עם תמיכה ב-Presentation API",
    castOption2: "אפשרות 2: פתיחה בטלוויזיה",
    castUrlLabel: "פתח כתובת זו בדפדפן הטלוויזיה:",
    castDetecting: "🔍 מזהה כתובת רשת...",
    castRedetect: "🔄 זהה מחדש",
    castManualBtn: "✏️ שנה ידנית",
    castManualIpDesc: 'הזן את כתובת ה-IP המקומית של המחשב. ניתן למצוא אותה ע"י הרצת',
    castSave: "שמור",
    castOption2Note: "פתח כתובת זו בכל מכשיר המחובר לאותה רשת Wi-Fi",
    copyTitle: "העתק",
    waitingForAlerts: "ממתין להתרעות...",
    tvIdleLastAlerts: "התרעות אחרונות",
    tvIdleTodayStats: (n) => `${n} התרעות היום`,
    onboardingSound: "לחץ להפעלת צלילי התרעה",
    onboardingCities: "הוסף ערים שמורות בהגדרות לקבלת סירנה מיוחדת",
    onboardingNotifications: "קבל התראות גם כשהלשונית מוסתרת",
    onboardingActivate: "🔊 הפעל והתחל",
    updatedAgo: (s) => s >= 60 ? `עודכן לפני ${Math.floor(s / 60)} דקות` : `עודכן לפני ${s} שניות`,
    updatedNow: "עודכן עכשיו",
    soundSettingTitle: "🔊 צליל התרעה",
    soundSettingDesc: "בחר את צליל ההתרעה לערים שמורות",
    soundRedAlert: "צבע אדום",
    soundRedAlertShort: "צבע אדום (קצר)",
    soundBell: "פעמון",
    soundAlarm: "אזעקה",
    soundWarning: "אזהרה",
    soundSecondary: "התרעה משנית",
    soundUrgent: "דחוף",
    soundCalm: "שקט",
    soundPreview: "▶",
    pwaInstall: "📲 התקן כאפליקציה",
    pwaInstalled: "✅ מותקן כאפליקציה",
    statsPeriod: "תקופה",
    statsPeriod7: "7 ימים",
    statsPeriod14: "14 ימים",
    statsPeriod30: "30 ימים",
    statsPeriod90: "90 ימים",
    statsHourlyHeatmap: "חום שעתי",
    statsExportCsv: "📥 ייצוא CSV",
    ttsTitle: "🗣️ קריאת שמות יישובים",
    ttsDesc: "הקראת שמות הערים בקול כאשר יש התרעה",
    ttsOn: "מופעל",
    ttsOff: "כבוי",
    categories: {
      1: "ירי רקטות וטילים",
      2: "אירוע רדיולוגי",
      3: "רעידת אדמה",
      4: "צונאמי",
      5: "חדירת כלי טיס עוין",
      6: "חומרים מסוכנים",
      7: "חדירת מחבלים",
      10: "התראה מוקדמת לאירוע עוין",
      13: "עדכון מיוחד",
      14: "התראה מוקדמת לרעידת אדמה",
    },
    locale: "he-IL",
  },

  en: {
    headerSubtitle: "Control Panel — Home Front Command",
    tabLive: "Live",
    tabHistory: "History",
    tabStats: "Statistics",
    fullscreenEnter: "Fullscreen",
    fullscreenExit: "Exit Fullscreen",
    legendActiveAlert: "Active Alert",
    settingsLanguage: "Language",
    langHe: "עברית",
    langEn: "English",
    langRu: "Русский",
    liveAlerts: "Live Alerts",
    noActiveAlerts: "No active alerts",
    listeningForUpdates: "System listening for updates...",
    savedCityAlert: "🔔 Alert in saved city!",
    shelterTime: "🛡️ Shelter time: ",
    alertHistory: "Alert History",
    searchPlaceholder: "Search by city or locality...",
    allCategories: "All types",
    totalAlerts: (n) => `Total: ${n} alerts`,
    pageOf: (p, total) => `Page ${p} of ${total}`,
    loading: "Loading...",
    colTime: "Time",
    colType: "Type",
    colAreas: "Areas",
    noAlertsFor: (city) => `No alerts found for "${city}"`,
    noData: "No data",
    prevPage: "← Prev",
    nextPage: "Next →",
    statistics: "Statistics",
    loadingData: "Loading data...",
    totalAlertsLabel: "Total Alerts",
    affectedAreas: "Affected Areas",
    activeDays: "Active Days",
    dailyAlerts: "Daily Alerts",
    topCities: "Top Cities",
    savedCitiesTitle: "🔔 Saved Cities",
    savedCitiesDesc: "A special alarm (red) will sound when an alert is issued for one of your saved cities",
    addCityPlaceholder: "Add city or locality...",
    noCitiesSelected: "No cities selected",
    castTitle: "📺 Cast to TV",
    castDesc: "Stream the alert map to a smart TV on your local network",
    castOption1: "Option 1: Direct Cast",
    castBroadcasting: "🔴 Broadcasting...",
    castStart: "📺 Start Broadcast",
    castOption1Note: "Requires Chrome/Edge with Presentation API support",
    castOption2: "Option 2: Open on TV",
    castUrlLabel: "Open this URL in your TV browser:",
    castDetecting: "🔍 Detecting network address...",
    castRedetect: "🔄 Re-detect",
    castManualBtn: "✏️ Enter manually",
    castManualIpDesc: "Enter the local IP address of this computer. Find it by running",
    castSave: "Save",
    castOption2Note: "Open this URL on any device connected to the same Wi-Fi network",
    copyTitle: "Copy",
    waitingForAlerts: "Waiting for alerts...",
    tvIdleLastAlerts: "Recent Alerts",
    tvIdleTodayStats: (n) => `${n} alerts today`,
    onboardingSound: "Tap to enable alert sounds",
    onboardingCities: "Add saved cities in Settings for a special siren",
    onboardingNotifications: "Get notifications even when the tab is hidden",
    onboardingActivate: "🔊 Activate & Start",
    updatedAgo: (s) => s >= 60 ? `Updated ${Math.floor(s / 60)}m ago` : `Updated ${s}s ago`,
    updatedNow: "Updated just now",
    soundSettingTitle: "🔊 Alert Sound",
    soundSettingDesc: "Choose the alert sound for saved cities",
    soundRedAlert: "Red Alert",
    soundRedAlertShort: "Red Alert (short)",
    soundBell: "Bell",
    soundAlarm: "Alarm",
    soundWarning: "Warning",
    soundSecondary: "Secondary Alert",
    soundUrgent: "Urgent",
    soundCalm: "Calm",
    soundPreview: "▶",
    pwaInstall: "📲 Install as App",
    pwaInstalled: "✅ Installed as App",
    statsPeriod: "Period",
    statsPeriod7: "7 days",
    statsPeriod14: "14 days",
    statsPeriod30: "30 days",
    statsPeriod90: "90 days",
    statsHourlyHeatmap: "Hourly Heatmap",
    statsExportCsv: "📥 Export CSV",
    ttsTitle: "🗣️ Read City Names",
    ttsDesc: "Announce city names aloud when an alert is received",
    ttsOn: "On",
    ttsOff: "Off",
    categories: {
      1: "Rocket / Missile Fire",
      2: "Radiological Incident",
      3: "Earthquake",
      4: "Tsunami",
      5: "Hostile Aircraft Infiltration",
      6: "Hazardous Materials",
      7: "Terrorist Infiltration",
      10: "Early Warning — Hostile Event",
      13: "Special Update",
      14: "Early Warning — Earthquake",
    },
    locale: "en-US",
  },

  ru: {
    headerSubtitle: "Панель управления — Командование тыла",
    tabLive: "Онлайн",
    tabHistory: "История",
    tabStats: "Статистика",
    fullscreenEnter: "На весь экран",
    fullscreenExit: "Выйти из полного экрана",
    legendActiveAlert: "Активная тревога",
    settingsLanguage: "Язык",
    langHe: "עברית",
    langEn: "English",
    langRu: "Русский",
    liveAlerts: "Тревоги в реальном времени",
    noActiveAlerts: "Нет активных тревог",
    listeningForUpdates: "Система ожидает обновлений...",
    savedCityAlert: "🔔 Тревога в сохранённом городе!",
    shelterTime: "🛡️ Время укрытия: ",
    alertHistory: "История тревог",
    searchPlaceholder: "Поиск по городу или населённому пункту...",
    allCategories: "Все типы",
    totalAlerts: (n) => `Всего: ${n} тревог`,
    pageOf: (p, total) => `Страница ${p} из ${total}`,
    loading: "Загрузка...",
    colTime: "Время",
    colType: "Тип",
    colAreas: "Районы",
    noAlertsFor: (city) => `Тревоги для "${city}" не найдены`,
    noData: "Нет данных",
    prevPage: "← Назад",
    nextPage: "Далее →",
    statistics: "Статистика",
    loadingData: "Загрузка данных...",
    totalAlertsLabel: "Всего тревог",
    affectedAreas: "Затронутые районы",
    activeDays: "Активных дней",
    dailyAlerts: "Тревоги по дням",
    topCities: "Топ городов",
    savedCitiesTitle: "🔔 Сохранённые города",
    savedCitiesDesc: "Специальная сирена (красная) прозвучит при тревоге в одном из сохранённых городов",
    addCityPlaceholder: "Добавить город или населённый пункт...",
    noCitiesSelected: "Города не выбраны",
    castTitle: "📺 Трансляция на ТВ",
    castDesc: "Транслируйте карту тревог на Smart TV в локальной сети",
    castOption1: "Вариант 1: Прямая трансляция",
    castBroadcasting: "🔴 Трансляция...",
    castStart: "📺 Начать трансляцию",
    castOption1Note: "Требуется Chrome/Edge с поддержкой Presentation API",
    castOption2: "Вариант 2: Открыть на ТВ",
    castUrlLabel: "Откройте этот адрес в браузере ТВ:",
    castDetecting: "🔍 Определение сетевого адреса...",
    castRedetect: "🔄 Определить заново",
    castManualBtn: "✏️ Ввести вручную",
    castManualIpDesc: "Введите локальный IP-адрес этого компьютера. Его можно найти, выполнив",
    castSave: "Сохранить",
    castOption2Note: "Откройте этот адрес на любом устройстве в той же Wi-Fi сети",
    copyTitle: "Копировать",
    waitingForAlerts: "Ожидание тревог...",
    tvIdleLastAlerts: "Последние тревоги",
    tvIdleTodayStats: (n) => `${n} тревог сегодня`,
    onboardingSound: "Нажмите для включения звуков тревоги",
    onboardingCities: "Добавьте города в настройках для специальной сирены",
    onboardingNotifications: "Получайте уведомления, даже когда вкладка скрыта",
    onboardingActivate: "🔊 Активировать и начать",
    updatedAgo: (s) => s >= 60 ? `Обновлено ${Math.floor(s / 60)} мин. назад` : `Обновлено ${s} сек. назад`,
    updatedNow: "Обновлено только что",
    soundSettingTitle: "🔊 Звук тревоги",
    soundSettingDesc: "Выберите звук тревоги для сохранённых городов",
    soundRedAlert: "Цвет красный",
    soundRedAlertShort: "Цвет красный (короткий)",
    soundBell: "Колокол",
    soundAlarm: "Сирена",
    soundWarning: "Предупреждение",
    soundSecondary: "Вторичная тревога",
    soundUrgent: "Срочный",
    soundCalm: "Спокойный",
    soundPreview: "▶",
    pwaInstall: "📲 Установить как приложение",
    pwaInstalled: "✅ Установлено как приложение",
    statsPeriod: "Период",
    statsPeriod7: "7 дней",
    statsPeriod14: "14 дней",
    statsPeriod30: "30 дней",
    statsPeriod90: "90 дней",
    statsHourlyHeatmap: "Тепловая карта по часам",
    statsExportCsv: "📥 Экспорт CSV",
    ttsTitle: "🗣️ Озвучка названий городов",
    ttsDesc: "Голосовое объявление городов при получении тревоги",
    ttsOn: "Вкл",
    ttsOff: "Выкл",
    categories: {
      1: "Ракетный обстрел",
      2: "Радиологическая угроза",
      3: "Землетрясение",
      4: "Цунами",
      5: "Вражеский летательный аппарат",
      6: "Опасные вещества",
      7: "Проникновение террористов",
      10: "Раннее предупреждение — враждебное событие",
      13: "Специальное обновление",
      14: "Раннее предупреждение — землетрясение",
    },
    locale: "ru-RU",
  },
};
