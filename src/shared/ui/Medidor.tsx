import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

/** Una barra con su etiqueta a los lados. Crece al entrar, una vez. */
export function Medidor({
  izquierda, derecha, porcentaje, color = 'primary.main', alto = 8, retraso = 0.3,
}: {
  izquierda: string
  derecha?: string
  porcentaje: number
  /** Un token del tema o uno de ACENTO. */
  color?: string
  alto?: number
  retraso?: number
}) {
  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 1, gap: 2 }}>
        <Typography variant="body2" color="text.secondary" noWrap>{izquierda}</Typography>
        {derecha && (
          <Typography variant="body2" className="cifras" sx={{ fontWeight: 500 }} noWrap>{derecha}</Typography>
        )}
      </Stack>
      <Box sx={{ height: alto, borderRadius: 999, bgcolor: 'action.disabledBackground', overflow: 'hidden' }}>
        <Box
          className="crece"
          style={{ animationDelay: `${retraso}s` }}
          sx={{
            height: '100%', borderRadius: 999, bgcolor: color,
            // Pasarse del 100 % es normal (debes más de lo que ganas). La barra
            // se queda llena; el número de al lado dice la verdad.
            width: `${Math.min(100, Math.max(0, porcentaje))}%`,
          }}
        />
      </Box>
    </Box>
  )
}
