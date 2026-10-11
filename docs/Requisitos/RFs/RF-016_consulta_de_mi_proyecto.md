# RF-016 — Consulta de mi proyecto

<!--
  ¿Qué? Requisito funcional que define: consulta de mi proyecto.
  ¿Para qué? Documentar formalmente el comportamiento que el sistema debe ofrecer.
  ¿Impacto? Es la pantalla principal del aprendiz; concentra el estado del trabajo del grupo.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RF-016 |
| **Nombre** | Consulta de mi proyecto |
| **Módulo** | Grupos y proyectos |
| **Prioridad** | Alta |
| **Estado** | Implementado |
| **Historia asociada** | HU-016 |
| **Fecha** | Octubre 2026 |

---

## Descripción

El sistema debe mostrar al aprendiz los datos de su proyecto, los integrantes del grupo, el líder, el código de invitación y las 5 fases con su estado.

---

## Entradas

Este requisito no recibe datos del usuario más allá de su sesión.

---

## Proceso

1. El backend identifica al aprendiz por su token.
2. Busca su grupo activo distinto de `General` y el proyecto asociado.
3. Reúne los datos del proyecto, los integrantes y las fases.
4. Devuelve el conjunto al frontend.

---

## Salidas

| Escenario | Código HTTP | Respuesta |
| --- | --- | --- |
| Proyecto encontrado | 200 | Proyecto, integrantes, líder y fases |
| Sin proyecto activo | 404 | "No perteneces a ningún proyecto activo" |

---

## Endpoints asociados

| Método | Ruta | Auth requerida | Descripción |
| --- | --- | --- | --- |
| GET | `/api/aprendiz/proyectos/mio` | Sí (APRENDIZ) | Devuelve mi proyecto |

---

## Reglas de negocio

- **RN-007** — Un proyecto activo por aprendiz.
- **RN-008** — Líder del grupo.
- **RN-011** — Cinco fases fijas.

Detalle en [`reglas-de-negocio.md`](../reglas-de-negocio.md).

---

## Cambios frente a la versión v11

- Se reemplazan las etiquetas de rol Scrum del equipo por la marca de líder.
