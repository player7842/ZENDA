# RF-023 — Evaluación de evidencias

<!--
  ¿Qué? Requisito funcional que define: evaluación de evidencias.
  ¿Para qué? Documentar formalmente el comportamiento que el sistema debe ofrecer.
  ¿Impacto? Es el núcleo del seguimiento académico: de aquí salen los estados de carpetas y fases.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RF-023 |
| **Nombre** | Evaluación de evidencias |
| **Módulo** | Evaluación |
| **Prioridad** | Alta |
| **Estado** | Parcial |
| **Historia asociada** | HU-023 |
| **Fecha** | Octubre 2026 |

---

## Descripción

El sistema debe permitir al instructor vinculado a la ficha evaluar cada evidencia como `APROBADO` o `REPROBADO`. Cada evaluación queda registrada con su autor y su fecha, y dispara el recálculo de los estados.

---

## Entradas

| Campo | Tipo | Obligatorio | Validaciones |
| --- | --- | --- | --- |
| `evidenciaId` | Número | Sí | Evidencia de una ficha a cargo del instructor |
| `resultado` | Opción | Sí | `APROBADO` o `REPROBADO` |

---

## Proceso

1. El instructor elige el resultado de una evidencia.
2. El backend verifica que la evidencia pertenezca a una ficha del instructor.
3. Abre una transacción y registra la evaluación.
4. Recalcula el estado de la carpeta y de la fase (ver [RF-025](../RFs/RF-025_estado_y_porcentaje_de_avance.md)).
5. Confirma la transacción y devuelve el nuevo estado.

---

## Salidas

| Escenario | Código HTTP | Respuesta |
| --- | --- | --- |
| Evaluación guardada | 200 | "Evaluación guardada" y estado de la fase |
| Resultado inválido | 400 | "Resultado inválido, debe ser APROBADO o REPROBADO" |
| Evidencia no está a su cargo | 403 | "Esta evidencia no está a tu cargo" |

---

## Endpoints asociados

| Método | Ruta | Auth requerida | Descripción |
| --- | --- | --- | --- |
| POST | `/api/instructor/evidencias/:evidenciaId/evaluar` | Sí (INSTRUCTOR) | Evalúa una evidencia |

---

## Reglas de negocio

- **RN-016** — Evaluación por el instructor asignado.
- **RN-017** — Historial de evaluaciones.
- **RN-018** — Cascada de estados.

Detalle en [`reglas-de-negocio.md`](../reglas-de-negocio.md).

---

## Cambios frente a la versión v11

- Hoy recalificar hace un `UPDATE` sobre la evaluación existente y sobrescribe al instructor anterior; pasa a insertar un registro nuevo (ver [RN-017](../reglas-de-negocio.md#rn-017--historial-de-evaluaciones)).
- La evaluación pasa a depender de la vinculación vigente `instructor_ficha`.
