import { useMemo } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { LineChart } from '@mui/x-charts/LineChart'

import type { DeudaViva } from '../../shared/finanzas/amortizacion'
import { simular } from '../../shared/finanzas/estrategias'
import type { Estrategia } from '../../shared/finanzas/estrategias'
import { pesos } from '../../shared/formato/moneda'

/** Más de diez años en la gráfica no se lee: la curva se aplasta contra el eje
    y deja de distinguirse una estrategia de otra. */
const TOPE_MESES = 120

/* Las tres curvas juntas: la que elegiste, la otra estrategia y lo que pasa si
   no cambias nada. La distancia entre la de arriba y la de abajo ES el
   argumento — es más convincente que cualquier cifra suelta. */
export function GraficaDeSalida({
  deudas, extra, estrategia,
}: {
  deudas: DeudaViva[]
  extra: number
  estrategia: Estrategia
}) {
  const theme = useTheme()

  const { meses, series } = useMemo(() => {
    const otra: Estrategia = estrategia === 'avalancha' ? 'bola-de-nieve' : 'avalancha'
    const curvas = {
      elegida: simular(deudas, extra, estrategia).curva,
      otra: simular(deudas, extra, otra).curva,
      minimos: simular(deudas, 0, 'minimos').curva,
    }
    const largo = Math.min(TOPE_MESES, Math.max(...Object.values(curvas).map((c) => c.length)))
    // Una curva que ya llegó a cero se corta: prolongarla en cero dibuja una
    // línea recta larguísima que parece parte del plan.
    const recorta = (c: number[]) => c.slice(0, largo).map((v) => (v <= 0.005 ? null : v))

    return {
      meses: Array.from({ length: largo }, (_, i) => i),
      // ⚠️ El orden importa: la última serie se dibuja ENCIMA. Con la elegida
      // primero, las dos estrategias se solapan mientras nadie ha liquidado
      // nada y la de arriba tapaba entera a la que el usuario acaba de elegir.
      series: [
        { data: recorta(curvas.minimos), label: 'Sin cambiar nada', color: theme.palette.error.main },
        { data: recorta(curvas.otra), label: otra === 'avalancha' ? 'Avalancha' : 'Bola de nieve', color: theme.palette.info.main },
        { data: recorta(curvas.elegida), label: estrategia === 'avalancha' ? 'Avalancha' : 'Bola de nieve', color: theme.palette.primary.main },
      ],
    }
  }, [deudas, extra, estrategia, theme])

  return (
    <Card>
      <CardContent>
        <Typography variant="overline" color="text.secondary">Cómo baja tu deuda</Typography>
        <LineChart
          height={300}
          series={series.map((s) => ({ ...s, showMark: false, curve: 'monotoneX' as const, valueFormatter: (v: number | null) => (v === null ? '' : pesos(v)) }))}
          xAxis={[{ data: meses, label: 'meses desde hoy' }]}
          yAxis={[{ valueFormatter: (v: number) => pesos(v) , width: 72 }]}
          margin={{ top: 8, right: 8 }}
        />
      </CardContent>
    </Card>
  )
}
