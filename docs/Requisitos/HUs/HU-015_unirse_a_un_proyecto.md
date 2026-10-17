# HU-015 — Unirse a un proyecto

<!--
  ¿Qué? Historia de usuario que describe: unirse a un proyecto.
  ¿Para qué? Formalizar la necesidad del aprendiz: colaborar con mis compañeros sin que alguien tenga que agregarme.
  ¿Impacto? Es la forma en que los demás integrantes entran al proyecto creado por el líder.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | HU-015 |
| **Título** | Unirse a un proyecto |
| **Módulo** | Grupos y proyectos |
| **Prioridad** | Alta |
| **Estado** | Parcial |
| **Rol** | Aprendiz |
| **RF asociado** | RF-015 |
| **Reglas de negocio** | RN-007, RN-009, RN-010 |

---

## Historia

**Como** aprendiz,
**quiero** unirme al proyecto de mi grupo con un código de invitación,
**para** colaborar con mis compañeros sin que alguien tenga que agregarme.

---

## Criterios de aceptación

### CA-015.1 — Unión exitosa

- **Dado que** tengo un código válido y no pertenezco a ningún proyecto,
- **cuando** lo ingreso y confirmo,
- **entonces** quedo como integrante del grupo y veo el proyecto.

### CA-015.2 — Código inexistente

- **Dado que** ingreso un código que no existe,
- **cuando** envío,
- **entonces** veo el mensaje "Código de grupo no encontrado".

### CA-015.3 — Grupo lleno

- **Dado que** el grupo ya alcanzó su cupo,
- **cuando** intento unirme,
- **entonces** veo un mensaje que indica que el grupo está completo.

### CA-015.4 — Ya tengo proyecto

- **Dado que** ya pertenezco a un proyecto activo,
- **cuando** intento unirme a otro,
- **entonces** veo el mensaje "Ya perteneces a un proyecto activo".

---

## Cambios frente a la versión v11

- Se elimina la selección de rol Scrum al unirse y la validación "Este grupo ya tiene un Product Owner".
- Se agrega la validación del cupo.
