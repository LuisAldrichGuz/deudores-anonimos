import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { useColorScheme } from '@mui/material/styles'
import DownloadRounded from '@mui/icons-material/DownloadRounded'
import DeleteForeverRounded from '@mui/icons-material/DeleteForeverRounded'
import InstallMobileRounded from '@mui/icons-material/InstallMobileRounded'
import LockRounded from '@mui/icons-material/LockRounded'

import { useAlmacen } from '../../shared/almacen/Almacen'
import type { FrecuenciaIngreso } from '../../shared/almacen/datos'
import { CampoDinero, CampoDiaDelMes } from '../../shared/ui/CamposNumericos'
import { DIAS_SEMANA } from '../../shared/finanzas/fechas'
import { Rejilla } from '../../shared/ui/Rejilla'
import { descargar } from '../../shared/almacen/archivo'
import { BotonCargarArchivo } from '../../shared/ui/BotonCargarArchivo'
import { alCambiarInstalacion, estaInstalada, instalar, sePuedeInstalar } from '../../app/pwa'

const FRECUENCIAS: { valor: FrecuenciaIngreso; texto: string }[] = [
  { valor: 'quincenal', texto: 'Cada quincena' },
  { valor: 'mensual', texto: 'Una vez al mes' },
  { valor: 'semanal', texto: 'Cada semana' },
]

export default function PantallaAjustes() {
  const { datos, cambiar, reemplazar, borrarTodo, dondeSeGuarda } = useAlmacen()
  const { mode, setMode } = useColorScheme()
  const { perfil } = datos

  const [aviso, setAviso] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null)
  const [confirmarBorrado, setConfirmarBorrado] = useState(false)
  const [puedeInstalar, setPuedeInstalar] = useState(sePuedeInstalar)

  useEffect(() => alCambiarInstalacion(setPuedeInstalar), [])

  const cambiarPerfil = (parte: Partial<typeof perfil>) =>
    cambiar((d) => ({ ...d, perfil: { ...d.perfil, ...parte } }))


  return (
    <Stack spacing={2}>
      {aviso && <Alert severity={aviso.tipo} onClose={() => setAviso(null)} sx={{ borderRadius: 3 }}>{aviso.texto}</Alert>}

      <Card>
        <CardContent>
          <Typography variant="overline" color="text.secondary">Tu ingreso</Typography>
          <Stack spacing={2.5} sx={{ mt: 2, maxWidth: 420 }}>
            <CampoDinero
              etiqueta="Cuánto te pagan"
              valor={perfil.ingreso}
              alCambiar={(ingreso) => cambiarPerfil({ ingreso })}
            />
            <TextField select label="Cada cuándo" value={perfil.frecuencia}
              onChange={(e) => {
                const frecuencia = e.target.value as FrecuenciaIngreso
                cambiarPerfil({
                  frecuencia,
                  diasDeCobro: frecuencia === 'mensual' ? [perfil.diasDeCobro[0] ?? 1] : perfil.diasDeCobro,
                  diaSemanaCobro: frecuencia === 'semanal' ? (perfil.diaSemanaCobro ?? 5) : undefined,
                })
              }}>
              {FRECUENCIAS.map((f) => <MenuItem key={f.valor} value={f.valor}>{f.texto}</MenuItem>)}
            </TextField>

            {perfil.frecuencia === 'semanal' ? (
              <TextField select label="Día de la semana" value={perfil.diaSemanaCobro ?? 5}
                onChange={(e) => cambiarPerfil({ diaSemanaCobro: Number(e.target.value) })}>
                {DIAS_SEMANA.map((d, i) => <MenuItem key={d} value={i} sx={{ textTransform: 'capitalize' }}>{d}</MenuItem>)}
              </TextField>
            ) : (
              <Stack direction="row" spacing={2}>
                <CampoDiaDelMes etiqueta="Primer pago" valor={perfil.diasDeCobro[0] ?? 1}
                  alCambiar={(d) => cambiarPerfil({ diasDeCobro: [d, ...perfil.diasDeCobro.slice(1)] })} />
                {perfil.frecuencia === 'quincenal' && (
                  <CampoDiaDelMes etiqueta="Segundo pago" valor={perfil.diasDeCobro[1] ?? 31}
                    alCambiar={(d) => cambiarPerfil({ diasDeCobro: [perfil.diasDeCobro[0] ?? 15, d] })} />
                )}
              </Stack>
            )}

            <TextField select label="Meses de colchón"
              value={perfil.colchonMeses}
              onChange={(e) => cambiarPerfil({ colchonMeses: Number(e.target.value) })}>
              {[1, 2, 3, 4, 5, 6, 9, 12].map((m) => (
                <MenuItem key={m} value={m}>{m} {m === 1 ? 'mes' : 'meses'}</MenuItem>
              ))}
            </TextField>
          </Stack>
        </CardContent>
      </Card>

      <Rejilla columnas={2} sx={{ alignItems: 'start' }}>
        <Card>
          <CardContent>
            <Typography variant="overline" color="text.secondary">Tus datos</Typography>

            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', my: 2 }}>
              <LockRounded fontSize="small" color="primary" />
              <Typography variant="body2" color="text.secondary">
                Guardado en {dondeSeGuarda}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
              <Button variant="contained" startIcon={<DownloadRounded />} onClick={() => descargar(datos)}>
                Descargar mi JSON
              </Button>
              <BotonCargarArchivo
                alCargar={(d) => { reemplazar(d); setAviso({ tipo: 'success', texto: 'Listo, tus datos se cargaron.' }) }}
                alFallar={(texto) => setAviso({ tipo: 'error', texto })}
              />
            </Stack>

            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', mt: 2 }}>
              <Button size="small" color="error" startIcon={<DeleteForeverRounded />}
                onClick={() => setConfirmarBorrado(true)}>
                Borrar todo
              </Button>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="overline" color="text.secondary">La app</Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>Tema</Typography>
            <ToggleButtonGroup exclusive value={mode ?? 'system'} size="small"
              onChange={(_, v: 'light' | 'dark' | 'system' | null) => v && setMode(v)}>
              <ToggleButton value="light" sx={{ borderRadius: '999px 0 0 999px', px: 2 }}>Claro</ToggleButton>
              <ToggleButton value="system" sx={{ px: 2 }}>Automático</ToggleButton>
              <ToggleButton value="dark" sx={{ borderRadius: '0 999px 999px 0', px: 2 }}>Oscuro</ToggleButton>
            </ToggleButtonGroup>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 3, mb: 1 }}>Instalación</Typography>
            {estaInstalada() ? (
              <Typography variant="body2" color="text.secondary">Instalada</Typography>
            ) : puedeInstalar ? (
              <Button variant="outlined" startIcon={<InstallMobileRounded />} onClick={() => void instalar()}>
                Instalar
              </Button>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Desde el menú del navegador
              </Typography>
            )}
          </CardContent>
        </Card>
      </Rejilla>

      <Dialog open={confirmarBorrado} onClose={() => setConfirmarBorrado(false)}>
        <DialogTitle>¿Borrar todo?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            No hay servidor del que recuperarlo. Descarga tu JSON antes si quieres una copia.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmarBorrado(false)}>Cancelar</Button>
          <Button color="error" variant="contained"
            onClick={() => { borrarTodo(); setConfirmarBorrado(false) }}>
            Borrar todo
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
