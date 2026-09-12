import type { Datos } from '../almacen/datos'
import { costoMensual, eventosEnRango, esSalida, totalDe } from './compromisos'
import type { Evento } from './compromisos'
import { deudasVivas, interesDelMes } from './amortizacion'
import { ingresoMensual, periodoEnCurso, periodoSiguiente } from './periodos'
import type { Periodo } from './periodos'
import { hoy } from './fechas'

/* La foto completa: los números que se leen de un vistazo en la portada.

   Se calcula TODO junto y una sola vez porque casi todos dependen unos de
   otros (el porcentaje comprometido necesita el ingreso y el apartado, el
   semáforo necesita los dos porcentajes). Calcularlos por separado en cada
   componente es la forma de que la portada diga 38 % y la pantalla de al lado
   41 % sin que ninguno esté equivocado. */

export type Salud = 'bien' | 'cuidado' | 'peligro'

export type Panorama = {
  ingresoMensual: number

  /** Lo que debes hoy, todo junto. */
  deudaTotal: number
  /** Lo que se va SOLO en intereses cada mes, sin bajar un peso del saldo.
      Es el número que convence a cualquiera de mover algo. */
  interesMensual: number

  /** Lo que hay que apartar al mes, incluyendo la parte proporcional de lo
      que no se paga todos los meses (el seguro, la tenencia, el predial). */
  apartadoMensual: number
  pagoDeudaMensual: number
  gastoFijoMensual: number
  ahorroMensual: number
  libreMensual: number

  porcentajeComprometido: number
  porcentajeDeuda: number
  /** Saldo de tarjetas entre el límite total. Arriba de 30 % ya pesa en buró. */
  usoDeCredito: number
  salud: Salud

  ahorrado: number
  objetivoAhorro: number
  /** Lo que debería tener guardado para aguantar `colchonMeses` sin ingresos. */
  colchonRecomendado: number
}

export function panorama(datos: Datos): Panorama {
  const ingreso = ingresoMensual(datos.perfil)

  const deudas = deudasVivas(datos)
  const deudaTotal = deudas.reduce((s, d) => s + d.saldo, 0)
  const interesMensual = deudas.reduce((s, d) => s + interesDelMes(d.saldo, d.tasaAnual), 0)
  const pagoDeudaMensual = deudas.reduce((s, d) => s + d.pagoMensual, 0)

  const gastoFijoMensual = datos.fijos.reduce((s, f) => s + costoMensual(f), 0)
  const ahorroMensual = datos.metas.reduce((s, m) => s + m.aportacion, 0)
  const apartadoMensual = pagoDeudaMensual + gastoFijoMensual + ahorroMensual

  const limiteTotal = datos.tarjetas.reduce((s, t) => s + t.limite, 0)
  const saldoTarjetas = datos.tarjetas.reduce((s, t) => s + t.saldo, 0)

  const porcentajeComprometido = ingreso > 0 ? (apartadoMensual / ingreso) * 100 : 0
  const porcentajeDeuda = ingreso > 0 ? (pagoDeudaMensual / ingreso) * 100 : 0
  const usoDeCredito = limiteTotal > 0 ? (saldoTarjetas / limiteTotal) * 100 : 0

  return {
    ingresoMensual: ingreso,
    deudaTotal,
    interesMensual,
    apartadoMensual,
    pagoDeudaMensual,
    gastoFijoMensual,
    ahorroMensual,
    libreMensual: ingreso - apartadoMensual,
    porcentajeComprometido,
    porcentajeDeuda,
    usoDeCredito,
    salud: salud(porcentajeComprometido, porcentajeDeuda),
    ahorrado: datos.metas.reduce((s, m) => s + m.ahorrado, 0),
    objetivoAhorro: datos.metas.reduce((s, m) => s + m.objetivo, 0),
    colchonRecomendado: (gastoFijoMensual + pagoDeudaMensual) * datos.perfil.colchonMeses,
  }
}

/* Los cortes no son opinión mía: el pago de deuda sobre ingreso es el mismo
   criterio que usa un banco para decidir si te presta (arriba de 30 % ya
   empieza a decir que no), y el comprometido total marca cuánto margen queda
   para vivir. Se toma el peor de los dos: basta uno para tener un problema. */
function salud(comprometido: number, deuda: number): Salud {
  const porDeuda: Salud = deuda > 30 ? 'peligro' : deuda > 15 ? 'cuidado' : 'bien'
  const porTotal: Salud = comprometido > 90 ? 'peligro' : comprometido > 70 ? 'cuidado' : 'bien'
  const orden: Salud[] = ['bien', 'cuidado', 'peligro']
  return orden[Math.max(orden.indexOf(porDeuda), orden.indexOf(porTotal))]
}

export type ResumenPeriodo = {
  periodo: Periodo
  salidas: Evento[]
  total: number
  /** Lo que queda para vivir en ese periodo. Negativo = no alcanza. */
  sobra: number
}

function resumen(datos: Datos, periodo: Periodo): ResumenPeriodo {
  const salidas = eventosEnRango(datos, periodo.inicio, periodo.fin).filter(esSalida)
  const total = totalDe(salidas)
  return { periodo, salidas, total, sobra: periodo.ingreso - total }
}

/** El periodo en el que estás: el dinero ya te lo pagaron. */
export const resumenEnCurso = (datos: Datos, ref = hoy()) =>
  resumen(datos, periodoEnCurso(datos.perfil, ref))

/** El que viene: el dinero que TODAVÍA NO TIENES y ya está comprometido.
    Es el número grande de la portada. */
export const resumenSiguiente = (datos: Datos, ref = hoy()) =>
  resumen(datos, periodoSiguiente(datos.perfil, ref))
