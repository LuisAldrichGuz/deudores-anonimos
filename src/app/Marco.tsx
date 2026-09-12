import { useState } from 'react'
import type { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import AddRounded from '@mui/icons-material/AddRounded'
import CloseRounded from '@mui/icons-material/CloseRounded'
import SettingsRounded from '@mui/icons-material/SettingsRounded'

import { DESTINOS } from './rutas'
import PantallaAjustes from '../features/ajustes/PantallaAjustes'

/* El armazón: barra arriba con el nombre y el engrane, navegación abajo con el
   botón de añadir en medio.

   Abajo y no arriba porque esto se usa con una mano en el camión: lo que se
   toca vive donde llega el pulgar. La misma forma en teléfono y en escritorio
   — una sola que mantener, y en ancho grande el contenido se centra. */

const ALTO_NAV = 72

export function Marco({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const navegar = useNavigate()
  const [ajustes, setAjustes] = useState(false)

  return (
    <Box sx={{ minHeight: '100%', bgcolor: 'background.default' }}>
      <AppBar position="sticky" sx={{ bgcolor: 'background.default', color: 'text.primary' }}>
        <Container maxWidth="sm" disableGutters>
          <Toolbar sx={{ gap: 1, minHeight: 56 }}>
            <Typography variant="overline" sx={{ flex: 1, color: 'text.disabled' }}>
              Deudores Anónimos
            </Typography>
            <IconButton onClick={() => setAjustes(true)} aria-label="Ajustes"
              sx={{ border: 1, borderColor: 'divider' }}>
              <SettingsRounded fontSize="small" />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      <Container
        maxWidth="sm"
        sx={{ pt: 1, pb: `calc(${ALTO_NAV}px + env(safe-area-inset-bottom) + 16px)` }}
      >
        {children}
      </Container>

      <Paper
        elevation={0}
        sx={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: (t) => t.zIndex.appBar,
          borderTop: 1, borderColor: 'divider', borderRadius: 0,
          pb: 'env(safe-area-inset-bottom)',
        }}
      >
        <Container maxWidth="sm" disableGutters>
          <Stack direction="row" sx={{ alignItems: 'center', px: 2, py: 1 }}>
            <Boton destino={0} pathname={pathname} alIr={navegar} />
            <Boton destino={1} pathname={pathname} alIr={navegar} />

            <Box sx={{ px: 1 }}>
              <IconButton
                onClick={() => navegar('/pagos?nuevo=1')}
                aria-label="Agregar una deuda"
                sx={{
                  width: 52, height: 52, bgcolor: 'text.primary', color: 'background.default',
                  '&:hover': { bgcolor: 'text.primary', opacity: .88 },
                }}
              >
                <AddRounded />
              </IconButton>
            </Box>

            <Boton destino={2} pathname={pathname} alIr={navegar} />
            {/* Un hueco del mismo peso que un destino: sin él, los tres botones
                quedan descentrados respecto al de añadir. */}
            <Box sx={{ flex: 1 }} />
          </Stack>
        </Container>
      </Paper>

      <Dialog open={ajustes} onClose={() => setAjustes(false)} fullWidth maxWidth="sm" scroll="body">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ flex: 1 }}>Ajustes</Box>
          <IconButton onClick={() => setAjustes(false)} aria-label="Cerrar"><CloseRounded /></IconButton>
        </DialogTitle>
        <DialogContent><PantallaAjustes /></DialogContent>
      </Dialog>
    </Box>
  )
}

function Boton({ destino, pathname, alIr }: {
  destino: number
  pathname: string
  alIr: (r: string) => void
}) {
  const { ruta, etiqueta, Icono } = DESTINOS[destino]
  const activo = ruta === pathname

  return (
    <Stack
      onClick={() => alIr(ruta)}
      role="button" tabIndex={0} aria-current={activo ? 'page' : undefined}
      sx={{
        flex: 1, alignItems: 'center', gap: .5, py: .75, cursor: 'pointer', borderRadius: 3,
        color: activo ? 'text.primary' : 'text.disabled',
        transition: 'color .2s',
        '&:hover': { color: 'text.primary' },
      }}
    >
      <Icono sx={{ fontSize: 22 }} />
      <Typography variant="caption" sx={{ fontSize: '.625rem', fontWeight: activo ? 600 : 400 }}>
        {etiqueta}
      </Typography>
    </Stack>
  )
}
