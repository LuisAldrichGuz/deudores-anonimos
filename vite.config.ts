import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

/** La app vive DENTRO del portafolio, en luisaldrichguz.net/deudas/, así que
    de aquí cuelgan los assets, el manifiesto y el alcance del service worker.
    En desarrollo se sirve igual a propósito: si en local saliera de la raíz, un
    fallo de ruta base solo aparecería ya desplegado. */
const BASE = '/deudas/'

export default defineConfig({
  base: BASE,
  server: { port: 5183, strictPort: false },

  plugins: [
    react(),
    VitePWA({
      // Los archivos que emite Vite llevan un hash en el nombre, así que un
      // service worker escrito a mano no puede saber qué precargar. Workbox
      // genera esa lista en cada build; por eso esto es un plugin y no un
      // sw.js nuestro en public/.
      registerType: 'autoUpdate',
      includeAssets: ['icono.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        id: BASE,
        name: 'Deudores Anónimos',
        short_name: 'Deudores',
        description: 'Tus tarjetas, deudas y pagos fijos en un solo lugar. Todo se queda en tu dispositivo.',
        start_url: BASE,
        scope: BASE,
        display: 'standalone',
        orientation: 'any',
        lang: 'es-MX',
        dir: 'ltr',
        categories: ['finance', 'productivity'],
        background_color: '#15171A',
        theme_color: '#15171A',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        // Los accesos del menú largo del icono, como en sedeco.
        shortcuts: [
          { name: 'Agregar una deuda', short_name: 'Agregar', url: `${BASE}pagos?nuevo=1` },
          { name: 'Estadísticas', short_name: 'Stats', url: `${BASE}stats` },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff,woff2}'],
        // ⚠️ Roboto viene partido en nueve subconjuntos. El NAVEGADOR solo baja
        // el que necesita (cada @font-face trae su unicode-range), pero el
        // service worker precarga lo que le digas: sin esta línea, instalar la
        // app se llevaba ~700 KB de cirílico, griego y vietnamita que una app
        // en español no va a escribir nunca.
        globIgnores: ['**/roboto-{cyrillic,greek,math,symbols,vietnamese}*'],
        // Sin esto, abrir /deudas/calendario sin conexión da un 404: el
        // service worker busca ese archivo y la SPA no tiene uno por ruta.
        navigateFallback: `${BASE}index.html`,
      },
      devOptions: { enabled: false },
    }),
  ],

  build: {
    // Avisa si un trozo se dispara de tamaño. El presupuesto es a propósito
    // bajo: es una app que se usa desde el móvil y con mala señal.
    chunkSizeWarningLimit: 350,
  },
})
