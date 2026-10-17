# HU-033 — Seguimiento académico de fichas y proyectos

<!--
  ¿Qué? Historia de usuario que describe: seguimiento académico de fichas y proyectos.
  ¿Para qué? Formalizar la necesidad del instructor o coordinador: acompañar a los grupos y detectar a tiempo los que se atrasan.
  ¿Impacto? Permite que el instructor y el coordinador actúen antes de que un grupo quede rezagado.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | HU-033 |
| **Título** | Seguimiento académico de fichas y proyectos |
| **Módulo** | Seguimiento |
| **Prioridad** | Alta |
| **Estado** | Implementado |
| **Rol** | Instructor o coordinador |
| **RF asociado** | RF-033 |
| **Reglas de negocio** | RN-016, RN-024, RN-025 |

---

## Historia

**Como** instructor o coordinador,
**quiero** consultar mis fichas, sus aprendices, sus grupos y el avance de cada proyecto,
**para** acompañar a los grupos y detectar a tiempo los que se atrasan.

---

## Criterios de aceptación

### CA-033.1 — Fichas del instructor

- **Dado que** soy instructor,
- **cuando** abro "Mis fichas",
- **entonces** veo solo las fichas a las que estoy vinculado.

### CA-033.2 — Aprendices y grupos

- **Dado que** selecciono una ficha,
- **cuando** abro sus aprendices y grupos,
- **entonces** veo quién está en cada grupo y su proyecto.

### CA-033.3 — Seguimiento del proyecto

- **Dado que** selecciono un proyecto,
- **cuando** abro su detalle,
- **entonces** veo su información, fases, evidencias y observaciones.

### CA-033.4 — Alcance del coordinador

- **Dado que** soy coordinador,
- **cuando** consulto fichas y proyectos,
- **entonces** veo solo los del programa ADSO.

---

## Cambios frente a la versión v11

- Alerta cuando un grupo lleva más de 15 días sin subir evidencias (hoy aparece solo en los datos de prueba).
