# RF-010 — Aprendices en una ficha

<!--
  ¿Qué? Requisito funcional que define: aprendices en una ficha.
  ¿Para qué? Documentar formalmente el comportamiento que el sistema debe ofrecer.
  ¿Impacto? Mantiene correcta la lista de cada ficha que el instructor evalúa.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RF-010 |
| **Nombre** | Aprendices en una ficha |
| **Módulo** | Administración |
| **Prioridad** | Media |
| **Estado** | Implementado |
| **Historia asociada** | HU-010 |
| **Fecha** | Octubre 2026 |

---

## Descripción

El sistema debe permitir al administrador vincular un aprendiz a una ficha (inscribiéndolo en su grupo `General`) y desvincularlo, marcando la inscripción como inactiva.

---

## Entradas

| Campo | Tipo | Obligatorio | Validaciones |
| --- | --- | --- | --- |
| `id` | Número | Sí | Ficha existente |
| `usuario_id` | Número | Sí | Aprendiz existente |

---

## Proceso

1. El administrador elige la ficha y el aprendiz.
2. El backend valida que el usuario exista.
3. Inscribe o desactiva al aprendiz en el grupo `General` de la ficha.
4. Devuelve el listado de fichas actualizado.

---

## Salidas

| Escenario | Código HTTP | Respuesta |
| --- | --- | --- |
| Aprendiz vinculado | 200 | "Aprendiz vinculado a la ficha" |
| Aprendiz desvinculado | 200 | "Aprendiz desvinculado de la ficha" |
| Usuario no existe o no está en la ficha | 404 | Mensaje del error |

---

## Endpoints asociados

| Método | Ruta | Auth requerida | Descripción |
| --- | --- | --- | --- |
| PUT | `/api/fichas/:id/aprendiz` | Sí (ADMINISTRADOR) | Vincula un aprendiz |
| DELETE | `/api/fichas/:id/aprendiz/:usuario_id` | Sí (ADMINISTRADOR) | Desvincula un aprendiz |

---

## Reglas de negocio

- **RN-006** — Grupo General por ficha.
- **RN-029** — Cambio de ficha del aprendiz.

Detalle en [`reglas-de-negocio.md`](../reglas-de-negocio.md).
