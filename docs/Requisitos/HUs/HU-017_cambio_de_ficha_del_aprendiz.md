# HU-017 — Cambio de ficha del aprendiz

<!--
  ¿Qué? Historia de usuario que describe: cambio de ficha del aprendiz.
  ¿Para qué? Formalizar la necesidad del aprendiz: corregir mi inscripción sin pedir ayuda al administrador.
  ¿Impacto? Evita inscripciones incorrectas, pero debe impedirse cuando ya hay un proyecto en curso.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | HU-017 |
| **Título** | Cambio de ficha del aprendiz |
| **Módulo** | Grupos y proyectos |
| **Prioridad** | Media |
| **Estado** | Implementado |
| **Rol** | Aprendiz |
| **RF asociado** | RF-017 |
| **Reglas de negocio** | RN-006, RN-029 |

---

## Historia

**Como** aprendiz,
**quiero** cambiar la ficha a la que estoy inscrito cuando me equivoqué o me trasladaron,
**para** corregir mi inscripción sin pedir ayuda al administrador.

---

## Criterios de aceptación

### CA-017.1 — Consultar mi ficha

- **Dado que** estoy inscrito en una ficha,
- **cuando** abro la sección de ficha,
- **entonces** veo mi ficha actual.

### CA-017.2 — Cambio exitoso

- **Dado que** no tengo proyecto activo,
- **cuando** elijo otra ficha y confirmo,
- **entonces** quedo inscrito en la nueva ficha.

### CA-017.3 — Con proyecto activo

- **Dado que** pertenezco a un proyecto,
- **cuando** intento cambiar de ficha,
- **entonces** veo el mensaje "Ya tienes un proyecto activo, no puedes cambiar de ficha".
