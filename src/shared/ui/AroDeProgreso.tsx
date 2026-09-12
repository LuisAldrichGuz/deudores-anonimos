import Box from '@mui/material/Box'

/* El medidor circular: un aro que se llena una vez al entrar.

   ⚠️ El destino de la animación va en una VARIABLE CSS y no en el keyframe.
   Un `@keyframes` es global: si el porcentaje estuviera dentro, dos aros con
   valores distintos en la misma pantalla se pisarían y los dos acabarían en el
   mismo sitio. Con `--resto` por instancia, cada uno llega al suyo. */
export function AroDeProgreso({
  porcentaje, valor, etiqueta, color, tamano = 124, grosor = 11, retraso = 0.3,
}: {
  /** 0 a 100. Se acota: una deuda puede pasarse del 100 y el aro no. */
  porcentaje: number
  /** Qué se escribe en medio. Si se omite, el porcentaje pegado al signo:
      `porcentaje()` separa con un espacio fino que en SVG se abre de más. */
  valor?: string
  etiqueta?: string
  /** Color del trazo. Un token del tema o uno de ACENTO. */
  color: string
  tamano?: number
  grosor?: number
  retraso?: number
}) {
  const radio = (tamano - grosor) / 2
  const vuelta = 2 * Math.PI * radio
  const parte = Math.min(100, Math.max(0, porcentaje)) / 100
  const texto = valor ?? `${Math.round(porcentaje)}%`

  return (
    <Box
      component="svg"
      width={tamano} height={tamano} viewBox={`0 0 ${tamano} ${tamano}`}
      sx={{ flexShrink: 0, display: 'block' }}
      role="img" aria-label={`${etiqueta ?? ''} ${texto}`}
    >
      <Box
        component="circle"
        cx={tamano / 2} cy={tamano / 2} r={radio} fill="none" strokeWidth={grosor}
        // ⚠️ `fill` y `stroke` NO están entre las propiedades que `sx` traduce a
        // colores del tema (sí `color`, `bgcolor`, `borderColor`…): con
        // 'text.primary' se emite `fill: text.primary`, que es CSS inválido y
        // cae al negro por defecto. Sobre un fondo oscuro eso es texto que no
        // se ve, y no hay error en consola. De ahí la función de tema.
        sx={(t) => ({ stroke: t.palette.action.disabledBackground })}
      />
      <circle
        className="aro"
        cx={tamano / 2} cy={tamano / 2} r={radio}
        fill="none" stroke={color} strokeWidth={grosor} strokeLinecap="round"
        strokeDasharray={vuelta}
        transform={`rotate(-90 ${tamano / 2} ${tamano / 2})`}
        style={{
          ['--vuelta' as string]: `${vuelta}`,
          ['--resto' as string]: `${vuelta * (1 - parte)}`,
          strokeDashoffset: vuelta * (1 - parte),
          animationDelay: `${retraso}s`,
        }}
      />
      <Box
        component="text"
        x={tamano / 2} y={tamano / 2 + (etiqueta ? 1 : 6)}
        textAnchor="middle"
        sx={(t) => ({ fill: t.palette.text.primary, fontFamily: '"JetBrains Mono Variable", monospace', fontWeight: 700 })}
        fontSize={tamano * 0.21}
      >
        {texto}
      </Box>
      {etiqueta && (
        <Box
          component="text"
          x={tamano / 2} y={tamano / 2 + tamano * 0.15}
          textAnchor="middle" letterSpacing="1.2"
          sx={(t) => ({ fill: t.palette.text.disabled })}
          fontSize={tamano * 0.09}
        >
          {etiqueta}
        </Box>
      )}
    </Box>
  )
}
