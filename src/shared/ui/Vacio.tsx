import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import type { SvgIconComponent } from '@mui/icons-material'

/** Lo que se ve cuando no hay nada, con el botón que lo arregla. */
export function Vacio({ Icono, titulo, accion, alPulsar }: {
  Icono: SvgIconComponent
  titulo: string
  accion?: string
  alPulsar?: () => void
}) {
  return (
    <Box sx={{ textAlign: 'center', py: 6 }}>
      <Icono sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
      <Typography variant="h6" sx={{ mb: accion ? 3 : 0 }}>{titulo}</Typography>
      {accion && <Button variant="contained" onClick={alPulsar}>{accion}</Button>}
    </Box>
  )
}
