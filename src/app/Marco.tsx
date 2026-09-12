import type { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import Container from '@mui/material/Container'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Paper from '@mui/material/Paper'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

import { DESTINOS } from './rutas'

const ANCHO_CARRIL = 240

/* El armazón: barra de abajo en el móvil, carril fijo en el escritorio.

   Los dos leen la MISMA lista de destinos (rutas.ts). La navegación no se
   duplica: se pinta dos veces. */
export function Marco({ children }: { children: ReactNode }) {
  const theme = useTheme()
  const escritorio = useMediaQuery(theme.breakpoints.up('md'))
  const { pathname } = useLocation()
  const actual = DESTINOS.find((d) => d.ruta === pathname) ?? DESTINOS[0]

  return (
    <Box sx={{ display: 'flex', minHeight: '100%', bgcolor: 'background.default' }}>
      {escritorio && (
        <Drawer
          variant="permanent"
          sx={{
            width: ANCHO_CARRIL,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: ANCHO_CARRIL,
              boxSizing: 'border-box',
              borderRight: 1,
              borderColor: 'divider',
              bgcolor: 'background.default',
            },
          }}
        >
          <Toolbar sx={{ px: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 500, letterSpacing: '-.01em' }}>
              Deudores<br />Anónimos
            </Typography>
          </Toolbar>

          <List sx={{ px: 1.5 }}>
            {DESTINOS.map(({ ruta, etiqueta, Icono }) => {
              const activo = ruta === pathname
              return (
                <ListItemButton
                  key={ruta}
                  component={NavLink}
                  to={ruta}
                  selected={activo}
                  sx={{
                    borderRadius: 999,
                    mb: 0.5,
                    // El estado activo de Material 3 es una píldora de color,
                    // no un subrayado ni un borde.
                    '&.Mui-selected': {
                      bgcolor: 'secondary.contenedor',
                      color: 'secondary.sobreContenedor',
                      '& .MuiListItemIcon-root': { color: 'inherit' },
                      '&:hover': { bgcolor: 'secondary.contenedor' },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}><Icono /></ListItemIcon>
                  <ListItemText primary={etiqueta} slotProps={{ primary: { sx: { fontWeight: activo ? 600 : 400 } } }} />
                </ListItemButton>
              )
            })}
          </List>
        </Drawer>
      )}

      <Box component="main" sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {!escritorio && (
          <AppBar
            position="sticky"
            sx={{ bgcolor: 'background.default', color: 'text.primary', borderBottom: 1, borderColor: 'divider' }}
          >
            <Toolbar>
              <Typography variant="h6" sx={{ fontWeight: 500 }}>{actual.titulo}</Typography>
            </Toolbar>
          </AppBar>
        )}

        <Container
          maxWidth="lg"
          sx={{
            flex: 1,
            py: { xs: 2, md: 4 },
            // Hueco para la barra de abajo + el área segura del iPhone.
            pb: { xs: 'calc(88px + env(safe-area-inset-bottom))', md: 4 },
          }}
        >
          {escritorio && (
            <Typography variant="h2" sx={{ mb: 3 }}>{actual.titulo}</Typography>
          )}
          {children}
        </Container>
      </Box>

      {!escritorio && (
        <Paper
          elevation={3}
          sx={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: (t) => t.zIndex.appBar,
            pb: 'env(safe-area-inset-bottom)', borderRadius: 0,
          }}
        >
          <BottomNavigation showLabels value={actual.ruta}>
            {DESTINOS.map(({ ruta, etiqueta, Icono }) => (
              <BottomNavigationAction
                key={ruta}
                component={NavLink}
                to={ruta}
                value={ruta}
                label={etiqueta}
                icon={<Icono />}
              />
            ))}
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  )
}
