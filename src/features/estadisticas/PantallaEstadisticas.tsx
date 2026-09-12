import { useMemo } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import InsightsRounded from '@mui/icons-material/InsightsRounded'

import { useAlmacen } from '../../shared/almacen/Almacen'
import { historicoDeDeuda, resumenDeDeuda } from '../../shared/finanzas/amortizacion'
import {
  fechaDeLibertad, pagosHechos, proximasEnCaer, proyeccionMensual, repartoDeDeuda,
} from '../../shared/finanzas/estadisticas'
import { esSalida, eventosEnRango, costoMensual, totalDe } from '../../shared/finanzas/compromisos'
import { saldoDe } from '../../shared/finanzas/plazos'
import { diasEnMes, textoFecha, textoFechaCorta } from '../../shared/finanzas/fechas'
import { ventanaDe, ingresoEnVentana } from '../../shared/finanzas/ventanas'
import { pesos, porcentaje, textoDuracion } from '../../shared/formato/moneda'
import { ACENTO } from '../../app/tema'

/** Los tonos del reparto: mismo croma y luminosidad, solo cambia el tono, así
    que ninguna rebanada pesa más que otra por su color. */
const TONOS = ['#B39A7D', '#A5A07C', '#94A585', '#89A88E', '#88A69C', '#87A2A9']
import { AroDeProgreso } from '../../shared/ui/AroDeProgreso'
import { Vacio } from '../../shared/ui/Vacio'
import { GraficaDeProyeccion } from './GraficaDeProyeccion'

