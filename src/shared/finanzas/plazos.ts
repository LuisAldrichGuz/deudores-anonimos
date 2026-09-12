import type { Plazos, Prestamo } from '../almacen/datos'
import { diasEnMes, fechaDelMes, hoy } from './fechas'

/* Las deudas que se pagan en abonos fijos y se acaban.

   La idea entera: NO se guarda cuánto queda. Se guarda lo que costó, en
   cuántos pagos, cada cuándo y desde cuándo; el resto sale de la fecha. Así el
   avance es cierto sin que nadie tenga que actualizar un saldo cada mes — que
   es exactamente lo que nadie hace, y por eso las apps que piden el saldo a
   mano acaban mintiendo. */

export type EstadoPago = 'pagado' | 'enCurso' | 'pendiente'

export type Pago = {
  numero: number
  fecha: Date
  estado: EstadoPago
}

export type Avance = {
  /** Los pagos que ya te tocaron (incluido el de hoy si ya llegó). */
  transcurridos: number
  restantes: number
  pagado: number
  falta: number
  /** 0 a 100. */
  porcentaje: number
  ultima: Date
  terminada: boolean
  pagos: Pago[]
}

/** Lo que sale en cada abono. */
export const importeDePago = (p: Plazos) => p.total / p.pagos

/** Lo que representa al mes, para poder compararlo con un sueldo mensual.
    Una quincena no es medio mes exacto, pero para presupuestar sí: son 24
    pagos al año y 24/12 = 2. */
export const pagoMensualDe = (p: Plazos) => importeDePago(p) * (p.cada === 'quincena' ? 2 : 1)

/** La fecha del pago número `n` (1 = el primero, el del inicio).

    ⚠️ Se construye con (año, mes, día) y nunca con `new Date('AAAA-MM-DD')`:
    esa cadena se interpreta como UTC y en México corre la fecha un día atrás,
    así que un pago del 1 se iría al 30 del mes anterior. */
export function fechaDePago(p: Plazos, n: number): Date {
  const [anio, mes, dia] = p.inicio.split('-').map(Number)

  if (p.cada === 'mes') return fechaDelMes(anio, mes - 1 + (n - 1), dia)

  // Quincenal: se alterna entre el 15 y el último día del mes. Cada quincena
  // es un número corrido (dos por mes), así no hay que sumar días ni meses y
  // no aparece el clásico «se saltó una quincena en enero».
  const primeraMitad = dia <= 15
  const indice = (anio * 12 + (mes - 1)) * 2 + (primeraMitad ? 0 : 1) + (n - 1)
  const meses = Math.floor(indice / 2)
  const a = Math.floor(meses / 12)
  const m = meses % 12
  return (((indice % 2) + 2) % 2) === 0 ? new Date(a, m, 15) : new Date(a, m, diasEnMes(a, m))
}

export function avanceDe(p: Plazos, ref = hoy()): Avance {
  const pagos: Pago[] = []
  let transcurridos = 0

  for (let n = 1; n <= p.pagos; n++) {
    const fecha = fechaDePago(p, n)
    const llegado = fecha <= ref
    if (llegado) transcurridos++
    // El de la ventana que se está mirando se resalta: al avanzar con las
    // flechas, marca hasta dónde llegarías en esa fecha.
    const enCurso = llegado
      && fecha.getFullYear() === ref.getFullYear()
      && fecha.getMonth() === ref.getMonth()
    pagos.push({ numero: n, fecha, estado: enCurso ? 'enCurso' : llegado ? 'pagado' : 'pendiente' })
  }

  // Se reparte el total entre los pagos en vez de multiplicar por el importe:
  // con un total que no divide exacto (29 850 / 9), multiplicar deja unos pesos
  // de diferencia que en pantalla parecen un error de cuentas.
  const pagado = Math.min(p.total, importeDePago(p) * transcurridos)

  return {
    transcurridos,
    restantes: p.pagos - transcurridos,
    pagado,
    falta: Math.max(0, p.total - pagado),
    porcentaje: (transcurridos / p.pagos) * 100,
    ultima: fechaDePago(p, p.pagos),
    terminada: transcurridos >= p.pagos,
    pagos,
  }
}

/** Lo que se debe HOY, venga de un saldo escrito a mano o de unos abonos que
    se van cayendo solos. Todo lo que necesite el saldo pasa por aquí. */
export function saldoDe(p: Prestamo, ref = hoy()): number {
  return p.plazos ? avanceDe(p.plazos, ref).falta : p.saldo
}
