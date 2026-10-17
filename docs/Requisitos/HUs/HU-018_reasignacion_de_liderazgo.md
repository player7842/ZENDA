# HU-018 — Reasignación de liderazgo

<!--
  ¿Qué? Historia de usuario que describe: reasignación de liderazgo.
  ¿Para qué? Formalizar la necesidad del administrador: que ningún grupo quede sin quien cree tareas y confirme su cumplimiento.
  ¿Impacto? Como el liderazgo es fijo, esta es la única salida para un grupo que pierde a su líder.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | HU-018 |
| **Título** | Reasignación de liderazgo |
| **Módulo** | Grupos y proyectos |
| **Prioridad** | Media |
| **Estado** | Planificado |
| **Rol** | Administrador |
| **RF asociado** | RF-018 |
| **Reglas de negocio** | RN-008, RN-028, RN-030 |

---

## Historia

**Como** administrador,
**quiero** asignar un nuevo líder a un grupo cuando el actual abandona o se desactiva,
**para** que ningún grupo quede sin quien cree tareas y confirme su cumplimiento.

---

## Criterios de aceptación

### CA-018.1 — Reasignar líder

- **Dado que** selecciono un grupo cuyo líder está inactivo o salió,
- **cuando** elijo a otro integrante activo y confirmo con mi contraseña,
- **entonces** ese integrante pasa a ser el líder del grupo.

### CA-018.2 — Solo integrantes activos

- **Dado que** elijo un usuario que no es integrante activo del grupo,
- **cuando** envío,
- **entonces** el sistema lo rechaza.

### CA-018.3 — Aviso de grupo sin líder

- **Dado que** un líder se desactiva,
- **cuando** guardo el cambio,
- **entonces** veo una alerta que indica que el grupo necesita un líder nuevo.

---

## Cambios frente a la versión v11

- Es una función nueva; hoy `grupos.lider_id` no tiene forma de cambiarse desde la aplicación.
