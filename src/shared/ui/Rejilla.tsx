import Box from '@mui/material/Box'
import type { BoxProps } from '@mui/material/Box'
import type { ReactNode } from 'react'

/* Rejilla responsiva de una línea: una columna en el móvil, `columnas` en
   pantalla ancha. Es CSS grid puro a propósito — el componente <Grid> de MUI
   cambió de API dos veces en tres versiones mayores y esto no cambia nunca. */
export function Rejilla({
  children, columnas = 3, sx, ...resto
}: { children: ReactNode; columnas?: 2 | 3 | 4 } & BoxProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: `repeat(${columnas}, 1fr)` },
        ...sx,
      }}
      {...resto}
    >
      {children}
    </Box>
  )
}
