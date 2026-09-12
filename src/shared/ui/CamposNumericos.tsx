import { useEffect, useState } from 'react'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'

/* Entradas de números para los formularios.

   ⚠️ Existen por un motivo concreto: un <input type="number"> atado
   directamente a un número del estado es una trampa. Al borrar el contenido
   el valor es '' y `Number('')` es 0, así que el campo se rellena solo con un
   cero que no deja teclear; y `Number('1.')` es NaN, así que escribir un
   decimal borra el campo a media palabra.

   La solución es la de siempre: MIENTRAS SE ESCRIBE manda el texto, y el
   número se avisa hacia arriba solo cuando el texto es un número válido. */

type BaseProps = {
  etiqueta: string
  valor: number
  alCambiar: (n: number) => void
  ayuda?: string
  requerido?: boolean
}

function useTextoNumerico(valor: number) {
  const [texto, setTexto] = useState(() => (valor === 0 ? '' : String(valor)))

  // Si el valor cambia DESDE FUERA (cargar un ejemplo, importar un JSON), el
  // campo tiene que reflejarlo; si viniera solo del tecleo, se quedaría con lo
  // viejo. Se compara por número para no pisar un «1.» a medio escribir.
  useEffect(() => {
    const actual = Number(texto)
    if (texto !== '' && actual === valor) return
    if (texto === '' && valor === 0) return
    setTexto(valor === 0 ? '' : String(valor))
    // Solo cuando cambia el valor de fuera; el texto es estado interno.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor])

  return [texto, setTexto] as const
}

export function CampoDinero({ etiqueta, valor, alCambiar, ayuda, requerido }: BaseProps) {
  const [texto, setTexto] = useTextoNumerico(valor)
  return (
    <TextField
      label={etiqueta}
      value={texto}
      required={requerido}
      helperText={ayuda}
      inputMode="decimal"
      onChange={(e) => {
        const t = e.target.value.replace(/[^\d.]/g, '')
        setTexto(t)
        const n = Number(t)
        if (t !== '' && isFinite(n)) alCambiar(n)
        if (t === '') alCambiar(0)
      }}
      slotProps={{
        input: { startAdornment: <InputAdornment position="start">$</InputAdornment> },
        htmlInput: { className: 'cifras' },
      }}
    />
  )
}

export function CampoPorcentaje({ etiqueta, valor, alCambiar, ayuda }: BaseProps) {
  const [texto, setTexto] = useTextoNumerico(valor)
  return (
    <TextField
      label={etiqueta}
      value={texto}
      helperText={ayuda}
      inputMode="decimal"
      onChange={(e) => {
        const t = e.target.value.replace(/[^\d.]/g, '')
        setTexto(t)
        const n = Number(t)
        if (t !== '' && isFinite(n)) alCambiar(n)
        if (t === '') alCambiar(0)
      }}
      slotProps={{
        input: { endAdornment: <InputAdornment position="end">%</InputAdornment> },
        htmlInput: { className: 'cifras' },
      }}
    />
  )
}

/** Día del mes. Es una lista y no un número escrito porque el 31 significa
    «el último día» y eso hay que poder decirlo, no adivinarlo. */
export function CampoDiaDelMes({
  etiqueta, valor, alCambiar, ayuda,
}: Omit<BaseProps, 'requerido'>) {
  return (
    <TextField select label={etiqueta} value={valor} helperText={ayuda}
      onChange={(e) => alCambiar(Number(e.target.value))}>
      {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
        <MenuItem key={d} value={d}>
          {d === 31 ? '31 (o el último del mes)' : d}
        </MenuItem>
      ))}
    </TextField>
  )
}
