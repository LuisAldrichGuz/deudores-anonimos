import type { Perfil } from '../almacen/datos'
import { diasEnMes, fechaDelMes, hoy, sumarDias } from './fechas'

/* Ventanas de tiempo fijas: semana, quincena o mes.

   Son distintas de los PERIODOS DE COBRO (periodos.ts), que van de un pago al
   siguiente. Estas se pueden elegir a mano porque la pregunta cambia según el
   momento: «¿qué me cae esta semana?» cuando andas corto, «¿y este mes?»
   cuando estás planeando. */

export type Unidad = 'semana' | 'quincena' | 'mes'

export type Ventana = { inicio: Date; fin: Date }

export const NOMBRE_UNIDAD: Record<Unidad, string> = {
  semana: 'Semana',
  quincena: 'Quincena',
  mes: 'Mes',
}

/** La ventana en la que cae esa fecha. */
export function ventanaDe(unidad: Unidad, f = hoy()): Ventana {
  const anio = f.getFullYear()
  const mes = f.getMonth()

  if (unidad === 'semana') {
    // La semana empieza en lunes: getDay() da 0 al domingo, de ahí el (+6)%7.
    const inicio = sumarDias(f, -((f.getDay() + 6) % 7))
    return { inicio, fin: sumarDias(inicio, 6) }
  }

  if (unidad === 'quincena') {
    return f.getDate() <= 15
      ? { inicio: new Date(anio, mes, 1), fin: new Date(anio, mes, 15) }
      : { inicio: new Date(anio, mes, 16), fin: new Date(anio, mes, diasEnMes(anio, mes)) }
  }

  return { inicio: new Date(anio, mes, 1), fin: new Date(anio, mes, diasEnMes(anio, mes)) }
}

/** La ventana `n` posiciones adelante (o atrás, con negativo). */
export function moverVentana(unidad: Unidad, v: Ventana, n: number): Ventana {
  if (unidad === 'semana') return ventanaDe(unidad, sumarDias(v.inicio, n * 7))
  if (unidad === 'mes') return ventanaDe(unidad, new Date(v.inicio.getFullYear(), v.inicio.getMonth() + n, 1))
  // Cada quincena es un número corrido (dos por mes). Sumarle n y volver a
  // año/mes/mitad es trivial; hacerlo con sumas de días y meses es donde
  // aparecen los errores de «se saltó una quincena en enero».
  const indice = (v.inicio.getFullYear() * 12 + v.inicio.getMonth()) * 2
    + (v.inicio.getDate() <= 15 ? 0 : 1) + n
  const mesesTotales = Math.floor(indice / 2)
  const segundaMitad = (((indice % 2) + 2) % 2) === 1
  return ventanaDe(
    unidad,
    new Date(Math.floor(mesesTotales / 12), mesesTotales % 12, segundaMitad ? 16 : 1),
  )
}

/** Las fechas de cobro que caen en el rango, ordenadas. */
export function fechasDeCobro(p: Perfil, desde: Date, hasta: Date): Date[] {
  const fechas: Date[] = []

  if (p.frecuencia === 'semanal') {
    const dia = p.diaSemanaCobro ?? 5
    const cursor = new Date(desde)
    // Retrocede hasta el primer día de cobro anterior al rango.
    while (cursor.getDay() !== dia) cursor.setDate(cursor.getDate() - 1)
    for (let f = cursor; f <= hasta; f = sumarDias(f, 7)) fechas.push(f)
    return fechas
  }

  const dias = [...new Set(p.diasDeCobro)].sort((a, b) => a - b)
  const cursor = new Date(desde.getFullYear(), desde.getMonth() - 1, 1)
  const fin = new Date(hasta.getFullYear(), hasta.getMonth() + 2, 1)
  while (cursor < fin) {
    for (const d of dias) fechas.push(fechaDelMes(cursor.getFullYear(), cursor.getMonth(), d))
    cursor.setMonth(cursor.getMonth() + 1)
  }
  return fechas.filter((f) => f <= hasta).sort((a, b) => a.getTime() - b.getTime())
}

/** Lo que entra en esa ventana. Si te pagan dos veces dentro, cuenta dos. */
export function ingresoEnVentana(p: Perfil, v: Ventana): number {
  return fechasDeCobro(p, v.inicio, v.fin).filter((f) => f >= v.inicio && f <= v.fin).length * p.ingreso
}
