# RF-026 — Observaciones del instructor

<!--
  ¿Qué? Requisito funcional que define: observaciones del instructor.
  ¿Para qué? Documentar formalmente el comportamiento que el sistema debe ofrecer.
  ¿Impacto? Es el canal de retroalimentación escrita entre el instructor y el grupo.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RF-026 |
| **Nombre** | Observaciones del instructor |
| **Módulo** | Evaluación |
| **Prioridad** | Alta |
| **Estado** | Implementado |
| **Historia asociada** | HU-026 |
| **Fecha** | Octubre 2026 |

---

## Descripción

El sistema debe permitir al instructor de la ficha crear observaciones sobre un proyecto, opcionalmente ligadas a una evidencia, y consultar las del proyecto.

---

## Entradas

| Campo | Tipo | Obligatorio | Validaciones |
| --- | --- | --- | --- |
| `proyectoId` | Número | Sí | Proyecto de una ficha del instructor |
| `titulo` | Texto | Sí | Máximo 150 caracteres |
| `descripcion` | Texto | Sí | Máximo 500 caracteres |
| `evidencia_id` | Número | No | Evidencia del mismo proyecto |

---

## Proceso

1. El instructor escribe la observación.
2. El backend verifica que el proyecto sea de una ficha a su cargo.
3. Guarda la observación con su fecha y su autor.

---

## Salidas

| Escenario | Código HTTP | Respuesta |
| --- | --- | --- |
| Observación creada | 201 | Datos de la observación |
| Faltan campos | 400 | Mensaje del error |
| Proyecto no está a su cargo | 403 | Mensaje de acceso denegado |

---

## Endpoints asociados

| Método | Ruta | Auth requerida | Descripción |
| --- | --- | --- | --- |
| GET | `/api/instructor/proyectos/:proyectoId/observaciones` | Sí (INSTRUCTOR) | Lista las observaciones |
| POST | `/api/instructor/proyectos/:proyectoId/observaciones` | Sí (INSTRUCTOR) | Crea una observación |

---

## Reglas de negocio

- **RN-016** — Evaluación por el instructor asignado.
- **RN-023** — Observaciones del instructor.

Detalle en [`reglas-de-negocio.md`](../reglas-de-negocio.md).
