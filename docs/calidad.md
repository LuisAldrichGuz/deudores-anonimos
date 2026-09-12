# Las reglas de este código

Lo que sigue no es una lista de buenas intenciones: es lo que hay que poder decir
de cualquier archivo del repo. Sirve para escribir código nuevo y para revisar un
*pull request*.

---

## 1. Un archivo = una responsabilidad, y se nota en el nombre

- Si el nombre necesita una «y», el archivo hace dos cosas.
- **Prohibidos los cajones de sastre**: nada de `utils.ts`, `helpers.ts`,
  `common/`, `misc/` ni un `types.ts` con todo dentro. Se nombra por lo que hace:
  `amortizacion.ts`, `archivo-de-datos.ts`, `CamposNumericos.tsx`.
- Una carpeta que pasa de ~10 archivos pide subcarpetas por sub-tema.
- Un archivo que pasa de ~400 líneas pide partirse.

## 2. La abstracción se escribe con los casos a la vista, nunca antes

`SeccionCrud` existe porque hay **cuatro** listas que se comportan igual (tarjetas,
deudas, gastos fijos y metas). Con una sola habría sido adivinar; con dos, una
corazonada. Con cuatro es un hecho.

La regla operativa: **copiar y pegar dos veces es un aviso; tres es un error** →
extrae. Y nada sube a `shared/` hasta que lo pide un **segundo** consumidor.

## 3. Los comentarios explican el *por qué*, no el *qué*

El código ya dice qué hace. Un comentario que lo repite es ruido que además se
queda desactualizado. Aquí se comenta:

- **Las trampas**, marcadas con ⚠️. Si algo falla en silencio, lleva comentario:

  ```ts
  // ⚠️ Todo aquí trabaja con Date a MEDIANOCHE LOCAL. Nada de UTC: un pago del
  // día 1 en México con `new Date('2026-03-01')` se convierte en el 28 de
  // febrero a las 18:00, y el gasto se va al mes anterior sin que nadie vea un
  // error.
  ```

- **Las decisiones que parecen de más.** Todo `Promise` en un puerto síncrono, el
  retardo al guardar, el orden de las series de una gráfica.
- **Lo que se probó y no funcionó**, para que nadie lo vuelva a intentar.

Y el tamaño se ajusta a lo que vale: una trampa merece una línea, no tres párrafos.

## 4. Los cálculos no saben que existe React

Todo `shared/finanzas/` son funciones puras sobre objetos planos. Ni un `import` de
React ni de MUI. Esto no es purismo: es lo que permite leer una fórmula sin
desenredarla de un componente, y probarla sin montar un árbol.

**La consecuencia práctica:** si te encuentras escribiendo un `useMemo` con quince
líneas de matemática dentro, esa matemática va a `shared/finanzas/` y el `useMemo`
solo la llama.

## 5. Un número se calcula UNA vez y baja como props

La portada llama a `panorama()` una sola vez y reparte el resultado. Si cada tarjeta
calculara lo suyo, dos pantallas acabarían diciendo 38 % y 41 % **sin que ninguna
estuviera equivocada**, y ese es el bug más caro de encontrar que hay.

Lo mismo con `eventosEnRango()`: es el único generador de eventos de la app.

## 6. Los estados raros se dibujan, no se asumen

Cada pantalla responde a las cuatro preguntas antes de darse por terminada:

| Estado | Qué se ve |
|---|---|
| Cargando | Un indicador, nunca la pantalla vacía (parece que se perdió el trabajo) |
| Vacío | Qué es esto y **el botón que lo arregla**. Un «sin datos» a secas deja al usuario buscando dónde se añade |
| Con datos | Lo normal |
| Imposible | El caso que rompe la fórmula, dicho en palabras |

Ese último es el que casi nadie hace. Aquí: si un pago no cubre ni los intereses,
la app **no dibuja una fecha de salida imposible** — dice por qué no la hay y
cuánto habría que pagar.

## 7. Todo texto que ve el usuario está escrito para una persona

- Se habla de tú, en corto, sin jerga financiera sin traducir.
- **Un aviso sin la siguiente acción no sirve.** No «vas mal»: *«en la quincena del
  31 al 14 te faltan $3,899; mover el crédito del carro al otro periodo deja el
  faltante en $49»*.
- Los números van con `.cifras` (`font-variant-numeric: tabular-nums`), o las
  cantidades en columna salen desalineadas aunque estén bien.

## 8. TypeScript en estricto, y sin `any`

`strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`.
El `build` corre `tsc --noEmit` **antes** de compilar: un error de tipos no llega a
producción.

Cuando el tipo de una librería se queda corto, se **extiende**, no se castea. Los
colores «contenedor» de Material 3 no existen en la paleta de MUI, así que se
añaden al tipo:

```ts
declare module '@mui/material/styles' {
  interface PaletteColor { contenedor: string; sobreContenedor: string }
}
```

A partir de ahí `theme.palette.primary.contenedor` se autocompleta y el compilador
avisa si falta en uno de los dos esquemas de color. Un `as any` habría funcionado
igual hoy y roto en silencio el día que se cambie la paleta.

## 9. Nunca un color a mano

Se pide el **papel** que juega el color (`primary.contenedor`, `text.secondary`,
`divider`), nunca un hexadecimal. Un `#c8102e` suelto en un componente es un
componente que no tiene modo oscuro y nadie se entera hasta que alguien lo abre de
noche.

## 10. Cada dependencia se justifica, y se quita cuando sobra

Las barras y los aros están escritos a mano —SVG y CSS, unas 150 líneas— porque
ninguna librería de gráficas dibuja lo que hacía falta: una barra por mes partida a
la mitad cuando se paga por quincena, con el ancho proporcional a los pagos que caen
en cada mes. Escribirlos quitó `@mui/x-charts` del paquete y bajó la precarga de la
app a menos de la mitad.

Al revés también: el service worker **no** está escrito a mano, porque los archivos
que emite Vite llevan un hash en el nombre y ninguna lista escrita a mano puede
conocerlos. Ahí la librería (Workbox) es la respuesta correcta.

La regla es la misma en los dos casos: **se usa librería cuando resuelve el
problema real, no cuando resuelve uno parecido.**

## Revisar un cambio

```bash
npm run build     # tsc --noEmit + vite build. Si esto pasa, el tipado está bien.
```

Y a ojo, en este orden:

1. ¿El archivo nuevo está en la feature que le toca, o cayó en `shared/` sin tener
   dos consumidores?
2. ¿Hay matemática dentro de un componente?
3. ¿Los comentarios explican por qué, o repiten el código?
4. ¿Se dibujaron los cuatro estados?
5. ¿Hay algún color, texto o número escrito a mano que debería venir del tema, de
   un token o de un cálculo?
6. Si tocó el modelo: ¿se actualizó `leerDatos()`?
