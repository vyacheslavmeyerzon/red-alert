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
      content.innerHTML = '<div class="no-alerts">אין התרעות פעילות</div>';
    } else {
      content.innerHTML = alerts
        .map(
          (a) => `
        <div class="alert-card">
          <div class="alert-title">${escapeHtml(a.title)}</div>
          <div class="alert-cities">${escapeHtml(a.cities.join(" • "))}</div>
          <div class="alert-time">${new Date(a.alerted_at).toLocaleTimeString("he-IL")}</div>
        </div>
      `
        )
        .join("");
    }
  } catch {
    statusDot.className = "status-dot disconnected";
    content.innerHTML =
      '<div class="no-alerts" style="color:#ef4444">לא ניתן להתחבר לשרת</div>';
  }

  // Listen for real-time updates
  try {
    eventSource = new EventSource(`${serverUrl}/api/alerts/stream`);
    eventSource.addEventListener("alert", (event) => {
      try {
        const alert = JSON.parse(event.data);
        const card = document.createElement("div");
        card.className = "alert-card";
        card.innerHTML = `
          <div class="alert-title">${escapeHtml(alert.title)}</div>
          <div class="alert-cities">${escapeHtml(alert.cities.join(" • "))}</div>
          <div class="alert-time">${new Date().toLocaleTimeString("he-IL")}</div>
        `;
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

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

init();
