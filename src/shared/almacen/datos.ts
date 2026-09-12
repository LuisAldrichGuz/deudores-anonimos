/* El modelo entero de la app. Un solo objeto: es lo que se guarda en el
   navegador y es, literalmente, el archivo que el usuario se descarga. */

export const VERSION_DATOS = 1

export type FrecuenciaGasto = 'mensual' | 'quincenal' | 'bimestral' | 'anual'
export type FrecuenciaIngreso = 'mensual' | 'quincenal' | 'semanal'

export type CategoriaFija =
  | 'renta' | 'servicios' | 'suscripcion' | 'transporte' | 'salud' | 'educacion' | 'otro'

export type Perfil = {
  /** Lo que cae en la cuenta CADA VEZ que te pagan, no al mes. */
  ingreso: number
  frecuencia: FrecuenciaIngreso
  /** Días del mes en que te pagan. 31 se entiende como «último día». */
  diasDeCobro: number[]
  /** Solo cuando la frecuencia es semanal: 0 domingo … 6 sábado.
      Va en su propio campo a propósito: meter un día de la semana dentro de
      `diasDeCobro` obligaría a saber la frecuencia para entender el número. */
  diaSemanaCobro?: number
  /** Meses de gasto que quieres tener guardados por si truena algo. */
  colchonMeses: number
}

export type Tarjeta = {
  id: string
  nombre: string
  limite: number
  saldo: number
  /** Tasa ANUAL en porcentaje (la que viene en el estado de cuenta). */
  tasaAnual: number
  /** Día del mes en que corta. */
  diaCorte: number
  /** Del corte a la fecha límite de pago. En México suelen ser 20. */
  diasParaPagar: number
  /** Lo que piensas abonarle al mes (no el mínimo del banco: el tuyo). */
  pagoMensual: number
}

export type Prestamo = {
  id: string
  nombre: string
  saldo: number
  tasaAnual: number
  pagoMensual: number
  diaPago: number
}

export type Fijo = {
  id: string
  nombre: string
  categoria: CategoriaFija
  monto: number
  frecuencia: FrecuenciaGasto
  diaPago: number
  /** Solo para bimestral y anual: el mes (1-12) en que toca pagar. */
  mesBase?: number
}

export type Meta = {
  id: string
  nombre: string
  objetivo: number
  ahorrado: number
  aportacion: number
  diaPago: number
}

export type Datos = {
  version: number
  perfil: Perfil
  tarjetas: Tarjeta[]
  prestamos: Prestamo[]
  fijos: Fijo[]
  metas: Meta[]
}

export const DATOS_VACIOS: Datos = {
  version: VERSION_DATOS,
  perfil: { ingreso: 0, frecuencia: 'quincenal', diasDeCobro: [15, 31], colchonMeses: 3 },
  tarjetas: [],
  prestamos: [],
  fijos: [],
  metas: [],
}

export const nuevoId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36)

/** Un JSON de fuera no es de fiar: puede venir de otra versión, editado a mano
    o de una pestaña con la app a medio actualizar. Esto lo deja utilizable o
    devuelve null; nunca deja entrar campos a medias. */
export function leerDatos(crudo: unknown): Datos | null {
  if (typeof crudo !== 'object' || crudo === null) return null
  const d = crudo as Partial<Datos>
  if (typeof d.version !== 'number') return null

  const num = (v: unknown, pordefecto = 0) => (typeof v === 'number' && isFinite(v) ? v : pordefecto)
  const texto = (v: unknown, pordefecto = '') => (typeof v === 'string' ? v : pordefecto)
  const lista = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : [])

  const p = (d.perfil ?? {}) as Partial<Perfil>
  return {
    version: VERSION_DATOS,
    perfil: {
      ingreso: num(p.ingreso),
      frecuencia: (['mensual', 'quincenal', 'semanal'] as const).includes(p.frecuencia as FrecuenciaIngreso)
        ? (p.frecuencia as FrecuenciaIngreso)
        : 'quincenal',
      diasDeCobro: Array.isArray(p.diasDeCobro) && p.diasDeCobro.length
        ? p.diasDeCobro.map((x) => Math.min(31, Math.max(1, num(x, 1))))
        : [15, 31],
      diaSemanaCobro: p.diaSemanaCobro === undefined
        ? undefined
        : Math.min(6, Math.max(0, num(p.diaSemanaCobro, 5))),
      colchonMeses: num(p.colchonMeses, 3),
    },
    tarjetas: lista<Tarjeta>(d.tarjetas).map((t) => ({
      id: texto(t.id) || nuevoId(),
      nombre: texto(t.nombre, 'Tarjeta'),
      limite: num(t.limite),
      saldo: num(t.saldo),
      tasaAnual: num(t.tasaAnual),
      diaCorte: Math.min(31, Math.max(1, num(t.diaCorte, 1))),
      diasParaPagar: num(t.diasParaPagar, 20),
      pagoMensual: num(t.pagoMensual),
    })),
    prestamos: lista<Prestamo>(d.prestamos).map((p2) => ({
      id: texto(p2.id) || nuevoId(),
      nombre: texto(p2.nombre, 'Préstamo'),
      saldo: num(p2.saldo),
      tasaAnual: num(p2.tasaAnual),
      pagoMensual: num(p2.pagoMensual),
      diaPago: Math.min(31, Math.max(1, num(p2.diaPago, 1))),
    })),
    fijos: lista<Fijo>(d.fijos).map((f) => ({
      id: texto(f.id) || nuevoId(),
      nombre: texto(f.nombre, 'Gasto'),
      categoria: (['renta', 'servicios', 'suscripcion', 'transporte', 'salud', 'educacion', 'otro'] as const)
        .includes(f.categoria as CategoriaFija) ? (f.categoria as CategoriaFija) : 'otro',
      monto: num(f.monto),
      frecuencia: (['mensual', 'quincenal', 'bimestral', 'anual'] as const)
        .includes(f.frecuencia as FrecuenciaGasto) ? (f.frecuencia as FrecuenciaGasto) : 'mensual',
      diaPago: Math.min(31, Math.max(1, num(f.diaPago, 1))),
      mesBase: f.mesBase === undefined ? undefined : Math.min(12, Math.max(1, num(f.mesBase, 1))),
    })),
    metas: lista<Meta>(d.metas).map((m) => ({
      id: texto(m.id) || nuevoId(),
      nombre: texto(m.nombre, 'Meta'),
      objetivo: num(m.objetivo),
      ahorrado: num(m.ahorrado),
      aportacion: num(m.aportacion),
      diaPago: Math.min(31, Math.max(1, num(m.diaPago, 1))),
    })),
  }
}
