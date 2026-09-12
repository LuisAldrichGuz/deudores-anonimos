import type { Datos, Fijo, Tarjeta } from '../almacen/datos'
import { diasEntre, fechaDelMes, hoy, sumarDias } from './fechas'

/* Todo lo que se paga —tarjetas, préstamos, gastos fijos y lo que apartas—
   se convierte aquí en UNA lista de eventos con fecha y monto.

   Es el único generador de la app: el calendario, los próximos pagos, el
   reparto por quincena y el semáforo leen de esta misma función. Si el mes de
   una tarjeta se calculara en un sitio y el del calendario en otro, tarde o
   temprano dirían cosas distintas y ninguno de los dos estaría «mal». */

export type TipoEvento = 'corte' | 'tarjeta' | 'prestamo' | 'fijo' | 'ahorro'

export type Evento = {
  /** Único por OCURRENCIA, no por origen: el mismo gasto aparece varias veces. */
  id: string
  origenId: string
  tipo: TipoEvento
  nombre: string
  /** 0 en los cortes: ese día no se paga nada, solo cierra el periodo. */
  monto: number
  fecha: Date
  detalle?: string
}

const claveEvento = (origenId: string, f: Date, sufijo = '') =>
  `${origenId}:${f.getFullYear()}-${f.getMonth()}-${f.getDate()}${sufijo}`

/** Los meses que toca recorrer para cubrir el rango. Se añade uno por cada
    lado porque el pago de una tarjeta nace de un corte del mes anterior y
    puede caer en el siguiente. */
function mesesQueTocan(desde: Date, hasta: Date) {
  const meses: { anio: number; mes: number }[] = []
  const cursor = new Date(desde.getFullYear(), desde.getMonth() - 1, 1)
  const fin = new Date(hasta.getFullYear(), hasta.getMonth() + 1, 1)
  while (cursor <= fin) {
    meses.push({ anio: cursor.getFullYear(), mes: cursor.getMonth() })
    cursor.setMonth(cursor.getMonth() + 1)
  }
  return meses
}

/** ¿Este gasto toca en este mes? Para bimestral y anual manda `mesBase`. */
function tocaEsteMes(f: Fijo, mes: number): boolean {
  const base = (f.mesBase ?? 1) - 1
  switch (f.frecuencia) {
    case 'mensual':
    case 'quincenal':
      return true
    case 'bimestral':
      return (((mes - base) % 2) + 2) % 2 === 0
    case 'anual':
      return mes === base
  }
}

export function eventosEnRango(datos: Datos, desde: Date, hasta: Date): Evento[] {
  const eventos: Evento[] = []
  const dentro = (f: Date) => f >= desde && f <= hasta

  for (const { anio, mes } of mesesQueTocan(desde, hasta)) {
    for (const t of datos.tarjetas) {
      const corte = fechaDelMes(anio, mes, t.diaCorte)
      if (dentro(corte)) {
        eventos.push({
          id: claveEvento(t.id, corte, ':corte'),
          origenId: t.id,
          tipo: 'corte',
          nombre: t.nombre,
          monto: 0,
          fecha: corte,
          detalle: 'corta',
        })
      }
      const limite = sumarDias(corte, t.diasParaPagar)
      if (dentro(limite) && t.pagoMensual > 0) {
        eventos.push({
          id: claveEvento(t.id, limite, ':pago'),
          origenId: t.id,
          tipo: 'tarjeta',
          nombre: t.nombre,
          monto: t.pagoMensual,
          fecha: limite,
          detalle: 'fecha límite de pago',
        })
      }
    }

    for (const p of datos.prestamos) {
      const f = fechaDelMes(anio, mes, p.diaPago)
      if (dentro(f) && p.pagoMensual > 0) {
        eventos.push({
          id: claveEvento(p.id, f),
          origenId: p.id,
          tipo: 'prestamo',
          nombre: p.nombre,
          monto: p.pagoMensual,
          fecha: f,
        })
      }
    }

    for (const g of datos.fijos) {
      if (!tocaEsteMes(g, mes)) continue
      const dias = g.frecuencia === 'quincenal' ? [g.diaPago, g.diaPago + 15] : [g.diaPago]
      for (const dia of dias) {
        if (dia > 31) continue
        const f = fechaDelMes(anio, mes, dia)
        if (!dentro(f) || g.monto <= 0) continue
        eventos.push({
          id: claveEvento(g.id, f),
          origenId: g.id,
          tipo: 'fijo',
          nombre: g.nombre,
          monto: g.monto,
          fecha: f,
        })
      }
    }

    for (const m of datos.metas) {
      const f = fechaDelMes(anio, mes, m.diaPago)
      if (dentro(f) && m.aportacion > 0) {
        eventos.push({
          id: claveEvento(m.id, f),
          origenId: m.id,
          tipo: 'ahorro',
          nombre: m.nombre,
          monto: m.aportacion,
          fecha: f,
          detalle: 'lo que apartas',
        })
      }
    }
  }

  return eventos.sort((a, b) => a.fecha.getTime() - b.fecha.getTime() || a.nombre.localeCompare(b.nombre))
}

export const esSalida = (e: Evento) => e.tipo !== 'corte'

export function totalDe(eventos: Evento[]): number {
  return eventos.reduce((s, e) => s + e.monto, 0)
}

/** Lo que cuesta al mes un gasto que no es mensual. El seguro del carro no se
    paga en marzo: se paga TODO el año, de a poquito, y este es el número que
    hay que apartar aunque el recibo no llegue. */
export function costoMensual(f: Fijo): number {
  switch (f.frecuencia) {
    case 'mensual': return f.monto
    case 'quincenal': return f.monto * 2
    case 'bimestral': return f.monto / 2
    case 'anual': return f.monto / 12
  }
}

/* ── Tarjetas: cortes, fechas límite y los días sin intereses ───────────── */

export function proximoCorte(t: Tarjeta, desde = hoy()): Date {
  const este = fechaDelMes(desde.getFullYear(), desde.getMonth(), t.diaCorte)
  return este >= desde ? este : fechaDelMes(desde.getFullYear(), desde.getMonth() + 1, t.diaCorte)
}

export function proximoLimiteDePago(t: Tarjeta, desde = hoy()): Date {
  // El límite que viene puede nacer del corte del mes pasado: se prueba ese
  // primero y solo si ya pasó se usa el del corte siguiente.
  const corteAnterior = fechaDelMes(desde.getFullYear(), desde.getMonth() - 1, t.diaCorte)
  const candidatos = [corteAnterior, fechaDelMes(desde.getFullYear(), desde.getMonth(), t.diaCorte)]
    .map((c) => sumarDias(c, t.diasParaPagar))
    .filter((f) => f >= desde)
  return candidatos[0] ?? sumarDias(proximoCorte(t, desde), t.diasParaPagar)
}

/** Si compras HOY con esta tarjeta, cuántos días pasan hasta que hay que
    pagarla. El truco de toda la vida: comprar justo después del corte estira
    el plazo al máximo; comprar justo antes lo deja en los días de pago. */
export function diasSinIntereses(t: Tarjeta, desde = hoy()): number {
  return diasEntre(desde, sumarDias(proximoCorte(t, desde), t.diasParaPagar))
}

/** El mejor día para comprar con esta tarjeta y cuántos días da. */
export function mejorDiaDeCompra(t: Tarjeta, desde = hoy()) {
  const dia = sumarDias(proximoCorte(t, desde), 1)
  return { dia, dias: diasSinIntereses(t, dia) }
}
