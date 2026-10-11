# RF-011 — Asignación de instructores a fichas

<!--
  ¿Qué? Requisito funcional que define: asignación de instructores a fichas.
  ¿Para qué? Documentar formalmente el comportamiento que el sistema debe ofrecer.
  ¿Impacto? Define quién puede evaluar cada ficha; un cambio mal manejado haría perder evaluaciones anteriores.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RF-011 |
| **Nombre** | Asignación de instructores a fichas |
| **Módulo** | Administración |
| **Prioridad** | Alta |
| **Estado** | Parcial |
| **Historia asociada** | HU-011 |
| **Fecha** | Octubre 2026 |

---

## Descripción

El sistema debe permitir al administrador y al coordinador vincular instructores a fichas. Cada vinculación guarda su fecha de inicio y de fin, de modo que al cambiar de instructor se conserve quién evaluó cada cosa.

---

## Entradas

| Campo | Tipo | Obligatorio | Validaciones |
| --- | --- | --- | --- |
| `id` | Número | Sí | Usuario con rol `INSTRUCTOR` |
| `fichas` | Lista de números | Sí | Fichas existentes (el coordinador, solo ADSO) |

---

## Proceso

1. Se elige el instructor y el conjunto de fichas.
2. El backend valida el rol del usuario.
3. Cierra las vinculaciones que ya no aplican y crea las nuevas con su fecha.
4. Devuelve el instructor con sus fichas vigentes.

---

## Salidas

| Escenario | Código HTTP | Respuesta |
| --- | --- | --- |
| Fichas actualizadas | 200 | Mensaje y fichas del instructor |
| Usuario no es instructor | 400 | Mensaje del error |
| Usuario no encontrado | 404 | "Usuario no encontrado" |

---

## Endpoints asociados

| Método | Ruta | Auth requerida | Descripción |
| --- | --- | --- | --- |
| PUT | `/api/users/:id/fichas` | Sí (ADMINISTRADOR) | Vincula fichas a un instructor |
| PUT | `/api/coordinador/instructores/:id/fichas` | Sí (COORDINADOR) | Reasigna fichas ADSO a un instructor |
| GET | `/api/coordinador/instructores` | Sí (COORDINADOR) | Lista instructores del programa |

---

## Reglas de negocio

- **RN-024** — Asignación instructor–ficha con historial.
- **RN-025** — Alcance del coordinador.
- **RN-028** — Confirmación con contraseña.

Detalle en [`reglas-de-negocio.md`](../reglas-de-negocio.md).

---

## Cambios frente a la versión v11

- Hoy `instructor_ficha` se borra y se vuelve a insertar, por lo que no queda historial.
- Se agregan `fecha_inicio`, `fecha_fin` y estado a `instructor_ficha`.
