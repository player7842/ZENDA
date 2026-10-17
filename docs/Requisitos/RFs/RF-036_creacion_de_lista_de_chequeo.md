# RF-036 — Creación de lista de chequeo

<!--
  ¿Qué? Requisito funcional que define: creación de lista de chequeo.
  ¿Para qué? Documentar formalmente el comportamiento que el sistema debe ofrecer.
  ¿Impacto? Reemplaza las listas en papel y da al instructor un seguimiento por ficha dentro de ZENDA.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RF-036 |
| **Nombre** | Creación de lista de chequeo |
| **Módulo** | Lista de chequeo |
| **Prioridad** | Media |
| **Estado** | Planificado |
| **Historia asociada** | HU-036 |
| **Fecha** | Octubre 2026 |

---

## Descripción

El sistema debe ofrecer un editor para crear la lista de chequeo de una ficha. La lista pertenece a la ficha y se compone de ítems agrupados por fase, cada uno con nombre de la evidencia, descripción, indicador de obligatorio y orden.

---

## Entradas

| Campo | Tipo | Obligatorio | Validaciones |
| --- | --- | --- | --- |
| `ficha_id` | Número | Sí | Ficha a cargo del instructor |
| `fase` | Número | Sí | De 1 a 5 |
| `nombre_evidencia` | Texto | Sí | Máximo 200 caracteres |
| `descripcion` | Texto | No | Máximo 500 caracteres |
| `obligatorio` | Booleano | Sí | Por defecto verdadero |
| `orden` | Número | No | Entero positivo |

---

## Proceso

1. El instructor abre el editor de una ficha a su cargo.
2. Agrega, edita, reordena o elimina ítems por fase.
3. El backend valida los datos y guarda la lista y sus ítems.

---

## Salidas

| Escenario | Código HTTP | Respuesta |
| --- | --- | --- |
| Lista guardada | 201 / 200 | Lista con sus ítems |
| Datos inválidos | 400 | Mensaje del error |
| Ficha no está a su cargo | 403 | Mensaje de acceso denegado |

---

## Endpoints asociados

| Método | Ruta | Auth requerida | Descripción |
| --- | --- | --- | --- |
| POST | `/api/instructor/fichas/:id/lista-chequeo` | Sí (INSTRUCTOR) | Crea la lista (propuesto) |
| PUT | `/api/instructor/lista-chequeo/:listaId` | Sí (INSTRUCTOR) | Edita la lista y sus ítems (propuesto) |

---

## Reglas de negocio

- **RN-016** — Evaluación por el instructor asignado.
- **RN-026** — Lista de chequeo por ficha.

Detalle en [`reglas-de-negocio.md`](../reglas-de-negocio.md).

---

## Cambios frente a la versión v11

- Función nueva: requiere las tablas `listas_chequeo` y `lista_chequeo_items`.
