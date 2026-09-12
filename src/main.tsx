import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import '@fontsource-variable/roboto'
import './index.css'

import { tema } from './app/tema'
import { App } from './app/App'
import { registrarServiceWorker } from './app/pwa'
import { ProveedorAlmacen } from './shared/almacen/Almacen'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={tema} defaultMode="system">
      <CssBaseline />
      {/* Sin adaptador: la app vive en /deudas/, no en la raíz del dominio. */}
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <ProveedorAlmacen>
          <App />
        </ProveedorAlmacen>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)

registrarServiceWorker()
