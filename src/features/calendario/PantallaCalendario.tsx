import { useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded'
import TodayRounded from '@mui/icons-material/TodayRounded'

import { useAlmacen } from '../../shared/almacen/Almacen'
import { esSalida, eventosEnRango, totalDe } from '../../shared/finanzas/compromisos'
import { MESES, claveDia, diasEnMes, hoy, textoFecha } from '../../shared/finanzas/fechas'
import { pesos } from '../../shared/formato/moneda'
import { ListaDePagos } from '../../shared/ui/ListaDePagos'
import { Rejilla } from '../../shared/ui/Rejilla'
import { COLOR_PUNTO, LEYENDA, RejillaDelMes } from './RejillaDelMes'

export default function PantallaCalendario() {
  const { datos } = useAlmacen()
  const hoyMismo = hoy()
  const [cursor, setCursor] = useState(() => new Date(hoyMismo.getFullYear(), hoyMismo.getMonth(), 1))
  const [seleccionado, setSeleccionado] = useState<Date | null>(hoyMismo)

  const anio = cursor.getFullYear()
  const mes = cursor.getMonth()

  const eventos = useMemo(
    () => eventosEnRango(datos, new Date(anio, mes, 1), new Date(anio, mes, diasEnMes(anio, mes))),
    [datos, anio, mes],
  )

  const delDia = seleccionado
    ? eventos.filter((e) => claveDia(e.fecha) === claveDia(seleccionado))
    : []

  const salidas = eventos.filter(esSalida)
  const totalMes = totalDe(salidas)

  const moverMes = (n: number) => {
    const nuevo = new Date(anio, mes + n, 1)
    setCursor(nuevo)
    setSeleccionado(null)
  }

  const volverAHoy = () => {
    setCursor(new Date(hoyMismo.getFullYear(), hoyMismo.getMonth(), 1))
    setSeleccionado(hoyMismo)
  }

  return (
    <Rejilla columnas={2} sx={{ alignItems: 'start' }}>
      <Card>
        <CardContent>
          <Stack direction="row" sx={{ alignItems: 'center', mb: 2 }}>
            <IconButton onClick={() => moverMes(-1)} aria-label="Mes anterior"><ChevronLeftRounded /></IconButton>
            <Typography variant="h6" sx={{ flex: 1, textAlign: 'center', textTransform: 'capitalize' }}>
              {MESES[mes]} {anio}
            </Typography>
            <IconButton onClick={() => moverMes(1)} aria-label="Mes siguiente"><ChevronRightRounded /></IconButton>
            <IconButton onClick={volverAHoy} aria-label="Volver a hoy"><TodayRounded /></IconButton>
          </Stack>

          <RejillaDelMes
            anio={anio} mes={mes} eventos={eventos}
            seleccionado={seleccionado} alSeleccionar={setSeleccionado}
          />

          <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap', mt: 3 }}>
            {LEYENDA.map(({ tipo, texto }) => (
              <Stack key={tipo} direction="row" spacing={.75} sx={{ alignItems: 'center' }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLOR_PUNTO[tipo] }} />
                <Typography variant="caption" color="text.secondary">{texto}</Typography>
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Stack spacing={2}>
        <Card sx={{ bgcolor: 'secondary.contenedor', color: 'secondary.sobreContenedor', border: 0 }}>
          <CardContent>
            <Typography variant="overline">Todo {MESES[mes]}</Typography>
            <Typography variant="h3" className="cifras" sx={{ my: .5 }}>{pesos(totalMes)}</Typography>
            <Typography variant="body2">
              En {salidas.length} pagos. Los cortes de tarjeta no suman: ese día no se paga nada,
              solo cierra el periodo que vas a pagar después.
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="overline" color="text.secondary">
              {seleccionado ? textoFecha(seleccionado) : 'Elige un día'}
            </Typography>
            {seleccionado && delDia.length === 0 && (
              <Typography color="text.secondary" sx={{ py: 3 }}>Ese día no cae nada.</Typography>
            )}
            {!seleccionado && (
              <Typography color="text.secondary" sx={{ py: 3 }}>
                Toca cualquier día del calendario para ver qué cae.
              </Typography>
            )}
            {delDia.length > 0 && <ListaDePagos eventos={delDia} conFecha={false} />}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="overline" color="text.secondary">Todo el mes, en orden</Typography>
            {salidas.length
              ? <ListaDePagos eventos={salidas} />
              : <Typography color="text.secondary" sx={{ py: 3 }}>Este mes no cae ningún pago.</Typography>}
          </CardContent>
        </Card>
      </Stack>
    </Rejilla>
  )
}
