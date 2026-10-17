# HU-012 — Gestión de programas de formación

<!--
  ¿Qué? Historia de usuario que describe: gestión de programas de formación.
  ¿Para qué? Formalizar la necesidad del administrador: mantener el catálogo de programas al que pertenecen las fichas.
  ¿Impacto? Las fichas dependen de un programa; sin gestión, el catálogo solo se cambia desde la base de datos.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | HU-012 |
| **Título** | Gestión de programas de formación |
| **Módulo** | Administración |
| **Prioridad** | Media |
| **Estado** | Planificado |
| **Rol** | Administrador |
| **RF asociado** | RF-012 |
| **Reglas de negocio** | RN-028 |

---

## Historia

**Como** administrador,
**quiero** crear, editar y eliminar programas de formación,
**para** mantener el catálogo de programas al que pertenecen las fichas.

---

## Criterios de aceptación

### CA-012.1 — Crear programa

- **Dado que** estoy en la sección Programas,
- **cuando** ingreso código y nombre del programa,
- **entonces** el programa se crea y queda disponible al crear fichas.

### CA-012.2 — Código duplicado

- **Dado que** ingreso un código que ya existe,
- **cuando** envío el formulario,
- **entonces** veo un mensaje que indica que el código ya existe.

### CA-012.3 — Programa con fichas

- **Dado que** un programa tiene fichas asociadas,
- **cuando** intento eliminarlo,
- **entonces** el sistema lo impide y me indica por qué.

---

## Cambios frente a la versión v11

- Faltan los endpoints de creación, edición y eliminación.
