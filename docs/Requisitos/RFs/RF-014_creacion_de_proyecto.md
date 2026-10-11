# RF-014 — Creación de proyecto

<!--
  ¿Qué? Requisito funcional que define: creación de proyecto.
  ¿Para qué? Documentar formalmente el comportamiento que el sistema debe ofrecer.
  ¿Impacto? Es el punto de partida del flujo del aprendiz: sin proyecto no hay fases, evidencias ni tareas.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RF-014 |
| **Nombre** | Creación de proyecto |
| **Módulo** | Grupos y proyectos |
| **Prioridad** | Alta |
| **Estado** | Parcial |
| **Historia asociada** | HU-014 |
| **Fecha** | Octubre 2026 |

---

## Descripción

El sistema debe permitir que un aprendiz sin proyecto activo cree el proyecto de su grupo. Al hacerlo, se crea el grupo del proyecto con un código de invitación único, el aprendiz queda como líder, se generan las 5 fases fijas y se registra el cupo máximo de integrantes.

---

## Entradas

| Campo | Tipo | Obligatorio | Validaciones |
| --- | --- | --- | --- |
| `nombre_proyecto` | Texto | Sí | Máximo 150 caracteres |
| `descripcion`, `problema`, `objetivo`, `alcance` | Texto | Sí | Máximo 500 caracteres cada uno |
| `tecnologias` | Texto | No | Máximo 500 caracteres |
| `fecha_inicio`, `fecha_fin_estimada` | Fecha | Sí | Fin posterior al inicio |
| `cupo_integrantes` | Número | Sí | Entero positivo; rango por definir |

---

## Proceso

1. El aprendiz completa el formulario.
2. El backend verifica que esté inscrito en una ficha y que no tenga un proyecto activo.
3. Crea el grupo con su código `PRY-XXXXXX` y lo marca con el aprendiz como líder.
4. Crea el proyecto y sus 5 fases fijas.
5. Inscribe al aprendiz como integrante del grupo y devuelve el código de invitación.

---

## Salidas

| Escenario | Código HTTP | Respuesta |
| --- | --- | --- |
| Proyecto creado | 201 | Datos del proyecto y código de invitación |
| Faltan campos, ya tiene proyecto o no tiene ficha | 400 | Mensaje del error |
| Error del servidor | 500 | "Error al crear el proyecto" |

---

## Endpoints asociados

| Método | Ruta | Auth requerida | Descripción |
| --- | --- | --- | --- |
| POST | `/api/aprendiz/proyectos` | Sí (APRENDIZ) | Crea el proyecto y el grupo |

---

## Reglas de negocio

- **RN-007** — Un proyecto activo por aprendiz.
- **RN-008** — Líder del grupo.
- **RN-009** — Cupo del grupo.
- **RN-010** — Código de invitación.
- **RN-011** — Cinco fases fijas.

Detalle en [`reglas-de-negocio.md`](../reglas-de-negocio.md).

---

## Cambios frente a la versión v11

- Se agrega `cupo_integrantes` a `grupos` o `proyectos`.
- El líder deja de depender de un sub-rol Scrum: es quien crea el proyecto.
- Las fases se siguen creando con los nombres `FASE 1 - ANALISIS` a `FASE 5 - CIERRE/ENTREGA`.
