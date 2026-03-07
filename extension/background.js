const DEFAULT_SERVER = "http://localhost";
const INITIAL_RECONNECT_MS = 5000;
const MAX_RECONNECT_MS = 60000;
const MAX_RETRIES = 100;

let eventSource = null;
let serverUrl = DEFAULT_SERVER;
let reconnectDelay = INITIAL_RECONNECT_MS;
let retryCount = 0;
let reconnecting = false;

async function loadSettings() {
  const result = await chrome.storage.sync.get(["serverUrl"]);
  serverUrl = result.serverUrl || DEFAULT_SERVER;
}

function connectSSE() {
  if (reconnecting) return;

  if (eventSource) {
    eventSource.close();
  }

  if (retryCount >= MAX_RETRIES) {
    console.error(`SSE: gave up after ${MAX_RETRIES} retries`);
    chrome.action.setBadgeText({ text: "ERR" });
    chrome.action.setBadgeBackgroundColor({ color: "#dc2626" });
    return;
  }

  const url = `${serverUrl}/api/alerts/stream`;
  eventSource = new EventSource(url);

  eventSource.onopen = () => {
    reconnectDelay = INITIAL_RECONNECT_MS;
    retryCount = 0;
    reconnecting = false;
  };

  eventSource.addEventListener("alert", (event) => {
    try {
      const alert = JSON.parse(event.data);
      showNotification(alert);
      // Update badge
      chrome.action.setBadgeText({ text: "!" });
      chrome.action.setBadgeBackgroundColor({ color: "#ef4444" });
      // Clear badge after 20 seconds
      setTimeout(() => chrome.action.setBadgeText({ text: "" }), 20000);
    } catch (e) {
      console.error("Failed to parse alert:", e);
    }
  });

  eventSource.onerror = () => {
    eventSource.close();
    eventSource = null;

    if (!reconnecting) {
      reconnecting = true;
      retryCount++;
      const delay = reconnectDelay;
      reconnectDelay = Math.min(delay * 2, MAX_RECONNECT_MS);
      setTimeout(() => {
        reconnecting = false;
        connectSSE();
      }, delay);
    }
  };
}

function showNotification(alert) {
  const citiesArr = alert.cities || alert.data || [];
  const cities = Array.isArray(citiesArr) ? citiesArr.join(", ") : "";
  chrome.notifications.create(`alert-${alert.id}-${Date.now()}`, {
    type: "basic",
    iconUrl: "icons/icon128.png",
    title: alert.title || "Red Alert",
    message: cities,
    priority: 2,
    requireInteraction: true,
  });
}

// Initialize
loadSettings().then(connectSSE);

// Listen for settings changes
chrome.storage.onChanged.addListener((changes) => {
  if (changes.serverUrl) {
    serverUrl = changes.serverUrl.newValue || DEFAULT_SERVER;
    connectSSE();
  }
});

// Re-connect when waking up
chrome.alarms.create("keepalive", { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "keepalive" && !eventSource) {
    connectSSE();
  }
});
