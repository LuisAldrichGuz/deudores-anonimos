/* Lo que convierte la página en una app instalable. */

/** El evento no está en los tipos del DOM porque solo existe en navegadores
    basados en Chromium. */
type EventoDeInstalacion = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let pendiente: EventoDeInstalacion | null = null
const avisar = new Set<(disponible: boolean) => void>()

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Sin esto, Chrome enseña su propia barrita y se queda sin nuestro botón.
    e.preventDefault()
    pendiente = e as EventoDeInstalacion
    avisar.forEach((f) => f(true))
  })
  window.addEventListener('appinstalled', () => {
    pendiente = null
    avisar.forEach((f) => f(false))
  })
}

export const sePuedeInstalar = () => pendiente !== null

export function alCambiarInstalacion(f: (disponible: boolean) => void) {
  avisar.add(f)
  return () => { avisar.delete(f) }
}

export async function instalar(): Promise<boolean> {
  if (!pendiente) return false
  await pendiente.prompt()
  const { outcome } = await pendiente.userChoice
  pendiente = null
  avisar.forEach((f) => f(false))
  return outcome === 'accepted'
}

/** true cuando ya se abrió desde el icono, no desde el navegador. */
export const estaInstalada = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  // Safari en iOS no implementa display-mode y usa esto.
  (navigator as Navigator & { standalone?: boolean }).standalone === true

export function registrarServiceWorker() {
  if (import.meta.env.DEV) return
  // `virtual:pwa-register` lo genera vite-plugin-pwa en el build: se encarga
  // del alcance y de traer la versión nueva cuando la hay.
  void import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({ immediate: true })
  })
}
