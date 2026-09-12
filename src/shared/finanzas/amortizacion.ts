import type { Datos } from '../almacen/datos'
import { saldoDe } from './plazos'
import { hoy } from './fechas'

/* Lo que cuesta deber dinero.

   ⚠️ Las tasas se guardan ANUALES porque así vienen en el estado de cuenta,
   pero los intereses se cobran por periodo. Aquí se divide entre 12 una sola
   vez y en un solo sitio: repartir ese `/12` por la app es la forma más
   sencilla de que un número diga 68 % y otro 5.6 % sin que nadie sepa cuál
   está mal. */


const tasaMensual = (tasaAnual: number) => tasaAnual / 100 / 12

export const interesDelMes = (saldo: number, tasaAnual: number) => saldo * tasaMensual(tasaAnual)


/** Meses hasta liquidar una deuda sola. `null` cuando el pago no alcanza ni
    para el interés: ahí la deuda no baja nunca y no hay número que dar. */
export function mesesParaLiquidar(saldo: number, tasaAnual: number, pago: number): number | null {
  if (saldo <= 0) return 0
  if (pago <= 0) return null
  const r = tasaMensual(tasaAnual)
  if (r === 0) return Math.ceil(saldo / pago)
  if (pago <= saldo * r) return null
  return Math.ceil(-Math.log(1 - (r * saldo) / pago) / Math.log(1 + r))
}

/** Los tres números de la barra de arriba, a la fecha que se le pida: con un
    `ref` en el futuro dice cómo estarás entonces, que es de lo que se trata.

    ⚠️ Cuenta SOLO las deudas que sigues pagando. Antes sumaba también las ya
    liquidadas y la barra decía «73 % pagado» cuando de lo que de verdad debes
    ibas al 50 %: el porcentaje subía con cada deuda vieja que se terminaba y
    dejaba de hablar de tu situación de hoy. Para el acumulado de siempre está
    `historicoDeDeuda`, que es otra pregunta y va en otra tarjeta. */
export function resumenDeDeuda(datos: Datos, ref = hoy()) {
  const vivas = datos.prestamos.filter((p) => saldoDe(p, ref) > 0)
  const saldoTarjetas = datos.tarjetas.reduce((s, t) => s + t.saldo, 0)

  const total = vivas.reduce((s, p) => s + saldoDe(p, ref), 0) + saldoTarjetas
  // En una deuda abierta —una tarjeta— no hay «original» que valga: lo que
  // costó no está en ningún lado, así que cuenta su saldo de hoy.
  const original = vivas.reduce((s, p) => s + (p.plazos ? p.plazos.total : p.saldo), 0) + saldoTarjetas

  return { total, original, pagada: Math.max(0, original - total) }
}

/** Todo lo que has pagado desde siempre, liquidadas incluidas. Es la palmada
    en la espalda, no el estado de cuenta: por eso va aparte. */
export function historicoDeDeuda(datos: Datos, ref = hoy()) {
  const original = datos.prestamos.reduce((s, p) => s + (p.plazos ? p.plazos.total : p.saldo), 0)
    + datos.tarjetas.reduce((s, t) => s + t.saldo, 0)
  const falta = resumenDeDeuda(datos, ref).total
  return {
    original,
    pagada: Math.max(0, original - falta),
    liquidadas: datos.prestamos.filter((p) => saldoDe(p, ref) <= 0).length,
  }
}
