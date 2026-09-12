import { useEffect, useRef, useState } from 'react'
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
import UploadRounded from '@mui/icons-material/UploadRounded'
import DeleteForeverRounded from '@mui/icons-material/DeleteForeverRounded'
import InstallMobileRounded from '@mui/icons-material/InstallMobileRounded'
import LockRounded from '@mui/icons-material/LockRounded'

import { useAlmacen } from '../../shared/almacen/Almacen'
import { DATOS_DE_EJEMPLO } from '../../shared/almacen/ejemplo'
import type { FrecuenciaIngreso } from '../../shared/almacen/datos'
import { CampoDinero, CampoDiaDelMes } from '../../shared/ui/CamposNumericos'
import { DIAS_SEMANA } from '../../shared/finanzas/fechas'
import { ingresoMensual } from '../../shared/finanzas/periodos'
import { pesos } from '../../shared/formato/moneda'
import { Rejilla } from '../../shared/ui/Rejilla'
import { ArchivoInvalido, descargar, leerArchivo } from './archivo-de-datos'
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

  const entrada = useRef<HTMLInputElement>(null)
  const [aviso, setAviso] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null)
  const [confirmarBorrado, setConfirmarBorrado] = useState(false)
  const [puedeInstalar, setPuedeInstalar] = useState(sePuedeInstalar)

  useEffect(() => alCambiarInstalacion(setPuedeInstalar), [])

  const cambiarPerfil = (parte: Partial<typeof perfil>) =>
    cambiar((d) => ({ ...d, perfil: { ...d.perfil, ...parte } }))

  const importar = async (archivo: File) => {
    try {
      reemplazar(await leerArchivo(archivo))
      setAviso({ tipo: 'success', texto: 'Listo, tus datos se cargaron.' })
    } catch (e) {
      setAviso({
        tipo: 'error',
        texto: e instanceof ArchivoInvalido ? e.message : 'No se pudo leer el archivo.',
      })
    }
  }

  return (
    <Stack spacing={2}>
      {aviso && <Alert severity={aviso.tipo} onClose={() => setAviso(null)} sx={{ borderRadius: 3 }}>{aviso.texto}</Alert>}

      <Card>
        <CardContent>
          <Typography variant="overline" color="text.secondary">Tu ingreso</Typography>
          <Stack spacing={2.5} sx={{ mt: 2, maxWidth: 420 }}>
            <CampoDinero
              etiqueta="Cuánto te cae cada vez que te pagan"
              valor={perfil.ingreso}
              alCambiar={(ingreso) => cambiarPerfil({ ingreso })}
              ayuda={`Son ${pesos(ingresoMensual(perfil))} al mes.`}
            />
            <TextField select label="Cada cuándo te pagan" value={perfil.frecuencia}
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
              <TextField select label="Qué día de la semana" value={perfil.diaSemanaCobro ?? 5}
                onChange={(e) => cambiarPerfil({ diaSemanaCobro: Number(e.target.value) })}>
                {DIAS_SEMANA.map((d, i) => <MenuItem key={d} value={i} sx={{ textTransform: 'capitalize' }}>{d}</MenuItem>)}
              </TextField>
            ) : (
              <Stack direction="row" spacing={2}>
                <CampoDiaDelMes etiqueta="Primer día de pago" valor={perfil.diasDeCobro[0] ?? 1}
                  alCambiar={(d) => cambiarPerfil({ diasDeCobro: [d, ...perfil.diasDeCobro.slice(1)] })} />
                {perfil.frecuencia === 'quincenal' && (
                  <CampoDiaDelMes etiqueta="Segundo día de pago" valor={perfil.diasDeCobro[1] ?? 31}
                    alCambiar={(d) => cambiarPerfil({ diasDeCobro: [perfil.diasDeCobro[0] ?? 15, d] })} />
                )}
              </Stack>
            )}

            <TextField select label="Meses de colchón que quieres tener"
              value={perfil.colchonMeses}
              helperText="Para calcular tu fondo de emergencia. Lo normal son 3 a 6 meses."
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

            <Stack direction="row" spacing={1.5} sx={{
              p: 2, my: 2, borderRadius: 3,
              bgcolor: 'primary.contenedor', color: 'primary.sobreContenedor',
            }}>
              <LockRounded fontSize="small" sx={{ mt: '2px' }} />
              <Typography variant="body2">
                Todo está guardado en <strong>{dondeSeGuarda}</strong>. No hay cuenta,
                no hay servidor y nada de esto viaja por internet. Si borras los datos
                del navegador, se va contigo.
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
              <Button variant="contained" startIcon={<DownloadRounded />} onClick={() => descargar(datos)}>
                Descargar mi JSON
              </Button>
              <Button variant="outlined" startIcon={<UploadRounded />} onClick={() => entrada.current?.click()}>
                Cargar un JSON
              </Button>
              <input
                ref={entrada} type="file" accept="application/json,.json" hidden
                onChange={(e) => {
                  const archivo = e.target.files?.[0]
                  if (archivo) void importar(archivo)
                  // Sin esto, elegir DOS VECES el mismo archivo no dispara el
                  // evento y parece que la app se quedó colgada.
                  e.target.value = ''
                }}
              />
            </Stack>

            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', mt: 2 }}>
              <Button size="small" onClick={() => reemplazar(DATOS_DE_EJEMPLO)}>
                Cargar datos de ejemplo
              </Button>
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
              <Typography variant="body2">Ya la tienes instalada. Funciona sin internet.</Typography>
            ) : puedeInstalar ? (
              <Button variant="outlined" startIcon={<InstallMobileRounded />} onClick={() => void instalar()}>
                Instalar en este dispositivo
              </Button>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Se instala desde el menú del navegador: «Instalar app» en Chrome,
                o «Compartir → Añadir a pantalla de inicio» en iPhone.
              </Typography>
            )}
          </CardContent>
        </Card>
      </Rejilla>

      <Dialog open={confirmarBorrado} onClose={() => setConfirmarBorrado(false)}>
        <DialogTitle>¿Borrar todo?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Se van tus tarjetas, tus deudas, tus gastos y tus metas. Como nada de esto
            está en ningún servidor, <strong>no hay manera de recuperarlo</strong>.
            Si quieres una copia, descarga tu JSON antes.
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
