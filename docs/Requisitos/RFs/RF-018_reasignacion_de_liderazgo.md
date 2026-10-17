# RF-018 — Reasignación de liderazgo

<!--
  ¿Qué? Requisito funcional que define: reasignación de liderazgo.
  ¿Para qué? Documentar formalmente el comportamiento que el sistema debe ofrecer.
  ¿Impacto? Como el liderazgo es fijo, esta es la única salida para un grupo que pierde a su líder.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RF-018 |
| **Nombre** | Reasignación de liderazgo |
| **Módulo** | Grupos y proyectos |
| **Prioridad** | Media |
| **Estado** | Planificado |
| **Historia asociada** | HU-018 |
| **Fecha** | Octubre 2026 |

---

## Descripción

El sistema debe permitir únicamente al administrador designar un nuevo líder para un grupo, entre sus integrantes activos, y avisar cuando un grupo quede sin líder.

---

## Entradas

| Campo | Tipo | Obligatorio | Validaciones |
| --- | --- | --- | --- |
| `grupo_id` | Número | Sí | Grupo existente |
| `nuevo_lider_id` | Número | Sí | Integrante activo del grupo |
| Contraseña del administrador | Texto | Sí | Debe coincidir |

---

## Proceso

1. El administrador selecciona el grupo y el nuevo líder.
2. El backend verifica que el usuario sea integrante activo.
3. Actualiza `grupos.lider_id`.
4. Devuelve el grupo actualizado.

---

## Salidas

| Escenario | Código HTTP | Respuesta |
| --- | --- | --- |
| Líder reasignado | 200 | Grupo con el nuevo líder |
| Usuario no es integrante activo | 400 | Mensaje del error |
| Contraseña incorrecta | 403 | Mensaje de confirmación fallida |

---

## Endpoints asociados

| Método | Ruta | Auth requerida | Descripción |
| --- | --- | --- | --- |
| PUT | `/api/grupos/:id/lider` | Sí (ADMINISTRADOR) | Reasigna el liderazgo (propuesto) |

---

## Reglas de negocio

- **RN-008** — Líder del grupo.
- **RN-028** — Confirmación con contraseña.
- **RN-030** — Reasignación de liderazgo por el administrador.

Detalle en [`reglas-de-negocio.md`](../reglas-de-negocio.md).

---

## Cambios frente a la versión v11

- Es una función nueva; hoy `grupos.lider_id` no tiene forma de cambiarse desde la aplicación.
