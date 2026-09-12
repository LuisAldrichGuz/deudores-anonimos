# Seguridad y privacidad

Este documento dice **qué protege** esta app, **cómo** lo hace y —lo más
importante— **qué no protege**. Una app de finanzas que solo promete «tus datos
están seguros» no está diciendo nada.

---

## El modelo: no hay nada que filtrar

La mayoría de las apps de finanzas personales protegen tus datos guardándolos bien.
Esta los protege **no teniéndolos**.

| | |
|---|---|
| Cuentas de usuario | No existen |
| Servidor de aplicación | No existe |
| Base de datos | No existe |
| Analítica, telemetría, *crash reporting* | No existe |
| Peticiones de red durante el uso | **Cero** |

Lo que se despliega son archivos estáticos. El servidor los entrega y no vuelve a
saber de ti.

### Cómo verificarlo sin leer el código

Abre las herramientas de desarrollo del navegador, pestaña **Red**, y usa la app.
Después de la carga inicial no se mueve nada. Ni una petición.

### Cómo está garantizado en el código

1. **No hay `fetch`, `XMLHttpRequest` ni `WebSocket` en todo `src/`.** Se puede
   comprobar de una pasada:

   ```bash
   grep -rnE "fetch\(|XMLHttpRequest|WebSocket|navigator\.sendBeacon" src/
   ```

2. **La persistencia tiene una sola puerta.** Todo entra y sale por
   `AlmacenDeDatos` (`src/shared/almacen/puerto.ts`), cuatro métodos. El adaptador
   por omisión escribe en `localStorage` y punto. Meter una fuga implicaría
   escribir un adaptador nuevo, que es un archivo entero y visible en el diff.

3. **La tipografía va empaquetada.** Instrument Sans y JetBrains Mono se sirven
   desde el mismo origen. Si
   viniera de Google Fonts, cada carga de la app le diría tu IP a un tercero — que
   es exactamente el tipo de fuga silenciosa que este proyecto quiere evitar.

4. **La CSP corta cualquier origen externo.** Aunque una dependencia futura
   intentara llamar a casa, el navegador la bloquea antes de que salga:

   ```
   default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';
   img-src 'self' data:; font-src 'self'; connect-src 'self';
   object-src 'none'; base-uri 'self'; frame-ancestors 'self'
   ```

   `connect-src 'self'` es la línea que importa: **no se puede hacer una petición a
   ningún dominio que no sea el propio**, y el propio no tiene API.

   ⚠️ `'unsafe-inline'` en `style-src` no es descuido: Emotion (el motor de estilos
   de MUI) inyecta `<style>` en tiempo de ejecución. Quitarlo deja la app sin CSS.
   La forma correcta de cerrarlo es un *nonce* por petición, que requiere render en
   servidor — y aquí no hay servidor. El riesgo que deja abierto es inyección de
   CSS, no de JavaScript: `script-src` sigue cerrado.

## Qué NO protege

Esto es lo que un documento de seguridad honesto tiene que decir:

- **No cifra nada.** Los datos están en `localStorage` en texto plano. Cualquiera
  con acceso físico a tu sesión de navegador —o una extensión que instalaste— los
  puede leer. **Si compartes la computadora, no uses esto para datos sensibles.**
- **No es una copia de seguridad.** Borrar los datos del sitio, usar modo privado o
  formatear el equipo se lleva todo. Por eso el botón de descargar el JSON está a
  un clic y el diálogo de borrado lo dice con todas sus letras.
- **No se sincroniza entre dispositivos.** Lo que captures en la compu no aparece
  en el celular. El JSON es el puente, a mano y a propósito.
- **No valida que tus números sean ciertos.** Si escribes mal una tasa, la fecha de
  salida estará mal. La app calcula, no audita.
- **No sustituye a un asesor financiero.** Los cortes de las estadísticas (pago de
  deuda sobre ingreso, uso de línea) son criterios generales de la industria, no un
  dictamen sobre tu caso.

## Decisiones de seguridad en el código

| Decisión | Por qué |
|---|---|
| Todo JSON externo pasa por `leerDatos()` | Un archivo importado es entrada no confiable. Se valida campo por campo y se acota (días 1–31, meses 1–12); lo que no cuadra toma un valor por omisión en vez de reventar un cálculo |
| El JSON se genera con `JSON.stringify`, no concatenando | Nunca se construye el archivo a mano |
| El borrado pide confirmación y avisa de que no hay vuelta | No hay servidor del que recuperarlo, y eso hay que decirlo antes, no después |
| El service worker tiene alcance `/deudas/` | La app vive dentro de otro sitio. Un alcance en la raíz secuestraría peticiones que no son suyas |
| Sin dependencias de UI fuera de MUI y React | Cada dependencia de una app así es superficie de ataque en la cadena de suministro |

## Reportar un problema

Si encuentras algo, abre un *issue* en el repositorio. Al no haber servidor ni
datos de usuarios, **no hay nada que se pueda filtrar en masa**: lo peor que puede
pasar es un fallo en un dispositivo, así que no hace falta divulgación privada.
