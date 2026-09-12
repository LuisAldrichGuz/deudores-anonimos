import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

import { Marco } from './Marco'
import { useAlmacen } from '../shared/almacen/Almacen'
import { Bienvenida } from '../features/bienvenida/Bienvenida'

/* Cada pantalla en su propio trozo. La de «Plan» se lleva la librería de
   gráficas, que pesa más que el resto de la app junta: cargarla en el arranque
   retrasaría la portada por algo que quizá nadie abra. */
const PantallaResumen = lazy(() => import('../features/resumen/PantallaResumen'))
const PantallaCalendario = lazy(() => import('../features/calendario/PantallaCalendario'))
const PantallaPagos = lazy(() => import('../features/compromisos/PantallaPagos'))
const PantallaPlan = lazy(() => import('../features/plan/PantallaPlan'))
const PantallaAjustes = lazy(() => import('../features/ajustes/PantallaAjustes'))

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
          <Route path="/calendario" element={<PantallaCalendario />} />
          <Route path="/pagos" element={<PantallaPagos />} />
          <Route path="/plan" element={<PantallaPlan />} />
          <Route path="/ajustes" element={<PantallaAjustes />} />
          {/* Cualquier otra dirección cae en la portada: es una app de cinco
              pantallas, un «no encontrado» aquí solo sería un callejón. */}
          <Route path="*" element={<PantallaResumen />} />
        </Routes>
      </Suspense>
    </Marco>
  )
}

const Centrado = ({ children }: { children: React.ReactNode }) => (
  <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>{children}</Box>
)
