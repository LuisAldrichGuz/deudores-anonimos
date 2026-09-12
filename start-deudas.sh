#!/usr/bin/env bash
# Levanta el entorno de Deudores Anónimos en su propia terminal.
#
# Uso:  ./start-deudas.sh   (o el alias `deudas`)
#
# La app no tiene backend: es un solo proceso. Si el 5183 está ocupado, Vite
# toma el siguiente libre y lo dice en pantalla — aquí NO se mata nada por
# nombre, que es la forma de tumbarle a alguien otro proyecto sin querer.
set -euo pipefail

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

[ -d "$RAIZ/node_modules" ] || {
  echo "Faltan las dependencias. Corriendo npm install..."
  (cd "$RAIZ" && npm install)
}

# La terminal de la casa es alacritty; si no está, se arranca aquí mismo.
if command -v alacritty >/dev/null 2>&1; then
  alacritty --title "Deudores Anónimos" -e bash -c "
    cd '$RAIZ'
    echo '═══ Deudores Anónimos → http://localhost:5183/deudas/ ═══'
    echo ''
    npm run dev
    echo ''
    echo 'Servidor detenido. Cierra esta ventana o presiona Enter.'
    read
  " &
  echo "Listo — ventana abierta.  http://localhost:5183/deudas/"
else
  echo "═══ Deudores Anónimos → http://localhost:5183/deudas/ ═══"
  cd "$RAIZ" && npm run dev
fi
