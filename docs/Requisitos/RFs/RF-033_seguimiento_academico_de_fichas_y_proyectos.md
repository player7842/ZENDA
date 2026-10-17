# RF-033 — Seguimiento académico de fichas y proyectos

<!--
  ¿Qué? Requisito funcional que define: seguimiento académico de fichas y proyectos.
  ¿Para qué? Documentar formalmente el comportamiento que el sistema debe ofrecer.
  ¿Impacto? Permite que el instructor y el coordinador actúen antes de que un grupo quede rezagado.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RF-033 |
| **Nombre** | Seguimiento académico de fichas y proyectos |
| **Módulo** | Seguimiento |
| **Prioridad** | Alta |
| **Estado** | Implementado |
| **Historia asociada** | HU-033 |
| **Fecha** | Octubre 2026 |

---

## Descripción

El sistema debe permitir al instructor consultar las fichas a su cargo, sus aprendices, grupos y proyectos, y al coordinador supervisar las fichas, grupos y proyectos del programa ADSO con el seguimiento de cada proyecto.

---

## Entradas

| Campo | Tipo | Obligatorio | Validaciones |
| --- | --- | --- | --- |
| `id` / `proyectoId` | Número | Sí | Ficha o proyecto dentro del alcance del usuario |

---

## Proceso

1. El usuario elige una ficha o un proyecto.
2. El backend verifica que esté dentro de su alcance (vinculación del instructor o programa del coordinador).
3. Reúne y devuelve los datos solicitados.

---

## Salidas

| Escenario | Código HTTP | Respuesta |
| --- | --- | --- |
| Datos del seguimiento | 200 | Fichas, aprendices, grupos, proyectos o seguimiento |
| Fuera de su alcance | 403 / 404 | Mensaje del error |

---

## Endpoints asociados

| Método | Ruta | Auth requerida | Descripción |
| --- | --- | --- | --- |
| GET | `/api/instructor/fichas` | Sí (INSTRUCTOR) | Mis fichas |
| GET | `/api/instructor/fichas/:id/aprendices` | Sí (INSTRUCTOR) | Aprendices de una ficha |
| GET | `/api/instructor/fichas/:id/grupos` | Sí (INSTRUCTOR) | Grupos de una ficha |
| GET | `/api/instructor/proyectos/:proyectoId` | Sí (INSTRUCTOR) | Detalle de un proyecto |
| GET | `/api/instructor/fichas/:id/evidencias` | Sí (INSTRUCTOR) | Evidencias de una ficha |
| GET | `/api/coordinador/fichas`, `/grupos`, `/proyectos` | Sí (COORDINADOR) | Supervisión del programa |
| GET | `/api/coordinador/proyectos/:id/seguimiento` | Sí (COORDINADOR) | Seguimiento de un proyecto |
| GET | `/api/coordinador/perfil` | Sí (COORDINADOR) | Perfil del coordinador |

---

## Reglas de negocio

- **RN-016** — Evaluación por el instructor asignado.
- **RN-024** — Asignación instructor–ficha con historial.
- **RN-025** — Alcance del coordinador.

Detalle en [`reglas-de-negocio.md`](../reglas-de-negocio.md).

---

## Cambios frente a la versión v11

- Alerta cuando un grupo lleva más de 15 días sin subir evidencias (hoy aparece solo en los datos de prueba).
