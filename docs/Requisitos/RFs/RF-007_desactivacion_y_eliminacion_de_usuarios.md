# RF-007 — Desactivación y eliminación de usuarios

<!--
  ¿Qué? Requisito funcional que define: desactivación y eliminación de usuarios.
  ¿Para qué? Documentar formalmente el comportamiento que el sistema debe ofrecer.
  ¿Impacto? Eliminar a un usuario con evaluaciones o evidencias puede dañar el historial; desactivar lo evita.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RF-007 |
| **Nombre** | Desactivación y eliminación de usuarios |
| **Módulo** | Administración |
| **Prioridad** | Media |
| **Estado** | Parcial |
| **Historia asociada** | HU-007 |
| **Fecha** | Octubre 2026 |

---

## Descripción

El sistema debe permitir al administrador desactivar un usuario (cambiando su estado) o eliminarlo, siempre con confirmación por contraseña. Se recomienda desactivar para conservar las evidencias, evaluaciones y observaciones asociadas.

---

## Entradas

| Campo | Tipo | Obligatorio | Validaciones |
| --- | --- | --- | --- |
| `id` | Número | Sí | Usuario existente |
| Contraseña del administrador | Texto | Sí | Debe coincidir con la del administrador |

---

## Proceso

1. El administrador elige la acción y confirma con su contraseña.
2. El backend verifica la contraseña.
3. Si desactiva, cambia el `estado` del usuario; si elimina, borra el registro.
4. Si el usuario es líder de un grupo, el sistema lo advierte (ver RF-018).

---

## Salidas

| Escenario | Código HTTP | Respuesta |
| --- | --- | --- |
| Usuario eliminado | 200 | Mensaje de confirmación |
| Usuario no encontrado | 404 | "Usuario no encontrado" |
| Contraseña incorrecta | 403 | Mensaje de confirmación fallida |

---

## Endpoints asociados

| Método | Ruta | Auth requerida | Descripción |
| --- | --- | --- | --- |
| DELETE | `/api/users/:id` | Sí (ADMINISTRADOR) | Elimina un usuario |
| PUT | `/api/users/:id` | Sí (ADMINISTRADOR) | Cambia el estado a inactivo |

---

## Reglas de negocio

- **RN-003** — Solo las cuentas activas inician sesión.
- **RN-028** — Confirmación con contraseña.
- **RN-030** — Reasignación de liderazgo por el administrador.

Detalle en [`reglas-de-negocio.md`](../reglas-de-negocio.md).

---

## Cambios frente a la versión v11

- Hoy el eliminado puede fallar si el usuario tiene registros asociados; la desactivación es la vía recomendada.
- Se agrega la advertencia por liderazgo pendiente.
