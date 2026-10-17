# HU-029 — Avance de mis tareas

<!--
  ¿Qué? Historia de usuario que describe: avance de mis tareas.
  ¿Para qué? Formalizar la necesidad del aprendiz: informar al líder cómo voy con mi parte del trabajo.
  ¿Impacto? Mantiene el tablero actualizado con la información de quien realmente hace la tarea.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | HU-029 |
| **Título** | Avance de mis tareas |
| **Módulo** | Tareas |
| **Prioridad** | Alta |
| **Estado** | Implementado |
| **Rol** | Aprendiz |
| **RF asociado** | RF-029 |
| **Reglas de negocio** | RN-022 |

---

## Historia

**Como** aprendiz,
**quiero** mover mis tareas asignadas a "En proceso" y "Finalizada",
**para** informar al líder cómo voy con mi parte del trabajo.

---

## Criterios de aceptación

### CA-029.1 — Iniciar tarea

- **Dado que** tengo una tarea `Pendiente` asignada,
- **cuando** la muevo a "En proceso",
- **entonces** el estado de la tarea cambia.

### CA-029.2 — Finalizar tarea

- **Dado que** tengo una tarea `En proceso`,
- **cuando** la muevo a "Finalizada",
- **entonces** queda pendiente de la confirmación del líder.

### CA-029.3 — Tarea ajena

- **Dado que** la tarea está asignada a otro integrante,
- **cuando** intento moverla,
- **entonces** veo el mensaje "Solo el responsable puede mover esta tarea".

### CA-029.4 — Transición inválida

- **Dado que** intento saltar de `Pendiente` a `Finalizada`,
- **cuando** envío el cambio,
- **entonces** veo un mensaje que indica que no se puede pasar de un estado al otro.
