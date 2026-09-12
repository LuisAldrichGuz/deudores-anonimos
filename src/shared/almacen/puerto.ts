import type { Datos } from './datos'

/* ─────────────────────────────────────────────────────────────
   El puerto de persistencia.

   La app NO sabe dónde viven los datos. Habla con esta interfaz y nada más,
   así que cambiar el navegador por un backend, por IndexedDB o por un archivo
   es escribir OTRO adaptador — no tocar pantallas.

   Tres decisiones que parecen de más y no lo son:

   - Todo devuelve Promise aunque el adaptador del navegador sea síncrono. Si
     el puerto fuera síncrono, el primer adaptador con red obligaría a cambiar
     la firma y con ella cada llamada de la app.
   - `cargar()` devuelve null cuando NO HAY NADA guardado, que no es lo mismo
     que unos datos vacíos: con null la app enseña la bienvenida; con datos
     vacíos, una app que el usuario ya vació.
   - Los errores se lanzan. Quien decide qué hacer con un fallo de guardado es
     la interfaz (avisar, reintentar), no el adaptador.
───────────────────────────────────────────────────────────── */
export interface AlmacenDeDatos {
  /** Para la pantalla de ajustes: «Guardado en: este navegador». */
  readonly nombre: string
  cargar(): Promise<Datos | null>
  guardar(datos: Datos): Promise<void>
  limpiar(): Promise<void>
}
