# HU-007 — Desactivación y eliminación de usuarios

<!--
  ¿Qué? Historia de usuario que describe: desactivación y eliminación de usuarios.
  ¿Para qué? Formalizar la necesidad del administrador: retirar el acceso de quienes ya no participan sin perder el historial académico.
  ¿Impacto? Eliminar a un usuario con evaluaciones o evidencias puede dañar el historial; desactivar lo evita.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | HU-007 |
| **Título** | Desactivación y eliminación de usuarios |
| **Módulo** | Administración |
| **Prioridad** | Media |
| **Estado** | Parcial |
| **Rol** | Administrador |
| **RF asociado** | RF-007 |
| **Reglas de negocio** | RN-003, RN-028, RN-030 |

---

## Historia

**Como** administrador,
**quiero** desactivar o eliminar un usuario con mi contraseña de confirmación,
**para** retirar el acceso de quienes ya no participan sin perder el historial académico.

---

## Criterios de aceptación

### CA-007.1 — Desactivar usuario

- **Dado que** selecciono un usuario activo,
- **cuando** cambio su estado a inactivo y confirmo,
- **entonces** el usuario ya no puede iniciar sesión y su historial se conserva.

### CA-007.2 — Eliminar con confirmación

- **Dado que** selecciono un usuario,
- **cuando** pulso eliminar y confirmo con mi contraseña,
- **entonces** el usuario se elimina.

### CA-007.3 — Contraseña incorrecta

- **Dado que** intento eliminar un usuario,
- **cuando** ingreso una contraseña distinta a la mía,
- **entonces** la acción se rechaza y el usuario no se elimina.

### CA-007.4 — Líder desactivado

- **Dado que** desactivo a un aprendiz que es líder de un grupo,
- **cuando** se guarda el cambio,
- **entonces** el sistema me avisa que el grupo necesita que reasigne el liderazgo.

---

## Cambios frente a la versión v11

- Hoy el eliminado puede fallar si el usuario tiene registros asociados; la desactivación es la vía recomendada.
- Se agrega la advertencia por liderazgo pendiente.
