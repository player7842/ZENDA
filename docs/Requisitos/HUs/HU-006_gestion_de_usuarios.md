# HU-006 — Gestión de usuarios

<!--
  ¿Qué? Historia de usuario que describe: gestión de usuarios.
  ¿Para qué? Formalizar la necesidad del administrador: mantener actualizado quién usa la plataforma y con qué permisos.
  ¿Impacto? Es la única vía para crear instructores, coordinadores y otros administradores.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | HU-006 |
| **Título** | Gestión de usuarios |
| **Módulo** | Administración |
| **Prioridad** | Alta |
| **Estado** | Implementado |
| **Rol** | Administrador |
| **RF asociado** | RF-006 |
| **Reglas de negocio** | RN-001, RN-002, RN-005, RN-028 |

---

## Historia

**Como** administrador,
**quiero** crear, consultar, editar y cambiar el rol de los usuarios,
**para** mantener actualizado quién usa la plataforma y con qué permisos.

---

## Criterios de aceptación

### CA-006.1 — Crear usuario

- **Dado que** estoy en la sección Usuarios,
- **cuando** completo los datos, el rol y confirmo con mi contraseña,
- **entonces** el usuario se crea y aparece en el listado.

### CA-006.2 — Contraseña inicial segura

- **Dado que** creo un usuario,
- **cuando** ingreso una contraseña de menos de 8 caracteres,
- **entonces** veo el mensaje que exige mínimo 8 caracteres.

### CA-006.3 — Consultar usuarios

- **Dado que** estoy en la sección Usuarios,
- **cuando** abro el listado,
- **entonces** veo todos los usuarios con su rol, estado y fichas vinculadas.

### CA-006.4 — Cambiar rol

- **Dado que** selecciono un usuario,
- **cuando** elijo un rol nuevo y confirmo con mi contraseña,
- **entonces** el rol se actualiza.

### CA-006.5 — No quitarme el rol

- **Dado que** intento cambiar mi propio rol de administrador,
- **cuando** envío el cambio,
- **entonces** el sistema lo rechaza.

---

## Cambios frente a la versión v11

- Los mensajes de error de la API deben reescribirse en un tono profesional (hoy algunos contienen groserías, ver [RI-002](../restricciones.md#ri-002--documentación-y-comentarios-profesionales-en-español)).
- Menú de tres puntos para las acciones de cada fila.
