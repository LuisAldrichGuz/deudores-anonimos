# Arquitectura

Una SPA sin backend. Todo lo que hay que entender cabe en tres ideas:

1. **La app se agrupa por lo que el usuario hace**, no por lo que las cosas son
   técnicamente. No hay una carpeta `components/` con cuarenta archivos de features
   distintas.
2. **La matemática no sabe que existe React.**
3. **Los datos entran y salen por un solo sitio.**

---

## Las capas

```
src/
  app/                  Arranque: tema, rutas, armazón de navegación, PWA.
                        Es lo único que sabe que esto es una SPA en /deudas/.

  features/<feature>/   Una carpeta por PANTALLA o por capacidad del usuario.
                        Dentro va todo lo suyo: la pantalla, sus piezas y sus
                        cálculos propios. Ninguna importa de los internos de otra.

  shared/almacen/       El modelo de datos y el PUERTO de persistencia.
  shared/finanzas/      Toda la matemática del dominio. Funciones puras.
  shared/formato/       Cómo se ve el dinero y la duración.
  shared/ui/            Piezas visuales con DOS O MÁS consumidores.
```

La flecha de dependencias va siempre en el mismo sentido y no se cruza:

```
app  ──►  features  ──►  shared/{almacen, finanzas, formato, ui}
```

`shared/finanzas` no importa de React ni de MUI. `features` no importa de `app`.
Una feature que necesita algo de otra es la señal de que falta subirlo a `shared/`.

## Qué vive en cada feature

| Carpeta | Qué resuelve |
|---|---|
| `bienvenida/` | La primera visita: pide el ingreso, o carga el ejemplo |
| `resumen/` | La portada: dinero comprometido, semáforo, reparto por quincena |
| `calendario/` | El mes con sus cortes y pagos |
| `compromisos/` | Alta, edición y borrado de tarjetas, deudas, gastos fijos y metas |
| `plan/` | El simulador de salida de deudas |
| `ajustes/` | Perfil de ingreso, tema, instalación y el archivo de datos |

## El puerto de persistencia

Es la decisión estructural del proyecto. La app **no sabe dónde viven los datos**:

```ts
// src/shared/almacen/puerto.ts
export interface AlmacenDeDatos {
  readonly nombre: string
  cargar(): Promise<Datos | null>
  guardar(datos: Datos): Promise<void>
  limpiar(): Promise<void>
}
```

`ProveedorAlmacen` recibe una implementación y expone `useAlmacen()` a toda la app.
El adaptador por omisión es `almacenNavegador` (`localStorage`).

Tres decisiones que parecen de más y no lo son:

- **Todo devuelve `Promise`** aunque el navegador sea síncrono. Si el puerto fuera
  síncrono, el primer adaptador con red obligaría a cambiar la firma y con ella
  cada llamada de la app.
- **`cargar()` devuelve `null` cuando NO HAY NADA**, que no es lo mismo que unos
  datos vacíos: con `null` se enseña la bienvenida; con datos vacíos, una app que
  el usuario ya vació.
- **El guardado va con retardo** (400 ms). Con `localStorage` daría igual; existe
  para que un adaptador con red no mande una petición por tecla.

→ Cómo escribir otro adaptador: **[integrar-un-backend.md](integrar-un-backend.md)**

## Por qué no hay estado global

No hay Redux, Zustand ni React Query, y no es minimalismo por deporte: **el estado
de esta app es un solo objeto que cabe en un JSON de 3 KB**. Un `useState` en un
contexto lo resuelve entero. Meter una librería de estado aquí sería añadir
conceptos (acciones, selectores, invalidación) para un problema que no existe.

El día que haya servidor, lo que hace falta es caché de red — y ahí sí entra React
Query, envolviendo el adaptador, sin tocar los componentes.

## Los cálculos

Todo lo que es matemática de dinero vive en `shared/finanzas/`, en funciones puras
sobre objetos planos:

| Archivo | De qué responde |
|---|---|
| `fechas.ts` | Fechas de calendario. **Nunca UTC**: un pago del día 1 en México con `new Date('2026-03-01')` se va al 28 de febrero |
| `compromisos.ts` | Convierte TODO (tarjetas, deudas, fijos, metas) en una sola lista de eventos con fecha y monto |
| `periodos.ts` | Los periodos de cobro: de un pago al siguiente |
| `amortizacion.ts` | Intereses y meses para liquidar una deuda |
| `estrategias.ts` | Avalancha, bola de nieve y la referencia de «no hacer nada» |
| `panorama.ts` | La foto completa de la portada, calculada de una sola pasada |

**`compromisos.ts` es el único generador de eventos de la app.** El calendario, la
portada, el reparto por quincena y el semáforo leen de la misma función. Si el mes
de una tarjeta se calculara en un sitio y el del calendario en otro, tarde o
temprano dirían cosas distintas y ninguno de los dos estaría «mal».

Lo mismo con `panorama()`: los números de la portada se calculan **juntos y una
vez**, y bajan como props. Ningún hijo puede llegar a otro resultado.

## Dónde meter lo nuevo

| Quiero añadir… | Va en… | Y además toca… |
|---|---|---|
| Un tipo de compromiso nuevo (p. ej. una suscripción anual compartida) | `shared/almacen/datos.ts` + su `features/compromisos/<tipo>/` | `leerDatos()`, `eventosEnRango()`, `panorama()` y una pestaña en `PantallaPagos` |
| Una pantalla | `features/<nombre>/` con `Pantalla<Nombre>.tsx` por defecto | una línea en `app/rutas.ts` y un `lazy()` en `app/App.tsx` |
| Un cálculo | `shared/finanzas/` si lo usan dos features; dentro de la feature si no | — |
| Un componente visual | dentro de la feature. **Sube a `shared/ui/` cuando lo pida un SEGUNDO consumidor**, nunca antes | — |
| Un adaptador de persistencia | `shared/almacen/almacen-<qué>.ts` | solo `main.tsx`, para pasárselo al proveedor |

⚠️ **Al tocar el modelo de datos, `leerDatos()` no es opcional.** Es el único sitio
por donde entra un JSON de fuera (importado por el usuario o guardado por una
versión anterior de la app). Un campo nuevo que no esté ahí llega `undefined` a un
cálculo y sale como `NaN` en pantalla, sin un solo error en consola.
