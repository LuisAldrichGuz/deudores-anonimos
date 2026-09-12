import { useMemo, useState } from 'react'

import type { Datos } from '../../shared/almacen/datos'
import { esSalida, eventosEnRango } from '../../shared/finanzas/compromisos'
import type { TipoEvento } from '../../shared/finanzas/compromisos'
import { ingresoEnVentana, ventanaDe } from '../../shared/finanzas/ventanas'
import type { Unidad, Ventana } from '../../shared/finanzas/ventanas'

/* Todo lo que la portada necesita saber de la ventana que estás mirando.

   ⚠️ El cursor es `ventana.fin`, y TODO se calcula contra él: los totales, el
   avance de cada deuda y la barra global. Si un número se calculara contra
   `hoy`, la pantalla mezclaría dos momentos distintos y nadie notaría cuál. */

export type Grupo = 'fijo' | 'deuda' | 'ahorro'

const GRUPO_DE: Record<TipoEvento, Grupo> = {
  fijo: 'fijo', tarjeta: 'deuda', prestamo: 'deuda', ahorro: 'ahorro', corte: 'deuda',
}

export const TITULO_DE: Record<Grupo, string> = {
  fijo: 'Gastos fijos', deuda: 'Deudas', ahorro: 'Ahorro',
}

const ORDEN: Grupo[] = ['fijo', 'deuda', 'ahorro']

export function useVentana(datos: Datos) {
  const [unidad, setUnidad] = useState<Unidad>('quincena')
  const [ventana, setVentana] = useState<Ventana>(() => ventanaDe('quincena'))

  const grupos = useMemo(() => {
    const salidas = eventosEnRango(datos, ventana.inicio, ventana.fin).filter(esSalida)
    // Un mismo origen puede caer dos veces en la ventana (un gasto quincenal
    // dentro de un mes): se suman, o saldría repetido.
    const suma = new Map<string, { nombre: string; monto: number; grupo: Grupo }>()
    for (const e of salidas) {
      const previo = suma.get(e.origenId)
      if (previo) previo.monto += e.monto
      else suma.set(e.origenId, { nombre: e.nombre, monto: e.monto, grupo: GRUPO_DE[e.tipo] })
    }
    const conceptos = [...suma].map(([id, v]) => ({
      id, ...v, prestamo: datos.prestamos.find((p) => p.id === id),
    }))
    return ORDEN
      .map((grupo) => {
        const filas = conceptos.filter((c) => c.grupo === grupo).sort((a, b) => b.monto - a.monto)
        return { grupo, filas, subtotal: filas.reduce((s, f) => s + f.monto, 0) }
      })
      .filter((g) => g.filas.length > 0)
  }, [datos, ventana])

  const total = grupos.reduce((s, g) => s + g.subtotal, 0)
  const ingreso = ingresoEnVentana(datos.perfil, ventana)

  return {
    unidad, ventana, grupos, total, ingreso,
    corte: ventana.fin,
    libre: ingreso - total,
    porcentajeGastado: ingreso > 0 ? (total / ingreso) * 100 : 0,
    mover: (u: Unidad, v: Ventana) => { setUnidad(u); setVentana(v) },
  }
}
