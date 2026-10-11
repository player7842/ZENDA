# HU-023 — Evaluación de evidencias

<!--
  ¿Qué? Historia de usuario que describe: evaluación de evidencias.
  ¿Para qué? Formalizar la necesidad del instructor: calificar el avance de los aprendices y dejar claro qué debe corregirse.
  ¿Impacto? Es el núcleo del seguimiento académico: de aquí salen los estados de carpetas y fases.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | HU-023 |
| **Título** | Evaluación de evidencias |
| **Módulo** | Evaluación |
| **Prioridad** | Alta |
| **Estado** | Parcial |
| **Rol** | Instructor |
| **RF asociado** | RF-023 |
| **Reglas de negocio** | RN-016, RN-017, RN-018 |

---

## Historia

**Como** instructor,
**quiero** aprobar o reprobar cada evidencia de los grupos de mis fichas,
**para** calificar el avance de los aprendices y dejar claro qué debe corregirse.

---

## Criterios de aceptación

### CA-023.1 — Aprobar o reprobar

- **Dado que** soy el instructor de la ficha,
- **cuando** evalúo una evidencia como aprobada o reprobada,
- **entonces** el resultado se guarda y el estado de la fase se recalcula.

### CA-023.2 — Resultado inválido

- **Dado que** envío un resultado distinto de aprobado o reprobado,
- **cuando** confirmo,
- **entonces** veo el mensaje "Resultado inválido, debe ser APROBADO o REPROBADO".

### CA-023.3 — Evidencia ajena

- **Dado que** la evidencia es de una ficha que no tengo a cargo,
- **cuando** intento evaluarla,
- **entonces** veo el mensaje "Esta evidencia no está a tu cargo".

### CA-023.4 — Recalificar

- **Dado que** ya evalué una evidencia,
- **cuando** la evalúo de nuevo,
- **entonces** se agrega la nueva evaluación y la anterior queda en el historial.

---

## Cambios frente a la versión v11

- Hoy recalificar hace un `UPDATE` sobre la evaluación existente y sobrescribe al instructor anterior; pasa a insertar un registro nuevo (ver [RN-017](../reglas-de-negocio.md#rn-017--historial-de-evaluaciones)).
- La evaluación pasa a depender de la vinculación vigente `instructor_ficha`.
