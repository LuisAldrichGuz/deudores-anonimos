import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import type { Prestamo } from '../../shared/almacen/datos'
import { avanceDe, importeDePago } from '../../shared/finanzas/plazos'
import { RejillaDePagos } from '../../shared/ui/RejillaDePagos'
import { pesos } from '../../shared/formato/moneda'

/** Un concepto de la ventana que estás viendo: lo que cae, y —si es una deuda
    a plazos— en qué punto va. Es la ÚNICA vez que una deuda aparece en la
    pantalla: la lista y las barras son lo mismo, no dos secciones. */
export function FilaDeDeuda({
  nombre, monto, prestamo, corte,
}: {
  nombre: string
  monto: number
  prestamo?: Prestamo
  /** Fecha a la que se mira: el final de la ventana seleccionada. */
  corte: Date
}) {
  const avance = prestamo?.plazos ? avanceDe(prestamo.plazos, corte) : null

  return (
    <Stack spacing={avance ? 1 : 0}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 2, alignItems: 'baseline' }}>
        <Typography noWrap sx={{ fontWeight: 500 }}>{nombre}</Typography>
        <Typography className="cifras" sx={{ fontWeight: 500 }}>{pesos(monto)}</Typography>
      </Stack>

      {avance && prestamo?.plazos && (
        <>
          <RejillaDePagos pagos={avance.pagos} importe={importeDePago(prestamo.plazos)} />
          <Typography variant="caption" color="text.secondary" className="cifras">
            {avance.transcurridos} de {prestamo.plazos.pagos} · faltan {pesos(avance.falta)} de {pesos(prestamo.plazos.total)}
          </Typography>
        </>
      )}
    </Stack>
  )
}
