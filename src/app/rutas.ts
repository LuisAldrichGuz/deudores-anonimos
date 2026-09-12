import type { SvgIconComponent } from '@mui/icons-material'
import DashboardRounded from '@mui/icons-material/DashboardRounded'
import CreditCardRounded from '@mui/icons-material/CreditCardRounded'
import InsightsRounded from '@mui/icons-material/InsightsRounded'

/* Los destinos. Tres: la que enseña el periodo, la que edita y la que mide.
   Los ajustes no están aquí porque no son un lugar al que se va, son algo que
   se abre y se cierra — de ahí que vivan en un botón de la barra. */

export type Destino = {
  ruta: string
  etiqueta: string
  Icono: SvgIconComponent
}

export const DESTINOS: Destino[] = [
  { ruta: '/', etiqueta: 'Inicio', Icono: DashboardRounded },
  { ruta: '/pagos', etiqueta: 'Deudas', Icono: CreditCardRounded },
  { ruta: '/stats', etiqueta: 'Stats', Icono: InsightsRounded },
]
