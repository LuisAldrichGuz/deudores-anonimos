import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import LockRounded from '@mui/icons-material/LockRounded'

import { CampoDinero } from '../../shared/ui/CamposNumericos'
import { useAlmacen } from '../../shared/almacen/Almacen'
import { DATOS_DE_EJEMPLO } from '../../shared/almacen/ejemplo'
import type { FrecuenciaIngreso } from '../../shared/almacen/datos'
import { DATOS_VACIOS } from '../../shared/almacen/datos'

const FRECUENCIAS: { valor: FrecuenciaIngreso; texto: string; dias: number[] }[] = [
  { valor: 'quincenal', texto: 'Cada quincena', dias: [15, 31] },
  { valor: 'mensual', texto: 'Una vez al mes', dias: [1] },
  { valor: 'semanal', texto: 'Cada semana', dias: [] },
]

/* La primera pantalla. Pide lo mínimo para que la app sirva de algo —cuánto
   entra y cada cuándo— y ofrece la salida de emergencia de todo portafolio:
   ver la app llena sin teclear nada. */
export function Bienvenida() {
  const { reemplazar, cambiar } = useAlmacen()
  const [ingreso, setIngreso] = useState(0)
  const [frecuencia, setFrecuencia] = useState<FrecuenciaIngreso>('quincenal')

  const empezar = () => {
    const elegida = FRECUENCIAS.find((f) => f.valor === frecuencia)!
    cambiar((d) => ({
      ...d,
      perfil: {
        ...DATOS_VACIOS.perfil,
        ingreso,
        frecuencia,
        diasDeCobro: elegida.dias.length ? elegida.dias : [15, 31],
        diaSemanaCobro: frecuencia === 'semanal' ? 5 : undefined,
      },
    }))
  }

  return (
    <Box sx={{ minHeight: '100%', display: 'grid', placeItems: 'center', p: 2, bgcolor: 'background.default' }}>
      <Card sx={{ maxWidth: 460, width: '100%' }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box component="img" src={`${import.meta.env.BASE_URL}icono.svg`} alt=""
            sx={{ width: 56, height: 56, borderRadius: 3, mb: 2, display: 'block' }} />
          <Typography variant="overline" color="primary">Bienvenido a</Typography>
          <Typography variant="h1" sx={{ fontSize: '2.25rem !important', lineHeight: 1.1, mb: 1.5 }}>
            Deudores<br />Anónimos
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Tus tarjetas, tus deudas y tus pagos fijos en un solo lugar, para saber
            cuánto apartar de cada pago antes de gastártelo.
          </Typography>

          <Stack direction="row" spacing={1.5} sx={{
            p: 2, mb: 3, borderRadius: 3,
            bgcolor: 'primary.contenedor', color: 'primary.sobreContenedor',
          }}>
            <LockRounded fontSize="small" sx={{ mt: '2px' }} />
            <Typography variant="body2">
              <strong>Anónimos de verdad.</strong> No hay cuenta ni servidor: todo se
              queda guardado en este dispositivo y puedes descargarlo o borrarlo cuando quieras.
            </Typography>
          </Stack>

          <Stack spacing={2}>
            <CampoDinero
              etiqueta="¿Cuánto te cae cada vez que te pagan?"
              valor={ingreso}
              alCambiar={setIngreso}
              ayuda="Lo que llega a tu cuenta, ya con los descuentos."
            />
            <TextField
              select label="¿Cada cuándo te pagan?" value={frecuencia}
              onChange={(e) => setFrecuencia(e.target.value as FrecuenciaIngreso)}
            >
              {FRECUENCIAS.map((f) => (
                <MenuItem key={f.valor} value={f.valor}>{f.texto}</MenuItem>
              ))}
            </TextField>

            <Button variant="contained" size="large" disabled={ingreso <= 0} onClick={empezar}>
              Empezar
            </Button>
          </Stack>

          <Divider sx={{ my: 3 }}>o</Divider>

          <Button fullWidth variant="outlined" onClick={() => reemplazar(DATOS_DE_EJEMPLO)}>
            Ver la app con datos de ejemplo
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
            Números inventados. Se borran con un botón en Ajustes.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
