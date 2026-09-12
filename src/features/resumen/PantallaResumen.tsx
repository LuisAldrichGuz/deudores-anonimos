import { useMemo } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import PaymentsRounded from '@mui/icons-material/PaymentsRounded'
import { useNavigate } from 'react-router-dom'

import { useAlmacen } from '../../shared/almacen/Almacen'
import { resumenDeDeuda } from '../../shared/finanzas/amortizacion'
import { diasEntre } from '../../shared/finanzas/fechas'
import { pesos, porcentaje } from '../../shared/formato/moneda'
import { ACENTO } from '../../app/tema'
import { AroDeProgreso } from '../../shared/ui/AroDeProgreso'
import { Medidor } from '../../shared/ui/Medidor'
import { Vacio } from '../../shared/ui/Vacio'
import { FilaDeDeuda } from './FilaDeDeuda'
import { SelectorDePeriodo } from './SelectorDePeriodo'
import { TITULO_DE, useVentana } from './useVentana'

export default function PantallaResumen() {
  const { datos } = useAlmacen()
  const navegar = useNavigate()
  const v = useVentana(datos)
  const deuda = useMemo(() => resumenDeDeuda(datos, v.corte), [datos, v.corte])

  const sinNada = !datos.prestamos.length && !datos.tarjetas.length
    && !datos.fijos.length && !datos.metas.length

  if (sinNada) {
    return (
      <Vacio Icono={PaymentsRounded} titulo="Todavía no hay nada que sumar"
        accion="Agregar lo que pagas" alPulsar={() => navegar('/pagos')} />
    )
  }

  const dias = Math.max(1, diasEntre(v.ventana.inicio, v.ventana.fin) + 1)
  const fijos = v.grupos.find((g) => g.grupo === 'fijo')?.subtotal ?? 0
  const deudas = v.grupos.find((g) => g.grupo === 'deuda')?.subtotal ?? 0

  return (
    <Stack spacing={1.75}>
      <Box className="sube"><SelectorDePeriodo unidad={v.unidad} ventana={v.ventana} alCambiar={v.mover} /></Box>

      {/* El medidor: cuánto de lo que entra ya no es tuyo. */}
      <Card className="sube" style={{ animationDelay: '.08s' }}>
        <CardContent sx={{ display: 'flex', gap: 2.5, alignItems: 'center', p: 2.5 }}>
          <AroDeProgreso
            porcentaje={v.porcentajeGastado}
            etiqueta="GASTADO"
            color={v.libre < 0 ? ACENTO.alerta : ACENTO.gastado}
          />
          <Stack spacing={1.75} sx={{ flex: 1, minWidth: 0 }}>
            <Box>
              <Typography variant="overline" color="text.disabled" sx={{ display: 'block' }}>Comprometido</Typography>
              <Typography className="cifras" sx={{ fontWeight: 700, fontSize: '1.6875rem' }}>{pesos(v.total)}</Typography>
            </Box>
            <Divider />
            <Box>
              <Typography variant="overline" color="text.disabled" sx={{ display: 'block' }}>
                {v.libre < 0 ? 'Te faltan' : 'Te queda libre'}
              </Typography>
              <Typography
                className="cifras"
                sx={{ fontWeight: 700, fontSize: '1.6875rem', color: v.libre < 0 ? 'error.main' : 'primary.main' }}
              >
                {pesos(Math.abs(v.libre))}
              </Typography>
              {v.libre >= 0 && v.ingreso > 0 && (
                <Typography variant="caption" color="text.secondary" className="cifras">
                  {pesos(v.libre / dias)} al día · {dias} días
                </Typography>
              )}
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Fijos contra deudas: son dos cosas distintas cuando toca apretar. */}
      {(fijos > 0 || deudas > 0) && (
        <Stack direction="row" spacing={1.25} className="sube" style={{ animationDelay: '.14s' }}>
          <Card sx={{ flex: 1 }}>
            <CardContent sx={{ p: 1.75, '&:last-child': { pb: 1.75 } }}>
              <Medidor
                izquierda="Fijos" derecha={pesos(fijos)} alto={4} retraso={0.5}
                porcentaje={v.total > 0 ? (fijos / v.total) * 100 : 0}
                color={ACENTO.gastado}
              />
            </CardContent>
          </Card>
          <Card sx={{ flex: 1 }}>
            <CardContent sx={{ p: 1.75, '&:last-child': { pb: 1.75 } }}>
              <Medidor
                izquierda="Deudas" derecha={pesos(deudas)} alto={4} retraso={0.58}
                porcentaje={v.total > 0 ? (deudas / v.total) * 100 : 0}
                color={ACENTO.alerta}
              />
            </CardContent>
          </Card>
        </Stack>
      )}

      {deuda.original > 0 && (
        <Card className="sube" style={{ animationDelay: '.2s' }}>
          <CardContent>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline', mb: 1.25 }}>
              <Typography variant="overline" color="text.disabled">Tu deuda</Typography>
              <Typography variant="body2" className="cifras" color="text.secondary">
                {porcentaje((deuda.pagada / deuda.original) * 100)} pagado
              </Typography>
            </Stack>
            <Medidor
              izquierda={`${pesos(deuda.pagada)} pagado`}
              derecha={`${pesos(deuda.total)} falta`}
              porcentaje={(deuda.pagada / deuda.original) * 100}
              retraso={0.66}
            />
          </CardContent>
        </Card>
      )}

      {v.grupos.length === 0 && (
        <Card className="sube" style={{ animationDelay: '.26s' }}>
          <CardContent><Typography color="text.secondary">Nada que pagar.</Typography></CardContent>
        </Card>
      )}

      {v.grupos.map((g, i) => (
        <Card key={g.grupo} className="sube" style={{ animationDelay: `${0.26 + i * 0.06}s` }}>
          <CardContent>
            <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 2, gap: 2 }}>
              <Typography variant="overline" color="text.disabled">{TITULO_DE[g.grupo]}</Typography>
              <Typography variant="overline" className="cifras" sx={{ fontWeight: 700 }}>{pesos(g.subtotal)}</Typography>
            </Stack>
            <Stack divider={<Divider />} spacing={2.5}>
              {g.filas.map((c) => (
                <FilaDeDeuda key={c.id} nombre={c.nombre} monto={c.monto}
                  prestamo={c.prestamo} corte={v.corte} />
              ))}
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  )
}
