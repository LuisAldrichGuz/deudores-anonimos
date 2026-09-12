import { useState } from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import ContentPasteRounded from '@mui/icons-material/ContentPasteRounded'

import type { Datos } from '../almacen/datos'
import { ArchivoInvalido, leerTexto } from '../almacen/archivo'

/** Pegar el JSON a mano, sin pasar por el selector de archivos.

    ⚠️ No es un adorno: en el móvil, elegir un archivo es la parte que falla.
    Muchos gestores de Android no reconocen un .json y ni siquiera lo enseñan
    en la lista, así que sin esto no hay manera de traerse los datos desde el
    teléfono. Pegar siempre funciona. */
export function BotonPegarJson({
  texto = 'Pegar el JSON', ancho, alCargar,
}: {
  texto?: string
  ancho?: boolean
  alCargar: (d: Datos) => void
}) {
  const [abierto, setAbierto] = useState(false)
  const [pegado, setPegado] = useState('')
  const [error, setError] = useState('')

  const cerrar = () => { setAbierto(false); setPegado(''); setError('') }

  const cargar = () => {
    try {
      alCargar(leerTexto(pegado))
      cerrar()
    } catch (e) {
      setError(e instanceof ArchivoInvalido ? e.message : 'No se pudo leer.')
    }
  }

  return (
    <>
      <Button variant="text" fullWidth={ancho} startIcon={<ContentPasteRounded />}
        onClick={() => setAbierto(true)}>
        {texto}
      </Button>

      <Dialog open={abierto} onClose={cerrar} fullWidth maxWidth="sm">
        <DialogTitle>Pegar el JSON</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus multiline minRows={8} maxRows={14}
            placeholder='{ "version": 1, "perfil": { … } }'
            value={pegado}
            error={!!error}
            helperText={error || undefined}
            onChange={(e) => { setPegado(e.target.value); setError('') }}
            slotProps={{
              // Sin las correcciones del teclado: en el móvil te cambian las
              // comillas rectas por tipográficas y el JSON deja de parsear.
              htmlInput: {
                autoCapitalize: 'off', autoCorrect: 'off', spellCheck: false,
                style: { fontFamily: '"JetBrains Mono Variable", monospace', fontSize: '.75rem' },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={cerrar}>Cancelar</Button>
          <Button variant="contained" onClick={cargar} disabled={!pegado.trim()}>Cargar</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
