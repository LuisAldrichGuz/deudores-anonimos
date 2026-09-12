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
| `bienvenida/` | La primera visita: pide el ingreso, o carga un JSON |
| `resumen/` | La portada: el cursor de tiempo, el medidor y lo que cae en esa ventana |
| `compromisos/` | Alta, edición y borrado de deudas, gastos fijos, tarjetas y metas |
| `estadisticas/` | Los aros del mes, la proyección y la fecha de salida |
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
| `compromisos.ts` | Convierte TODO (deudas, tarjetas, fijos, metas) en una sola lista de eventos con fecha y monto |
| `plazos.ts` | Las deudas a abonos fijos: el calendario de pagos y el avance, calculados desde la fecha |
| `ventanas.ts` | Semana, quincena y mes, más los días en que te pagan |
| `amortizacion.ts` | Intereses, meses para liquidar y el total de deuda a una fecha |
| `estadisticas.ts` | Proyección mensual, fecha de libertad y reparto de la deuda |

**`compromisos.ts` es el único generador de eventos de la app.** La portada y las
estadísticas leen de la misma función. Si el calendario de una deuda se calculara en
un sitio y el de la portada en otro, tarde o temprano dirían cosas distintas y
ninguno de los dos estaría «mal».

**Y casi todo acepta una fecha de referencia.** `saldoDe(prestamo, ref)`,
`resumenDeDeuda(datos, ref)`, `avanceDe(plazos, ref)`: el cursor de la portada es el
FINAL de la ventana que estás mirando, y por eso navegar con las flechas no cambia
solo la lista — recalcula el avance de cada deuda. ⚠️ Un número que se calculara
contra `hoy` mezclaría dos momentos en la misma pantalla y nadie notaría cuál.

## Dónde meter lo nuevo

| Quiero añadir… | Va en… | Y además toca… |
|---|---|---|
| Un tipo de compromiso nuevo (p. ej. una suscripción anual compartida) | `shared/almacen/datos.ts` + su `features/compromisos/<tipo>/` | `leerDatos()`, `eventosEnRango()` y una ficha en `PantallaPagos` |
| Una pantalla | `features/<nombre>/` con `Pantalla<Nombre>.tsx` por defecto | una línea en `app/rutas.ts` y un `lazy()` en `app/App.tsx` |
| Un cálculo | `shared/finanzas/` si lo usan dos features; dentro de la feature si no | — |
| Un componente visual | dentro de la feature. **Sube a `shared/ui/` cuando lo pida un SEGUNDO consumidor**, nunca antes | — |
| Un adaptador de persistencia | `shared/almacen/almacen-<qué>.ts` | solo `main.tsx`, para pasárselo al proveedor |

⚠️ **Al tocar el modelo de datos, `leerDatos()` no es opcional.** Es el único sitio
por donde entra un JSON de fuera (importado por el usuario o guardado por una
versión anterior de la app). Un campo nuevo que no esté ahí llega `undefined` a un
cálculo y sale como `NaN` en pantalla, sin un solo error en consola.
