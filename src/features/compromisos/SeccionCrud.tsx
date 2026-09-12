import { useEffect, useState } from 'react'
import type { ComponentType } from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
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
  vacio: { titulo: string }
  /** Cómo nace una nueva. Incluye el id. */
  nuevo: () => T
  Ficha: ComponentType<{ item: T; alEditar: () => void }>
  Formulario: ComponentType<{ valor: T; alCambiar: (f: (t: T) => T) => void }>
  /** Qué hace falta para poder guardar. */
  valido: (t: T) => boolean
  /** Cómo se ordena en pantalla. Por omisión, como se guardó. */
  ordenar?: (a: T, b: T) => number
}

export function SeccionCrud<T extends { id: string }>({
  items, alGuardar, definicion, abrirNuevo: pedido, alAbrir,
}: {
  items: T[]
  alGuardar: (items: T[]) => void
  definicion: DefinicionSeccion<T>
  /** Para el botón de añadir de la barra de abajo: entra pidiendo el diálogo. */
  abrirNuevo?: boolean
  alAbrir?: () => void
}) {
  const { singular, Icono, vacio, nuevo, Ficha, Formulario, valido, ordenar } = definicion
  // ⚠️ Se ordena una COPIA: `sort` muta, y mutar `items` es reordenar el estado
  // guardado como efecto secundario de pintarlo.
  const enPantalla = ordenar ? [...items].sort(ordenar) : items
  // null = diálogo cerrado. El borrador es una COPIA: si se cancela a medias,
  // la lista no se enteró de nada.
  const [borrador, setBorrador] = useState<T | null>(null)
  const [esNuevo, setEsNuevo] = useState(false)

  const abrirNuevo = () => { setBorrador(nuevo()); setEsNuevo(true) }

  // El botón de la barra navega con `?nuevo=1`; al llegar aquí se abre el
  // diálogo y se avisa para que la dirección se limpie — si no, volver atrás
  // desde otra pantalla lo abriría otra vez.
  useEffect(() => {
    if (!pedido) return
    abrirNuevo()
    alAbrir?.()
    // Solo cuando llega la petición.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pedido])
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
        <Vacio Icono={Icono} titulo={vacio.titulo} accion={`Agregar ${singular}`} alPulsar={abrirNuevo} />
      ) : (
        <Stack spacing={2}>
          {enPantalla.map((item) => (
            <Ficha key={item.id} item={item} alEditar={() => abrirEdicion(item)} />
          ))}
          <Button startIcon={<AddRounded />} onClick={abrirNuevo} sx={{ alignSelf: 'flex-start' }}>
            Agregar {singular}
          </Button>
        </Stack>
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
