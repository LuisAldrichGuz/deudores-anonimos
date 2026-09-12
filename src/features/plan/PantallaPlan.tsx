import { useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import TrendingDownRounded from '@mui/icons-material/TrendingDownRounded'

import { useAlmacen } from '../../shared/almacen/Almacen'
import { deudasVivas } from '../../shared/finanzas/amortizacion'
import { simular } from '../../shared/finanzas/estrategias'
import type { Estrategia } from '../../shared/finanzas/estrategias'
import { textoFecha } from '../../shared/finanzas/fechas'
import { pesos, textoDuracion } from '../../shared/formato/moneda'
import { Rejilla } from '../../shared/ui/Rejilla'
import { TarjetaDato } from '../../shared/ui/TarjetaDato'
import { Vacio } from '../../shared/ui/Vacio'
import { GraficaDeSalida } from './GraficaDeSalida'
import { OrdenDeAtaque } from './OrdenDeAtaque'

const ESTRATEGIAS: { valor: Estrategia; texto: string; explica: string }[] = [
  {
    valor: 'avalancha', texto: 'Avalancha',
    explica: 'Todo lo que te sobre va a la deuda de tasa más alta. Es la que menos intereses paga: con los mismos pesos, sales antes.',
  },
  {
    valor: 'bola-de-nieve', texto: 'Bola de nieve',
    explica: 'Todo lo que te sobre va a la deuda más chica. Pagas un poco más de intereses, pero tachas una deuda antes — y eso es lo que hace que la gente no lo deje a medias.',
  },
]

export default function PantallaPlan() {
  const { datos } = useAlmacen()
  const [estrategia, setEstrategia] = useState<Estrategia>('avalancha')
  const [extra, setExtra] = useState(0)

  const deudas = useMemo(() => deudasVivas(datos), [datos])

  const plan = useMemo(() => simular(deudas, extra, estrategia), [deudas, extra, estrategia])
  const referencia = useMemo(() => simular(deudas, 0, 'minimos'), [deudas])

  if (!deudas.length) {
    return (
      <Vacio
        Icono={TrendingDownRounded}
        titulo="No hay nada de qué salir"
        texto="Cuando agregues una tarjeta o una deuda, aquí sale en qué orden conviene atacarlas y en qué fecha quedarías libre."
      />
    )
  }

  const pagoBase = deudas.reduce((s, d) => s + d.pagoMensual, 0)
  const ahorroIntereses = referencia.interesTotal - plan.interesTotal
  const mesesMenos =
    referencia.meses !== null && plan.meses !== null ? referencia.meses - plan.meses : null

  return (
    <Stack spacing={2}>
      <Card>
        <CardContent>
          <Typography variant="overline" color="text.secondary">Cómo lo atacas</Typography>

          <ToggleButtonGroup
            exclusive value={estrategia} sx={{ my: 2, flexWrap: 'wrap' }}
            onChange={(_, v: Estrategia | null) => v && setEstrategia(v)}
          >
            {ESTRATEGIAS.map((e) => (
              <ToggleButton key={e.valor} value={e.valor} sx={{ borderRadius: 999, px: 3 }}>
                {e.texto}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {ESTRATEGIAS.find((e) => e.valor === estrategia)!.explica}
          </Typography>

          <Typography gutterBottom>
            ¿Y si además le abonas <strong className="cifras">{pesos(extra)}</strong> al mes?
          </Typography>
          <Box sx={{ px: 2 }}>
          <Slider
            value={extra}
            onChange={(_, v) => setExtra(v as number)}
            min={0}
            // Hasta duplicar lo que ya pagas: más allá el deslizador se vuelve
            // imposible de ajustar con el dedo y deja de servir.
            max={Math.max(1000, Math.round(pagoBase))}
            step={50}
            valueLabelDisplay="auto"
            valueLabelFormat={(v) => pesos(v)}
            marks={[
              { value: 0, label: 'nada' },
              { value: Math.max(1000, Math.round(pagoBase)), label: 'el doble' },
            ]}
          />
          </Box>
        </CardContent>
      </Card>

      <Rejilla>
        <TarjetaDato
          destacado
          titulo="Quedarías libre"
          valor={plan.fechaLibre ? textoFecha(plan.fechaLibre, true) : 'nunca'}
          pie={plan.meses !== null
            ? `En ${textoDuracion(plan.meses)} desde hoy.`
            : 'Con este pago los intereses se comen el abono y el saldo no baja.'}
        />
        <TarjetaDato
          titulo="Vas a pagar de intereses"
          valor={pesos(plan.interesTotal)}
          pie={`Sobre los ${pesos(deudas.reduce((s, d) => s + d.saldo, 0))} que debes hoy.`}
        />
        <TarjetaDato
          titulo="Te ahorras"
          valor={pesos(Math.max(0, ahorroIntereses))}
          color="primary.main"
          pie={mesesMenos && mesesMenos > 0
            ? `Y sales ${textoDuracion(mesesMenos)} antes que pagando como hasta ahora.`
            : 'Comparado con seguir pagando lo mismo de siempre, sin reinvertir lo que se libera.'}
        />
      </Rejilla>

      {plan.meses === null && (
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          Con lo que abonas hoy estas deudas no se acaban: cada mes los intereses son mayores
          que lo que pagas. Sube el abono con el deslizador hasta que aparezca una fecha.
        </Alert>
      )}

      <Rejilla columnas={2} sx={{ alignItems: 'start' }}>
        <GraficaDeSalida deudas={deudas} extra={extra} estrategia={estrategia} />
        <OrdenDeAtaque plan={plan} estrategia={estrategia} deudas={deudas} />
      </Rejilla>
    </Stack>
  )
}
