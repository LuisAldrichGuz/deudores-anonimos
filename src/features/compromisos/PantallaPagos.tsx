import { useState } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useSearchParams } from 'react-router-dom'

import { useAlmacen } from '../../shared/almacen/Almacen'
import { SeccionCrud } from './SeccionCrud'
import { SECCION_TARJETAS } from './tarjetas/seccion-tarjetas'
import { SECCION_PRESTAMOS } from './prestamos/seccion-prestamos'
import { SECCION_FIJOS } from './fijos/seccion-fijos'
import { SECCION_METAS } from './metas/seccion-metas'

/* Las cuatro listas, en fichas en vez de pestañas.

   Esta pantalla no sabe nada de tarjetas ni de metas: solo conecta cada
   sección con su parte del estado. Lo que cambia de una a otra —cómo se pinta
   la ficha y qué campos tiene— lo pide cada sección; el alta, la edición y el
   borrado los resuelve `SeccionCrud` una sola vez para las cuatro. */
export default function PantallaPagos() {
  const { datos, cambiar } = useAlmacen()
  const [busca, setBusca] = useSearchParams()
  const [cual, setCual] = useState(0)

  // El botón de añadir de la barra de abajo entra por aquí.
  const pedido = busca.get('nuevo') === '1'
  const limpiar = () => setBusca({}, { replace: true })

  const fichas = [
    { etiqueta: 'Deudas', cuantos: datos.prestamos.length },
    { etiqueta: 'Gastos fijos', cuantos: datos.fijos.length },
    { etiqueta: 'Tarjetas', cuantos: datos.tarjetas.length },
    { etiqueta: 'Ahorro', cuantos: datos.metas.length },
  ]

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }} useFlexGap>
        {fichas.map((f, i) => {
          const activa = i === cual
          return (
            <Box
              key={f.etiqueta}
              onClick={() => setCual(i)}
              role="button" tabIndex={0}
              sx={{
                px: 2, py: 1.5, borderRadius: 999, cursor: 'pointer',
                fontSize: '.8125rem', fontWeight: activa ? 600 : 400,
                bgcolor: activa ? 'text.primary' : 'transparent',
                color: activa ? 'background.default' : 'text.secondary',
                border: 1, borderColor: activa ? 'transparent' : 'divider',
                transition: 'background-color .2s, color .2s',
              }}
            >
              {f.etiqueta}{f.cuantos ? ` · ${f.cuantos}` : ''}
            </Box>
          )
        })}
      </Stack>

      {cual === 0 && (
        <SeccionCrud items={datos.prestamos} definicion={SECCION_PRESTAMOS}
          abrirNuevo={pedido} alAbrir={limpiar}
          alGuardar={(prestamos) => cambiar((d) => ({ ...d, prestamos }))} />
      )}
      {cual === 1 && (
        <SeccionCrud items={datos.fijos} definicion={SECCION_FIJOS}
          alGuardar={(fijos) => cambiar((d) => ({ ...d, fijos }))} />
      )}
      {cual === 2 && (
        <SeccionCrud items={datos.tarjetas} definicion={SECCION_TARJETAS}
          alGuardar={(tarjetas) => cambiar((d) => ({ ...d, tarjetas }))} />
      )}
      {cual === 3 && (
        <SeccionCrud items={datos.metas} definicion={SECCION_METAS}
          alGuardar={(metas) => cambiar((d) => ({ ...d, metas }))} />
      )}

      {fichas[cual].cuantos === 0 && cual !== 0 && (
        <Typography variant="caption" color="text.disabled" sx={{ px: .5 }}>
          El botón de abajo agrega en «Deudas».
        </Typography>
      )}
    </Stack>
  )
}
