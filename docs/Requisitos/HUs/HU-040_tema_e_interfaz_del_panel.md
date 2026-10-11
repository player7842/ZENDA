# HU-040 — Tema e interfaz del panel

<!--
  ¿Qué? Historia de usuario que describe: tema e interfaz del panel.
  ¿Para qué? Formalizar la necesidad del usuario autenticado: usar ZENDA con comodidad y sin perder espacio de trabajo.
  ¿Impacto? Mejora la comodidad y la accesibilidad de uso diario.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | HU-040 |
| **Título** | Tema e interfaz del panel |
| **Módulo** | Interfaz y legal |
| **Prioridad** | Media |
| **Estado** | Parcial |
| **Rol** | Usuario autenticado |
| **RF asociado** | RF-040 |
| **Reglas de negocio** | — |

---

## Historia

**Como** usuario autenticado,
**quiero** elegir entre tema claro y oscuro, y trabajar con un panel compacto y ordenado,
**para** usar ZENDA con comodidad y sin perder espacio de trabajo.

---

## Criterios de aceptación

### CA-040.1 — Cambiar tema

- **Dado que** estoy en cualquier pantalla,
- **cuando** alterno entre tema claro y oscuro,
- **entonces** la interfaz cambia y mi elección se recuerda.

### CA-040.2 — Barra lateral colapsable

- **Dado que** estoy en mi panel,
- **cuando** colapso la barra lateral,
- **entonces** solo veo los iconos y gano espacio.

### CA-040.3 — Menú de tres puntos

- **Dado que** veo una lista o tabla con acciones,
- **cuando** abro el menú de tres puntos de una fila,
- **entonces** encuentro las acciones secundarias (editar, eliminar, etc.).

### CA-040.4 — Contraste

- **Dado que** uso cualquiera de los dos temas,
- **cuando** reviso textos e iconos,
- **entonces** todos son legibles.

---

## Cambios frente a la versión v11

- El tema claro y oscuro ya existe.
- La barra lateral colapsable y el menú de tres puntos son cambios pedidos por el instructor ([RD-003](../restricciones.md#rd-003--menú-de-tres-puntos-para-acciones-secundarias), [RD-004](../restricciones.md#rd-004--barra-lateral-colapsable)).
- Las animaciones de componentes equivalentes deben ser consistentes ([RD-002](../restricciones.md#rd-002--animaciones-consistentes)).
