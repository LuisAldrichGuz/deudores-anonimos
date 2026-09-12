import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import CreditCardRounded from '@mui/icons-material/CreditCardRounded'
import EditRounded from '@mui/icons-material/EditRounded'

import type { Tarjeta } from '../../../shared/almacen/datos'
import { nuevoId } from '../../../shared/almacen/datos'
import { interesDelMes } from '../../../shared/finanzas/amortizacion'
import { diasSinIntereses, mejorDiaDeCompra, proximoCorte, proximoLimiteDePago } from '../../../shared/finanzas/compromisos'
import { textoFecha } from '../../../shared/finanzas/fechas'
import { pesos, porcentaje } from '../../../shared/formato/moneda'
import { Medidor } from '../../../shared/ui/Medidor'
import { CampoDinero, CampoDiaDelMes, CampoPorcentaje } from '../../../shared/ui/CamposNumericos'
import type { DefinicionSeccion } from '../SeccionCrud'

function FichaTarjeta({ item, alEditar }: { item: Tarjeta; alEditar: () => void }) {
  const uso = item.limite > 0 ? (item.saldo / item.limite) * 100 : 0
  const interes = interesDelMes(item.saldo, item.tasaAnual)
  const mejor = mejorDiaDeCompra(item)
  const dias = diasSinIntereses(item)

  return (
    <Card>
      <CardContent>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
          <Stack sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" noWrap>{item.nombre}</Typography>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', mt: .5 }}>
              <Chip size="small" variant="outlined" label={`Corta el ${textoFecha(proximoCorte(item))}`} />
              <Chip size="small" color="warning" variant="outlined"
                label={`Pagas el ${textoFecha(proximoLimiteDePago(item))}`} />
              <Chip size="small" variant="outlined" label={`${porcentaje(item.tasaAnual, 1)} anual`} />
            </Stack>
          </Stack>
          <IconButton onClick={alEditar} aria-label={`Editar ${item.nombre}`}><EditRounded /></IconButton>
        </Stack>

        <Stack spacing={2} sx={{ mt: 2.5 }}>
          <Medidor
            izquierda="Usado"
            derecha={`${pesos(item.saldo)} de ${pesos(item.limite)} · ${porcentaje(uso)}`}
            porcentaje={uso}
            color={uso > 50 ? 'error' : uso > 30 ? 'warning' : 'primary'}
          />

          <Stack direction="row" spacing={3} useFlexGap sx={{ flexWrap: 'wrap' }}>
            <Dato titulo="Le abonas" valor={pesos(item.pagoMensual)} />
            <Dato
              titulo="Se va en intereses"
              valor={pesos(interes)}
              ayuda="Cada mes, antes de bajar un peso del saldo."
              alerta={item.pagoMensual > 0 && item.pagoMensual <= interes}
            />
            <Dato
              titulo="Si compras hoy"
              valor={`${dias} días sin intereses`}
              ayuda={`El mejor día para comprar con esta tarjeta es el ${textoFecha(mejor.dia)}: te daría ${mejor.dias} días para pagarla.`}
            />
          </Stack>

          {item.pagoMensual > 0 && item.pagoMensual <= interes && (
            <Typography variant="body2" color="error.main">
              Con {pesos(item.pagoMensual)} al mes esta tarjeta no baja nunca: los intereses
              solos son {pesos(interes)}. Para que empiece a bajar tienes que pasar de ahí.
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}

function Dato({ titulo, valor, ayuda, alerta }: { titulo: string; valor: string; ayuda?: string; alerta?: boolean }) {
  const cuerpo = (
    <Stack>
      <Typography variant="caption" color="text.secondary">{titulo}</Typography>
      <Typography className="cifras" sx={{ fontWeight: 500, color: alerta ? 'error.main' : 'text.primary' }}>
        {valor}
      </Typography>
    </Stack>
  )
  return ayuda ? <Tooltip title={ayuda} arrow>{cuerpo}</Tooltip> : cuerpo
}

function FormularioTarjeta({ valor, alCambiar }: {
  valor: Tarjeta
  alCambiar: (f: (t: Tarjeta) => Tarjeta) => void
}) {
  return (
    <>
      <TextField label="Nombre" value={valor.nombre} autoFocus
        onChange={(e) => alCambiar((t) => ({ ...t, nombre: e.target.value }))} />
      <CampoDinero etiqueta="Cuánto debes" valor={valor.saldo}
        alCambiar={(n) => alCambiar((t) => ({ ...t, saldo: n }))} />
      <CampoDinero etiqueta="Límite de la tarjeta" valor={valor.limite}
        alCambiar={(n) => alCambiar((t) => ({ ...t, limite: n }))} />
      <CampoPorcentaje etiqueta="Tasa anual" valor={valor.tasaAnual}
        ayuda="La que viene en tu estado de cuenta. Si solo tienes el CAT, ese sirve."
        alCambiar={(n) => alCambiar((t) => ({ ...t, tasaAnual: n }))} />
      <CampoDiaDelMes etiqueta="Día de corte" valor={valor.diaCorte}
        alCambiar={(n) => alCambiar((t) => ({ ...t, diaCorte: n }))} />
      <CampoDinero etiqueta="Cuánto le abonas al mes" valor={valor.pagoMensual}
        ayuda="Lo que piensas pagarle tú, no el mínimo del banco."
        alCambiar={(n) => alCambiar((t) => ({ ...t, pagoMensual: n }))} />
      <TextField label="Días del corte a la fecha límite" type="number" value={valor.diasParaPagar}
        helperText="En México casi siempre son 20."
        onChange={(e) => alCambiar((t) => ({ ...t, diasParaPagar: Math.max(0, Number(e.target.value) || 0) }))} />
    </>
  )
}

export const SECCION_TARJETAS: DefinicionSeccion<Tarjeta> = {
  singular: 'tarjeta',
  Icono: CreditCardRounded,
  vacio: {
    titulo: 'Sin tarjetas',
    texto: 'Agrega tus tarjetas de crédito con su día de corte para saber cuándo te toca pagar y cuántos días sin intereses te dan.',
  },
  nuevo: () => ({
    id: nuevoId(), nombre: '', limite: 0, saldo: 0, tasaAnual: 0,
    diaCorte: 1, diasParaPagar: 20, pagoMensual: 0,
  }),
  Ficha: FichaTarjeta,
  Formulario: FormularioTarjeta,
  valido: (t) => t.nombre.trim().length > 0,
}
