# RNF-003 — Usabilidad UX/UI

<!--
  ¿Qué? Requisito no funcional que define: usabilidad ux/ui.
  ¿Para qué? Ofrecer una interfaz clara, consistente y cómoda para los cuatro roles.
  ¿Impacto? Una interfaz confusa hace que los aprendices no suban sus evidencias o abandonen el sistema.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RNF-003 |
| **Nombre** | Usabilidad UX/UI |
| **Categoría** | Experiencia de usuario |
| **Prioridad** | Alta |
| **Estado** | Parcial |
| **Fecha** | Octubre 2026 |

---

## Requisitos

### RNF-003.1 — Consistencia visual

Componentes equivalentes (tarjetas, botones, tablas) se ven y se comportan igual en todas las pantallas. Si una animación existe en un lado, existe en los demás de la misma página.

**Estado:** Adoptada

### RNF-003.2 — Tema claro y oscuro

La interfaz ofrece ambos temas y recuerda la elección del usuario.

**Estado:** Vigente

### RNF-003.3 — Navegación del panel

La barra lateral puede colapsarse a solo iconos. Las acciones secundarias de listas y tablas se agrupan en un menú de tres puntos.

**Estado:** Adoptada

### RNF-003.4 — Retroalimentación al usuario

Cada acción muestra su estado: indicador de carga, mensaje de éxito o mensaje de error comprensible y en español.

**Estado:** Parcial

### RNF-003.5 — Mensajes guiados

Los estados vacíos y los pasos pendientes se acompañan de mensajes que orientan la siguiente acción, sin recordatorios masivos.

**Estado:** Adoptada

### RNF-003.6 — Responsive

La interfaz es utilizable en pantallas desde 360 px de ancho hasta escritorio.

**Estado:** Parcial

### RNF-003.7 — Acceso y retorno

Las pantallas de inicio de sesión y registro ofrecen un botón para volver al inicio.

**Estado:** Adoptada

### RNF-003.8 — Idioma

Toda la interfaz está en español de Colombia.

**Estado:** Vigente

### RNF-003.9 — Facilidad de aprendizaje

Un usuario nuevo puede usar el sistema sin manual y llega a cualquier función principal en no más de 3 clics desde el menú principal.

**Estado:** Adoptada

### RNF-003.10 — Colores y tipografía

Paleta suave y tipografías consistentes en todos los apartados, coherentes con la identidad institucional del SENA.

**Estado:** Parcial

### RNF-003.11 — Animaciones con propósito

Las animaciones se aplican a botones, barras laterales y componentes importantes, son breves y consistentes, y respetan la preferencia `prefers-reduced-motion`.

**Estado:** Adoptada

### RNF-003.12 — Mensajes temporales

Los avisos no críticos desaparecen solos a los 10 s; los errores permanecen hasta que el usuario los cierre.

**Estado:** Adoptada

### RNF-003.13 — Acciones destructivas

Eliminar y otras acciones destructivas usan un estilo visual distinto (por ejemplo, rojo) y piden confirmación.

**Estado:** Parcial

### RNF-003.14 — Pérdida de conexión

Si se pierde la conexión con el servidor, el sistema muestra un mensaje claro y permite reintentar.

**Estado:** Adoptada

---

## Documentos relacionados

- [Restricciones](../restricciones.md)
- [Reglas de negocio](../reglas-de-negocio.md)
