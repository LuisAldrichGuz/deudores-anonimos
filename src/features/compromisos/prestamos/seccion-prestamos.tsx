import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import AccountBalanceRounded from '@mui/icons-material/AccountBalanceRounded'
import EditRounded from '@mui/icons-material/EditRounded'

import type { Prestamo } from '../../../shared/almacen/datos'
import { nuevoId } from '../../../shared/almacen/datos'
import { interesDelMes, mesesParaLiquidar } from '../../../shared/finanzas/amortizacion'
import { sumarMeses, textoFecha } from '../../../shared/finanzas/fechas'
import { pesos, porcentaje, textoDuracion } from '../../../shared/formato/moneda'
import { CampoDinero, CampoDiaDelMes, CampoPorcentaje } from '../../../shared/ui/CamposNumericos'
import type { DefinicionSeccion } from '../SeccionCrud'

function FichaPrestamo({ item, alEditar }: { item: Prestamo; alEditar: () => void }) {
  const meses = mesesParaLiquidar(item.saldo, item.tasaAnual, item.pagoMensual)
  const interes = interesDelMes(item.saldo, item.tasaAnual)

  return (
    <Card>
      <CardContent>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
          <Stack sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" noWrap>{item.nombre}</Typography>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', mt: .5 }}>
              <Chip size="small" variant="outlined" label={`Pagas el día ${item.diaPago}`} />
              <Chip size="small" variant="outlined" label={`${porcentaje(item.tasaAnual, 1)} anual`} />
            </Stack>
          </Stack>
          <IconButton onClick={alEditar} aria-label={`Editar ${item.nombre}`}><EditRounded /></IconButton>
        </Stack>

        <Stack direction="row" spacing={3} useFlexGap sx={{ flexWrap: 'wrap', mt: 2 }}>
          <Dato titulo="Debes" valor={pesos(item.saldo)} />
          <Dato titulo="Pagas al mes" valor={pesos(item.pagoMensual)} />
          <Dato titulo="Intereses al mes" valor={pesos(interes)} />
        </Stack>

        <Typography variant="body2" sx={{ mt: 2 }} color={meses === null ? 'error.main' : 'text.secondary'}>
          {meses === null
            ? `Con ${pesos(item.pagoMensual)} al mes este préstamo no se acaba nunca: solo los intereses son ${pesos(interes)}.`
            : `A este ritmo lo terminas en ${textoDuracion(meses)} — por ${textoFecha(sumarMeses(new Date(), meses), true)}.`}
        </Typography>
      </CardContent>
    </Card>
  )
}

const Dato = ({ titulo, valor }: { titulo: string; valor: string }) => (
  <Stack>
    <Typography variant="caption" color="text.secondary">{titulo}</Typography>
    <Typography className="cifras" sx={{ fontWeight: 500 }}>{valor}</Typography>
  </Stack>
)

export const SECCION_PRESTAMOS: DefinicionSeccion<Prestamo> = {
  singular: 'deuda',
  Icono: AccountBalanceRounded,
  vacio: {
    titulo: 'Sin deudas a plazos',
    texto: 'El crédito del carro, un préstamo personal, lo que le debes a alguien. Todo lo que se paga en mensualidades hasta acabarlo.',
  },
  nuevo: () => ({ id: nuevoId(), nombre: '', saldo: 0, tasaAnual: 0, pagoMensual: 0, diaPago: 1 }),
  Ficha: FichaPrestamo,
  Formulario: ({ valor, alCambiar }) => (
    <>
      <TextField label="Nombre" value={valor.nombre} autoFocus
        onChange={(e) => alCambiar((p) => ({ ...p, nombre: e.target.value }))} />
      <CampoDinero etiqueta="Cuánto debes" valor={valor.saldo}
        alCambiar={(n) => alCambiar((p) => ({ ...p, saldo: n }))} />
      <CampoDinero etiqueta="Mensualidad" valor={valor.pagoMensual}
        alCambiar={(n) => alCambiar((p) => ({ ...p, pagoMensual: n }))} />
      <CampoPorcentaje etiqueta="Tasa anual" valor={valor.tasaAnual}
        ayuda="Si no la sabes, déjala en 0: los cálculos salen sin intereses."
        alCambiar={(n) => alCambiar((p) => ({ ...p, tasaAnual: n }))} />
      <CampoDiaDelMes etiqueta="Día de pago" valor={valor.diaPago}
        alCambiar={(n) => alCambiar((p) => ({ ...p, diaPago: n }))} />
    </>
  ),
  valido: (p) => p.nombre.trim().length > 0,
}
