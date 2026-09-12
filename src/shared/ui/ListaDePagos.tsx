import Avatar from '@mui/material/Avatar'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import CreditCardRounded from '@mui/icons-material/CreditCardRounded'
import AccountBalanceRounded from '@mui/icons-material/AccountBalanceRounded'
import ReceiptLongRounded from '@mui/icons-material/ReceiptLongRounded'
import SavingsRounded from '@mui/icons-material/SavingsRounded'
import ContentCutRounded from '@mui/icons-material/ContentCutRounded'
import type { SvgIconComponent } from '@mui/icons-material'

import type { Evento, TipoEvento } from '../finanzas/compromisos'
import { pesos } from '../formato/moneda'
import { textoFecha, textoRelativo } from '../finanzas/fechas'

/* La lista de «qué cae y cuándo». La usan la portada y el calendario, así que
   el aspecto de un pago se decide UNA vez: si mañana el corte cambia de icono,
   cambia en las dos. */

const PINTA: Record<TipoEvento, { Icono: SvgIconComponent; color: string; fondo: string }> = {
  corte: { Icono: ContentCutRounded, color: 'info.sobreContenedor', fondo: 'info.contenedor' },
  tarjeta: { Icono: CreditCardRounded, color: 'warning.sobreContenedor', fondo: 'warning.contenedor' },
  prestamo: { Icono: AccountBalanceRounded, color: 'secondary.sobreContenedor', fondo: 'secondary.contenedor' },
  fijo: { Icono: ReceiptLongRounded, color: 'secondary.sobreContenedor', fondo: 'secondary.contenedor' },
  ahorro: { Icono: SavingsRounded, color: 'primary.sobreContenedor', fondo: 'primary.contenedor' },
}

export function ListaDePagos({ eventos, conFecha = true }: { eventos: Evento[]; conFecha?: boolean }) {
  return (
    <List disablePadding>
      {eventos.map((e) => {
        const { Icono, color, fondo } = PINTA[e.tipo]
        return (
          <ListItem key={e.id} disableGutters
            secondaryAction={
              e.monto > 0
                ? <Typography className="cifras" sx={{ fontWeight: 500 }}>{pesos(e.monto)}</Typography>
                : <Typography variant="body2" color="text.secondary">corta</Typography>
            }
          >
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: fondo, color }}><Icono fontSize="small" /></Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={e.nombre}
              secondary={conFecha ? `${textoFecha(e.fecha)} · ${textoRelativo(e.fecha)}` : e.detalle}
              slotProps={{ primary: { sx: { fontWeight: 500 } } }}
            />
          </ListItem>
        )
      })}
    </List>
  )
}
