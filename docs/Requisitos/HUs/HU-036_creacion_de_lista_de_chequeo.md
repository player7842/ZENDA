# HU-036 — Creación de lista de chequeo

<!--
  ¿Qué? Historia de usuario que describe: creación de lista de chequeo.
  ¿Para qué? Formalizar la necesidad del instructor: llevar el control del avance de la ficha con mi propio criterio de evaluación.
  ¿Impacto? Reemplaza las listas en papel y da al instructor un seguimiento por ficha dentro de ZENDA.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | HU-036 |
| **Título** | Creación de lista de chequeo |
| **Módulo** | Lista de chequeo |
| **Prioridad** | Media |
| **Estado** | Planificado |
| **Rol** | Instructor |
| **RF asociado** | RF-036 |
| **Reglas de negocio** | RN-016, RN-026 |

---

## Historia

**Como** instructor,
**quiero** crear la lista de chequeo de una ficha, por fase, con las evidencias que se esperan,
**para** llevar el control del avance de la ficha con mi propio criterio de evaluación.

---

## Criterios de aceptación

### CA-036.1 — Crear lista

- **Dado que** soy instructor de una ficha,
- **cuando** creo una lista de chequeo para esa ficha,
- **entonces** la lista queda asociada a la ficha.

### CA-036.2 — Agregar ítems

- **Dado que** estoy editando la lista,
- **cuando** agrego un ítem con fase, nombre de la evidencia, descripción, si es obligatoria y su orden,
- **entonces** el ítem aparece en la fase indicada.

### CA-036.3 — Editar y ordenar

- **Dado que** la lista tiene ítems,
- **cuando** los edito, reordeno o elimino,
- **entonces** la lista se actualiza sin perder las evaluaciones ya hechas.

---

## Cambios frente a la versión v11

- Función nueva: requiere las tablas `listas_chequeo` y `lista_chequeo_items`.
