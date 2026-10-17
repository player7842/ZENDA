# HU-001 — Registro de aprendiz

<!--
  ¿Qué? Historia de usuario que describe: registro de aprendiz.
  ¿Para qué? Formalizar la necesidad del aprendiz nuevo: acceder a ZENDA e inscribirme en mi ficha de formación.
  ¿Impacto? Es la puerta de entrada de los aprendices; sin registro no hay usuarios que formen grupos.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | HU-001 |
| **Título** | Registro de aprendiz |
| **Módulo** | Autenticación |
| **Prioridad** | Alta |
| **Estado** | Parcial |
| **Rol** | Aprendiz nuevo |
| **RF asociado** | RF-001 |
| **Reglas de negocio** | RN-001, RN-002, RN-004, RN-005, RN-006 |

---

## Historia

**Como** aprendiz nuevo,
**quiero** crear mi cuenta con mis datos personales, mi correo institucional y mi ficha,
**para** acceder a ZENDA e inscribirme en mi ficha de formación.

---

## Criterios de aceptación

### CA-001.1 — Formulario completo

- **Dado que** estoy en la página de registro,
- **cuando** veo el formulario,
- **entonces** encuentro los campos nombre, apellido, tipo y número de documento (CC, TI, CE, PA y PPT), correo institucional, ficha, contraseña y confirmación de contraseña.

### CA-001.2 — Correo institucional obligatorio

- **Dado que** completo el formulario con un correo que no termina en `@soy.sena.edu.co`,
- **cuando** envío el formulario,
- **entonces** veo el mensaje "El correo debe ser institucional (@soy.sena.edu.co)".

### CA-001.3 — Medidor de contraseña

- **Dado que** escribo mi contraseña,
- **cuando** cambia cada carácter,
- **entonces** veo un medidor con cinco niveles: muy baja, baja, media, fuerte y muy segura.

### CA-001.4 — Confirmación sin pegar

- **Dado que** estoy en el campo de confirmación de contraseña,
- **cuando** intento pegar texto con el portapapeles,
- **entonces** el campo no acepta el contenido pegado y debo escribirlo.

### CA-001.5 — Aceptación legal obligatoria

- **Dado que** no he marcado alguna de las cuatro casillas legales (términos, privacidad, cookies y protección de datos),
- **cuando** intento enviar el formulario,
- **entonces** el registro se bloquea y se indica cuál aceptación falta.

### CA-001.6 — Registro exitoso

- **Dado que** completé todos los campos correctamente,
- **cuando** envío el formulario,
- **entonces** mi cuenta se crea como `APRENDIZ`, quedo inscrito en el grupo `General` de mi ficha y accedo a mi panel.

### CA-001.7 — Correo duplicado

- **Dado que** intento registrarme con un correo que ya existe,
- **cuando** envío el formulario,
- **entonces** veo el mensaje "Este correo ya está registrado".

---

## Cambios frente a la versión v11

- Se elimina el campo `sub_rol` (Scrum Master, Product Owner, Developer) del formulario, de la validación y de la base de datos.
- Se agrega el tipo de documento `PPT`.
- Se agregan las cuatro casillas legales obligatorias, el medidor de contraseña y el bloqueo de pegado en la confirmación.
- Se agregan límite de intentos, campo trampa (*honeypot*) y verificación del correo (ver [RS-006](../restricciones.md#rs-006--registro-seguro-y-humano)).
- Hoy el registro no valida la longitud de la contraseña; solo lo hace el restablecimiento.
