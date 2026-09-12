/* Fechas de calendario, no instantes.

   ⚠️ Todo aquí trabaja con Date a MEDIANOCHE LOCAL. Nada de UTC y nada de
   ISO con Z: un pago del día 1 en México con `new Date('2026-03-01')` se
   convierte en el 28 de febrero a las 18:00, y el gasto se va al mes anterior
   sin que nadie vea un error. Por eso se construye siempre con
   `new Date(anio, mes, dia)`. */

export const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

export const DIAS_SEMANA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

export const DIA_MS = 86_400_000

export function hoy(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export const diasEnMes = (anio: number, mes: number) => new Date(anio, mes + 1, 0).getDate()

/** El día 31 en febrero es el 28. Así se entiende «me pagan el último día»
    sin pedirle al usuario que sepa cuántos días trae cada mes. */
export function fechaDelMes(anio: number, mes: number, dia: number): Date {
  return new Date(anio, mes, Math.min(Math.max(1, dia), diasEnMes(anio, mes)))
}

export function sumarDias(f: Date, n: number): Date {
  const d = new Date(f)
  d.setDate(d.getDate() + n)
  d.setHours(0, 0, 0, 0)
  return d
}

export function sumarMeses(f: Date, n: number): Date {
  return fechaDelMes(f.getFullYear(), f.getMonth() + n, f.getDate())
}

/** Días completos de `a` a `b`. Se normaliza a mediodía antes de restar
    porque el cambio de horario de verano hace que un día dure 23 o 25 horas,
    y una división entre 86 400 000 daría 0.96 días. */
export function diasEntre(a: Date, b: Date): number {
  const x = new Date(a.getFullYear(), a.getMonth(), a.getDate(), 12)
  const y = new Date(b.getFullYear(), b.getMonth(), b.getDate(), 12)
  return Math.round((y.getTime() - x.getTime()) / DIA_MS)
}

export const mismoDia = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

export const claveDia = (f: Date) =>
  `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`

export function textoFecha(f: Date, conAnio = false): string {
  return `${f.getDate()} de ${MESES[f.getMonth()]}${conAnio ? ` de ${f.getFullYear()}` : ''}`
}

export function textoFechaCorta(f: Date): string {
  return `${f.getDate()} ${MESES[f.getMonth()].slice(0, 3)}`
}

/** «hoy», «mañana», «en 3 días», «hace 2 días». */
export function textoRelativo(f: Date, desde = hoy()): string {
  const d = diasEntre(desde, f)
  if (d === 0) return 'hoy'
  if (d === 1) return 'mañana'
  if (d === -1) return 'ayer'
  return d > 0 ? `en ${d} días` : `hace ${-d} días`
}
