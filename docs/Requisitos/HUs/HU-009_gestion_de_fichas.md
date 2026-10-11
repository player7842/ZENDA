# HU-009 — Gestión de fichas

<!--
  ¿Qué? Historia de usuario que describe: gestión de fichas.
  ¿Para qué? Formalizar la necesidad del administrador: organizar a los aprendices por programa y jornada.
  ¿Impacto? Toda la estructura del sistema (grupos, proyectos, evaluaciones) cuelga de la ficha.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | HU-009 |
| **Título** | Gestión de fichas |
| **Módulo** | Administración |
| **Prioridad** | Alta |
| **Estado** | Implementado |
| **Rol** | Administrador |
| **RF asociado** | RF-009 |
| **Reglas de negocio** | RN-028 |

---

## Historia

**Como** administrador,
**quiero** crear, editar, eliminar y consultar las fichas de formación,
**para** organizar a los aprendices por programa y jornada.

---

## Criterios de aceptación

### CA-009.1 — Crear ficha

- **Dado que** estoy en la sección Fichas,
- **cuando** completo programa, número, fechas y jornada y confirmo con mi contraseña,
- **entonces** la ficha se crea y aparece con su conteo de aprendices.

### CA-009.2 — Número duplicado

- **Dado que** intento crear una ficha con un número que ya existe,
- **cuando** envío el formulario,
- **entonces** veo el mensaje que indica que el número ya existe.

### CA-009.3 — Fechas inválidas

- **Dado que** ingreso una fecha de fin anterior a la de inicio,
- **cuando** envío el formulario,
- **entonces** veo un mensaje que exige fechas válidas.

### CA-009.4 — Editar y eliminar

- **Dado que** selecciono una ficha,
- **cuando** edito sus datos o la elimino con confirmación,
- **entonces** el listado se actualiza.

---

## Cambios frente a la versión v11

- Menú de tres puntos para las acciones de cada ficha.
