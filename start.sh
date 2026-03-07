#!/bin/bash
# Auto-detect LAN IP and start Red Alert Dashboard
# Works on Windows (Git Bash/WSL), Linux, and macOS

detect_lan_ip() {
  # Windows (PowerShell via Git Bash)
  if command -v powershell.exe &>/dev/null; then
    powershell.exe -Command "Get-NetIPAddress -AddressFamily IPv4 | Where-Object { \$_.IPAddress -like '192.168.*' -or \$_.IPAddress -like '10.*' } | Select-Object -First 1 -ExpandProperty IPAddress" 2>/dev/null | tr -d '\r'
    return
  fi
  # Linux/macOS
  if command -v ip &>/dev/null; then
    ip -4 route get 8.8.8.8 2>/dev/null | awk '/src/ {for(i=1;i<=NF;i++) if($i=="src") print $(i+1)}'
    return
  fi
  if command -v ifconfig &>/dev/null; then
    ifconfig | awk '/inet / && !/127.0.0.1/ {print $2}' | head -1
    return
  fi
}

LAN_IP=$(detect_lan_ip)

if [ -n "$LAN_IP" ]; then
  echo "Detected LAN IP: $LAN_IP"
  export HOST_LAN_IP="$LAN_IP"
else
  echo "Could not detect LAN IP. Set HOST_LAN_IP manually in .env"
fi

docker compose up -d "$@"

if [ -n "$LAN_IP" ]; then
  echo ""
  echo "Dashboard:  http://$LAN_IP/"
  echo "HTTPS:      https://$LAN_IP/"
  echo "TV Mode:    http://$LAN_IP/#/tv"
  echo ""
  echo "To install PWA on mobile:"
  echo "  1. Download CA cert: http://$LAN_IP/cert.pem"
  echo "  2. Install it on phone (Settings > Security > Install Certificate)"
  echo "  3. Open https://$LAN_IP/ in Chrome"
fi
