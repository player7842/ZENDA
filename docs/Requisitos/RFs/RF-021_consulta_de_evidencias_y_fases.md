# RF-021 — Consulta de evidencias y fases

<!--
  ¿Qué? Requisito funcional que define: consulta de evidencias y fases.
  ¿Para qué? Documentar formalmente el comportamiento que el sistema debe ofrecer.
  ¿Impacto? Da visibilidad al avance real del proyecto y a las observaciones del instructor.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RF-021 |
| **Nombre** | Consulta de evidencias y fases |
| **Módulo** | Fases y evidencias |
| **Prioridad** | Alta |
| **Estado** | Implementado |
| **Historia asociada** | HU-021 |
| **Fecha** | Octubre 2026 |

---

## Descripción

El sistema debe mostrar al aprendiz del grupo y al instructor de la ficha las carpetas y evidencias de cada fase, con su autor, su fecha y su resultado de evaluación.

---

## Entradas

| Campo | Tipo | Obligatorio | Validaciones |
| --- | --- | --- | --- |
| `faseId` | Número | Sí | Fase existente a la que tengo acceso |

---

## Proceso

1. El backend identifica al usuario y la fase solicitada.
2. Verifica que el aprendiz pertenezca al grupo o que el instructor esté vinculado a la ficha.
3. Devuelve las carpetas con sus evidencias y evaluaciones.

---

## Salidas

| Escenario | Código HTTP | Respuesta |
| --- | --- | --- |
| Carpetas de la fase | 200 | Carpetas y evidencias con su resultado |
| Sin pertenencia | 403 | "No perteneces al grupo dueño de esta fase" |

---

## Endpoints asociados

| Método | Ruta | Auth requerida | Descripción |
| --- | --- | --- | --- |
| GET | `/api/aprendiz/proyectos/fases/:faseId/carpetas` | Sí (APRENDIZ) | Carpetas y evidencias de mi fase |
| GET | `/api/instructor/fases/:faseId/carpetas` | Sí (INSTRUCTOR) | Carpetas y evidencias de una fase de mi ficha |

---

## Reglas de negocio

- **RN-012** — Carpetas y evidencias por cualquier integrante.
- **RN-016** — Evaluación por el instructor asignado.

Detalle en [`reglas-de-negocio.md`](../reglas-de-negocio.md).

---

## Cambios frente a la versión v11

- Se agregan las versiones de cada evidencia y se ocultan las eliminadas (ver [RF-022](../RFs/RF-022_versiones_y_eliminacion_de_evidencias.md)).
