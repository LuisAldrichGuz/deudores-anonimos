import { useState } from 'react'
import type { ComponentType } from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Fab from '@mui/material/Fab'
import Stack from '@mui/material/Stack'
import AddRounded from '@mui/icons-material/AddRounded'
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded'
import type { SvgIconComponent } from '@mui/icons-material'

import { Vacio } from '../../shared/ui/Vacio'

/* Alta, edición y borrado — una sola vez para las cuatro listas.

   Tarjetas, préstamos, gastos fijos y metas se comportan igual: una lista de
   fichas, un botón de añadir, un diálogo con el formulario y un borrar. Lo
   ÚNICO que cambia es cómo se pinta cada ficha y qué campos tiene. Eso es lo
   que pide cada sección; el resto vive aquí.

   ⚠️ La abstracción se escribió con las cuatro ya a la vista, no antes: con
   un solo caso habría sido adivinar. */

export type DefinicionSeccion<T> = {
  /** «tarjeta», «préstamo»… Sale en el botón y en el título del diálogo. */
  singular: string
  Icono: SvgIconComponent
  vacio: { titulo: string; texto: string }
  /** Cómo nace una nueva. Incluye el id. */
  nuevo: () => T
  Ficha: ComponentType<{ item: T; alEditar: () => void }>
  Formulario: ComponentType<{ valor: T; alCambiar: (f: (t: T) => T) => void }>
  /** Qué hace falta para poder guardar. */
  valido: (t: T) => boolean
}

export function SeccionCrud<T extends { id: string }>({
  items, alGuardar, definicion,
}: {
  items: T[]
  alGuardar: (items: T[]) => void
  definicion: DefinicionSeccion<T>
}) {
  const { singular, Icono, vacio, nuevo, Ficha, Formulario, valido } = definicion
  // null = diálogo cerrado. El borrador es una COPIA: si se cancela a medias,
  // la lista no se enteró de nada.
  const [borrador, setBorrador] = useState<T | null>(null)
  const [esNuevo, setEsNuevo] = useState(false)

  const abrirNuevo = () => { setBorrador(nuevo()); setEsNuevo(true) }
  const abrirEdicion = (item: T) => { setBorrador({ ...item }); setEsNuevo(false) }
  const cerrar = () => setBorrador(null)

  const guardar = () => {
    if (!borrador) return
    alGuardar(esNuevo ? [...items, borrador] : items.map((i) => (i.id === borrador.id ? borrador : i)))
    cerrar()
  }

  const borrar = () => {
    if (!borrador) return
    alGuardar(items.filter((i) => i.id !== borrador.id))
    cerrar()
  }

  return (
    <>
      {items.length === 0 ? (
        <Vacio Icono={Icono} titulo={vacio.titulo} texto={vacio.texto}
          accion={`Agregar ${singular}`} alPulsar={abrirNuevo} />
      ) : (
        <Stack spacing={2}>
          {items.map((item) => (
            <Ficha key={item.id} item={item} alEditar={() => abrirEdicion(item)} />
          ))}
          <Button startIcon={<AddRounded />} onClick={abrirNuevo} sx={{ alignSelf: 'flex-start' }}>
            Agregar {singular}
          </Button>
        </Stack>
      )}

      {/* En el móvil el botón de añadir también va flotando: la lista puede
          ser larga y el de arriba se queda fuera de pantalla. */}
      {items.length > 0 && (
        <Fab color="primary" onClick={abrirNuevo} aria-label={`Agregar ${singular}`}
          sx={{
            position: 'fixed', right: 16, display: { xs: 'flex', md: 'none' },
            bottom: 'calc(72px + env(safe-area-inset-bottom))',
          }}>
          <AddRounded />
        </Fab>
      )}

      <Dialog open={borrador !== null} onClose={cerrar} fullWidth maxWidth="xs">
        <DialogTitle>{esNuevo ? `Agregar ${singular}` : `Editar ${singular}`}</DialogTitle>
        <DialogContent>
          {borrador && (
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              <Formulario valor={borrador} alCambiar={(f) => setBorrador((b) => (b ? f(b) : b))} />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {!esNuevo && (
            <Button color="error" startIcon={<DeleteOutlineRounded />} onClick={borrar} sx={{ mr: 'auto' }}>
              Borrar
            </Button>
          )}
          <Button onClick={cerrar}>Cancelar</Button>
          <Button variant="contained" onClick={guardar} disabled={!borrador || !valido(borrador)}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
