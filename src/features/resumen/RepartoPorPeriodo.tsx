import { useMemo } from 'react'
import Alert from '@mui/material/Alert'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import type { Datos } from '../../shared/almacen/datos'
import { eventosEnRango, esSalida, totalDe } from '../../shared/finanzas/compromisos'
import { nombrePeriodo, periodos } from '../../shared/finanzas/periodos'
import { hoy, sumarDias, textoFechaCorta } from '../../shared/finanzas/fechas'
import { Medidor } from '../../shared/ui/Medidor'
import { pesos } from '../../shared/formato/moneda'

const CUANTOS = 4

/* Cuánto apartar en cada pago, uno por uno.

   Es la pregunta que de verdad se hace la gente y la que ninguna app de
   bancos responde: no «cuánto gasto al mes», sino «de ESTA quincena, cuánto
   no puedo tocar». Y de paso sale a la vista el problema más común de
   quien cobra dos veces al mes: todos los recibos amontonados en la misma. */
export function RepartoPorPeriodo({ datos }: { datos: Datos }) {
  const nombre = nombrePeriodo(datos.perfil)

  const filas = useMemo(() => {
    const desde = hoy()
    const hasta = sumarDias(desde, 120)
    return periodos(datos.perfil, desde, hasta)
      .slice(0, CUANTOS)
      .map((p) => {
        const salidas = eventosEnRango(datos, p.inicio, p.fin).filter(esSalida)
        const total = totalDe(salidas)
        return { periodo: p, salidas, total, sobra: p.ingreso - total }
      })
  }, [datos])

  const consejo = useMemo(() => sugerirRebalanceo(filas), [filas])

  return (
    <Card>
      <CardContent>
        <Typography variant="overline" color="text.secondary">
          Cuánto apartar en cada {nombre}
        </Typography>

        <Stack spacing={2.5} sx={{ mt: 2 }}>
          {filas.map(({ periodo, total, sobra }) => (
            <Medidor
              key={periodo.inicio.toISOString()}
              izquierda={`${textoFechaCorta(periodo.inicio)} – ${textoFechaCorta(periodo.fin)}`}
              derecha={`${pesos(total)} de ${pesos(periodo.ingreso)}`}
              porcentaje={periodo.ingreso > 0 ? (total / periodo.ingreso) * 100 : 0}
              color={sobra < 0 ? 'error' : total / (periodo.ingreso || 1) > 0.8 ? 'warning' : 'primary'}
            />
          ))}
        </Stack>

        {consejo && <Alert severity="info" sx={{ mt: 2.5, borderRadius: 3 }}>{consejo}</Alert>}
      </CardContent>
    </Card>
  )
}

type Fila = {
  periodo: { inicio: Date; fin: Date; ingreso: number }
  salidas: { nombre: string; monto: number }[]
  total: number
  sobra: number
}

/** Si un periodo no cierra y el siguiente va sobrado, dice QUÉ pago mover.
    Un aviso de «vas mal» sin la siguiente acción no sirve de nada. */
function sugerirRebalanceo(filas: Fila[]): string | null {
  for (let i = 0; i < filas.length - 1; i++) {
    const apretada = filas[i]
    const holgada = filas[i + 1]
    if (apretada.sobra >= 0 || holgada.sobra <= 0) continue

    const candidato = apretada.salidas
      .filter((s) => s.monto <= holgada.sobra)
      .sort((a, b) => b.monto - a.monto)[0]

    const rango = `${textoFechaCorta(apretada.periodo.inicio)}–${textoFechaCorta(apretada.periodo.fin)}`
    if (!candidato) {
      return `En la ${rango} te faltan ${pesos(-apretada.sobra)} y en la siguiente tampoco sobra lo suficiente para mover un pago entero. Aquí el ajuste tiene que venir del gasto, no del calendario.`
    }
    const resuelveTodo = candidato.monto >= -apretada.sobra
    const cabecera = `En la ${rango} te faltan ${pesos(-apretada.sobra)}, y en la siguiente te sobran ${pesos(holgada.sobra)}.`
    return resuelveTodo
      ? `${cabecera} Mover «${candidato.nombre}» (${pesos(candidato.monto)}) al otro periodo deja las dos cerrando.`
      : `${cabecera} Mover «${candidato.nombre}» (${pesos(candidato.monto)}) al otro periodo no lo cubre todo, pero deja el faltante en ${pesos(-apretada.sobra - candidato.monto)}.`
  }
  return null
}
