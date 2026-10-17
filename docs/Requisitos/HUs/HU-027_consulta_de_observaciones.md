# HU-027 — Consulta de observaciones

<!--
  ¿Qué? Historia de usuario que describe: consulta de observaciones.
  ¿Para qué? Formalizar la necesidad del aprendiz: saber qué debo corregir y mejorar mi entrega.
  ¿Impacto? Cierra el ciclo de retroalimentación: sin leerlas, el aprendiz no puede actuar sobre ellas.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | HU-027 |
| **Título** | Consulta de observaciones |
| **Módulo** | Evaluación |
| **Prioridad** | Alta |
| **Estado** | Implementado |
| **Rol** | Aprendiz |
| **RF asociado** | RF-027 |
| **Reglas de negocio** | RN-023 |

---

## Historia

**Como** aprendiz,
**quiero** consultar las observaciones que el instructor dejó a mi proyecto,
**para** saber qué debo corregir y mejorar mi entrega.

---

## Criterios de aceptación

### CA-027.1 — Ver observaciones

- **Dado que** mi proyecto tiene observaciones,
- **cuando** abro la sección "Observaciones",
- **entonces** veo la lista con título, descripción, fecha e instructor.

### CA-027.2 — Sin observaciones

- **Dado que** mi proyecto no tiene observaciones,
- **cuando** abro la sección,
- **entonces** veo un mensaje que lo indica.

### CA-027.3 — Sin proyecto

- **Dado que** mi grupo aún no tiene proyecto,
- **cuando** abro la sección,
- **entonces** veo el mensaje "Tu grupo aún no tiene proyecto".
