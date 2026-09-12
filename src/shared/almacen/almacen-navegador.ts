import type { AlmacenDeDatos } from './puerto'
import type { Datos } from './datos'
import { leerDatos } from './datos'

const LLAVE = 'deudores-anonimos:v1'

/* El adaptador por defecto: el almacenamiento del propio navegador.
   Nada sale del dispositivo, que es la promesa del proyecto.

   ⚠️ `localStorage` puede lanzar aunque exista: hay navegadores que lo
   declaran y luego niegan el acceso (modo privado, permisos del sitio,
   almacenamiento lleno). Se trata como «no hay dónde guardar», no como
   error de programación: la app sigue funcionando, solo que sin memoria. */
export const almacenNavegador: AlmacenDeDatos = {
  nombre: 'este navegador',

  async cargar() {
    try {
      const crudo = localStorage.getItem(LLAVE)
      if (!crudo) return null
      return leerDatos(JSON.parse(crudo))
    } catch {
      return null
    }
  },

  async guardar(datos: Datos) {
    try {
      localStorage.setItem(LLAVE, JSON.stringify(datos))
    } catch {
      /* sin espacio o sin permiso */
    }
  },

  async limpiar() {
    try {
      localStorage.removeItem(LLAVE)
    } catch {
      /* ídem */
    }
  },
}
