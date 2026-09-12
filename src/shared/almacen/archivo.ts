import type { Datos } from './datos'
import { leerDatos } from './datos'

/* Bajar y subir el archivo con todo lo tuyo.

   Vive en `shared/` y no dentro de Ajustes porque lo usan DOS pantallas: la de
   ajustes y la de bienvenida —que es donde de verdad hace falta, cuando
   todavía no hay nada y lo que quieres es traerte tus datos de otro lado.

   Es la contraparte de no tener servidor: si la app no guarda nada de nadie,
   tiene que ser MUY fácil llevarte tus datos. El formato es el mismo objeto
   que usa la app por dentro — JSON legible, sin comprimir y sin cifrar, para
   que se pueda abrir con cualquier editor y arreglar a mano si hace falta. */

const nombreDeArchivo = () => {
  const f = new Date()
  const dd = (n: number) => String(n).padStart(2, '0')
  return `deudores-anonimos-${f.getFullYear()}-${dd(f.getMonth() + 1)}-${dd(f.getDate())}.json`
}

export function descargar(datos: Datos) {
  const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombreDeArchivo()
  a.click()
  // Sin esto el blob se queda en memoria hasta recargar la página.
  URL.revokeObjectURL(url)
}

export class ArchivoInvalido extends Error {}

/** Lee el JSON pegado o leído de un archivo. Lanza `ArchivoInvalido` con un
    mensaje que se puede enseñar tal cual: aquí el error no es un fallo del
    programa, es que le pasaron el texto equivocado. */
export function leerTexto(texto: string): Datos {
  let crudo: unknown
  try {
    crudo = JSON.parse(texto)
  } catch {
    throw new ArchivoInvalido('Eso no es un JSON válido.')
  }
  const datos = leerDatos(crudo)
  if (!datos) {
    throw new ArchivoInvalido('Es JSON, pero no tiene la forma que esta app guarda.')
  }
  return datos
}

export async function leerArchivo(archivo: File): Promise<Datos> {
  return leerTexto(await archivo.text())
}
