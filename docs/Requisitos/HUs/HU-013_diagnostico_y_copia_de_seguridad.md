# HU-013 — Diagnóstico y copia de seguridad

<!--
  ¿Qué? Historia de usuario que describe: diagnóstico y copia de seguridad.
  ¿Para qué? Formalizar la necesidad del administrador: detectar fallas a tiempo y proteger la información del proyecto.
  ¿Impacto? Sin copias de seguridad, un fallo del servidor puede significar la pérdida de todas las evidencias registradas.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | HU-013 |
| **Título** | Diagnóstico y copia de seguridad |
| **Módulo** | Administración |
| **Prioridad** | Baja |
| **Estado** | Planificado |
| **Rol** | Administrador |
| **RF asociado** | RF-013 |
| **Reglas de negocio** | RN-028 |

---

## Historia

**Como** administrador,
**quiero** consultar el estado del sistema y descargar una copia de seguridad de la base de datos,
**para** detectar fallas a tiempo y proteger la información del proyecto.

---

## Criterios de aceptación

### CA-013.1 — Ver diagnóstico

- **Dado que** estoy en la sección Sistema,
- **cuando** abro la pantalla,
- **entonces** veo el estado del servidor, de la base de datos y de la última copia.

### CA-013.2 — Descargar copia

- **Dado que** estoy en la sección Sistema,
- **cuando** pulso "Descargar copia de seguridad" y confirmo con mi contraseña,
- **entonces** obtengo un archivo con la copia de la base de datos.

### CA-013.3 — Solo administradores

- **Dado que** no soy administrador,
- **cuando** intento acceder a estas funciones,
- **entonces** el sistema me lo niega.

---

## Cambios frente a la versión v11

- Ambos endpoints están pendientes en el backend.
