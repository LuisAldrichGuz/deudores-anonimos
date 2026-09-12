import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import type { Evento, TipoEvento } from '../../shared/finanzas/compromisos'
import { claveDia, diasEnMes, hoy, mismoDia } from '../../shared/finanzas/fechas'

/* El mes dibujado a mano.

   Se escribió en vez de usar el calendario de la librería por una razón
   concreta: un día puede tener a la vez un corte, un pago de tarjeta y la
   renta, y esos componentes solo admiten UN marcador por casilla. Aquí cada
   día lleva hasta tres puntos de color, que es justo lo que hay que ver de un
   vistazo. */

const COLOR_PUNTO: Record<TipoEvento, string> = {
  corte: 'info.main',
  tarjeta: 'warning.main',
  prestamo: 'secondary.main',
  fijo: 'text.secondary',
  ahorro: 'primary.main',
}

const INICIALES = ['D', 'L', 'M', 'M', 'J', 'V', 'S']

export function RejillaDelMes({
  anio, mes, eventos, seleccionado, alSeleccionar,
}: {
  anio: number
  mes: number
  eventos: Evento[]
  seleccionado: Date | null
  alSeleccionar: (f: Date) => void
}) {
  const porDia = new Map<string, Evento[]>()
  for (const e of eventos) {
    const k = claveDia(e.fecha)
    const lista = porDia.get(k)
    if (lista) lista.push(e)
    else porDia.set(k, [e])
  }

  const primero = new Date(anio, mes, 1)
  // Casillas en blanco hasta que empieza el mes: sin ellas el día 1 cae bajo
  // el domingo y todas las fechas quedan corridas.
  const huecos = primero.getDay()
  const total = diasEnMes(anio, mes)
  const hoyMismo = hoy()

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: .5 }}>
      {INICIALES.map((d, i) => (
        <Typography key={i} variant="caption" align="center" color="text.secondary" sx={{ pb: 1 }}>
          {d}
        </Typography>
      ))}

      {Array.from({ length: huecos }, (_, i) => <Box key={`hueco-${i}`} />)}

      {Array.from({ length: total }, (_, i) => {
        const fecha = new Date(anio, mes, i + 1)
        const delDia = porDia.get(claveDia(fecha)) ?? []
        const esHoy = mismoDia(fecha, hoyMismo)
        const activo = seleccionado !== null && mismoDia(fecha, seleccionado)
        const tipos = [...new Set(delDia.map((e) => e.tipo))].slice(0, 3)

        return (
          <ButtonBase
            key={i}
            onClick={() => alSeleccionar(fecha)}
            aria-label={`${i + 1}, ${delDia.length} movimientos`}
            sx={{
              aspectRatio: '1', borderRadius: 2, flexDirection: 'column', gap: .25,
              bgcolor: activo ? 'primary.main' : esHoy ? 'primary.contenedor' : 'transparent',
              color: activo ? 'primary.contrastText' : esHoy ? 'primary.sobreContenedor' : 'text.primary',
              border: 1, borderColor: activo || esHoy ? 'transparent' : 'divider',
              '&:hover': { bgcolor: activo ? 'primary.main' : 'action.hover' },
            }}
          >
            <Typography variant="body2" className="cifras" sx={{ fontWeight: esHoy || activo ? 600 : 400 }}>
              {i + 1}
            </Typography>
            <Stack direction="row" spacing={.3} sx={{ height: 6 }}>
              {tipos.map((t) => (
                <Box key={t} sx={{
                  width: 5, height: 5, borderRadius: '50%',
                  bgcolor: activo ? 'primary.contrastText' : COLOR_PUNTO[t],
                }} />
              ))}
            </Stack>
          </ButtonBase>
        )
      })}
    </Box>
  )
}

export const LEYENDA: { tipo: TipoEvento; texto: string }[] = [
  { tipo: 'corte', texto: 'Corte de tarjeta' },
  { tipo: 'tarjeta', texto: 'Pago de tarjeta' },
  { tipo: 'prestamo', texto: 'Mensualidad' },
  { tipo: 'fijo', texto: 'Gasto fijo' },
  { tipo: 'ahorro', texto: 'Lo que apartas' },
]

export { COLOR_PUNTO }
