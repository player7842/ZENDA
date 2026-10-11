# HU-025 — Estado y porcentaje de avance

<!--
  ¿Qué? Historia de usuario que describe: estado y porcentaje de avance.
  ¿Para qué? Formalizar la necesidad del aprendiz: saber cuánto me falta para aprobar cada fase.
  ¿Impacto? Convierte las evaluaciones en un indicador claro para el aprendiz y para el seguimiento.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | HU-025 |
| **Título** | Estado y porcentaje de avance |
| **Módulo** | Evaluación |
| **Prioridad** | Alta |
| **Estado** | Parcial |
| **Rol** | Aprendiz |
| **RF asociado** | RF-025 |
| **Reglas de negocio** | RN-018, RN-019, RN-020 |

---

## Historia

**Como** aprendiz,
**quiero** ver el estado y el porcentaje de avance de cada fase,
**para** saber cuánto me falta para aprobar cada fase.

---

## Criterios de aceptación

### CA-025.1 — Estado de la fase

- **Dado que** mi proyecto tiene evidencias evaluadas,
- **cuando** abro "Fases",
- **entonces** cada fase muestra su estado: `Pendiente`, `En revisión`, `Aprobada` o `Desaprobada`.

### CA-025.2 — Porcentaje

- **Dado que** una fase tiene 10 evidencias y 7 aprobadas,
- **cuando** la consulto,
- **entonces** veo un avance del 70 %.

### CA-025.3 — Carpetas aprobadas

- **Dado que** una fase tiene 4 carpetas y 3 aprobadas,
- **cuando** la consulto,
- **entonces** veo "3 de 4 carpetas aprobadas".

### CA-025.4 — Una reprobada desaprueba la fase

- **Dado que** una carpeta tiene una evidencia reprobada,
- **cuando** se registra la evaluación,
- **entonces** la carpeta y la fase pasan a `Desaprobada`.

---

## Cambios frente a la versión v11

- Hoy la cascada recorre todas las evidencias de la fase; no existe el estado de carpeta ni el porcentaje.
- Se agrega `estado_carpeta` a `carpetas`.
