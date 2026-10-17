# RF-038 — Evaluación con lista de chequeo

<!--
  ¿Qué? Requisito funcional que define: evaluación con lista de chequeo.
  ¿Para qué? Documentar formalmente el comportamiento que el sistema debe ofrecer.
  ¿Impacto? Da el indicador de avance de la ficha y garantiza que un cambio de instructor no borre lo evaluado.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RF-038 |
| **Nombre** | Evaluación con lista de chequeo |
| **Módulo** | Lista de chequeo |
| **Prioridad** | Media |
| **Estado** | Planificado |
| **Historia asociada** | HU-038 |
| **Fecha** | Octubre 2026 |

---

## Descripción

El sistema debe permitir al instructor evaluar cada ítem de la lista por grupo (`Aprobado`, `No aprobado` o `Pendiente`), con un comentario opcional, y calcular el avance por grupo y por ficha. Las evaluaciones nunca se sobrescriben y la lista permanece con la ficha aunque cambie el instructor.

---

## Entradas

| Campo | Tipo | Obligatorio | Validaciones |
| --- | --- | --- | --- |
| `item_id` | Número | Sí | Ítem de la lista de la ficha |
| `grupo_id` | Número | Sí | Grupo de esa ficha |
| `resultado` | Opción | Sí | `Aprobado`, `No aprobado` o `Pendiente` |
| `comentario` | Texto | No | Máximo 500 caracteres |

---

## Proceso

1. El instructor elige un grupo y marca el resultado de un ítem.
2. El backend verifica que el instructor esté vinculado a la ficha.
3. Inserta una evaluación con su autor y fecha; la última es la vigente.
4. Calcula el avance del grupo (obligatorios aprobados sobre obligatorios) y el de la ficha (promedio de los grupos).

---

## Salidas

| Escenario | Código HTTP | Respuesta |
| --- | --- | --- |
| Evaluación guardada | 201 | Evaluación y avance recalculado |
| Resultado inválido | 400 | Mensaje del error |
| Ficha no está a su cargo | 403 | Mensaje de acceso denegado |

---

## Endpoints asociados

| Método | Ruta | Auth requerida | Descripción |
| --- | --- | --- | --- |
| POST | `/api/instructor/lista-chequeo/items/:itemId/evaluar` | Sí (INSTRUCTOR) | Evalúa un ítem de un grupo (propuesto) |
| GET | `/api/instructor/fichas/:id/lista-chequeo/avance` | Sí (INSTRUCTOR) | Avance por grupo y por ficha (propuesto) |

---

## Reglas de negocio

- **RN-016** — Evaluación por el instructor asignado.
- **RN-024** — Asignación instructor–ficha con historial.
- **RN-026** — Lista de chequeo por ficha.
- **RN-027** — Avance de la lista de chequeo.

Detalle en [`reglas-de-negocio.md`](../reglas-de-negocio.md).

---

## Cambios frente a la versión v11

- Función nueva: requiere la tabla `lista_chequeo_evaluaciones`. Es independiente de la cascada de evidencias (ver [RN-027](../reglas-de-negocio.md#rn-027--avance-de-la-lista-de-chequeo)).
