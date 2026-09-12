import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import type { Panorama, Salud } from '../../shared/finanzas/panorama'
import { Medidor } from '../../shared/ui/Medidor'
import { porcentaje } from '../../shared/formato/moneda'

const LETRERO: Record<Salud, { texto: string; color: 'success' | 'warning' | 'error'; frase: string }> = {
  bien: {
    texto: 'Vas bien', color: 'success',
    frase: 'Tus pagos caben de sobra en lo que ganas. El margen es lo que te deja ahorrar o adelantar deuda.',
  },
  cuidado: {
    texto: 'Con cuidado', color: 'warning',
    frase: 'Cabe, pero justo. Un gasto imprevisto te obligaría a pagar con tarjeta, que es como empieza la bola de nieve.',
  },
  peligro: {
    texto: 'Apretado', color: 'error',
    frase: 'Estás comprometiendo demasiado de lo que ganas. Mira el plan: mover el orden de los pagos ya cambia la fecha de salida.',
  },
}

/* Dos porcentajes y un veredicto.

   Los cortes no son inventados: el pago de deuda sobre ingreso es el mismo
   criterio con el que un banco decide si te presta, y arriba del 30 % de uso
   de tus líneas ya pesa en tu historial. Se dicen en la propia pantalla para
   que el semáforo no sea una opinión sin fuente. */
export function Semaforo({ panorama }: { panorama: Panorama }) {
  const { salud, porcentajeComprometido, porcentajeDeuda, usoDeCredito } = panorama
  const letrero = LETRERO[salud]

  return (
    <Card>
      <CardContent>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2 }}>
          <Typography variant="overline" color="text.secondary">Cómo vas</Typography>
          <Chip size="small" color={letrero.color} label={letrero.texto} />
        </Stack>

        <Stack spacing={2}>
          <Medidor
            izquierda="De tu ingreso ya está comprometido"
            derecha={porcentaje(porcentajeComprometido)}
            porcentaje={porcentajeComprometido}
            color={porcentajeComprometido > 90 ? 'error' : porcentajeComprometido > 70 ? 'warning' : 'primary'}
          />
          <Medidor
            izquierda="Se va en pagar deudas (sano: menos del 15 %)"
            derecha={porcentaje(porcentajeDeuda)}
            porcentaje={porcentajeDeuda}
            color={porcentajeDeuda > 30 ? 'error' : porcentajeDeuda > 15 ? 'warning' : 'primary'}
          />
          <Medidor
            izquierda="Usas de tus tarjetas (sano: menos del 30 %)"
            derecha={porcentaje(usoDeCredito)}
            porcentaje={usoDeCredito}
            color={usoDeCredito > 50 ? 'error' : usoDeCredito > 30 ? 'warning' : 'primary'}
          />
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          {letrero.frase}
        </Typography>
      </CardContent>
    </Card>
  )
}
