# HU-024 — Aprobación de carpetas en bloque

<!--
  ¿Qué? Historia de usuario que describe: aprobación de carpetas en bloque.
  ¿Para qué? Formalizar la necesidad del instructor: no tener que aprobar una por una las evidencias de una carpeta correcta.
  ¿Impacto? Reduce el tiempo de evaluación en carpetas con muchos documentos.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | HU-024 |
| **Título** | Aprobación de carpetas en bloque |
| **Módulo** | Evaluación |
| **Prioridad** | Media |
| **Estado** | Planificado |
| **Rol** | Instructor |
| **RF asociado** | RF-024 |
| **Reglas de negocio** | RN-016, RN-017, RN-018, RN-019 |

---

## Historia

**Como** instructor,
**quiero** aprobar una carpeta completa con una sola acción,
**para** no tener que aprobar una por una las evidencias de una carpeta correcta.

---

## Criterios de aceptación

### CA-024.1 — Aprobar carpeta

- **Dado que** soy el instructor de la ficha,
- **cuando** pulso "Aprobar carpeta" y confirmo,
- **entonces** todas las evidencias de la carpeta quedan aprobadas.

### CA-024.2 — Reprobar una evidencia

- **Dado que** una carpeta tiene varias evidencias aprobadas,
- **cuando** reapruebo una sola como reprobada,
- **entonces** la carpeta pasa a `Desaprobada`.

### CA-024.3 — Carpeta vacía

- **Dado que** la carpeta no tiene evidencias,
- **cuando** intento aprobarla,
- **entonces** el sistema me lo impide.

---

## Cambios frente a la versión v11

- Es una función nueva.
