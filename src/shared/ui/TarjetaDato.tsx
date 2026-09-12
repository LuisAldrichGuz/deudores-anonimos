import type { ReactNode } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { SvgIconComponent } from '@mui/icons-material'

/* Un número con su nombre y, si hace falta, la frase que lo explica.
   Se repite en media app: la portada, el plan y el detalle de cada tarjeta. */
export function TarjetaDato({
  titulo, valor, pie, Icono, color = 'text.primary', destacado,
}: {
  titulo: string
  valor: ReactNode
  pie?: ReactNode
  Icono?: SvgIconComponent
  /** Token del tema, nunca un hex: así el modo oscuro no se queda atrás. */
  color?: string
  destacado?: boolean
}) {
  return (
    <Card sx={destacado ? { bgcolor: 'primary.contenedor', color: 'primary.sobreContenedor', border: 0 } : undefined}>
      <CardContent>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
          {Icono && <Icono fontSize="small" sx={{ color: destacado ? 'inherit' : 'text.secondary' }} />}
          <Typography variant="overline" sx={{ color: destacado ? 'inherit' : 'text.secondary', lineHeight: 1.6 }}>
            {titulo}
          </Typography>
        </Stack>
        <Typography variant="h3" className="cifras" sx={{ color: destacado ? 'inherit' : color, fontWeight: 500 }}>
          {valor}
        </Typography>
        {pie && (
          <Typography variant="body2" sx={{ mt: 0.5, color: destacado ? 'inherit' : 'text.secondary', opacity: destacado ? .9 : 1 }}>
            {pie}
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}
