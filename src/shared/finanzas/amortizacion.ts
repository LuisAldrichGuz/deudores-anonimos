import type { Datos } from '../almacen/datos'
import { saldoDe } from './plazos'
import { hoy } from './fechas'

/* Lo que cuesta deber dinero.

   ⚠️ Las tasas se guardan ANUALES porque así vienen en el estado de cuenta,
   pero los intereses se cobran por periodo. Aquí se divide entre 12 una sola
   vez y en un solo sitio: repartir ese `/12` por la app es la forma más
   sencilla de que un número diga 68 % y otro 5.6 % sin que nadie sepa cuál
   está mal. */

/** Una deuda, venga de una tarjeta o de un préstamo. El simulador no
    distingue: lo único que importa es saldo, tasa y cuánto le abonas. */
type DeudaViva = {
  id: string
  nombre: string
  saldo: number
  tasaAnual: number
  pagoMensual: number
  origen: 'tarjeta' | 'prestamo'
}

const tasaMensual = (tasaAnual: number) => tasaAnual / 100 / 12

export const interesDelMes = (saldo: number, tasaAnual: number) => saldo * tasaMensual(tasaAnual)

/** Todas las deudas de los datos, en una sola lista. */
function deudasVivas(datos: Datos, ref = hoy()): DeudaViva[] {
  return [
    ...datos.tarjetas.map((t): DeudaViva => ({
      id: t.id, nombre: t.nombre, saldo: t.saldo, tasaAnual: t.tasaAnual,
      pagoMensual: t.pagoMensual, origen: 'tarjeta',
    })),
    // ⚠️ `saldoDe` y no `p.saldo`: en una deuda a plazos el saldo guardado no
    // significa nada, se calcula con las mensualidades que ya cayeron.
    ...datos.prestamos.map((p): DeudaViva => ({
      id: p.id, nombre: p.nombre, saldo: saldoDe(p, ref), tasaAnual: p.tasaAnual,
      pagoMensual: p.pagoMensual, origen: 'prestamo',
    })),
  ].filter((d) => d.saldo > 0)
}

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
    `ref` en el futuro dice cómo estarás entonces, que es de lo que se trata. */
export function resumenDeDeuda(datos: Datos, ref = hoy()) {
  const total = deudasVivas(datos, ref).reduce((s, d) => s + d.saldo, 0)
  // En una deuda abierta —una tarjeta— no hay «original» que valga: lo que
  // costó no está en ningún lado, así que cuenta su saldo de hoy.
  const original = datos.prestamos.reduce((s, p) => s + (p.plazos ? p.plazos.total : p.saldo), 0)
    + datos.tarjetas.reduce((s, t) => s + t.saldo, 0)
  return { total, original, pagada: Math.max(0, original - total) }
}