export default function PantallaEstadisticas() {
  const { datos } = useAlmacen()

  // ⚠️ Al CIERRE de la quincena en curso, no a hoy — es la misma fecha con la
  // que abre Inicio. Con `hoy()` las dos pantallas decían cifras distintas de
  // la misma deuda (unos días de pagos de diferencia) y eso se lee como un
  // error de cuentas aunque las dos tengan razón.
  const ref = ventanaDe('quincena').fin

  const s = useMemo(() => {
    const mes = ventanaDe('mes', ref)
    const delMes = totalDe(eventosEnRango(datos, mes.inicio, mes.fin).filter(esSalida))
    const ingresoMes = ingresoEnVentana(datos.perfil, mes)
    const deuda = resumenDeDeuda(datos, ref)
    const historico = historicoDeDeuda(datos, ref)
    const pagoDeudaMensual = datos.prestamos
      .filter((p) => saldoDe(p, ref) > 0)
      .reduce((t, p) => t + p.pagoMensual, 0)
    const fijoMensual = datos.fijos.reduce((t, f) => t + costoMensual(f), 0)
    const libertad = fechaDeLibertad(datos, ref)
    const proyeccion = proyeccionMensual(datos, ref)
    const reparto = repartoDeDeuda(datos, ref)

    return {
      delMes, ingresoMes, deuda, historico, pagoDeudaMensual, fijoMensual, libertad, proyeccion, reparto,
      pagos: pagosHechos(datos, ref),
      proximas: proximasEnCaer(datos, ref).slice(0, 4),
      activas: datos.prestamos.filter((p) => saldoDe(p, ref) > 0).length,
      liquidadas: datos.prestamos.filter((p) => saldoDe(p, ref) <= 0).length,
      diasDelMes: diasEnMes(ref.getFullYear(), ref.getMonth()),
    }
  }, [datos, ref])

  if (!datos.prestamos.length && !datos.fijos.length) {
    return <Vacio Icono={InsightsRounded} titulo="Sin nada que medir todavía" />
  }

  const pctGastado = s.ingresoMes > 0 ? (s.delMes / s.ingresoMes) * 100 : 0
  const pctLibre = Math.max(0, 100 - pctGastado)
  const mesesRestantes = s.libertad
    ? (s.libertad.getFullYear() - ref.getFullYear()) * 12 + s.libertad.getMonth() - ref.getMonth()
    : null

  return (
    <Stack spacing={1.75}>

      {/* Los dos aros: lo que ya no es tuyo y lo que sí. */}
      <Card className="sube">
        <CardContent sx={{ display: 'flex', gap: 1, p: 2.5 }}>
          <Stack spacing={1} sx={{ flex: 1, alignItems: 'center' }}>
            <AroDeProgreso porcentaje={pctGastado} etiqueta="GASTADO"
              color={ACENTO.gastado} tamano={108} grosor={10} />
            <Typography className="cifras" sx={{ fontWeight: 600 }}>{pesos(s.delMes)}</Typography>
            <Typography variant="caption" color="text.disabled" className="cifras">de {pesos(s.ingresoMes)}</Typography>
          </Stack>
          <Divider orientation="vertical" flexItem />
          <Stack spacing={1} sx={{ flex: 1, alignItems: 'center' }}>
            <AroDeProgreso porcentaje={pctLibre} etiqueta="LIBRE"
              color={ACENTO.libre} tamano={108} grosor={10} retraso={0.45} />
            <Typography className="cifras" sx={{ fontWeight: 600, color: ACENTO.libre }}>
              {pesos(Math.max(0, s.ingresoMes - s.delMes))}
            </Typography>
            <Typography variant="caption" color="text.disabled">para vivir</Typography>
          </Stack>
        </CardContent>
      </Card>

      {/* Cuándo se acaba */}
      {s.libertad && (
        <Card className="sube" style={{ animationDelay: '.06s' }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="overline" color="text.disabled" sx={{ display: 'block' }}>Quedas libre</Typography>
              <Typography variant="h3" sx={{ mt: .5 }}>{textoFecha(s.libertad, true)}</Typography>
              <Typography variant="body2" color="text.secondary" className="cifras" sx={{ mt: .25 }}>
                {mesesRestantes !== null ? `en ${textoDuracion(mesesRestantes)}` : ''}
                {s.pagos.restantes > 0 ? ` · ${s.pagos.restantes} pagos` : ''}
              </Typography>
            </Box>
            {s.deuda.original > 0 && (
              <AroDeProgreso
                porcentaje={(s.deuda.pagada / s.deuda.original) * 100}
                color={ACENTO.libre} tamano={64} grosor={6} retraso={0.6}
              />
            )}
          </CardContent>
        </Card>
      )}

      {s.proyeccion.length > 1 && (
        <Card className="sube" style={{ animationDelay: '.12s' }}>
          <CardContent>
            <Typography variant="overline" color="text.disabled" sx={{ display: 'block', mb: 2 }}>
              Lo que cae cada mes
            </Typography>
            <GraficaDeProyeccion meses={s.proyeccion} />
          </CardContent>
        </Card>
      )}

      {/* Rejilla de cifras */}
      <Box className="sube" style={{ animationDelay: '.18s' }}
        sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1.25 }}>
        <Dato titulo="Deuda / ingreso"
          valor={porcentaje(s.ingresoMes > 0 ? (s.pagoDeudaMensual / s.ingresoMes) * 100 : 0)}
          pie="sano por debajo de 30"
          barra={s.ingresoMes > 0 ? (s.pagoDeudaMensual / s.ingresoMes) * 100 : 0}
          color={ACENTO.gastado} />
        <Dato titulo="Gasto fijo / ingreso"
          valor={porcentaje(s.ingresoMes > 0 ? (s.fijoMensual / s.ingresoMes) * 100 : 0)}
          pie="renta y servicios"
          barra={s.ingresoMes > 0 ? (s.fijoMensual / s.ingresoMes) * 100 : 0}
          color={ACENTO.libre} />
        <Dato titulo="Pagado desde siempre" valor={pesos(s.historico.pagada)} color={ACENTO.libre}
          pie={`de ${pesos(s.historico.original)} en ${datos.prestamos.length} deudas`} />
        <Dato titulo="Ya liquidadas" valor={String(s.liquidadas)} pie={`quedan ${s.activas} activas`} />
        <Dato titulo="Pagos hechos" valor={`${s.pagos.hechos} / ${s.pagos.totales}`}
          pie={`faltan ${s.pagos.restantes}`} />
        <Dato titulo="Te queda al día"
          valor={pesos(Math.max(0, (s.ingresoMes - s.delMes) / s.diasDelMes))}
          pie="lo que sobra este mes" />
      </Box>

      {/* En qué está la deuda */}
      {s.reparto.length > 0 && (
        <Card className="sube" style={{ animationDelay: '.24s' }}>
          <CardContent>
            <Typography variant="overline" color="text.disabled" sx={{ display: 'block', mb: 2 }}>
              En qué está tu deuda
            </Typography>
            <Stack direction="row" spacing="2px" sx={{ height: 10, borderRadius: 999, overflow: 'hidden' }}>
              {s.reparto.map((d, i) => (
                <Box key={d.id} className="crece" style={{ animationDelay: `${0.5 + i * 0.06}s` }}
                  sx={{ flex: d.falta, bgcolor: TONOS[i % TONOS.length] }} />
              ))}
            </Stack>
            <Stack spacing={1.25} sx={{ mt: 2 }}>
              {s.reparto.slice(0, 5).map((d, i) => (
                <Stack key={d.id} direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: .5, flexShrink: 0, bgcolor: TONOS[i % TONOS.length] }} />
                  <Typography variant="body2" noWrap sx={{ flex: 1, minWidth: 0 }}>{d.nombre}</Typography>
                  <Typography variant="body2" className="cifras" color="text.secondary">{pesos(d.falta)}</Typography>
                </Stack>
              ))}
              {s.reparto.length > 5 && (
                <Typography variant="caption" color="text.disabled">y {s.reparto.length - 5} más</Typography>
              )}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Las buenas noticias */}
      {s.proximas.length > 0 && (
        <Card className="sube" style={{ animationDelay: '.3s' }}>
          <CardContent>
            <Typography variant="overline" color="text.disabled" sx={{ display: 'block', mb: 2 }}>
              Las que caen primero
            </Typography>
            <Stack spacing={1.75}>
              {s.proximas.map((d, i) => (
                <Stack key={d.id} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <Typography variant="caption" className="cifras"
                    sx={{ width: 58, flexShrink: 0, color: i === 0 ? ACENTO.libre : 'text.secondary' }}>
                    {textoFechaCorta(d.fin)}
                  </Typography>
                  <Typography variant="body2" noWrap sx={{ flex: 1, minWidth: 0 }}>{d.nombre}</Typography>
                  <Typography variant="caption" className="cifras" color="text.disabled">
                    +{pesos(d.libera)}/{d.porPeriodo === 'quincena' ? 'q' : 'mes'}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}
    </Stack>
  )
}

function Dato({ titulo, valor, pie, barra, color }: {
  titulo: string
  valor: string
  pie?: string
  barra?: number
  color?: string
}) {
  return (
    <Card>
      <CardContent sx={{ p: 1.75, '&:last-child': { pb: 1.75 } }}>
        <Typography variant="overline" color="text.disabled" sx={{ display: 'block', fontSize: '.625rem' }}>
          {titulo}
        </Typography>
        <Typography className="cifras" sx={{ fontSize: '1.25rem', fontWeight: 700, color: color ?? 'text.primary', my: .5 }}>
          {valor}
        </Typography>
        {barra !== undefined && (
          <Box sx={{ height: 3, borderRadius: 999, bgcolor: 'action.disabledBackground', overflow: 'hidden', mb: .75 }}>
            <Box className="crece" style={{ animationDelay: '.7s' }}
              sx={{ height: '100%', width: `${Math.min(100, barra)}%`, bgcolor: color ?? 'text.primary' }} />
          </Box>
        )}
        {pie && <Typography variant="caption" color="text.disabled">{pie}</Typography>}
      </CardContent>
    </Card>
  )
}
