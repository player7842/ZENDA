# HU-004 — Sesión segura

<!--
  ¿Qué? Historia de usuario que describe: sesión segura.
  ¿Para qué? Formalizar la necesidad del usuario autenticado: proteger mi cuenta sin tener que iniciar sesión a cada rato.
  ¿Impacto? Reduce el daño si alguien obtiene un token o usa un equipo compartido del centro de formación.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | HU-004 |
| **Título** | Sesión segura |
| **Módulo** | Autenticación |
| **Prioridad** | Alta |
| **Estado** | Parcial |
| **Rol** | Usuario autenticado |
| **RF asociado** | RF-004 |
| **Reglas de negocio** | RN-003 |

---

## Historia

**Como** usuario autenticado,
**quiero** que mi sesión se renueve mientras trabajo y se cierre sola si me ausento,
**para** proteger mi cuenta sin tener que iniciar sesión a cada rato.

---

## Criterios de aceptación

### CA-004.1 — Cierre manual

- **Dado que** estoy dentro de mi panel,
- **cuando** pulso "Cerrar sesión",
- **entonces** mi sesión se cierra y regreso al inicio.

### CA-004.2 — Renovación transparente

- **Dado que** mi token de acceso está por vencer y sigo activo,
- **cuando** la aplicación hace una petición,
- **entonces** la sesión se renueva sin interrumpirme.

### CA-004.3 — Cierre por inactividad

- **Dado que** paso 30 minutos sin actividad,
- **cuando** se cumple el tiempo,
- **entonces** mi sesión se cierra automáticamente.

### CA-004.4 — Aviso previo

- **Dado que** faltan 60 segundos para el cierre por inactividad,
- **cuando** la aplicación lo detecta,
- **entonces** veo un aviso con la opción de continuar.

---

## Cambios frente a la versión v11

- Hoy existe el cierre manual en el cliente y un token único de 24 horas guardado en `localStorage`.
- Los endpoints de renovación y de cierre son nuevos.
- Ver [RT-004](../restricciones.md#rt-004--método-de-autenticación).
