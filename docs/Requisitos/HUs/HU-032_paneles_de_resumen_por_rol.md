# HU-032 — Paneles de resumen por rol

<!--
  ¿Qué? Historia de usuario que describe: paneles de resumen por rol.
  ¿Para qué? Formalizar la necesidad del usuario autenticado: entender de un vistazo el estado de lo que me corresponde.
  ¿Impacto? Es la primera pantalla tras iniciar sesión; orienta qué atender primero.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | HU-032 |
| **Título** | Paneles de resumen por rol |
| **Módulo** | Seguimiento |
| **Prioridad** | Media |
| **Estado** | Implementado |
| **Rol** | Usuario autenticado |
| **RF asociado** | RF-032 |
| **Reglas de negocio** | RN-025 |

---

## Historia

**Como** usuario autenticado,
**quiero** ver un panel de inicio con métricas y gráficas propias de mi rol,
**para** entender de un vistazo el estado de lo que me corresponde.

---

## Criterios de aceptación

### CA-032.1 — Resumen del aprendiz

- **Dado que** soy aprendiz,
- **cuando** abro mi panel,
- **entonces** veo el avance de mis fases y mis tareas.

### CA-032.2 — Resumen del instructor

- **Dado que** soy instructor,
- **cuando** abro mi panel,
- **entonces** veo las evidencias aprobadas y reprobadas de mis fichas.

### CA-032.3 — Resumen del coordinador

- **Dado que** soy coordinador,
- **cuando** abro mi panel,
- **entonces** veo el estado de los proyectos y las alertas pedagógicas.

### CA-032.4 — Resumen del administrador

- **Dado que** soy administrador,
- **cuando** abro mi panel,
- **entonces** veo los totales de usuarios, fichas y proyectos.

---

## Cambios frente a la versión v11

- Barra lateral colapsable que muestre solo iconos (ver [RD-004](../restricciones.md#rd-004--barra-lateral-colapsable)).
- Todas las gráficas deben cumplir el contraste mínimo ([RD-001](../restricciones.md#rd-001--contraste-mínimo-accesible)).
