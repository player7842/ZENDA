# HU-010 — Aprendices en una ficha

<!--
  ¿Qué? Historia de usuario que describe: aprendices en una ficha.
  ¿Para qué? Formalizar la necesidad del administrador: corregir inscripciones o trasladar aprendices entre fichas.
  ¿Impacto? Mantiene correcta la lista de cada ficha que el instructor evalúa.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | HU-010 |
| **Título** | Aprendices en una ficha |
| **Módulo** | Administración |
| **Prioridad** | Media |
| **Estado** | Implementado |
| **Rol** | Administrador |
| **RF asociado** | RF-010 |
| **Reglas de negocio** | RN-006, RN-029 |

---

## Historia

**Como** administrador,
**quiero** vincular y desvincular aprendices de una ficha,
**para** corregir inscripciones o trasladar aprendices entre fichas.

---

## Criterios de aceptación

### CA-010.1 — Vincular aprendiz

- **Dado que** selecciono una ficha y un aprendiz,
- **cuando** confirmo la vinculación,
- **entonces** el aprendiz queda inscrito en el grupo `General` de esa ficha.

### CA-010.2 — Desvincular aprendiz

- **Dado que** un aprendiz está inscrito en la ficha,
- **cuando** lo desvinculo,
- **entonces** su inscripción queda inactiva en esa ficha.

### CA-010.3 — Aprendiz inexistente

- **Dado que** indico un usuario que no existe,
- **cuando** envío la solicitud,
- **entonces** veo el mensaje "Ese usuario no existe".
