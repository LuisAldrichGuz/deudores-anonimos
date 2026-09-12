import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

/* Una barra con su etiqueta a los lados. */
export function Medidor({
  izquierda, derecha, porcentaje, color = 'primary',
}: {
  izquierda: string
  derecha?: string
  porcentaje: number
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'
}) {
  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', mb: .75 }}>
        <Typography variant="body2" color="text.secondary">{izquierda}</Typography>
        {derecha && <Typography variant="body2" className="cifras" sx={{ fontWeight: 500 }}>{derecha}</Typography>}
      </Stack>
      <LinearProgress
        variant="determinate"
        color={color}
        // Pasarse del 100 % es normal (debes más de lo que ganas). La barra se
        // queda llena; el número de al lado es el que dice la verdad.
        value={Math.min(100, Math.max(0, porcentaje))}
      />
    </Box>
  )
}
