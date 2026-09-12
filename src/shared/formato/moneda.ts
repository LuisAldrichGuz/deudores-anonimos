/* Un solo sitio decide cómo se ve el dinero. */

const PESOS = new Intl.NumberFormat('es-MX', {
  style: 'currency', currency: 'MXN', maximumFractionDigits: 0,
})

const PESOS_CENTAVOS = new Intl.NumberFormat('es-MX', {
  style: 'currency', currency: 'MXN', minimumFractionDigits: 2, maximumFractionDigits: 2,
})

/** Lo normal: sin centavos. En un presupuesto los centavos son ruido. */
export const pesos = (n: number) => PESOS.format(redondeaCero(n))

/** Solo donde el centavo importa (intereses de un día, cuotas calculadas). */
export const pesosConCentavos = (n: number) => PESOS_CENTAVOS.format(redondeaCero(n))

export const porcentaje = (n: number, decimales = 0) =>
  `${n.toLocaleString('es-MX', { minimumFractionDigits: decimales, maximumFractionDigits: decimales })} %`

/** «13 meses» → «1 año y 1 mes». Para la fecha de salir de deudas. */
export function textoDuracion(meses: number): string {
  if (meses <= 0) return 'ya'
  const a = Math.floor(meses / 12)
  const m = meses % 12
  const partes: string[] = []
  if (a) partes.push(a === 1 ? '1 año' : `${a} años`)
  if (m) partes.push(m === 1 ? '1 mes' : `${m} meses`)
  return partes.join(' y ')
}

/** -0 existe en JavaScript y se imprime como «-$0», que parece un error. */
const redondeaCero = (n: number) => (Object.is(n, -0) || Math.abs(n) < 0.005 ? 0 : n)
