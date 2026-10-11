# RF-009 — Gestión de fichas

<!--
  ¿Qué? Requisito funcional que define: gestión de fichas.
  ¿Para qué? Documentar formalmente el comportamiento que el sistema debe ofrecer.
  ¿Impacto? Toda la estructura del sistema (grupos, proyectos, evaluaciones) cuelga de la ficha.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RF-009 |
| **Nombre** | Gestión de fichas |
| **Módulo** | Administración |
| **Prioridad** | Alta |
| **Estado** | Implementado |
| **Historia asociada** | HU-009 |
| **Fecha** | Octubre 2026 |

---

## Descripción

El sistema debe permitir al administrador crear, editar, eliminar y listar fichas, con su programa, número único, fechas y jornada, y mostrar conteos de aprendices e instructores.

---

## Entradas

| Campo | Tipo | Obligatorio | Validaciones |
| --- | --- | --- | --- |
| `programa_id` | Número | Sí | Programa existente |
| `numero_ficha` | Número | Sí | Único |
| `fecha_inicio`, `fecha_fin` | Fecha | Sí | Inicio anterior al fin |
| `jornada` | Texto | Sí | Máximo 20 caracteres |

---

## Proceso

1. El administrador completa el formulario y confirma con su contraseña.
2. El backend valida los datos, el programa y la unicidad del número.
3. Guarda la ficha y devuelve el listado actualizado.

---

## Salidas

| Escenario | Código HTTP | Respuesta |
| --- | --- | --- |
| Ficha creada | 201 | "Ficha creada exitosamente" y el listado |
| Datos faltantes, fechas inválidas, programa inexistente o número duplicado | 400 | Mensaje del error |
| Ficha no encontrada | 404 | "Ficha no encontrada" |

---

## Endpoints asociados

| Método | Ruta | Auth requerida | Descripción |
| --- | --- | --- | --- |
| GET | `/api/fichas` | Sí (ADMINISTRADOR) | Lista fichas con conteos |
| POST | `/api/fichas` | Sí (ADMINISTRADOR) | Crea una ficha |
| PUT | `/api/fichas/:id` | Sí (ADMINISTRADOR) | Edita una ficha |
| DELETE | `/api/fichas/:id` | Sí (ADMINISTRADOR) | Elimina una ficha |

---

## Reglas de negocio

- **RN-028** — Confirmación con contraseña.

Detalle en [`reglas-de-negocio.md`](../reglas-de-negocio.md).

---

## Cambios frente a la versión v11

- Menú de tres puntos para las acciones de cada ficha.
