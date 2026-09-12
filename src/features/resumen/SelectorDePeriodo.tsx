import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded'

import { moverVentana, ventanaDe, NOMBRE_UNIDAD } from '../../shared/finanzas/ventanas'
import type { Unidad, Ventana } from '../../shared/finanzas/ventanas'
import { MESES, textoFechaCorta } from '../../shared/finanzas/fechas'

const UNIDADES: Unidad[] = ['semana', 'quincena', 'mes']

/* El cursor de tiempo de toda la pantalla: qué tan ancha es la ventana y en
   cuál estás parado. Se sacó a su propio archivo porque lo que cuelga de él
   —los totales, los aros, el avance de cada deuda— ya no cabía junto. */
export function SelectorDePeriodo({
  unidad, ventana, alCambiar,
}: {
  unidad: Unidad
  ventana: Ventana
  alCambiar: (u: Unidad, v: Ventana) => void
}) {
  return (
    <Stack spacing={1.5}>
      <Stack
        direction="row" spacing={0.5}
        sx={{ p: 0.5, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 999 }}
      >
        {UNIDADES.map((u) => {
          const activa = u === unidad
          return (
            <Box
              key={u}
              onClick={() => alCambiar(u, ventanaDe(u))}
              role="button" tabIndex={0}
              sx={{
                flex: 1, textAlign: 'center', py: 1.5, borderRadius: 999, cursor: 'pointer',
                fontSize: '.8125rem', fontWeight: activa ? 600 : 400,
                bgcolor: activa ? 'text.primary' : 'transparent',
                color: activa ? 'background.default' : 'text.secondary',
                transition: 'background-color .2s, color .2s',
              }}
            >
              {NOMBRE_UNIDAD[u]}
            </Box>
          )
        })}
      </Stack>

      <Stack direction="row" sx={{ alignItems: 'center' }}>
        <IconButton onClick={() => alCambiar(unidad, moverVentana(unidad, ventana, -1))} aria-label="Periodo anterior">
          <ChevronLeftRounded />
        </IconButton>
        <Typography sx={{ flex: 1, textAlign: 'center', fontWeight: 500, textTransform: 'capitalize' }}>
          {titulo(unidad, ventana)}
        </Typography>
        <IconButton onClick={() => alCambiar(unidad, moverVentana(unidad, ventana, 1))} aria-label="Periodo siguiente">
          <ChevronRightRounded />
        </IconButton>
      </Stack>
    </Stack>
  )
}

function titulo(unidad: Unidad, v: Ventana): string {
  if (unidad === 'mes') return `${MESES[v.inicio.getMonth()]} ${v.inicio.getFullYear()}`
  return `${textoFechaCorta(v.inicio)} – ${textoFechaCorta(v.fin)}`
}
