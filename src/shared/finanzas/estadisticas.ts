import type { Datos, Prestamo } from '../almacen/datos'
import { esSalida, eventosEnRango, totalDe } from './compromisos'
import { diasEnMes, hoy, sumarMeses } from './fechas'
import { avanceDe, fechaDePago, saldoDe } from './plazos'
import { mesesParaLiquidar } from './amortizacion'

/* Las cuentas de la pantalla de estadísticas.

   Viven aquí y no en el componente por la razón de siempre: son funciones
   puras sobre objetos planos, se leen sin desenredarlas de un JSX y se pueden
   probar sin montar un árbol de React. */

/** El último pago de una deuda: la fecha en que deja de existir. */
function fechaFinal(p: Prestamo, ref = hoy()): Date | null {
  if (p.plazos) return fechaDePago(p.plazos, p.plazos.pagos)
  const meses = mesesParaLiquidar(p.saldo, p.tasaAnual, p.pagoMensual)
  return meses === null ? null : sumarMeses(ref, meses)
}

/** El día en que no debes nada. `null` si alguna deuda no se acaba nunca. */
export function fechaDeLibertad(datos: Datos, ref = hoy()): Date | null {
  const vivas = datos.prestamos.filter((p) => saldoDe(p, ref) > 0)
  if (!vivas.length) return null
  let ultima: Date | null = null
  for (const p of vivas) {
    const f = fechaFinal(p, ref)
    if (!f) return null
    if (!ultima || f > ultima) ultima = f
  }
  return ultima
}

/** Lo que cae cada mes de aquí a que te liberes. Es la gráfica que enseña que
    esto se acaba: la barra baja sola conforme las deudas se van cayendo. */
export function proyeccionMensual(datos: Datos, ref = hoy(), topeMeses = 24) {
  const fin = fechaDeLibertad(datos, ref)
  const meses: { fecha: Date; total: number }[] = []
  const limite = fin
    ? Math.min(topeMeses, (fin.getFullYear() - ref.getFullYear()) * 12 + fin.getMonth() - ref.getMonth() + 1)
    : topeMeses

  for (let i = 0; i < Math.max(1, limite); i++) {
    const inicio = new Date(ref.getFullYear(), ref.getMonth() + i, 1)
    const cierre = new Date(inicio.getFullYear(), inicio.getMonth(), diasEnMes(inicio.getFullYear(), inicio.getMonth()))
    meses.push({ fecha: inicio, total: totalDe(eventosEnRango(datos, inicio, cierre).filter(esSalida)) })
  }
  return meses
}

/** En qué está repartida la deuda que falta, de mayor a menor. */
export function repartoDeDeuda(datos: Datos, ref = hoy()) {
  return datos.prestamos
    .map((p) => ({ id: p.id, nombre: p.nombre, falta: saldoDe(p, ref) }))
    .filter((d) => d.falta > 0)
    .sort((a, b) => b.falta - a.falta)
}

/** Las que caen primero y cuánto liberan al caer. Es el calendario de buenas
    noticias: la única lista de una app de deudas que da gusto leer. */
export function proximasEnCaer(datos: Datos, ref = hoy()) {
  return datos.prestamos
    .filter((p) => saldoDe(p, ref) > 0)
    .map((p) => ({
      id: p.id,
      nombre: p.nombre,
      fin: fechaFinal(p, ref),
      // Lo que se libera es el abono de CADA vez, no el mensual: si paga por
      // quincena, lo que deja de salir el día 15 es la mitad.
      libera: p.plazos ? p.plazos.total / p.plazos.pagos : p.pagoMensual,
      porPeriodo: p.plazos?.cada ?? 'mes',
    }))
    .filter((d): d is typeof d & { fin: Date } => d.fin !== null)
    .sort((a, b) => a.fin.getTime() - b.fin.getTime())
}

/** Cuántos pagos llevas hechos y cuántos faltan, en todas las deudas juntas. */
export function pagosHechos(datos: Datos, ref = hoy()) {
  let hechos = 0
  let totales = 0
  for (const p of datos.prestamos) {
    if (!p.plazos) continue
    const a = avanceDe(p.plazos, ref)
    hechos += a.transcurridos
    totales += p.plazos.pagos
  }
  return { hechos, totales, restantes: totales - hechos }
}
