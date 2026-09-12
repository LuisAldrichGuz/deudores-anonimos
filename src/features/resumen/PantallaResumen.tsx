import { useMemo } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { Link, useNavigate } from 'react-router-dom'
import CreditCardOffRounded from '@mui/icons-material/CreditCardOffRounded'
import AccountBalanceWalletRounded from '@mui/icons-material/AccountBalanceWalletRounded'
import SavingsRounded from '@mui/icons-material/SavingsRounded'
import EventAvailableRounded from '@mui/icons-material/EventAvailableRounded'
import PaymentsRounded from '@mui/icons-material/PaymentsRounded'

import { useAlmacen } from '../../shared/almacen/Almacen'
import { panorama, resumenSiguiente } from '../../shared/finanzas/panorama'
import { eventosEnRango } from '../../shared/finanzas/compromisos'
import { nombrePeriodo } from '../../shared/finanzas/periodos'
import { hoy, sumarDias } from '../../shared/finanzas/fechas'
import { pesos, porcentaje } from '../../shared/formato/moneda'
import { DineroFantasma } from './DineroFantasma'
import { Semaforo } from './Semaforo'
import { RepartoPorPeriodo } from './RepartoPorPeriodo'
import { TarjetaDato } from '../../shared/ui/TarjetaDato'
import { Medidor } from '../../shared/ui/Medidor'
import { Rejilla } from '../../shared/ui/Rejilla'
import { ListaDePagos } from '../../shared/ui/ListaDePagos'
import { Vacio } from '../../shared/ui/Vacio'

const DIAS_A_LA_VISTA = 12

export default function PantallaResumen() {
  const { datos } = useAlmacen()
  const navegar = useNavigate()

  // Una sola pasada para toda la pantalla: los números se calculan aquí y
  // bajan como props, así ningún hijo puede llegar a otro resultado.
  const foto = useMemo(() => panorama(datos), [datos])
  const siguiente = useMemo(() => resumenSiguiente(datos), [datos])
  const proximos = useMemo(
    () => eventosEnRango(datos, hoy(), sumarDias(hoy(), DIAS_A_LA_VISTA)),
    [datos],
  )

  const sinNada = !datos.tarjetas.length && !datos.prestamos.length && !datos.fijos.length && !datos.metas.length

  if (sinNada) {
    return (
      <Vacio
        Icono={PaymentsRounded}
        titulo="Todavía no hay nada que sumar"
        texto="Agrega tus tarjetas, tus deudas y lo que pagas cada mes. En cuanto haya algo, aquí sale cuánto tienes que apartar de cada pago."
        accion="Agregar mi primer pago"
        alPulsar={() => navegar('/pagos')}
      />
    )
  }

  return (
    <Stack spacing={2}>
      <DineroFantasma resumen={siguiente} periodo={nombrePeriodo(datos.perfil)} />

      <Rejilla>
        <TarjetaDato
          titulo="Debes en total"
          valor={pesos(foto.deudaTotal)}
          Icono={CreditCardOffRounded}
          pie={
            foto.interesMensual > 0
              ? `Solo en intereses se te van ${pesos(foto.interesMensual)} al mes.`
              : 'Sin deudas registradas.'
          }
        />
        <TarjetaDato
          titulo="Apartas al mes"
          valor={pesos(foto.apartadoMensual)}
          Icono={AccountBalanceWalletRounded}
          pie={`${porcentaje(foto.porcentajeComprometido)} de lo que ganas. Incluye la parte mensual de lo que se paga una vez al año.`}
        />
        <TarjetaDato
          titulo="Te queda libre al mes"
          valor={pesos(foto.libreMensual)}
          Icono={SavingsRounded}
          color={foto.libreMensual < 0 ? 'error.main' : 'text.primary'}
          pie={
            foto.libreMensual < 0
              ? 'Estás comprometiendo más de lo que entra.'
              : 'Después de deudas, gastos fijos y lo que apartas.'
          }
        />
      </Rejilla>

      <Semaforo panorama={foto} />

      <Rejilla columnas={2}>
        <Card>
          <CardContent>
            <Typography variant="overline" color="text.secondary">
              Lo que viene en {DIAS_A_LA_VISTA} días
            </Typography>
            {proximos.length ? (
              <ListaDePagos eventos={proximos} />
            ) : (
              <Typography color="text.secondary" sx={{ py: 3 }}>
                Nada a la vista. Los siguientes pagos caen más adelante.
              </Typography>
            )}
            <Button component={Link} to="/calendario" startIcon={<EventAvailableRounded />} sx={{ mt: 1 }}>
              Ver el calendario
            </Button>
          </CardContent>
        </Card>

        <Stack spacing={2}>
          <RepartoPorPeriodo datos={datos} />

          {foto.colchonRecomendado > 0 && (
            <Card>
              <CardContent>
                <Typography variant="overline" color="text.secondary">Fondo de emergencia</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, mt: .5 }}>
                  Lo que necesitas guardado para aguantar {datos.perfil.colchonMeses} meses
                  sin ingresos, pagando lo mismo que hoy.
                </Typography>
                <Medidor
                  izquierda="Llevas guardado"
                  derecha={`${pesos(foto.ahorrado)} de ${pesos(foto.colchonRecomendado)}`}
                  porcentaje={(foto.ahorrado / foto.colchonRecomendado) * 100}
                  color={foto.ahorrado >= foto.colchonRecomendado ? 'primary' : 'warning'}
                />
              </CardContent>
            </Card>
          )}
        </Stack>
      </Rejilla>
    </Stack>
  )
}
