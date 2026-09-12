# Bitácora

Qué entró y qué salió en cada versión.

## 2.0.0 — 2026-09-12

Rediseño completo y un modelo de deuda nuevo. La app pasó de cinco pantallas a
tres y de una paleta verde a un neutro oscuro.

### Entró

- **Deudas a plazos fijos**: se guarda lo que costó, en cuántos pagos, cada cuándo
  y desde cuándo — el saldo y el avance SE CALCULAN con la fecha, así nadie tiene
  que actualizar un número cada mes. Con periodicidad **mensual o quincenal**.
- **Pagos que siguen tu nómina**: una deuda o un gasto fijo se puede pagar cuando
  te cae el dinero, repartido entre tus días de cobro, en vez de un cargo entero
  un día suelto. La renta partida en dos mitades deja de inflar una quincena y
  vaciar la otra.
- **Cursor de tiempo**: semana, quincena o mes, navegable con flechas. TODO se
  recalcula a esa fecha —los totales, el avance de cada deuda, la barra global—,
  así que se puede ver cómo vas a estar dentro de tres quincenas.
- **Línea de tiempo por deuda**: una barra por mes, partida a la mitad si pagas
  por quincena, con el ancho proporcional a los pagos que caen en cada mes.
- **Pantalla de estadísticas**: aros de gastado y libre, fecha exacta de salida,
  lo que cae cada mes hasta entonces, ratio deuda/ingreso, reparto de la deuda y
  cuáles caen primero.
- **Grafito**: paleta neutra con tres acentos de la misma luminosidad y croma
  (solo cambia el tono), Instrument Sans para la interfaz y JetBrains Mono
  tabular para toda cifra. Entrada escalonada, aros y barras que se llenan una
  vez, todo apagado con `prefers-reduced-motion`.
- **Navegación abajo**, con el botón de añadir en medio: esto se usa con una mano.
- **Instalación en iOS**: `apple-mobile-web-app-capable` y sus hermanas. Sin
  ellas el icono se ponía en la pantalla de inicio pero la app abría dentro de
  Safari, con su barra encima.
- **Caché de producción por capas**: un año e `immutable` para lo que lleva hash,
  30 días para los iconos, y `no-cache` para el `index.html`, el service worker y
  el manifiesto — los tres que deciden si el usuario ve una versión nueva.

### Salió

- Las pantallas de **calendario** y de **plan de salida** (avalancha y bola de
  nieve), el **semáforo de tres barras**, el **fondo de emergencia** y los **datos
  de ejemplo**: la app hacía muchas cosas a medias en vez de pocas bien.
- `@mui/x-charts` y `react-icons`: las barras y los aros son SVG y CSS. La
  precarga bajó de 1.2 MB a 775 KB.
- `panorama.ts`, `periodos.ts`, `estrategias.ts`, `ListaDePagos`, `TarjetaDato` y
  una docena de funciones que se quedaron sin consumidor.
- Los textos de ayuda bajo los campos, las leyendas de colores y los pies
  explicativos de cada tarjeta.

## 1.0.0 — 2026-09-12

Primera versión pública.

### Entró

- **Resumen**: dinero comprometido de la próxima quincena, semáforo de salud
  (comprometido, pago de deuda e uso de línea), reparto por periodo de cobro con
  sugerencia de qué pago mover, próximos pagos y fondo de emergencia.
- **Calendario**: mes propio con varios marcadores por día (corte, pago de tarjeta,
  mensualidad, gasto fijo y ahorro), detalle del día y el mes completo en lista.
- **Mis pagos**: alta, edición y borrado de tarjetas, deudas, gastos fijos y metas
  de ahorro, las cuatro sobre un mismo componente genérico.
  - Tarjetas: uso de la línea, intereses que se van al mes, días sin intereses si
    compras hoy y el mejor día para comprar.
  - Gastos fijos con frecuencia mensual, quincenal, bimestral o anual, y prorrateo
    mensual de los que no se pagan cada mes.
- **Plan**: simulador de salida de deudas con avalancha y bola de nieve contra la
  referencia de no cambiar nada, deslizador de abono extra, gráfica comparativa y
  el orden de ataque paso por paso.
- **Ajustes**: perfil de ingreso (mensual, quincenal o semanal), tema claro/oscuro/
  automático, instalación de la app, descarga e importación del JSON y borrado.
- **PWA** instalable y offline, con alcance `/deudas/`.
- **Puerto de persistencia** (`AlmacenDeDatos`) con adaptador de navegador, pensado
  para que un backend sea un archivo nuevo y ningún cambio en la app.
- Documentación: arquitectura, calidad, seguridad y guía para integrar un backend.

### Salió

- `@mui/x-date-pickers` y `dayjs`: el calendario de la librería solo admite un
  marcador por día. El mes escrito a mano da lo que hacía falta y quita dos
  dependencias.
- Tailwind CSS: se reemplazó por el tema de MUI antes del primer commit. Mantener
  dos sistemas de estilo es pelearse con la especificidad en cada componente.
