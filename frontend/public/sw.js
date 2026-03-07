const CACHE_NAME = "redalert-v1";
const PRECACHE = ["/", "/icon-192.png", "/icon-512.png"];

// Install — cache shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — network first, fallback to cache
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Don't cache API/SSE requests
  if (url.pathname.startsWith("/api/")) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful GET responses
        if (event.request.method === "GET" && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// Background SSE listener for push-like notifications
let alertSource = null;

function connectAlertStream() {
  if (alertSource) {
    alertSource.close();
  }

  try {
    alertSource = new EventSource("/api/alerts/stream");

    alertSource.addEventListener("alert", (event) => {
      try {
        const alert = JSON.parse(event.data);
        const cities = Array.isArray(alert.cities) ? alert.cities.join(", ") : "";
        self.registration.showNotification(alert.title || "Red Alert", {
          body: cities,
          icon: "/icon-192.png",
          badge: "/icon-192.png",
          tag: `alert-${alert.id}`,
          renotify: true,
          vibrate: [300, 100, 300, 100, 600],
          data: { url: "/" },
        });
      } catch {}
    });

    alertSource.onerror = () => {
      alertSource.close();
      alertSource = null;
      setTimeout(connectAlertStream, 5000);
    };
  } catch {}
}

// Start listening when SW activates
self.addEventListener("activate", () => {
  connectAlertStream();
});

// Re-connect on message from client
self.addEventListener("message", (event) => {
  if (event.data === "start-alerts") {
    connectAlertStream();
  }
});

// Click notification — open app
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes("/") && "focus" in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow("/");
    })
  );
});
