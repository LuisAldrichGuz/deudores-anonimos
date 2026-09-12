import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import MenuItem from '@mui/material/MenuItem'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import AccountBalanceRounded from '@mui/icons-material/AccountBalanceRounded'
import EditRounded from '@mui/icons-material/EditRounded'

import type { Prestamo } from '../../../shared/almacen/datos'
import { nuevoId } from '../../../shared/almacen/datos'
import { mesesParaLiquidar } from '../../../shared/finanzas/amortizacion'
import { avanceDe, importeDePago, pagoMensualDe } from '../../../shared/finanzas/plazos'
import { sumarMeses, textoFecha } from '../../../shared/finanzas/fechas'
import { pesos, porcentaje, textoDuracion } from '../../../shared/formato/moneda'
import { Medidor } from '../../../shared/ui/Medidor'
import { CampoDinero, CampoDiaDelMes, CampoPorcentaje } from '../../../shared/ui/CamposNumericos'
import { RejillaDePagos } from '../../../shared/ui/RejillaDePagos'
import type { DefinicionSeccion } from '../SeccionCrud'

function FichaPrestamo({ item, alEditar }: { item: Prestamo; alEditar: () => void }) {
  const avance = item.plazos ? avanceDe(item.plazos) : null
  const terminada = avance?.terminada ?? false

  return (
    // Una deuda pagada sigue siendo útil de ver, pero no compite con las vivas.
    <Card sx={terminada ? { opacity: .55 } : undefined}>
      <CardContent>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ flex: 1, minWidth: 0 }} noWrap>{item.nombre}</Typography>
          <Typography variant="h6" className="cifras">
            {pesos(item.plazos ? item.plazos.total : item.saldo)}
          </Typography>
          <IconButton onClick={alEditar} aria-label={`Editar ${item.nombre}`}><EditRounded /></IconButton>
        </Stack>

        {avance && item.plazos ? (
          <>
            <RejillaDePagos pagos={avance.pagos} importe={importeDePago(item.plazos)} />
            <Stack direction="row" spacing={3} sx={{ mt: 2.5, flexWrap: 'wrap' }} useFlexGap>
              <Dato titulo="Pagado" valor={pesos(avance.pagado)} />
              <Dato titulo="Falta" valor={pesos(avance.falta)} />
              <Dato
                titulo={item.plazos.cada === 'quincena' ? 'Por quincena' : 'Al mes'}
                valor={pesos(importeDePago(item.plazos))}
              />
              <Dato
                titulo={avance.terminada ? 'Terminada' : 'Última'}
                valor={textoFecha(avance.ultima, true)}
              />
            </Stack>
          </>
        ) : (
          <>
            <Medidor
              izquierda={`${porcentaje(item.tasaAnual, 1)} anual · día ${item.diaPago}`}
              derecha={pesos(item.pagoMensual)}
              porcentaje={0}
            />
            <Stack direction="row" spacing={3} sx={{ mt: 2, flexWrap: 'wrap' }} useFlexGap>
              <Dato titulo="Debes" valor={pesos(item.saldo)} />
              <Dato titulo="Mensual" valor={pesos(item.pagoMensual)} />
              <Dato titulo="Termina" valor={textoTermino(item)} />
            </Stack>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function textoTermino(p: Prestamo): string {
  const meses = mesesParaLiquidar(p.saldo, p.tasaAnual, p.pagoMensual)
  return meses === null ? 'nunca' : `${textoFecha(sumarMeses(new Date(), meses), true)} · ${textoDuracion(meses)}`
}

const Dato = ({ titulo, valor }: { titulo: string; valor: string }) => (
  <Stack>
    <Typography variant="caption" color="text.secondary">{titulo}</Typography>
    <Typography className="cifras" sx={{ fontWeight: 500 }}>{valor}</Typography>
  </Stack>
)

/** La fecha de hoy en 'AAAA-MM-DD', que es lo que espera <input type="date">. */
function hoyISO(): string {
  const f = new Date()
  const dd = (n: number) => String(n).padStart(2, '0')
  return `${f.getFullYear()}-${dd(f.getMonth() + 1)}-${dd(f.getDate())}`
}

function FormularioPrestamo({ valor, alCambiar }: {
  valor: Prestamo
  alCambiar: (f: (p: Prestamo) => Prestamo) => void
}) {
  const plazos = valor.plazos

  // ⚠️ Con plazos, la mensualidad y el día de pago NO se piden: salen del total,
  // del número de mensualidades y de la fecha de inicio. Pedirlos sería dejar
  // que el usuario escriba un tercer número que contradice a los otros dos.
  const conPlazos = (p: Prestamo, cambios: Partial<NonNullable<Prestamo['plazos']>>): Prestamo => {
    const base: NonNullable<Prestamo['plazos']> =
      p.plazos ?? { total: 0, pagos: 1, cada: 'mes', inicio: hoyISO() }
    const plazos = { ...base, ...cambios }
    return {
      ...p,
      plazos,
      // `pagoMensual` es lo que la app compara contra un sueldo mensual, así que
      // en una deuda quincenal son DOS abonos. El importe de cada abono se
      // calcula aparte (importeDePago) y no se guarda: sale del total.
      pagoMensual: pagoMensualDe(plazos),
      diaPago: Number(plazos.inicio.slice(8, 10)) || 1,
      saldo: 0,
    }
  }

  return (
    <>
      <TextField label="Nombre" value={valor.nombre} autoFocus
        onChange={(e) => alCambiar((p) => ({ ...p, nombre: e.target.value }))} />

      <FormControlLabel
        label="Pagos fijos"
        control={
          <Switch
            checked={!!plazos}
            onChange={(e) => alCambiar((p) => e.target.checked
              ? conPlazos(p, {})
              : { ...p, plazos: undefined, saldo: p.plazos?.total ?? 0 })}
          />
        }
      />

      {plazos ? (
        <>
          <CampoDinero etiqueta="Cuánto costó" valor={plazos.total}
            alCambiar={(n) => alCambiar((p) => conPlazos(p, { total: n }))} />
          <TextField select label="Cada cuándo pagas" value={plazos.cada}
            onChange={(e) => alCambiar((p) => conPlazos(p, { cada: e.target.value as 'mes' | 'quincena' }))}>
            <MenuItem value="quincena">Cada quincena</MenuItem>
            <MenuItem value="mes">Cada mes</MenuItem>
          </TextField>
          <TextField label="Cuántos pagos" type="number" value={plazos.pagos}
            onChange={(e) => alCambiar((p) => conPlazos(p, { pagos: Math.max(1, Number(e.target.value) || 1) }))} />
          <TextField label="Primer pago" type="date" value={plazos.inicio}
            slotProps={{ inputLabel: { shrink: true } }}
            onChange={(e) => alCambiar((p) => conPlazos(p, { inicio: e.target.value }))} />
          <Typography variant="body2" color="text.secondary" className="cifras">
            {pesos(importeDePago(plazos))} cada {plazos.cada}
          </Typography>
        </>
      ) : (
        <>
          <CampoDinero etiqueta="Cuánto debes" valor={valor.saldo}
            alCambiar={(n) => alCambiar((p) => ({ ...p, saldo: n }))} />
          <CampoDinero etiqueta="Mensualidad" valor={valor.pagoMensual}
            alCambiar={(n) => alCambiar((p) => ({ ...p, pagoMensual: n }))} />
          <CampoPorcentaje etiqueta="Tasa anual" valor={valor.tasaAnual}
            alCambiar={(n) => alCambiar((p) => ({ ...p, tasaAnual: n }))} />
          <CampoDiaDelMes etiqueta="Día de pago" valor={valor.diaPago}
            alCambiar={(n) => alCambiar((p) => ({ ...p, diaPago: n }))} />
        </>
      )}
    </>
  )
}

export const SECCION_PRESTAMOS: DefinicionSeccion<Prestamo> = {
  singular: 'deuda',
  Icono: AccountBalanceRounded,
  vacio: { titulo: 'Sin deudas' },
  nuevo: () => ({ id: nuevoId(), nombre: '', saldo: 0, tasaAnual: 0, pagoMensual: 0, diaPago: 1 }),
  Ficha: FichaPrestamo,
  Formulario: FormularioPrestamo,
  valido: (p) => p.nombre.trim().length > 0,
  // Primero lo que sigues debiendo, y de eso lo más grande. Las pagadas al
  // final: si no, quien lleva años usando esto abre la lista y ve su historial
  // en vez de lo que le toca este mes.
  ordenar: (a, b) => {
    const faltaA = a.plazos ? avanceDe(a.plazos).falta : a.saldo
    const faltaB = b.plazos ? avanceDe(b.plazos).falta : b.saldo
    if ((faltaA > 0) !== (faltaB > 0)) return faltaA > 0 ? -1 : 1
    return faltaB - faltaA
  },
}
