import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import FormControlLabel from '@mui/material/FormControlLabel'
import MenuItem from '@mui/material/MenuItem'
import Switch from '@mui/material/Switch'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import ReceiptLongRounded from '@mui/icons-material/ReceiptLongRounded'
import EditRounded from '@mui/icons-material/EditRounded'

import type { CategoriaFija, Fijo, FrecuenciaGasto } from '../../../shared/almacen/datos'
import { nuevoId } from '../../../shared/almacen/datos'
import { costoMensual } from '../../../shared/finanzas/compromisos'
import { useAlmacen } from '../../../shared/almacen/Almacen'
import { MESES } from '../../../shared/finanzas/fechas'
import { pesos } from '../../../shared/formato/moneda'
import { CampoDinero, CampoDiaDelMes } from '../../../shared/ui/CamposNumericos'
import type { DefinicionSeccion } from '../SeccionCrud'

const CATEGORIAS: { valor: CategoriaFija; texto: string }[] = [
  { valor: 'renta', texto: 'Renta o hipoteca' },
  { valor: 'servicios', texto: 'Servicios (luz, agua, internet)' },
  { valor: 'suscripcion', texto: 'Suscripciones' },
  { valor: 'transporte', texto: 'Transporte y coche' },
  { valor: 'salud', texto: 'Salud' },
  { valor: 'educacion', texto: 'Educación' },
  { valor: 'otro', texto: 'Otro' },
]

const FRECUENCIAS: { valor: FrecuenciaGasto; texto: string }[] = [
  { valor: 'mensual', texto: 'Cada mes' },
  { valor: 'quincenal', texto: 'Cada quincena' },
  { valor: 'bimestral', texto: 'Cada dos meses' },
  { valor: 'anual', texto: 'Una vez al año' },
]

const textoFrecuencia = (f: FrecuenciaGasto) => FRECUENCIAS.find((x) => x.valor === f)!.texto

/** En cuántas partes cae un gasto partido: una por cada vez que te pagan. */
const VECES = { mensual: 1, quincenal: 2, semanal: 4 } as const

/** Los que no se pagan todos los meses necesitan saber en CUÁL toca. */
const necesitaMes = (f: FrecuenciaGasto) => f === 'bimestral' || f === 'anual'

function FichaFijo({ item, alEditar }: { item: Fijo; alEditar: () => void }) {
  const { datos } = useAlmacen()
  const mensual = costoMensual(item)
  const partes = item.partidoPorCobro ? VECES[datos.perfil.frecuencia] : 1
  return (
    <Card>
      <CardContent>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Stack sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" noWrap>{item.nombre}</Typography>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', mt: .5 }}>
              <Chip size="small" variant="outlined" label={textoFrecuencia(item.frecuencia)} />
              {partes > 1
                ? <Chip size="small" variant="outlined" label={`En ${partes} partes`} />
                : <Chip size="small" variant="outlined" label={`Día ${item.diaPago}`} />}
              {necesitaMes(item.frecuencia) && item.mesBase && (
                <Chip size="small" variant="outlined" label={`Desde ${MESES[item.mesBase - 1]}`} />
              )}
            </Stack>
          </Stack>
          <Stack sx={{ alignItems: 'flex-end' }}>
            <Typography variant="h6" className="cifras">{pesos(item.monto)}</Typography>
            {partes > 1 && (
              <Typography variant="caption" color="text.secondary" className="cifras">
                {pesos(item.monto / partes)} cada vez
              </Typography>
            )}
            {partes === 1 && item.frecuencia !== 'mensual' && (
              <Typography variant="caption" color="text.secondary" className="cifras">
                {pesos(mensual)} al mes
              </Typography>
            )}
          </Stack>
          <IconButton onClick={alEditar} aria-label={`Editar ${item.nombre}`}><EditRounded /></IconButton>
        </Stack>
      </CardContent>
    </Card>
  )
}

export const SECCION_FIJOS: DefinicionSeccion<Fijo> = {
  singular: 'gasto fijo',
  Icono: ReceiptLongRounded,
  vacio: { titulo: 'Sin gastos fijos' },
  nuevo: () => ({
    id: nuevoId(), nombre: '', categoria: 'otro', monto: 0,
    frecuencia: 'mensual', diaPago: 1,
  }),
  Ficha: FichaFijo,
  Formulario: ({ valor, alCambiar }) => (
    <>
      <TextField label="Nombre" value={valor.nombre} autoFocus
        onChange={(e) => alCambiar((f) => ({ ...f, nombre: e.target.value }))} />
      <CampoDinero etiqueta="Cuánto pagas" valor={valor.monto}
        alCambiar={(n) => alCambiar((f) => ({ ...f, monto: n }))} />
      <TextField select label="Cada cuándo" value={valor.frecuencia}
        onChange={(e) => {
          const frecuencia = e.target.value as FrecuenciaGasto
          alCambiar((f) => ({
            ...f,
            frecuencia,
            // Si deja de necesitar mes, se quita: un campo escondido con valor
            // viejo reaparece al volver a cambiar la frecuencia.
            mesBase: necesitaMes(frecuencia) ? (f.mesBase ?? 1) : undefined,
          }))
        }}>
        {FRECUENCIAS.map((f) => <MenuItem key={f.valor} value={f.valor}>{f.texto}</MenuItem>)}
      </TextField>
      {necesitaMes(valor.frecuencia) && (
        <TextField select label="Mes en que toca" value={valor.mesBase ?? 1}
          helperText={valor.frecuencia === 'bimestral' ? 'Y de ahí, cada dos meses.' : undefined}
          onChange={(e) => alCambiar((f) => ({ ...f, mesBase: Number(e.target.value) }))}>
          {MESES.map((m, i) => <MenuItem key={m} value={i + 1}>{m}</MenuItem>)}
        </TextField>
      )}
      <FormControlLabel
        label="Lo pago cuando me cae el dinero"
        control={
          <Switch
            checked={!!valor.partidoPorCobro}
            onChange={(e) => alCambiar((f) => ({ ...f, partidoPorCobro: e.target.checked || undefined }))}
          />
        }
      />
      {/* ⚠️ Con el reparto puesto, el día de pago deja de decidir nada: las
          fechas salen de cuándo te pagan. Se esconde en vez de dejarlo ahí
          sin efecto, que es peor que no tenerlo. */}
      {!valor.partidoPorCobro && (
        <CampoDiaDelMes etiqueta="Día de pago" valor={valor.diaPago}
          alCambiar={(n) => alCambiar((f) => ({ ...f, diaPago: n }))} />
      )}
      <TextField select label="Categoría" value={valor.categoria}
        onChange={(e) => alCambiar((f) => ({ ...f, categoria: e.target.value as CategoriaFija }))}>
        {CATEGORIAS.map((c) => <MenuItem key={c.valor} value={c.valor}>{c.texto}</MenuItem>)}
      </TextField>
    </>
  ),
  valido: (f) => f.nombre.trim().length > 0 && f.monto > 0,
}
