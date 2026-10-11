# HU-026 — Observaciones del instructor

<!--
  ¿Qué? Historia de usuario que describe: observaciones del instructor.
  ¿Para qué? Formalizar la necesidad del instructor: orientar al grupo sobre lo que debe corregir o mejorar.
  ¿Impacto? Es el canal de retroalimentación escrita entre el instructor y el grupo.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | HU-026 |
| **Título** | Observaciones del instructor |
| **Módulo** | Evaluación |
| **Prioridad** | Alta |
| **Estado** | Implementado |
| **Rol** | Instructor |
| **RF asociado** | RF-026 |
| **Reglas de negocio** | RN-016, RN-023 |

---

## Historia

**Como** instructor,
**quiero** dejar observaciones sobre un proyecto o una evidencia concreta,
**para** orientar al grupo sobre lo que debe corregir o mejorar.

---

## Criterios de aceptación

### CA-026.1 — Crear observación

- **Dado que** soy instructor de la ficha,
- **cuando** escribo un título y una descripción y guardo,
- **entonces** la observación queda registrada en el proyecto.

### CA-026.2 — Ligada a una evidencia

- **Dado que** estoy evaluando una evidencia,
- **cuando** agrego una observación sobre ella,
- **entonces** la observación queda asociada a esa evidencia.

### CA-026.3 — Consultar observaciones

- **Dado que** abro un proyecto de mi ficha,
- **cuando** reviso sus observaciones,
- **entonces** veo el historial con fecha y título.
