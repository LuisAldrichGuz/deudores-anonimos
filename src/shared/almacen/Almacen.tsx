import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { Datos } from './datos'
import { DATOS_VACIOS } from './datos'
import type { AlmacenDeDatos } from './puerto'
import { almacenNavegador } from './almacen-navegador'

/* Único punto por el que pasan los datos de la app. Los componentes leen de
   aquí y escriben por `cambiar`; ninguno sabe si detrás hay un navegador, una
   API o un archivo — eso lo decide el adaptador que se le pase al proveedor
   (ver src/shared/almacen/puerto.ts y docs/integrar-un-backend.md). */

export type EstadoGuardado = 'inactivo' | 'guardando' | 'guardado' | 'error'

type Almacen = {
  datos: Datos
  /** Cambia el estado. Recibe los datos actuales y devuelve los nuevos. */
  cambiar: (f: (d: Datos) => Datos) => void
  reemplazar: (d: Datos) => void
  borrarTodo: () => void
  /** false mientras no se ha leído el almacén: sin esto, el primer fotograma
      enseña «no tienes nada» y parece que se perdió el trabajo. */
  listo: boolean
  /** No hay nada guardado: es la primera visita, toca la bienvenida. */
  primeraVez: boolean
  guardado: EstadoGuardado
  dondeSeGuarda: string
}

const Contexto = createContext<Almacen | null>(null)

/** Margen entre la última tecla y el guardado. Con el navegador daría igual;
    existe para que un adaptador con red no mande una petición por letra. */
const ESPERA_MS = 400

export function ProveedorAlmacen({
  children,
  almacen = almacenNavegador,
}: {
  children: ReactNode
  almacen?: AlmacenDeDatos
}) {
  const [datos, setDatos] = useState<Datos>(DATOS_VACIOS)
  const [listo, setListo] = useState(false)
  const [primeraVez, setPrimeraVez] = useState(true)
  const [guardado, setGuardado] = useState<EstadoGuardado>('inactivo')
  const temporizador = useRef<number | undefined>(undefined)

  useEffect(() => {
    let vivo = true
    almacen.cargar().then((d) => {
      if (!vivo) return
      if (d) {
        setDatos(d)
        setPrimeraVez(false)
      }
      setListo(true)
    })
    return () => { vivo = false }
  }, [almacen])

  useEffect(() => {
    if (!listo) return
    window.clearTimeout(temporizador.current)
    setGuardado('guardando')
    temporizador.current = window.setTimeout(() => {
      almacen.guardar(datos).then(
        () => setGuardado('guardado'),
        () => setGuardado('error'),
      )
    }, ESPERA_MS)
    return () => window.clearTimeout(temporizador.current)
  }, [datos, listo, almacen])

  const cambiar = useCallback((f: (d: Datos) => Datos) => {
    setPrimeraVez(false)
    setDatos((d) => f(d))
  }, [])

  const reemplazar = useCallback((d: Datos) => {
    setPrimeraVez(false)
    setDatos(d)
  }, [])

  const borrarTodo = useCallback(() => {
    window.clearTimeout(temporizador.current)
    almacen.limpiar().then(() => {
      setDatos(DATOS_VACIOS)
      setPrimeraVez(true)
      setGuardado('inactivo')
    })
  }, [almacen])

  const valor = useMemo<Almacen>(
    () => ({ datos, cambiar, reemplazar, borrarTodo, listo, primeraVez, guardado, dondeSeGuarda: almacen.nombre }),
    [datos, cambiar, reemplazar, borrarTodo, listo, primeraVez, guardado, almacen.nombre],
  )

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useAlmacen() {
  const v = useContext(Contexto)
  if (!v) throw new Error('useAlmacen() se llamó fuera de <ProveedorAlmacen>')
  return v
}
