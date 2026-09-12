import { useRef } from 'react'
import Button from '@mui/material/Button'
import UploadRounded from '@mui/icons-material/UploadRounded'

import type { Datos } from '../almacen/datos'
import { ArchivoInvalido, leerArchivo } from '../almacen/archivo'

/** El botón de traerte tu JSON. Está aquí y no en Ajustes porque hace falta
    también en la bienvenida: quien llega con un archivo no debería tener que
    inventarse un sueldo para poder entrar a importarlo. */
export function BotonCargarArchivo({
  texto = 'Cargar un JSON', variante = 'outlined', ancho, alCargar, alFallar,
}: {
  texto?: string
  variante?: 'outlined' | 'contained' | 'text'
  ancho?: boolean
  alCargar: (d: Datos) => void
  alFallar: (mensaje: string) => void
}) {
  const entrada = useRef<HTMLInputElement>(null)

  return (
    <>
      <Button variant={variante} fullWidth={ancho} startIcon={<UploadRounded />}
        onClick={() => entrada.current?.click()}>
        {texto}
      </Button>
      <input
        ref={entrada} type="file" accept="application/json,.json" hidden
        onChange={async (e) => {
          const archivo = e.target.files?.[0]
          // ⚠️ Se limpia SIEMPRE: sin esto, elegir dos veces el mismo archivo no
          // dispara el evento y parece que la app se quedó colgada.
          e.target.value = ''
          if (!archivo) return
          try {
            alCargar(await leerArchivo(archivo))
          } catch (err) {
            alFallar(err instanceof ArchivoInvalido ? err.message : 'No se pudo leer el archivo.')
          }
        }}
      />
    </>
  )
}
