# HU-030 — Confirmación de tareas

<!--
  ¿Qué? Historia de usuario que describe: confirmación de tareas.
  ¿Para qué? Formalizar la necesidad del líder de grupo: decidir si el trabajo cumple lo esperado antes de darlo por terminado.
  ¿Impacto? Es el control de calidad interno del equipo antes de presentar evidencias al instructor.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | HU-030 |
| **Título** | Confirmación de tareas |
| **Módulo** | Tareas |
| **Prioridad** | Alta |
| **Estado** | Parcial |
| **Rol** | Líder de grupo |
| **RF asociado** | RF-030 |
| **Reglas de negocio** | RN-008, RN-022 |

---

## Historia

**Como** líder de grupo,
**quiero** confirmar una tarea finalizada o marcarla como incompleta,
**para** decidir si el trabajo cumple lo esperado antes de darlo por terminado.

---

## Criterios de aceptación

### CA-030.1 — Confirmar tarea

- **Dado que** una tarea está `Finalizada`,
- **cuando** la confirmo,
- **entonces** la tarea pasa a `Confirmada`.

### CA-030.2 — Marcar incompleta

- **Dado que** una tarea está `Finalizada` y no cumple lo esperado,
- **cuando** la marco como incompleta,
- **entonces** pasa a `Incompleta` y el responsable puede retomarla.

### CA-030.3 — Solo el líder

- **Dado que** soy un integrante que no es líder,
- **cuando** intento confirmar o rechazar una tarea,
- **entonces** veo el mensaje que indica que solo el líder puede hacerlo.

---

## Cambios frente a la versión v11

- El mensaje "Solo el Scrum Master puede confirmar o rechazar esta tarea" pasa a mencionar al líder del grupo.
