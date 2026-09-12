import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'

import type { ResumenPeriodo } from '../../shared/finanzas/panorama'
import { pesos } from '../../shared/formato/moneda'
import { diasEntre, textoFecha } from '../../shared/finanzas/fechas'

/* El número grande de la portada: de lo que te van a pagar, cuánto ya no es
   tuyo. Es el dinero que todavía no tienes y que ya está gastado — de ahí el
   nombre del proyecto.

   Va primero y ocupa toda la fila porque es la única cifra que hace cambiar
   una decisión: saberlo el día 14 sirve; saberlo el 20, ya no. */
export function DineroFantasma({ resumen, periodo }: { resumen: ResumenPeriodo; periodo: string }) {
  const { total, sobra, periodo: p } = resumen
  const dias = Math.max(1, diasEntre(p.inicio, p.fin) + 1)
  const alcanza = sobra >= 0
  const porDia = sobra / dias

  return (
    <Card sx={{
      bgcolor: alcanza ? 'primary.contenedor' : 'error.contenedor',
      color: alcanza ? 'primary.sobreContenedor' : 'error.sobreContenedor',
      border: 0,
    }}>
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Typography variant="overline">
          De tu próxima {periodo} · te pagan el {textoFecha(p.inicio)}
        </Typography>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'baseline', flexWrap: 'wrap', my: 1 }}>
          <Typography variant="h1" className="cifras">{pesos(total)}</Typography>
          <Typography variant="h6" sx={{ opacity: .85 }}>ya están comprometidos</Typography>
        </Stack>

        <LinearProgress
          variant="determinate"
          value={p.ingreso > 0 ? Math.min(100, (total / p.ingreso) * 100) : 0}
          sx={{
            my: 2,
            bgcolor: 'rgba(0,0,0,.12)',
            '& .MuiLinearProgress-bar': { bgcolor: 'currentColor' },
          }}
        />

        <Typography>
          {alcanza ? (
            <>
              De los <strong className="cifras">{pesos(p.ingreso)}</strong> te quedarían{' '}
              <strong className="cifras">{pesos(sobra)}</strong> para los {dias} días
              {' '}— unos <strong className="cifras">{pesos(porDia)}</strong> al día.
            </>
          ) : (
            <>
              Te faltan <strong className="cifras">{pesos(-sobra)}</strong> para cubrir esa {periodo}:
              lo comprometido pasa de los {pesos(p.ingreso)} que vas a cobrar.
            </>
          )}
        </Typography>
      </CardContent>
    </Card>
  )
}
