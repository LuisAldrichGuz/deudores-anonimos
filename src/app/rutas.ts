import type { SvgIconComponent } from '@mui/icons-material'
import DashboardRounded from '@mui/icons-material/DashboardRounded'
import CalendarMonthRounded from '@mui/icons-material/CalendarMonthRounded'
import ReceiptLongRounded from '@mui/icons-material/ReceiptLongRounded'
import TrendingDownRounded from '@mui/icons-material/TrendingDownRounded'
import SettingsRounded from '@mui/icons-material/SettingsRounded'

/* Los destinos de la app, en un solo sitio: de aquí salen la barra de abajo
   del móvil y el carril lateral del escritorio. Añadir una pantalla es añadir
   una línea; no hay una segunda lista que se quede atrás. */

export type Destino = {
  ruta: string
  etiqueta: string
  titulo: string
  Icono: SvgIconComponent
}

export const DESTINOS: Destino[] = [
  { ruta: '/', etiqueta: 'Resumen', titulo: 'Tu resumen', Icono: DashboardRounded },
  { ruta: '/calendario', etiqueta: 'Calendario', titulo: 'Calendario de pagos', Icono: CalendarMonthRounded },
  { ruta: '/pagos', etiqueta: 'Mis pagos', titulo: 'Lo que pagas', Icono: ReceiptLongRounded },
  { ruta: '/plan', etiqueta: 'Plan', titulo: 'Plan para salir', Icono: TrendingDownRounded },
  { ruta: '/ajustes', etiqueta: 'Ajustes', titulo: 'Ajustes y datos', Icono: SettingsRounded },
]
