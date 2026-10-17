# RF-012 — Gestión de programas de formación

<!--
  ¿Qué? Requisito funcional que define: gestión de programas de formación.
  ¿Para qué? Documentar formalmente el comportamiento que el sistema debe ofrecer.
  ¿Impacto? Las fichas dependen de un programa; sin gestión, el catálogo solo se cambia desde la base de datos.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RF-012 |
| **Nombre** | Gestión de programas de formación |
| **Módulo** | Administración |
| **Prioridad** | Media |
| **Estado** | Planificado |
| **Historia asociada** | HU-012 |
| **Fecha** | Octubre 2026 |

---

## Descripción

El sistema debe permitir al administrador crear, editar, eliminar y listar programas de formación con código único y nombre. La interfaz (`Programas.jsx`) y sus funciones del frontend existen; el backend solo ofrece el listado.

---

## Entradas

| Campo | Tipo | Obligatorio | Validaciones |
| --- | --- | --- | --- |
| `codigo_programa` | Número | Sí | Único |
| `nombre_programa` | Texto | Sí | Máximo 220 caracteres |

---

## Proceso

1. El administrador completa el formulario.
2. El backend valida el código único.
3. Guarda, edita o elimina el programa; no permite eliminar uno con fichas.
4. Devuelve el listado actualizado.

---

## Salidas

| Escenario | Código HTTP | Respuesta |
| --- | --- | --- |
| Programa guardado | 201 / 200 | Programa y listado |
| Código duplicado o datos inválidos | 400 | Mensaje del error |
| Programa con fichas | 409 | Mensaje del error |

---

## Endpoints asociados

| Método | Ruta | Auth requerida | Descripción |
| --- | --- | --- | --- |
| GET | `/api/fichas/programas` | Sí (ADMINISTRADOR) | Lista programas (existe) |
| POST | `/api/programas` | Sí (ADMINISTRADOR) | Crea un programa (propuesto) |
| PUT | `/api/programas/:id` | Sí (ADMINISTRADOR) | Edita un programa (propuesto) |
| DELETE | `/api/programas/:id` | Sí (ADMINISTRADOR) | Elimina un programa (propuesto) |

---

## Reglas de negocio

- **RN-028** — Confirmación con contraseña.

Detalle en [`reglas-de-negocio.md`](../reglas-de-negocio.md).

---

## Cambios frente a la versión v11

- Faltan los endpoints de creación, edición y eliminación.
