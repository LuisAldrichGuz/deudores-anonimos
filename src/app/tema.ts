import { createTheme } from '@mui/material/styles'
import type { Theme } from '@mui/material/styles'

/* ─────────────────────────────────────────────────────────────
   Material 3 sobre MUI.

   MUI trae la paleta de Material 2: `main`, `light`, `dark`, `contrastText`.
   Material 3 razona distinto — cada color tiene además un CONTENEDOR (un tono
   suave para rellenar chips, avisos y tarjetas) y su color de texto encima.

   En vez de colar esos tonos a mano en cada `sx` —que es como se pierde una
   paleta—, se añaden al tipo `PaletteColor`. A partir de la línea de abajo,
   `theme.palette.primary.contenedor` existe, se autocompleta y el compilador
   avisa si falta en alguno de los dos esquemas.
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

export const tema: Theme = createTheme({
  // Con esto MUI emite variables CSS y el cambio claro/oscuro no repinta el
  // árbol de React: cambia una clase en <html>. Y el selector por clase deja
  // que `InitColorSchemeScript` la ponga ANTES del primer pintado, que es lo
  // que evita el fogonazo blanco al abrir la app en oscuro.
  cssVariables: { colorSchemeSelector: 'class' },

  colorSchemes: {
    light: {
      palette: {
        primary:   { main: '#1b6b50', contrastText: '#ffffff', contenedor: '#a7f2d0', sobreContenedor: '#002114' },
        secondary: { main: '#4c6358', contrastText: '#ffffff', contenedor: '#cee9da', sobreContenedor: '#082017' },
        info:      { main: '#3d6373', contrastText: '#ffffff', contenedor: '#c1e9fb', sobreContenedor: '#001f29' },
        error:     { main: '#ba1a1a', contrastText: '#ffffff', contenedor: '#ffdad6', sobreContenedor: '#410002' },
        warning:   { main: '#8a5300', contrastText: '#ffffff', contenedor: '#ffddb3', sobreContenedor: '#2c1600' },
        success:   { main: '#1b6b50', contrastText: '#ffffff', contenedor: '#a7f2d0', sobreContenedor: '#002114' },
        background: { default: '#f5fbf6', paper: '#ffffff' },
        text: { primary: '#171d1a', secondary: '#3f4945' },
        divider: '#bfc9c2',
      },
    },
    dark: {
      palette: {
        primary:   { main: '#8bd6b5', contrastText: '#003828', contenedor: '#00513b', sobreContenedor: '#a7f2d0' },
        secondary: { main: '#b2ccbe', contrastText: '#1e352b', contenedor: '#344c41', sobreContenedor: '#cee9da' },
        info:      { main: '#a5cbdf', contrastText: '#063544', contenedor: '#244c5b', sobreContenedor: '#c1e9fb' },
        error:     { main: '#ffb4ab', contrastText: '#690005', contenedor: '#93000a', sobreContenedor: '#ffdad6' },
        warning:   { main: '#ffb951', contrastText: '#452b00', contenedor: '#6a3f00', sobreContenedor: '#ffddb3' },
        success:   { main: '#8bd6b5', contrastText: '#003828', contenedor: '#00513b', sobreContenedor: '#a7f2d0' },
        background: { default: '#0f1512', paper: '#1b211e' },
        text: { primary: '#dfe4e0', secondary: '#bfc9c2' },
        divider: '#3f4945',
      },
    },
  },

  // Las esquinas de Material 3: 4 · 8 · 12 · 16 · 28. Ninguna otra.
  shape: { borderRadius: 12 },

  typography: {
    fontFamily: '"Roboto Variable", Roboto, system-ui, -apple-system, sans-serif',
    // En Material 3 los botones no van en MAYÚSCULAS desde 2021.
    button: { textTransform: 'none', fontWeight: 500, letterSpacing: '.01em' },
    h1: { fontSize: 'clamp(2rem, 7vw, 3rem)', fontWeight: 400, letterSpacing: '-.02em' },
    h2: { fontSize: '1.75rem', fontWeight: 400 },
    h3: { fontSize: '1.375rem', fontWeight: 400 },
    overline: { letterSpacing: '.08em', fontWeight: 500 },
  },

  components: {
    // Las tarjetas de M3 son superficies con tono, no cajas con sombra.
    MuiCard: {
      defaultProps: { elevation: 0, variant: 'outlined' },
      styleOverrides: {
        root: { borderRadius: 16 },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 999, paddingInline: 20 } },
    },
    MuiChip: { styleOverrides: { root: { borderRadius: 8, fontWeight: 500 } } },
    MuiTextField: { defaultProps: { variant: 'outlined', size: 'small', fullWidth: true } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 28 } } },
    MuiLinearProgress: { styleOverrides: { root: { height: 8, borderRadius: 999 } } },
    MuiTooltip: { defaultProps: { enterTouchDelay: 0 } },
    MuiAppBar: { defaultProps: { elevation: 0, color: 'transparent' } },
  },
})
