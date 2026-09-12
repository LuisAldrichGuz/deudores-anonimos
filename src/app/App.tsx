import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

import { Marco } from './Marco'
import { useAlmacen } from '../shared/almacen/Almacen'
import { Bienvenida } from '../features/bienvenida/Bienvenida'

/* Cada pantalla en su propio trozo: la de editar no se descarga hasta que
   alguien la abre, y quien solo entra a mirar sus números no la paga. */
const PantallaResumen = lazy(() => import('../features/resumen/PantallaResumen'))
const PantallaPagos = lazy(() => import('../features/compromisos/PantallaPagos'))
const PantallaEstadisticas = lazy(() => import('../features/estadisticas/PantallaEstadisticas'))

export function App() {
  const { listo, primeraVez } = useAlmacen()

  // Hasta que no se sabe qué hay guardado no se pinta nada: enseñar la
  // bienvenida y quitarla medio segundo después parece que se perdió todo.
  if (!listo) return <Centrado><CircularProgress /></Centrado>
  if (primeraVez) return <Bienvenida />

  return (
    <Marco>
      <Suspense fallback={<Centrado><CircularProgress /></Centrado>}>
        <Routes>
          <Route path="/" element={<PantallaResumen />} />
          <Route path="/pagos" element={<PantallaPagos />} />
          <Route path="/stats" element={<PantallaEstadisticas />} />
          {/* Cualquier otra dirección cae en la portada: son tres pantallas, un
              «no encontrado» aquí solo sería un callejón. */}
          <Route path="*" element={<PantallaResumen />} />
        </Routes>
      </Suspense>
    </Marco>
  )
}

const Centrado = ({ children }: { children: React.ReactNode }) => (
  <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>{children}</Box>
)
