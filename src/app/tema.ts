import { createTheme } from '@mui/material/styles'
import type { Theme } from '@mui/material/styles'

/* ─────────────────────────────────────────────────────────────
   Grafito — neutro oscuro.

   Los tres acentos comparten LUMINOSIDAD Y CROMA y solo cambian de tono
   (oklch). Es lo que hace que ninguno grite más que otro y que el gris pueda
   seguir siendo el protagonista: aquí el color no decora, significa —
   comprometido, libre, alerta — y en una app de dinero esa distinción es la
   mitad del trabajo.

   MUI trae la paleta de Material 2 (`main`, `light`, `dark`, `contrastText`).
   Le falta el CONTENEDOR de Material 3 —un tono suave para rellenar chips y
   avisos—, así que se añade al tipo en vez de colarlo a mano en cada `sx`:
   a partir de aquí `palette.primary.contenedor` existe y se autocompleta.
───────────────────────────────────────────────────────────── */
declare module '@mui/material/styles' {
  interface PaletteColor {
    contenedor: string
    sobreContenedor: string
  }
  interface SimplePaletteColorOptions {
    contenedor?: string
    sobreContenedor?: string
  }
}

export const FUENTE_UI = '"Instrument Sans Variable", system-ui, -apple-system, sans-serif'
export const FUENTE_CIFRAS = '"JetBrains Mono Variable", ui-monospace, SFMono-Regular, monospace'

/* Los tres papeles del color, en un solo sitio: los usan las barras, los aros
   y las rejillas de pagos, que no son componentes de MUI.

   ⚠️ Van en HEX aunque se diseñaron en oklch. MUI necesita PARSEAR los colores
   de la paleta para calcular contrastes y variantes, y no entiende `oklch()`:
   con la función puesta, `createTheme` truena con el error #9 y la app no
   arranca. Los valores de origen quedan al lado para poder rehacerlos. */
export const ACENTO = {
  gastado: '#B39A7D',   // oklch(0.70 0.05 70)
  libre: '#89A88E',     // oklch(0.70 0.05 150)
  alerta: '#BC938F',    // oklch(0.70 0.05 25)
} as const

export const tema: Theme = createTheme({
  // Con esto MUI emite variables CSS: cambiar de esquema no repinta el árbol
  // de React, cambia una clase en <html>.
  cssVariables: { colorSchemeSelector: 'class' },
  defaultColorScheme: 'dark',

  colorSchemes: {
    dark: {
      palette: {
        primary: { main: '#89A88E', contrastText: '#15171A', contenedor: '#22302A', sobreContenedor: '#AECEB3' },
        secondary: { main: '#8B9199', contrastText: '#15171A', contenedor: '#262A2F', sobreContenedor: '#E8EAED' },
        warning: { main: '#B39A7D', contrastText: '#15171A', contenedor: '#2E2A22', sobreContenedor: '#DABFA2' },
        error: { main: '#BC938F', contrastText: '#15171A', contenedor: '#332422', sobreContenedor: '#E3B8B4' },
        info: { main: '#8B9199', contrastText: '#15171A', contenedor: '#262A2F', sobreContenedor: '#E8EAED' },
        success: { main: '#89A88E', contrastText: '#15171A', contenedor: '#22302A', sobreContenedor: '#AECEB3' },
        background: { default: '#15171A', paper: '#1E2125' },
        text: { primary: '#E8EAED', secondary: '#8B9199', disabled: '#5D646C' },
        divider: '#2E333A',
        action: { disabledBackground: '#262A2F', hover: 'rgba(232,234,237,.06)', selected: 'rgba(232,234,237,.1)' },
      },
    },
    // Papel: el mismo diseño con otros valores. Nada de estructura cambia.
    light: {
      palette: {
        primary: { main: '#507357', contrastText: '#FAF8F5', contenedor: '#DCE8DF', sobreContenedor: '#214329' },
        secondary: { main: '#6F675D', contrastText: '#FAF8F5', contenedor: '#F1ECE4', sobreContenedor: '#1C1917' },
        warning: { main: '#957256', contrastText: '#FAF8F5', contenedor: '#F3E7D6', sobreContenedor: '#5A3A1F' },
        error: { main: '#9F5C52', contrastText: '#FAF8F5', contenedor: '#F6DFD8', sobreContenedor: '#64271F' },
        info: { main: '#6F675D', contrastText: '#FAF8F5', contenedor: '#F1ECE4', sobreContenedor: '#1C1917' },
        success: { main: '#507357', contrastText: '#FAF8F5', contenedor: '#DCE8DF', sobreContenedor: '#214329' },
        background: { default: '#FAF8F5', paper: '#FFFFFF' },
        text: { primary: '#1C1917', secondary: '#6F675D', disabled: '#9A9086' },
        divider: '#E4DDD2',
        action: { disabledBackground: '#EDE7DE', hover: 'rgba(28,25,23,.04)', selected: 'rgba(28,25,23,.07)' },
      },
    },
  },

  shape: { borderRadius: 14 },

  typography: {
    fontFamily: FUENTE_UI,
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: 0 },
    h1: { fontSize: 'clamp(1.75rem, 6vw, 2.25rem)', fontWeight: 600, letterSpacing: '-.02em' },
    h2: { fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-.02em' },
    h3: { fontSize: '1.3125rem', fontWeight: 600, letterSpacing: '-.015em' },
    h6: { fontSize: '.9375rem', fontWeight: 500, letterSpacing: 0 },
    // El rótulo de las tarjetas: pequeño, espaciado, en mayúsculas.
    overline: { fontSize: '.6875rem', letterSpacing: '.1em', fontWeight: 500, lineHeight: 1.6 },
    caption: { fontSize: '.6875rem', lineHeight: 1.5 },
  },

  components: {
    MuiCard: {
      defaultProps: { elevation: 0, variant: 'outlined' },
      styleOverrides: { root: { borderRadius: 16, backgroundImage: 'none' } },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 13, paddingBlock: 12, paddingInline: 20 } },
    },
    MuiChip: { styleOverrides: { root: { borderRadius: 999, fontWeight: 500 } } },
    MuiTextField: { defaultProps: { variant: 'outlined', size: 'medium', fullWidth: true } },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 13 } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 24, backgroundImage: 'none' } } },
    MuiLinearProgress: { styleOverrides: { root: { height: 8, borderRadius: 999 } } },
    MuiTooltip: { defaultProps: { enterTouchDelay: 0 } },
    MuiAppBar: { defaultProps: { elevation: 0, color: 'transparent' } },
    MuiToggleButton: { styleOverrides: { root: { borderRadius: 999, textTransform: 'none', fontWeight: 500 } } },
  },
})
