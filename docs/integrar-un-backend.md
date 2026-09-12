# Ponerle un backend

La app no guarda nada en ningún servidor **a propósito**, pero está construida para
que eso se pueda cambiar sin reescribirla. Si quieres sincronizar entre
dispositivos, compartir un presupuesto con tu pareja o montar un SaaS encima, esta
es la guía.

---

## Lo único que hay que implementar

Toda la persistencia pasa por una interfaz de cuatro métodos:

```ts
// src/shared/almacen/puerto.ts
export interface AlmacenDeDatos {
  readonly nombre: string          // sale en Ajustes: «Guardado en: …»
  cargar(): Promise<Datos | null>  // null = NO HAY NADA guardado todavía
  guardar(datos: Datos): Promise<void>
  limpiar(): Promise<void>
}
```

`Datos` es un objeto plano serializable (`src/shared/almacen/datos.ts`). Lo que
guardas es exactamente lo que el usuario se descarga con el botón de exportar.

**Ningún componente de la app cambia.** Todos hablan con `useAlmacen()`, y
`useAlmacen()` habla con el puerto.

## Ejemplo completo

```ts
// src/shared/almacen/almacen-api.ts
import type { AlmacenDeDatos } from './puerto'
import type { Datos } from './datos'
import { leerDatos } from './datos'

export function almacenApi(base: string, token: () => string): AlmacenDeDatos {
  const cabeceras = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token()}`,
  })

  return {
    nombre: 'tu cuenta',

    async cargar() {
      const r = await fetch(`${base}/presupuesto`, { headers: cabeceras() })
      if (r.status === 404) return null        // ⚠️ null, NO un objeto vacío
      if (!r.ok) throw new Error(`El servidor respondió ${r.status}`)
      // ⚠️ Lo que llega de la red se valida igual que un archivo del usuario.
      return leerDatos(await r.json())
    },

    async guardar(datos: Datos) {
      const r = await fetch(`${base}/presupuesto`, {
        method: 'PUT',
        headers: cabeceras(),
        body: JSON.stringify(datos),
      })
      if (!r.ok) throw new Error(`No se pudo guardar (${r.status})`)
    },

    async limpiar() {
      await fetch(`${base}/presupuesto`, { method: 'DELETE', headers: cabeceras() })
    },
  }
}
```

Y se conecta en un solo sitio:

```tsx
// src/main.tsx
<ProveedorAlmacen almacen={almacenApi('/api/v1', () => sesion.token)}>
  <App />
</ProveedorAlmacen>
```

Listo. La app entera funciona contra tu API.

## Las cinco trampas

1. **`cargar()` devuelve `null` cuando no hay nada, no un objeto vacío.** Con `null`
   la app enseña la bienvenida; con un objeto vacío enseña una app que el usuario
   ya vació. Un 404 del servidor es `null`, no un error.

2. **Valida lo que llega de la red con `leerDatos()`.** Sí, el servidor es tuyo.
   También es el que se va a quedar con un campo viejo el día que despliegues una
   versión nueva del cliente antes que la del backend. `leerDatos()` acota rangos y
   rellena lo que falte, y es la diferencia entre una pantalla con un dato raro y
   una pantalla llena de `NaN`.

3. **El guardado ya va con retardo (400 ms) y no hace falta que lo pongas tú.**
   `ProveedorAlmacen` agrupa las escrituras: el usuario teclea «12000» y sale una
   petición, no cinco. Si tu API es cara, sube el valor de `ESPERA_MS`.

4. **Los errores de `guardar()` no rompen la app.** El proveedor los recoge y pone
   el estado en `'error'` (`useAlmacen().guardado`). Hoy nadie lo pinta porque con
   `localStorage` no falla nunca; con red, **eso es lo primero que tienes que
   enseñar en pantalla** — un cambio que no se guardó y no avisa es peor que un
   error.

5. **Ojo con el último escritor.** Este puerto guarda el objeto entero. Dos
   dispositivos editando a la vez: el último pisa al otro. Si te importa, añade un
   `version`/`updatedAt` al objeto, recházalo en el servidor con un 409 y resuelve
   el conflicto en `guardar()`. **El puerto no lo hace por ti a propósito**: qué
   significa «conflicto» depende de tu producto.

## Ideas que ya caben sin tocar la app

- **Los dos a la vez.** Un adaptador que escribe en `localStorage` *y* en la API, y
  lee del navegador primero. Offline gratis: la app ya es una PWA.
- **IndexedDB** en lugar de `localStorage`, si los datos crecen (`localStorage` se
  queda en ~5 MB).
- **Cifrado en el cliente**: el adaptador cifra antes de `guardar()` y descifra en
  `cargar()`. El servidor guarda un blob que no puede leer.

## Lo que SÍ habría que tocar si metes cuentas de usuario

El puerto cubre los datos. Un producto con cuentas necesita además:

- Inicio de sesión y manejo del token (una feature nueva, `features/sesion/`).
- Enseñar en la interfaz el estado de guardado y los errores de red.
- Cambiar el texto de privacidad de la bienvenida y de Ajustes. **Ese texto es una
  promesa concreta** («no hay cuenta ni servidor»); si deja de ser cierta, cambiarlo
  no es opcional.
- Revisar [seguridad.md](seguridad.md): buena parte de ese documento dice «no hay
  servidor». Con backend, ese documento se reescribe entero.
