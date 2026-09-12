import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { MESES } from '../../shared/finanzas/fechas'
import { pesos } from '../../shared/formato/moneda'
import { ACENTO } from '../../app/tema'

/* El degradado de la columna más alta a la más baja: del tono de «gastado» al
   de «libre». Es una tabla y no una interpolación en oklch porque el color
   acaba en un `bgcolor` de MUI, que lo parsea. */
const ESCALA = ['#B39A7D', '#AF9C7C', '#AA9E7B', '#A5A07C', '#A0A27E', '#9AA381', '#94A585', '#8EA789', '#89A88E']

/* Lo que cae cada mes hasta liberarte, en columnas.

   El color va del tono de «gastado» al de «libre» conforme baja la barra: no
   es adorno, es el argumento entero de la pantalla — esto se acaba, y se ve. */
export function GraficaDeProyeccion({ meses }: { meses: { fecha: Date; total: number }[] }) {
  const techo = Math.max(...meses.map((m) => m.total), 1)
  // Con más de un año de columnas las etiquetas no caben.
  const paso = meses.length > 14 ? 3 : meses.length > 8 ? 2 : 1

  return (
    <Box>
      <Stack direction="row" spacing={0.75} sx={{ alignItems: 'flex-end', height: 110 }}>
        {meses.map((m, i) => {
          const parte = m.total / techo
          // La columna más chica del futuro llega casi al verde: la barra baja
          // y el color lo confirma.
          const tono = ESCALA[Math.min(ESCALA.length - 1, Math.round((1 - parte) * (ESCALA.length - 1)))]
          return (
            <Box
              key={m.fecha.toISOString()}
              className="crece-alto"
              style={{ animationDelay: `${0.35 + i * 0.05}s` }}
              sx={{
                flex: 1, minWidth: 0,
                height: `${Math.max(3, parte * 100)}%`,
                borderRadius: '4px 4px 0 0',
                bgcolor: tono,
              }}
            />
          )
        })}
      </Stack>

      <Stack direction="row" spacing={0.75} sx={{ mt: 1 }}>
        {meses.map((m, i) => (
          <Typography
            key={m.fecha.toISOString()} variant="caption" noWrap
            sx={{ flex: 1, minWidth: 0, textAlign: 'center', color: 'text.disabled', fontSize: '.5625rem' }}
          >
            {i % paso === 0 ? MESES[m.fecha.getMonth()].slice(0, 3) : ' '}
          </Typography>
        ))}
      </Stack>

      <Stack direction="row" sx={{ justifyContent: 'space-between', mt: 2, pt: 1.5, borderTop: 1, borderColor: 'divider' }}>
        <Box>
          <Typography variant="overline" color="text.disabled" sx={{ display: 'block' }}>Este mes</Typography>
          <Typography className="cifras" sx={{ fontWeight: 600 }}>{pesos(meses[0]?.total ?? 0)}</Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="overline" color="text.disabled" sx={{ display: 'block' }}>Último mes</Typography>
          <Typography className="cifras" sx={{ fontWeight: 600, color: ACENTO.libre }}>
            {pesos(meses[meses.length - 1]?.total ?? 0)}
          </Typography>
        </Box>
      </Stack>
    </Box>
  )
}
