# HU-031 — Tablero y progreso de tareas

<!--
  ¿Qué? Historia de usuario que describe: tablero y progreso de tareas.
  ¿Para qué? Formalizar la necesidad del aprendiz: saber qué hay por hacer y qué tan avanzado va el equipo.
  ¿Impacto? Da visibilidad compartida del trabajo, tanto al líder como a los integrantes.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | HU-031 |
| **Título** | Tablero y progreso de tareas |
| **Módulo** | Tareas |
| **Prioridad** | Alta |
| **Estado** | Implementado |
| **Rol** | Aprendiz |
| **RF asociado** | RF-031 |
| **Reglas de negocio** | RN-021, RN-022 |

---

## Historia

**Como** aprendiz,
**quiero** ver el tablero de tareas de mi proyecto y mi porcentaje de cumplimiento,
**para** saber qué hay por hacer y qué tan avanzado va el equipo.

---

## Criterios de aceptación

### CA-031.1 — Ver tablero

- **Dado que** pertenezco a un proyecto,
- **cuando** abro "Tareas",
- **entonces** veo las tareas agrupadas por estado, con su responsable y prioridad.

### CA-031.2 — Mis tareas

- **Dado que** hay tareas asignadas a varios integrantes,
- **cuando** reviso el tablero,
- **entonces** identifico cuáles son mías.

### CA-031.3 — Progreso

- **Dado que** el grupo tiene tareas confirmadas,
- **cuando** consulto el progreso,
- **entonces** veo el porcentaje de tareas confirmadas sobre el total.

---

## Cambios frente a la versión v11

- La interfaz usa `Tareas.tsx`, el único archivo en TypeScript del frontend (ver [restricciones](../restricciones.md#pendientes-de-confirmación)).
