# HU-016 — Consulta de mi proyecto

<!--
  ¿Qué? Historia de usuario que describe: consulta de mi proyecto.
  ¿Para qué? Formalizar la necesidad del aprendiz: saber en qué punto está mi grupo y qué falta por entregar.
  ¿Impacto? Es la pantalla principal del aprendiz; concentra el estado del trabajo del grupo.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | HU-016 |
| **Título** | Consulta de mi proyecto |
| **Módulo** | Grupos y proyectos |
| **Prioridad** | Alta |
| **Estado** | Implementado |
| **Rol** | Aprendiz |
| **RF asociado** | RF-016 |
| **Reglas de negocio** | RN-007, RN-008, RN-011 |

---

## Historia

**Como** aprendiz,
**quiero** consultar la información de mi proyecto, mis compañeros y el estado de las fases,
**para** saber en qué punto está mi grupo y qué falta por entregar.

---

## Criterios de aceptación

### CA-016.1 — Ficha del proyecto

- **Dado que** pertenezco a un proyecto,
- **cuando** abro "Mi proyecto",
- **entonces** veo su nombre, descripción, problema, objetivo, alcance, tecnologías y fechas.

### CA-016.2 — Integrantes

- **Dado que** estoy en "Mi proyecto",
- **cuando** reviso la sección del equipo,
- **entonces** veo a todos los integrantes y quién es el líder.

### CA-016.3 — Código de invitación

- **Dado que** soy integrante del grupo,
- **cuando** reviso el encabezado del proyecto,
- **entonces** puedo ver el código para invitar a otros compañeros.

### CA-016.4 — Sin proyecto

- **Dado que** no pertenezco a ningún proyecto,
- **cuando** abro "Mi proyecto",
- **entonces** veo las opciones "Crear proyecto" o "Unirme con código".

---

## Cambios frente a la versión v11

- Se reemplazan las etiquetas de rol Scrum del equipo por la marca de líder.
