# HU-003 — Recuperación de contraseña

<!--
  ¿Qué? Historia de usuario que describe: recuperación de contraseña.
  ¿Para qué? Formalizar la necesidad del usuario registrado: volver a entrar a mi cuenta si la olvidé.
  ¿Impacto? Evita bloquear cuentas legítimas sin que un administrador intervenga.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | HU-003 |
| **Título** | Recuperación de contraseña |
| **Módulo** | Autenticación |
| **Prioridad** | Alta |
| **Estado** | Parcial |
| **Rol** | Usuario registrado |
| **RF asociado** | RF-003 |
| **Reglas de negocio** | RN-002 |

---

## Historia

**Como** usuario registrado,
**quiero** recuperar mi contraseña mediante un enlace enviado a mi correo,
**para** volver a entrar a mi cuenta si la olvidé.

---

## Criterios de aceptación

### CA-003.1 — Solicitud de recuperación

- **Dado que** estoy en la pantalla "Olvidé mi contraseña",
- **cuando** ingreso mi correo y envío,
- **entonces** veo un mensaje que indica que, si el correo existe, recibirá un enlace.

### CA-003.2 — Correo con enlace

- **Dado que** solicité la recuperación con un correo registrado,
- **cuando** reviso mi bandeja,
- **entonces** recibo un correo con un enlace válido por 15 minutos.

### CA-003.3 — Nueva contraseña

- **Dado que** abro el enlace con un token vigente,
- **cuando** ingreso una contraseña de al menos 8 caracteres y envío,
- **entonces** mi contraseña se actualiza y puedo iniciar sesión con ella.

### CA-003.4 — Enlace vencido

- **Dado que** abro un enlace con el token expirado o inválido,
- **cuando** envío la nueva contraseña,
- **entonces** veo el mensaje "El token es inválido o ha expirado".

---

## Cambios frente a la versión v11

- La solicitud debe responder siempre el mismo mensaje, exista o no el correo, para evitar la enumeración de usuarios (hoy responde 404 si no existe).
- La URL base del enlace se lee de una variable de entorno (hoy está fija en `http://localhost:5173`).
- El token debe poder usarse una sola vez.
- Se elimina el secreto JWT por defecto del código.
