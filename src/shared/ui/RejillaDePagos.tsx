import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

import type { Pago } from '../finanzas/plazos'
import { MESES } from '../finanzas/fechas'
import { pesos } from '../formato/moneda'
import { ACENTO } from '../../app/tema'

/* La línea de tiempo de una deuda: UNA barra por mes, siempre en un renglón.

   ⚠️ Si pagas por quincena el mes se parte en dos mitades pegadas, en vez de
   dibujar dos barras sueltas: con 24 pagos, una barra por pago se iba a tres
   renglones y la deuda parecía el doble de larga.

   ⚠️ El ancho de cada mes es PROPORCIONAL a los pagos que caen en él. Reservar
   siempre las dos mitades dejaba un hueco en el primer mes cuando la deuda
   empieza a media quincena, y se veía como una barra cortada. */

const COLOR: Record<Pago['estado'], string> = {
  pagado: ACENTO.gastado,
  enCurso: 'text.primary',
  pendiente: 'action.disabledBackground',
}

type Mes = { clave: string; fecha: Date; pagos: Pago[] }

export function RejillaDePagos({
  pagos, importe, alto = 16, retraso = 0.3,
}: {
  pagos: Pago[]
  importe: number
  alto?: number
  retraso?: number
}) {
  const meses = agruparPorMes(pagos)
  // Con muchos meses las etiquetas no caben: se escriben salteadas para que
  // sigan sirviendo de regla sin amontonarse.
  const paso = meses.length > 16 ? 3 : meses.length > 10 ? 2 : 1

  return (
    <Stack direction="row" spacing={0.6} sx={{ flexWrap: 'nowrap', width: '100%' }}>
      {meses.map((mes, i) => (
        <Stack key={mes.clave} sx={{ flex: mes.pagos.length, minWidth: 0 }}>
          <Typography
            variant="caption" noWrap
            sx={{ color: 'text.disabled', height: 15, fontSize: '.625rem', lineHeight: 1.4 }}
          >
            {i % paso === 0 ? MESES[mes.fecha.getMonth()].slice(0, 3) : ' '}
          </Typography>

          {/* Las mitades se pegan con una ranura de 1 px y solo redondean por
              fuera: el mes se lee como una barra partida, no como dos barras. */}
          <Stack direction="row" spacing="1px" sx={{ height: alto }}>
            {mes.pagos.map((pago, k) => (
              <Tooltip
                key={pago.numero} arrow
                title={`${pago.fecha.getDate()} de ${MESES[pago.fecha.getMonth()]} ${pago.fecha.getFullYear()} · ${pesos(importe)}`}
              >
                <Box
                  className="crece"
                  style={{ animationDelay: `${retraso + i * 0.035}s` }}
                  sx={{
                    flex: 1,
                    bgcolor: COLOR[pago.estado],
                    borderRadius: mes.pagos.length === 1 ? '4px'
                      : k === 0 ? '4px 0 0 4px' : '0 4px 4px 0',
                  }}
                />
              </Tooltip>
            ))}
          </Stack>
        </Stack>
      ))}
    </Stack>
  )
}

function agruparPorMes(pagos: Pago[]): Mes[] {
  const porMes = new Map<string, Mes>()
  for (const p of pagos) {
    const clave = `${p.fecha.getFullYear()}-${p.fecha.getMonth()}`
    const mes = porMes.get(clave)
    if (mes) mes.pagos.push(p)
    else porMes.set(clave, { clave, fecha: p.fecha, pagos: [p] })
  }
  return [...porMes.values()]
}
