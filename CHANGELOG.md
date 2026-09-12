# Bitácora

Qué entró y qué salió en cada versión.

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
