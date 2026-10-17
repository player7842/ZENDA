# HU-014 — Creación de proyecto

<!--
  ¿Qué? Historia de usuario que describe: creación de proyecto.
  ¿Para qué? Formalizar la necesidad del aprendiz: iniciar el desarrollo del proyecto formativo y quedar como líder del grupo.
  ¿Impacto? Es el punto de partida del flujo del aprendiz: sin proyecto no hay fases, evidencias ni tareas.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | HU-014 |
| **Título** | Creación de proyecto |
| **Módulo** | Grupos y proyectos |
| **Prioridad** | Alta |
| **Estado** | Parcial |
| **Rol** | Aprendiz |
| **RF asociado** | RF-014 |
| **Reglas de negocio** | RN-007, RN-008, RN-009, RN-010, RN-011 |

---

## Historia

**Como** aprendiz,
**quiero** crear el proyecto de mi grupo definiendo su información y el cupo de integrantes,
**para** iniciar el desarrollo del proyecto formativo y quedar como líder del grupo.

---

## Criterios de aceptación

### CA-014.1 — Formulario del proyecto

- **Dado que** soy un aprendiz inscrito en una ficha y sin proyecto activo,
- **cuando** abro "Crear proyecto",
- **entonces** veo los campos nombre, descripción, problema, objetivo, alcance, tecnologías, fechas y cupo de integrantes.

### CA-014.2 — Creación exitosa

- **Dado que** completé los campos obligatorios,
- **cuando** envío el formulario,
- **entonces** el proyecto se crea, recibo un código `PRY-XXXXXX`, quedo como líder y se generan las 5 fases.

### CA-014.3 — Un solo proyecto

- **Dado que** ya pertenezco a un proyecto activo,
- **cuando** intento crear otro,
- **entonces** veo el mensaje "Ya perteneces a un proyecto activo".

### CA-014.4 — Campos obligatorios

- **Dado que** dejo vacío un campo obligatorio,
- **cuando** envío el formulario,
- **entonces** veo el mensaje "Faltan campos obligatorios del proyecto".

### CA-014.5 — Sin ficha

- **Dado que** no estoy inscrito en ninguna ficha,
- **cuando** intento crear un proyecto,
- **entonces** veo el mensaje "No estás inscrito en ninguna ficha".

---

## Cambios frente a la versión v11

- Se agrega `cupo_integrantes` a `grupos` o `proyectos`.
- El líder deja de depender de un sub-rol Scrum: es quien crea el proyecto.
- Las fases se siguen creando con los nombres `FASE 1 - ANALISIS` a `FASE 5 - CIERRE/ENTREGA`.
