# HU-019 — Carpetas de una fase

<!--
  ¿Qué? Historia de usuario que describe: carpetas de una fase.
  ¿Para qué? Formalizar la necesidad del aprendiz: organizar las evidencias que mi grupo va entregando.
  ¿Impacto? Las carpetas son la unidad con la que el instructor revisa y aprueba las entregas.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | HU-019 |
| **Título** | Carpetas de una fase |
| **Módulo** | Fases y evidencias |
| **Prioridad** | Alta |
| **Estado** | Parcial |
| **Rol** | Aprendiz |
| **RF asociado** | RF-019 |
| **Reglas de negocio** | RN-012, RN-015 |

---

## Historia

**Como** aprendiz,
**quiero** crear carpetas dentro de cada fase del proyecto,
**para** organizar las evidencias que mi grupo va entregando.

---

## Criterios de aceptación

### CA-019.1 — Crear carpeta

- **Dado que** pertenezco al grupo dueño de la fase,
- **cuando** creo una carpeta con un nombre,
- **entonces** la carpeta aparece dentro de la fase.

### CA-019.2 — Nombre obligatorio

- **Dado que** dejo el nombre vacío,
- **cuando** envío,
- **entonces** veo el mensaje "El nombre de la carpeta es obligatorio".

### CA-019.3 — Cualquier integrante

- **Dado que** soy un integrante que no es líder,
- **cuando** creo una carpeta,
- **entonces** el sistema me lo permite.

### CA-019.4 — Fase ajena

- **Dado que** la fase pertenece a otro grupo,
- **cuando** intento crear una carpeta,
- **entonces** el sistema me lo niega.

---

## Cambios frente a la versión v11

- Hoy solo el líder puede crear carpetas ("Solo el líder del grupo puede crear carpetas"); pasa a ser permitido a cualquier integrante.
- Se agrega `estado_carpeta` para la cascada de aprobación.
