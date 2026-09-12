import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import type { SvgIconComponent } from '@mui/icons-material'

/* Lo que se ve cuando todavía no hay nada. Siempre con la acción que lo
   arregla: una pantalla que solo dice «sin datos» deja al usuario buscando
   dónde se añaden. */
export function Vacio({
  Icono, titulo, texto, accion, alPulsar,
}: {
  Icono: SvgIconComponent
  titulo: string
  texto: string
  accion?: string
  alPulsar?: () => void
}) {
  return (
    <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
      <Icono sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
      <Typography variant="h6" sx={{ mb: .5 }}>{titulo}</Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 380, mx: 'auto', mb: accion ? 3 : 0 }}>
        {texto}
      </Typography>
      {accion && <Button variant="contained" onClick={alPulsar}>{accion}</Button>}
    </Box>
  )
}
