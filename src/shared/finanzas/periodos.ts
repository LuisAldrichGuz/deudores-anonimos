import type { Perfil } from '../almacen/datos'
import { fechaDelMes, hoy, sumarDias } from './fechas'

/* Los periodos de cobro: de un pago al siguiente.

   Es la unidad en la que de verdad se vive. Nadie presupuesta «el mes»: se
   presupuesta «lo que me tiene que durar hasta el día 30», y por eso todos
   los números de la portada están cortados así y no por mes natural. */

export type Periodo = {
  inicio: Date
  /** El día ANTES del siguiente cobro: el periodo incluye sus dos extremos. */
  fin: Date
  ingreso: number
}

const VECES_AL_MES = { mensual: 1, quincenal: 2, semanal: 52 / 12 } as const

/** Lo que entra al mes, sin importar cada cuándo te paguen. */
export const ingresoMensual = (p: Perfil) => p.ingreso * VECES_AL_MES[p.frecuencia]

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

/** Los periodos completos que cubren el rango, con el de dentro incluido. */
export function periodos(p: Perfil, desde: Date, hasta: Date): Periodo[] {
  const fechas = fechasDeCobro(p, sumarDias(desde, -40), sumarDias(hasta, 40))
  const salida: Periodo[] = []
  for (let i = 0; i < fechas.length - 1; i++) {
    const inicio = fechas[i]
    const fin = sumarDias(fechas[i + 1], -1)
    if (fin < desde || inicio > hasta) continue
    salida.push({ inicio, fin, ingreso: p.ingreso })
  }
  return salida
}

/** En el que estás parado hoy: ya te pagaron y esto tiene que alcanzar. */
export function periodoEnCurso(p: Perfil, ref = hoy()): Periodo {
  const lista = periodos(p, sumarDias(ref, -45), sumarDias(ref, 45))
  return lista.find((x) => ref >= x.inicio && ref <= x.fin) ?? { inicio: ref, fin: sumarDias(ref, 14), ingreso: p.ingreso }
}

/** El que viene: el dinero que todavía no tienes. */
export function periodoSiguiente(p: Perfil, ref = hoy()): Periodo {
  const actual = periodoEnCurso(p, ref)
  const lista = periodos(p, actual.fin, sumarDias(actual.fin, 60))
  return lista.find((x) => x.inicio > actual.inicio) ?? {
    inicio: sumarDias(actual.fin, 1),
    fin: sumarDias(actual.fin, 15),
    ingreso: p.ingreso,
  }
}

export function nombrePeriodo(p: Perfil): string {
  return { mensual: 'mes', quincenal: 'quincena', semanal: 'semana' }[p.frecuencia]
}
