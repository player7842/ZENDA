# HU-028 — Creación y asignación de tareas

<!--
  ¿Qué? Historia de usuario que describe: creación y asignación de tareas.
  ¿Para qué? Formalizar la necesidad del líder de grupo: repartir el trabajo del proyecto y llevar el control de quién hace qué.
  ¿Impacto? Organiza el trabajo del equipo; es la función que distingue al líder de los demás integrantes.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | HU-028 |
| **Título** | Creación y asignación de tareas |
| **Módulo** | Tareas |
| **Prioridad** | Alta |
| **Estado** | Parcial |
| **Rol** | Líder de grupo |
| **RF asociado** | RF-028 |
| **Reglas de negocio** | RN-008, RN-021 |

---

## Historia

**Como** líder de grupo,
**quiero** crear tareas y asignarlas a los integrantes de mi grupo,
**para** repartir el trabajo del proyecto y llevar el control de quién hace qué.

---

## Criterios de aceptación

### CA-028.1 — Crear tarea

- **Dado que** soy el líder del grupo,
- **cuando** creo una tarea con título, responsable y prioridad,
- **entonces** la tarea queda en estado `Pendiente` asignada al responsable.

### CA-028.2 — Solo el líder

- **Dado que** soy un integrante que no es líder,
- **cuando** intento crear una tarea,
- **entonces** el sistema me lo niega.

### CA-028.3 — Responsable del grupo

- **Dado que** elijo como responsable a alguien que no pertenece a mi grupo,
- **cuando** envío,
- **entonces** veo el mensaje "El responsable no pertenece a tu grupo".

### CA-028.4 — Prioridad válida

- **Dado que** envío una prioridad distinta de alta, media o baja,
- **cuando** guardo,
- **entonces** veo el mensaje "Prioridad inválida".

---

## Cambios frente a la versión v11

- El mensaje de error "Solo el Scrum Master puede crear y asignar tareas" pasa a mencionar al líder del grupo.
