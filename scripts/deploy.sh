#!/usr/bin/env bash
# Despliega Deudores Anónimos a la VPS.
#
# Uso: ./scripts/deploy.sh
#
# La VPS sirve, no compila: el build sale de esta máquina y allá solo quedan
# archivos estáticos que entrega Caddy.
#
# ⚠️ Este script NO toca la configuración de Caddy, y no es un olvido. La app
# se sirve como una RUTA dentro del portafolio (luisaldrichguz.net/deudas/), no
# como un dominio propio, así que su bloque `handle /deudas/*` vive en el
# Caddyfile del repo `luisaldrichguz.net`. Escribirlo desde aquí lo borraría el
# siguiente deploy de aquel repo, sin error y sin aviso.
set -euo pipefail

HOST="${VPS_HOST:-vps}"
REMOTO="${VPS_DIR:-/srv/deudas}"
URL="${DEUDAS_URL:-https://luisaldrichguz.net/deudas/}"
RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

ssh -o BatchMode=yes -o ConnectTimeout=5 "$HOST" true 2>/dev/null || {
  echo "No se pudo conectar a '$HOST'. Revisa el bloque Host en ~/.ssh/config." >&2
  exit 1
}

echo "==> Compilando (incluye el chequeo de tipos)"
(cd "$RAIZ" && npm run build >/dev/null)

echo "==> Subiendo dist/ a $HOST:$REMOTO"
ssh "$HOST" "sudo mkdir -p $REMOTO && sudo chown \$(whoami) $REMOTO"
# --delete para que un archivo con hash viejo no se quede ocupando disco para
# siempre. El service worker ya sirve la versión vieja desde caché mientras
# baja la nueva, así que nadie ve una pantalla rota durante la subida.
rsync -az --delete "$RAIZ/dist/" "$HOST:$REMOTO/"

echo "==> Verificando"
codigo=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$URL" || true)
[ "$codigo" = "200" ] || {
  echo "⚠️  $URL respondió '$codigo' (esperaba 200)." >&2
  echo "    ¿Está el bloque 'handle /deudas/*' en el Caddyfile del repo luisaldrichguz.net?" >&2
  exit 1
}

echo "==> Listo · $URL"
