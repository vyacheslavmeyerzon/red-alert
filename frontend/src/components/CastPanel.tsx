import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "redalert-lan-ip";

/** Try to detect the host's LAN IP via WebRTC ICE candidates. */
function detectLanIpWebRTC(timeout = 4000): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      const pc = new RTCPeerConnection({ iceServers: [] });
      let found = false;
      const timer = setTimeout(() => {
        if (!found) { pc.close(); resolve(null); }
      }, timeout);

      pc.createDataChannel("");
      pc.createOffer().then((offer) => pc.setLocalDescription(offer));

      pc.onicecandidate = (e) => {
        if (found) return;
        if (!e.candidate) return;
        // Extract IP from ICE candidate string
        const match = e.candidate.candidate.match(
          /(?:\d+\.\d+\.\d+\.\d+)/g
        );
        if (match) {
          const lanIp = match.find(
            (ip) =>
              (ip.startsWith("192.168.") ||
                ip.startsWith("10.") ||
                ip.startsWith("172.")) &&
              !ip.endsWith(".1") &&
              ip !== "0.0.0.0"
          );
          if (lanIp) {
            found = true;
            clearTimeout(timer);
            pc.close();
            resolve(lanIp);
          }
        }
      };
    } catch {
      resolve(null);
    }
  });
}

/** Ask backend for the LAN IP (works if HOST_LAN_IP env is set). */
async function detectLanIpBackend(): Promise<string | null> {
  try {
    const res = await fetch("/api/network-info");
    const data = await res.json();
    const ip = data.lan_ip;
    if (ip && ip !== "localhost" && ip !== "127.0.0.1" && !ip.startsWith("172.")) {
      return ip;
    }
  } catch {}
  return null;
}

/** Check if an IP looks like a valid private LAN address. */
function isValidLanIp(ip: string): boolean {
  return (
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip)
  );
}

export default function CastPanel() {
  const [casting, setCasting] = useState(false);
  const [lanIp, setLanIp] = useState<string>("");
  const [detecting, setDetecting] = useState(true);
  const [manualInput, setManualInput] = useState("");
  const [showManual, setShowManual] = useState(false);

  const detect = useCallback(async () => {
    setDetecting(true);
    setShowManual(false);

    // 1. Check localStorage cache
    const cached = localStorage.getItem(STORAGE_KEY);

    // 2. Try WebRTC + backend in parallel
    const [webrtcIp, backendIp] = await Promise.all([
      detectLanIpWebRTC(),
      detectLanIpBackend(),
    ]);

    // 3. Pick the best result: WebRTC > backend > cache
    const detected = webrtcIp || backendIp;
    if (detected && isValidLanIp(detected)) {
      setLanIp(detected);
      localStorage.setItem(STORAGE_KEY, detected);
    } else if (cached && isValidLanIp(cached)) {
      setLanIp(cached);
    } else {
      // Check if user is already accessing via LAN IP
      const host = window.location.hostname;
      if (isValidLanIp(host)) {
        setLanIp(host);
        localStorage.setItem(STORAGE_KEY, host);
      } else {
        setLanIp("");
        setShowManual(true);
      }
    }
    setDetecting(false);
  }, []);

  useEffect(() => { detect(); }, [detect]);

  const tvUrl = lanIp ? `http://${lanIp}/#/tv` : "";

  const saveManualIp = () => {
    const ip = manualInput.trim();
    if (ip && /^\d+\.\d+\.\d+\.\d+$/.test(ip)) {
      setLanIp(ip);
      localStorage.setItem(STORAGE_KEY, ip);
      setShowManual(false);
    }
  };

  const startPresentation = useCallback(async () => {
    if (!("PresentationRequest" in window)) {
      alert("Presentation API is not supported. Open the TV URL on your Smart TV browser instead.");
      return;
    }
    try {
      const request = new (window as any).PresentationRequest([tvUrl]);
      const connection = await request.start();
      setCasting(true);
      connection.onclose = () => setCasting(false);
      connection.onterminate = () => setCasting(false);
    } catch {}
  }, [tvUrl]);

  return (
    <div className="cast-panel">
      <h3>📺 שידור לטלוויזיה</h3>
      <p className="cast-desc">
        ניתן לשדר את מפת ההתרעות לטלוויזיה חכמה ברשת המקומית
      </p>

      <div className="cast-methods">
        <div className="cast-method">
          <h4>אפשרות 1: Cast ישיר</h4>
          <button
            className={`cast-btn ${casting ? "casting" : ""}`}
            onClick={startPresentation}
            disabled={!tvUrl}
          >
            {casting ? "🔴 משדר..." : "📺 התחל שידור"}
          </button>
          <small>דורש דפדפן Chrome/Edge עם תמיכה ב-Presentation API</small>
        </div>

        <div className="cast-method">
          <h4>אפשרות 2: פתיחה בטלוויזיה</h4>
          <p className="tv-url-label">פתח כתובת זו בדפדפן הטלוויזיה:</p>

          {detecting ? (
            <div className="tv-url-box">
              <code>🔍 מזהה כתובת רשת...</code>
            </div>
          ) : tvUrl ? (
            <>
              <div className="tv-url-box">
                <code>{tvUrl}</code>
                <button
                  className="copy-btn"
                  onClick={() => navigator.clipboard.writeText(tvUrl)}
                  title="העתק"
                >
                  📋
                </button>
              </div>
              <div className="tv-url-actions">
                <button className="redetect-btn" onClick={detect}>
                  🔄 זהה מחדש
                </button>
                <button className="manual-btn" onClick={() => setShowManual(!showManual)}>
                  ✏️ שנה ידנית
                </button>
              </div>
            </>
          ) : null}

          {showManual && (
            <div className="manual-ip-form">
              <p className="manual-ip-desc">
                הזן את כתובת ה-IP המקומית של המחשב.
                <br />
                ניתן למצוא אותה ע"י הרצת <code>ipconfig</code> בטרמינל (IPv4 Address).
              </p>
              <div className="manual-ip-input">
                <input
                  type="text"
                  placeholder="192.168.1.xxx"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveManualIp()}
                  dir="ltr"
                />
                <button onClick={saveManualIp}>שמור</button>
              </div>
            </div>
          )}

          <small>פתח כתובת זו בכל מכשיר המחובר לאותה רשת Wi-Fi</small>
        </div>
      </div>
    </div>
  );
}
