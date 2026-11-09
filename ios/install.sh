#!/usr/bin/env bash
# Instala LiDAR Scan en un iPhone conectado por cable (compila con Xcode y lo instala).
# Uso:  ./install.sh            (pide el Team ID)
#       TEAM_ID=ABCDE12345 BUNDLE_ID=com.tunombre.lidarscan ./install.sh
set -euo pipefail
cd "$(dirname "$0")"

[[ "$(uname)" == "Darwin" ]] || { echo "Esto solo funciona en macOS con Xcode."; exit 1; }
command -v xcodebuild >/dev/null || { echo "Instala Xcode 15+ desde la App Store."; exit 1; }
xcrun devicectl --version >/dev/null 2>&1 || { echo "Necesitas Xcode 15 o posterior (devicectl)."; exit 1; }

if ! command -v xcodegen >/dev/null; then
  command -v brew >/dev/null || { echo "Instala Homebrew (https://brew.sh) o xcodegen manualmente."; exit 1; }
  brew install xcodegen
fi

TEAM="${TEAM_ID:-}"
if [[ -z "$TEAM" ]]; then
  echo "Team ID: Xcode > Settings > Accounts > tu cuenta > Team (10 caracteres). Sirve un Apple ID gratuito."
  read -rp "Team ID: " TEAM
fi
BUNDLE="${BUNDLE_ID:-com.$(whoami | tr -cd 'a-z0-9').lidarscan}"

echo "→ Generando proyecto…"
xcodegen generate

echo "→ Buscando iPhone conectado…"
JSON="$(mktemp)"
xcrun devicectl list devices --json-output "$JSON" >/dev/null
IFS=$'\t' read -r DEVICE_ID UDID NAME < <(python3 - "$JSON" <<'PY'
import json, sys
devs = json.load(open(sys.argv[1]))["result"]["devices"]
for d in devs:
    hp, dp, cp = d.get("hardwareProperties", {}), d.get("deviceProperties", {}), d.get("connectionProperties", {})
    if hp.get("platform") == "iOS" and cp.get("tunnelState") != "unavailable":
        print("\t".join([d["identifier"], hp.get("udid", ""), dp.get("name", "iPhone")]))
        break
PY
) || true
[[ -n "${DEVICE_ID:-}" ]] || { echo "No hay iPhone conectado y desbloqueado. Conéctalo por USB, confía en este Mac y activa Ajustes > Privacidad y seguridad > Modo desarrollador."; exit 1; }
echo "   Dispositivo: $NAME"

echo "→ Compilando (Release)…"
xcodebuild -project LidarScan.xcodeproj -scheme LidarScan -configuration Release \
  -destination "id=$UDID" -derivedDataPath build -allowProvisioningUpdates \
  DEVELOPMENT_TEAM="$TEAM" PRODUCT_BUNDLE_IDENTIFIER="$BUNDLE" build -quiet

APP="build/Build/Products/Release-iphoneos/LidarScan.app"
echo "→ Instalando…"
xcrun devicectl device install app --device "$DEVICE_ID" "$APP"
echo "→ Abriendo…"
xcrun devicectl device process launch --device "$DEVICE_ID" "$BUNDLE" || \
  echo "Ábrela a mano. Si iOS la bloquea: Ajustes > General > VPN y gestión de dispositivos > confiar en tu cuenta."

echo "Listo. Con Apple ID gratuito la app caduca a los 7 días (vuelve a ejecutar este script)."
