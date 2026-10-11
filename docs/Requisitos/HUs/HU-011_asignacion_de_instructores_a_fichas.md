# HU-011 — Asignación de instructores a fichas

<!--
  ¿Qué? Historia de usuario que describe: asignación de instructores a fichas.
  ¿Para qué? Formalizar la necesidad del administrador: que cada ficha tenga un instructor que evalúe y que un cambio de instructor no borre su historial.
  ¿Impacto? Define quién puede evaluar cada ficha; un cambio mal manejado haría perder evaluaciones anteriores.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | HU-011 |
| **Título** | Asignación de instructores a fichas |
| **Módulo** | Administración |
| **Prioridad** | Alta |
| **Estado** | Parcial |
| **Rol** | Administrador |
| **RF asociado** | RF-011 |
| **Reglas de negocio** | RN-024, RN-025, RN-028 |

---

## Historia

**Como** administrador,
**quiero** vincular instructores a las fichas que acompañan, y que el coordinador pueda reasignarlos,
**para** que cada ficha tenga un instructor que evalúe y que un cambio de instructor no borre su historial.

---

## Criterios de aceptación

### CA-011.1 — Vincular fichas

- **Dado que** selecciono un instructor,
- **cuando** elijo las fichas que atenderá y guardo,
- **entonces** el instructor ve esas fichas en su panel.

### CA-011.2 — Solo instructores

- **Dado que** selecciono un usuario que no es instructor,
- **cuando** intento vincularle fichas,
- **entonces** el sistema lo rechaza.

### CA-011.3 — Reasignación por el coordinador

- **Dado que** soy coordinador,
- **cuando** cambio las fichas de un instructor del programa ADSO,
- **entonces** la asignación se actualiza solo para fichas ADSO.

### CA-011.4 — Historial conservado

- **Dado que** se retira una ficha a un instructor,
- **cuando** guardo el cambio,
- **entonces** la vinculación anterior queda cerrada con su fecha y sus evaluaciones se conservan.

---

## Cambios frente a la versión v11

- Hoy `instructor_ficha` se borra y se vuelve a insertar, por lo que no queda historial.
- Se agregan `fecha_inicio`, `fecha_fin` y estado a `instructor_ficha`.
