# HU-021 — Consulta de evidencias y fases

<!--
  ¿Qué? Historia de usuario que describe: consulta de evidencias y fases.
  ¿Para qué? Formalizar la necesidad del aprendiz: saber qué fue aprobado, qué fue reprobado y qué sigue pendiente.
  ¿Impacto? Da visibilidad al avance real del proyecto y a las observaciones del instructor.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | HU-021 |
| **Título** | Consulta de evidencias y fases |
| **Módulo** | Fases y evidencias |
| **Prioridad** | Alta |
| **Estado** | Implementado |
| **Rol** | Aprendiz |
| **RF asociado** | RF-021 |
| **Reglas de negocio** | RN-012, RN-016 |

---

## Historia

**Como** aprendiz,
**quiero** consultar las carpetas y evidencias de cada fase y su estado de evaluación,
**para** saber qué fue aprobado, qué fue reprobado y qué sigue pendiente.

---

## Criterios de aceptación

### CA-021.1 — Ver fases

- **Dado que** estoy en "Fases",
- **cuando** abro el módulo,
- **entonces** veo las 5 fases con su estado.

### CA-021.2 — Ver evidencias

- **Dado que** selecciono una fase,
- **cuando** abro sus carpetas,
- **entonces** veo cada carpeta con sus evidencias, su autor y su resultado.

### CA-021.3 — Fase de otro grupo

- **Dado que** la fase pertenece a otro grupo,
- **cuando** intento consultarla,
- **entonces** el sistema me lo niega con el mensaje "No perteneces al grupo dueño de esta fase".

### CA-021.4 — Vista del instructor

- **Dado que** soy instructor de la ficha,
- **cuando** abro una fase de un proyecto de mi ficha,
- **entonces** veo sus carpetas y evidencias para evaluarlas.

---

## Cambios frente a la versión v11

- Se agregan las versiones de cada evidencia y se ocultan las eliminadas (ver [RF-022](../RFs/RF-022_versiones_y_eliminacion_de_evidencias.md)).
