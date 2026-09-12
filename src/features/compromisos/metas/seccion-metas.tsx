import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import SavingsRounded from '@mui/icons-material/SavingsRounded'
import EditRounded from '@mui/icons-material/EditRounded'

import type { Meta } from '../../../shared/almacen/datos'
import { nuevoId } from '../../../shared/almacen/datos'
import { sumarMeses, textoFecha } from '../../../shared/finanzas/fechas'
import { pesos, textoDuracion } from '../../../shared/formato/moneda'
import { Medidor } from '../../../shared/ui/Medidor'
import { CampoDinero, CampoDiaDelMes } from '../../../shared/ui/CamposNumericos'
import type { DefinicionSeccion } from '../SeccionCrud'

function FichaMeta({ item, alEditar }: { item: Meta; alEditar: () => void }) {
  const falta = Math.max(0, item.objetivo - item.ahorrado)
  const meses = item.aportacion > 0 ? Math.ceil(falta / item.aportacion) : null

  return (
    <Card>
      <CardContent>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ flex: 1, minWidth: 0 }} noWrap>{item.nombre}</Typography>
          <IconButton onClick={alEditar} aria-label={`Editar ${item.nombre}`}><EditRounded /></IconButton>
        </Stack>

        <Medidor
          izquierda={`Apartas ${pesos(item.aportacion)} el día ${item.diaPago}`}
          derecha={`${pesos(item.ahorrado)} de ${pesos(item.objetivo)}`}
          porcentaje={item.objetivo > 0 ? (item.ahorrado / item.objetivo) * 100 : 0}
        />

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
          {falta === 0
            ? 'Ya la juntaste.'
            : meses === null
              ? `Te faltan ${pesos(falta)}. Sin una cantidad mensual no hay fecha que calcular.`
              : `Te faltan ${pesos(falta)}: ${textoDuracion(meses)} más, hasta ${textoFecha(sumarMeses(new Date(), meses), true)}.`}
        </Typography>
      </CardContent>
    </Card>
  )
}

export const SECCION_METAS: DefinicionSeccion<Meta> = {
  singular: 'meta',
  Icono: SavingsRounded,
  vacio: { titulo: 'Sin metas de ahorro' },
  nuevo: () => ({ id: nuevoId(), nombre: '', objetivo: 0, ahorrado: 0, aportacion: 0, diaPago: 1 }),
  Ficha: FichaMeta,
  Formulario: ({ valor, alCambiar }) => (
    <>
      <TextField label="Nombre" value={valor.nombre} autoFocus
        onChange={(e) => alCambiar((m) => ({ ...m, nombre: e.target.value }))} />
      <CampoDinero etiqueta="Cuánto quieres juntar" valor={valor.objetivo}
        alCambiar={(n) => alCambiar((m) => ({ ...m, objetivo: n }))} />
      <CampoDinero etiqueta="Cuánto llevas" valor={valor.ahorrado}
        alCambiar={(n) => alCambiar((m) => ({ ...m, ahorrado: n }))} />
      <CampoDinero etiqueta="Cuánto apartas al mes" valor={valor.aportacion}
        alCambiar={(n) => alCambiar((m) => ({ ...m, aportacion: n }))} />
      <CampoDiaDelMes etiqueta="Día en que lo apartas" valor={valor.diaPago}
        alCambiar={(n) => alCambiar((m) => ({ ...m, diaPago: n }))} />
    </>
  ),
  valido: (m) => m.nombre.trim().length > 0 && m.objetivo > 0,
}
