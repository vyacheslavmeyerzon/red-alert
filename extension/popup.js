const DEFAULT_SERVER = "http://localhost";
let eventSource = null;

async function init() {
  const result = await chrome.storage.sync.get(["serverUrl"]);
  const serverUrl = result.serverUrl || DEFAULT_SERVER;

  const statusDot = document.getElementById("status");
  const content = document.getElementById("content");

  // Fetch current live alerts
  try {
    const res = await fetch(`${serverUrl}/api/alerts/live`);
    const alerts = await res.json();
    statusDot.className = "status-dot connected";

    if (alerts.length === 0) {
      const noAlerts = document.createElement("div");
      noAlerts.className = "no-alerts";
      noAlerts.textContent = "אין התרעות פעילות";
      content.appendChild(noAlerts);
    } else {
      for (const a of alerts) {
        content.appendChild(buildAlertCard(a));
      }
    }
  } catch {
    statusDot.className = "status-dot disconnected";
    content.textContent = "";
    const errDiv = document.createElement("div");
    errDiv.className = "no-alerts";
    errDiv.style.color = "#ef4444";
    errDiv.textContent = "לא ניתן להתחבר לשרת";
    content.appendChild(errDiv);
  }

  // Listen for real-time updates
  try {
    eventSource = new EventSource(`${serverUrl}/api/alerts/stream`);
    eventSource.addEventListener("alert", (event) => {
      try {
        const alert = JSON.parse(event.data);
        const card = buildAlertCard(alert);
        // Remove "no alerts" message if present
        const noAlerts = content.querySelector(".no-alerts");
        if (noAlerts) noAlerts.remove();
        content.prepend(card);
      } catch {}
    });
  } catch {}

  document.getElementById("settingsBtn").addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });
}

function buildAlertCard(a) {
  const card = document.createElement("div");
  card.className = "alert-card";

  const title = document.createElement("div");
  title.className = "alert-title";
  title.textContent = a.title || "Red Alert";
  card.appendChild(title);

  const cities = document.createElement("div");
  cities.className = "alert-cities";
  const citiesArr = a.cities || a.data || [];
  cities.textContent = Array.isArray(citiesArr) ? citiesArr.join(" \u2022 ") : "";
  card.appendChild(cities);

  const time = document.createElement("div");
  time.className = "alert-time";
  time.textContent = new Date(a.alerted_at || Date.now()).toLocaleTimeString("he-IL");
  card.appendChild(time);

  return card;
}

init();
