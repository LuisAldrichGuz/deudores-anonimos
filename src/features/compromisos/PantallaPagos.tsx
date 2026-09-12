import { useState } from 'react'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'

import { useAlmacen } from '../../shared/almacen/Almacen'
import { SeccionCrud } from './SeccionCrud'
import { SECCION_TARJETAS } from './tarjetas/seccion-tarjetas'
import { SECCION_PRESTAMOS } from './prestamos/seccion-prestamos'
import { SECCION_FIJOS } from './fijos/seccion-fijos'
import { SECCION_METAS } from './metas/seccion-metas'

/* Las cuatro listas, cada una en su pestaña. Esta pantalla no sabe nada de
   tarjetas ni de metas: solo conecta cada sección con su parte del estado. */
export default function PantallaPagos() {
  const { datos, cambiar } = useAlmacen()
  const [pestana, setPestana] = useState(0)

  const pestanas = [
    { etiqueta: 'Tarjetas', cuantos: datos.tarjetas.length },
    { etiqueta: 'Deudas', cuantos: datos.prestamos.length },
    { etiqueta: 'Gastos fijos', cuantos: datos.fijos.length },
    { etiqueta: 'Ahorro', cuantos: datos.metas.length },
  ]

  return (
    <Box>
      <Tabs
        value={pestana}
        onChange={(_, v: number) => setPestana(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        {pestanas.map((p) => (
          <Tab
            key={p.etiqueta}
            label={
              <Badge badgeContent={p.cuantos} color="primary" sx={{ '& .MuiBadge-badge': { right: -18, top: 2 } }}>
                {p.etiqueta}
              </Badge>
            }
          />
        ))}
      </Tabs>

      {pestana === 0 && (
        <SeccionCrud
          items={datos.tarjetas}
          alGuardar={(tarjetas) => cambiar((d) => ({ ...d, tarjetas }))}
          definicion={SECCION_TARJETAS}
        />
      )}
      {pestana === 1 && (
        <SeccionCrud
          items={datos.prestamos}
          alGuardar={(prestamos) => cambiar((d) => ({ ...d, prestamos }))}
          definicion={SECCION_PRESTAMOS}
        />
      )}
      {pestana === 2 && (
        <SeccionCrud
          items={datos.fijos}
          alGuardar={(fijos) => cambiar((d) => ({ ...d, fijos }))}
          definicion={SECCION_FIJOS}
        />
      )}
      {pestana === 3 && (
        <SeccionCrud
          items={datos.metas}
          alGuardar={(metas) => cambiar((d) => ({ ...d, metas }))}
          definicion={SECCION_METAS}
        />
      )}
    </Box>
  )
}
