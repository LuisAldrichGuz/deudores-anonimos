import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Step from '@mui/material/Step'
import StepContent from '@mui/material/StepContent'
import StepLabel from '@mui/material/StepLabel'
import Stepper from '@mui/material/Stepper'
import Typography from '@mui/material/Typography'

import type { DeudaViva } from '../../shared/finanzas/amortizacion'
import type { Estrategia, Simulacion } from '../../shared/finanzas/estrategias'
import { sumarMeses, textoFecha } from '../../shared/finanzas/fechas'
import { pesos, porcentaje, textoDuracion } from '../../shared/formato/moneda'

/* El plan en pasos: a cuál le pegas primero y qué pasa cuando cae.

   La parte que casi nadie explica es la última línea de cada paso: el pago de
   la deuda que se acaba NO se gasta, se suma al ataque de la siguiente. Ese
   es todo el truco de la bola de nieve, y sin decirlo el orden parece
   arbitrario. */
export function OrdenDeAtaque({
  plan, estrategia, deudas,
}: {
  plan: Simulacion
  estrategia: Estrategia
  deudas: DeudaViva[]
}) {
  const porId = new Map(deudas.map((d) => [d.id, d]))
  let liberado = 0

  return (
    <Card>
      <CardContent>
        <Typography variant="overline" color="text.secondary">En qué orden caen</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: .5, mb: 2 }}>
          {estrategia === 'avalancha'
            ? 'De la tasa más alta a la más baja: cada peso extra vale más donde más caro cobran.'
            : 'De la más chica a la más grande: la primera cae pronto y eso es lo que sostiene el plan.'}
        </Typography>

        {plan.liquidaciones.length === 0 ? (
          <Typography color="text.secondary">
            Con el abono actual no se liquida ninguna. Sube el abono y vuelve a mirar.
          </Typography>
        ) : (
          <Stepper orientation="vertical" activeStep={-1}>
            {plan.liquidaciones.map((l, i) => {
              const deuda = porId.get(l.id)
              const antes = liberado
              liberado += deuda?.pagoMensual ?? 0
              return (
                <Step key={l.id} expanded>
                  <StepLabel>
                    <Typography sx={{ fontWeight: 500 }}>{l.nombre}</Typography>
                  </StepLabel>
                  <StepContent>
                    <Typography variant="body2" color="text.secondary">
                      Cae en {textoDuracion(l.mes)} — por {textoFecha(sumarMeses(new Date(), l.mes), true)}.
                      {deuda && ` Debes ${pesos(deuda.saldo)} al ${porcentaje(deuda.tasaAnual, 1)} anual.`}
                    </Typography>
                    {deuda && deuda.pagoMensual > 0 && (
                      <Typography variant="body2" sx={{ mt: .5, color: 'primary.main' }}>
                        A partir de ahí, sus {pesos(deuda.pagoMensual)} al mes se van completos
                        a la siguiente{i > 0 ? ` (con los ${pesos(antes)} que ya venías arrastrando)` : ''}.
                      </Typography>
                    )}
                  </StepContent>
                </Step>
              )
            })}
          </Stepper>
        )}
      </CardContent>
    </Card>
  )
}
