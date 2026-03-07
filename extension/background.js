const DEFAULT_SERVER = "http://localhost";
let eventSource = null;
let serverUrl = DEFAULT_SERVER;

async function loadSettings() {
  const result = await chrome.storage.sync.get(["serverUrl"]);
  serverUrl = result.serverUrl || DEFAULT_SERVER;
}

function connectSSE() {
  if (eventSource) {
    eventSource.close();
  }

  const url = `${serverUrl}/api/alerts/stream`;
  eventSource = new EventSource(url);

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
    // Retry after 5 seconds
    setTimeout(connectSSE, 5000);
  };
}

function showNotification(alert) {
  const cities = Array.isArray(alert.cities) ? alert.cities.join(", ") : "";
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
