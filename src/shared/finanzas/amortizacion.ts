import type { Datos } from '../almacen/datos'

/* Lo que cuesta deber dinero.

   ⚠️ Las tasas se guardan ANUALES porque así vienen en el estado de cuenta,
   pero los intereses se cobran por periodo. Aquí se divide entre 12 una sola
   vez y en un solo sitio: repartir ese `/12` por la app es la forma más
   sencilla de que un número diga 68 % y otro 5.6 % sin que nadie sepa cuál
   está mal. */

/** Una deuda, venga de una tarjeta o de un préstamo. El simulador no
    distingue: lo único que importa es saldo, tasa y cuánto le abonas. */
export type DeudaViva = {
  id: string
  nombre: string
  saldo: number
  tasaAnual: number
  pagoMensual: number
  origen: 'tarjeta' | 'prestamo'
}

export const tasaMensual = (tasaAnual: number) => tasaAnual / 100 / 12

export const interesDelMes = (saldo: number, tasaAnual: number) => saldo * tasaMensual(tasaAnual)

/** Todas las deudas de los datos, en una sola lista. */
export function deudasVivas(datos: Datos): DeudaViva[] {
  return [
    ...datos.tarjetas.map((t): DeudaViva => ({
      id: t.id, nombre: t.nombre, saldo: t.saldo, tasaAnual: t.tasaAnual,
      pagoMensual: t.pagoMensual, origen: 'tarjeta',
    })),
    ...datos.prestamos.map((p): DeudaViva => ({
      id: p.id, nombre: p.nombre, saldo: p.saldo, tasaAnual: p.tasaAnual,
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

/** El pago mínimo para que la deuda al menos no CREZCA. Es el número que
    convierte «pago y pago y no baja» en una cifra concreta. */
export const pagoQueSoloCubreIntereses = (saldo: number, tasaAnual: number) =>
  interesDelMes(saldo, tasaAnual)
