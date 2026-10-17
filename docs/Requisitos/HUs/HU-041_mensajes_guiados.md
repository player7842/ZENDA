# HU-041 — Mensajes guiados

<!--
  ¿Qué? Historia de usuario que describe: mensajes guiados.
  ¿Para qué? Formalizar la necesidad del aprendiz: avanzar en mi proyecto sin recibir recordatorios masivos.
  ¿Impacto? Aporta dinamismo y acompañamiento sin llenar el sistema de notificaciones.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | HU-041 |
| **Título** | Mensajes guiados |
| **Módulo** | Interfaz y legal |
| **Prioridad** | Baja |
| **Estado** | Planificado |
| **Rol** | Aprendiz |
| **RF asociado** | RF-041 |
| **Reglas de negocio** | — |

---

## Historia

**Como** aprendiz,
**quiero** recibir mensajes breves dentro de la interfaz que me orienten sobre lo siguiente que debo hacer,
**para** avanzar en mi proyecto sin recibir recordatorios masivos.

---

## Criterios de aceptación

### CA-041.1 — Mensaje contextual

- **Dado que** me falta una evidencia en una fase,
- **cuando** abro esa fase,
- **entonces** veo un mensaje que me orienta sobre qué falta.

### CA-041.2 — Estado vacío

- **Dado que** aún no tengo proyecto,
- **cuando** abro mi panel,
- **entonces** veo un mensaje que me explica cómo crear uno o unirme.

### CA-041.3 — Sin saturación

- **Dado que** uso el sistema normalmente,
- **cuando** navego por las pantallas,
- **entonces** no recibo ventanas emergentes repetitivas.

---

## Cambios frente a la versión v11

- Sustituye a los recordatorios, que quedaron fuera del alcance ([RO-004](../restricciones.md#ro-004--alcance-excluido)).
