import { interesDelMes } from './amortizacion'
import type { DeudaViva } from './amortizacion'
import { sumarMeses, hoy } from './fechas'

/* Salir de deudas: las dos estrategias de siempre, simuladas mes a mes.

   - AVALANCHA: todo el sobrante a la de tasa más alta. Es la que menos
     intereses paga; matemáticamente siempre gana.
   - BOLA DE NIEVE: todo el sobrante a la de saldo más chico. Paga algo más
     de intereses, pero liquida una deuda ANTES y eso es lo que hace que la
     gente no abandone. Por eso están las dos y la app no elige por ti.
   - MÍNIMOS: la referencia. Cada deuda con su pago de siempre y el dinero
     que se libera NO se reinvierte. Es lo que pasa si no haces nada, y sirve
     para poner número a la diferencia.

   El motor es el mismo para las tres: lo único que cambia es a quién se le da
   el sobrante y si el pago liberado se reparte o se pierde. */

export type Estrategia = 'avalancha' | 'bola-de-nieve' | 'minimos'

export type Simulacion = {
  /** null = con ese dinero no se acaba nunca (el interés se come el pago). */
  meses: number | null
  fechaLibre: Date | null
  interesTotal: number
  pagadoTotal: number
  /** Saldo total al cierre de cada mes. El punto 0 es el saldo de hoy. */
  curva: number[]
  liquidaciones: { id: string; nombre: string; mes: number }[]
}

/** 50 años. Pasado eso, para quien lo mira es «nunca». */
const TOPE_MESES = 600

export function simular(deudas: DeudaViva[], extra: number, estrategia: Estrategia): Simulacion {
  const saldos = deudas.map((d) => ({ ...d }))
  const total = () => saldos.reduce((s, d) => s + d.saldo, 0)

  const curva: number[] = [total()]
  const liquidaciones: Simulacion['liquidaciones'] = []
  let interesTotal = 0
  let pagadoTotal = 0

  if (!saldos.length) {
    return { meses: 0, fechaLibre: hoy(), interesTotal: 0, pagadoTotal: 0, curva, liquidaciones }
  }

  // El presupuesto NO baja cuando una deuda se acaba: ese es justamente el
  // efecto bola de nieve. En «mínimos» sí baja, porque ahí nadie lo reinvierte.
  const presupuestoInicial = saldos.reduce((s, d) => s + d.pagoMensual, 0) + extra

  for (let mes = 1; mes <= TOPE_MESES; mes++) {
    for (const d of saldos) {
      if (d.saldo <= 0) continue
      const interes = interesDelMes(d.saldo, d.tasaAnual)
      d.saldo += interes
      interesTotal += interes
    }

    let disponible = estrategia === 'minimos'
      ? saldos.filter((d) => d.saldo > 0).reduce((s, d) => s + d.pagoMensual, 0)
      : presupuestoInicial

    // Primero el pago de cada una; después el sobrante, todo al objetivo.
    for (const d of saldos) {
      if (d.saldo <= 0 || disponible <= 0) continue
      const pago = Math.min(d.pagoMensual, d.saldo, disponible)
      d.saldo -= pago
      disponible -= pago
      pagadoTotal += pago
    }

    if (estrategia !== 'minimos') {
      while (disponible > 0.005) {
        const objetivo = elegirObjetivo(saldos, estrategia)
        if (!objetivo) break
        const pago = Math.min(objetivo.saldo, disponible)
        objetivo.saldo -= pago
        disponible -= pago
        pagadoTotal += pago
      }
    }

    for (const d of saldos) {
      if (d.saldo <= 0.005 && !liquidaciones.some((l) => l.id === d.id)) {
        d.saldo = 0
        liquidaciones.push({ id: d.id, nombre: d.nombre, mes })
      }
    }

    curva.push(total())

    if (total() <= 0.005) {
      return { meses: mes, fechaLibre: sumarMeses(hoy(), mes), interesTotal, pagadoTotal, curva, liquidaciones }
    }
    // Si en un mes entero no bajó ni un peso, no va a bajar nunca.
    if (mes > 1 && curva[mes] >= curva[mes - 1] - 0.005) break
  }

  return { meses: null, fechaLibre: null, interesTotal, pagadoTotal, curva, liquidaciones }
}

function elegirObjetivo(saldos: DeudaViva[], estrategia: Estrategia): DeudaViva | undefined {
  const vivas = saldos.filter((d) => d.saldo > 0.005)
  if (!vivas.length) return undefined
  return estrategia === 'avalancha'
    ? vivas.reduce((a, b) => (b.tasaAnual > a.tasaAnual ? b : a))
    : vivas.reduce((a, b) => (b.saldo < a.saldo ? b : a))
}
