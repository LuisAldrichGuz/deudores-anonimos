import type { Datos } from './datos'
import { VERSION_DATOS } from './datos'

/* Un caso realista para que la app se pueda MIRAR sin capturar nada: quien
   entra desde el portafolio no va a teclear sus deudas para ver qué hace.
   Se carga desde Ajustes y se borra con un botón. */
export const DATOS_DE_EJEMPLO: Datos = {
  version: VERSION_DATOS,
  perfil: { ingreso: 11000, frecuencia: 'quincenal', diasDeCobro: [15, 31], colchonMeses: 3 },
  tarjetas: [
    { id: 'ej-t1', nombre: 'Tarjeta azul', limite: 30000, saldo: 18400, tasaAnual: 68, diaCorte: 12, diasParaPagar: 20, pagoMensual: 2000 },
    { id: 'ej-t2', nombre: 'Tarjeta morada', limite: 15000, saldo: 4800, tasaAnual: 94, diaCorte: 27, diasParaPagar: 18, pagoMensual: 900 },
  ],
  prestamos: [
    { id: 'ej-p1', nombre: 'Crédito del carro', saldo: 61800, tasaAnual: 22, pagoMensual: 3850, diaPago: 5 },
    { id: 'ej-p2', nombre: 'Préstamo personal', saldo: 12400, tasaAnual: 38, pagoMensual: 1600, diaPago: 20 },
  ],
  fijos: [
    { id: 'ej-f1', nombre: 'Renta', categoria: 'renta', monto: 6500, frecuencia: 'mensual', diaPago: 1 },
    { id: 'ej-f2', nombre: 'Luz', categoria: 'servicios', monto: 980, frecuencia: 'bimestral', diaPago: 18, mesBase: 1 },
    { id: 'ej-f3', nombre: 'Internet', categoria: 'servicios', monto: 499, frecuencia: 'mensual', diaPago: 9 },
    { id: 'ej-f4', nombre: 'Streaming', categoria: 'suscripcion', monto: 219, frecuencia: 'mensual', diaPago: 22 },
    { id: 'ej-f5', nombre: 'Gimnasio', categoria: 'salud', monto: 450, frecuencia: 'mensual', diaPago: 3 },
    { id: 'ej-f6', nombre: 'Transporte', categoria: 'transporte', monto: 700, frecuencia: 'quincenal', diaPago: 1 },
    { id: 'ej-f7', nombre: 'Tenencia y seguro del carro', categoria: 'transporte', monto: 9800, frecuencia: 'anual', diaPago: 20, mesBase: 3 },
  ],
  metas: [
    { id: 'ej-m1', nombre: 'Fondo de emergencia', objetivo: 42000, ahorrado: 6500, aportacion: 1000, diaPago: 16 },
    { id: 'ej-m2', nombre: 'Cambio de laptop', objetivo: 25000, ahorrado: 3200, aportacion: 500, diaPago: 16 },
  ],
}
