# HU-038 — Evaluación con lista de chequeo

<!--
  ¿Qué? Historia de usuario que describe: evaluación con lista de chequeo.
  ¿Para qué? Formalizar la necesidad del instructor: seguir el cumplimiento de cada grupo y de toda la ficha, y conservar el historial si cambia el instructor.
  ¿Impacto? Da el indicador de avance de la ficha y garantiza que un cambio de instructor no borre lo evaluado.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | HU-038 |
| **Título** | Evaluación con lista de chequeo |
| **Módulo** | Lista de chequeo |
| **Prioridad** | Media |
| **Estado** | Planificado |
| **Rol** | Instructor |
| **RF asociado** | RF-038 |
| **Reglas de negocio** | RN-016, RN-024, RN-026, RN-027 |

---

## Historia

**Como** instructor,
**quiero** marcar cada ítem de la lista como aprobado o no aprobado para cada grupo y ver el avance,
**para** seguir el cumplimiento de cada grupo y de toda la ficha, y conservar el historial si cambia el instructor.

---

## Criterios de aceptación

### CA-038.1 — Evaluar ítem

- **Dado que** estoy en la lista de una ficha,
- **cuando** marco un ítem de un grupo como aprobado o no aprobado,
- **entonces** queda registrado con mi nombre y la fecha.

### CA-038.2 — Avance por grupo

- **Dado que** evalué los ítems de un grupo,
- **cuando** consulto su avance,
- **entonces** veo el porcentaje de ítems obligatorios aprobados.

### CA-038.3 — Avance por ficha

- **Dado que** la ficha tiene varios grupos evaluados,
- **cuando** consulto el avance de la ficha,
- **entonces** veo el promedio de sus grupos.

### CA-038.4 — Cambio de instructor

- **Dado que** otro instructor asume la ficha,
- **cuando** abre la lista,
- **entonces** hereda la lista y las evaluaciones, con el autor de cada una.

### CA-038.5 — Reevaluar

- **Dado que** ya evalué un ítem,
- **cuando** lo cambio,
- **entonces** se agrega una evaluación nueva y la anterior queda en el historial.

---

## Cambios frente a la versión v11

- Función nueva: requiere la tabla `lista_chequeo_evaluaciones`. Es independiente de la cascada de evidencias (ver [RN-027](../reglas-de-negocio.md#rn-027--avance-de-la-lista-de-chequeo)).
