# HU-002 — Inicio de sesión

<!--
  ¿Qué? Historia de usuario que describe: inicio de sesión.
  ¿Para qué? Formalizar la necesidad del usuario registrado: acceder al panel que corresponde a mi rol.
  ¿Impacto? Controla el acceso a toda la plataforma; un fallo expone datos de los proyectos.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | HU-002 |
| **Título** | Inicio de sesión |
| **Módulo** | Autenticación |
| **Prioridad** | Alta |
| **Estado** | Implementado |
| **Rol** | Usuario registrado |
| **RF asociado** | RF-002 |
| **Reglas de negocio** | RN-002, RN-003 |

---

## Historia

**Como** usuario registrado,
**quiero** iniciar sesión con mi correo y mi contraseña,
**para** acceder al panel que corresponde a mi rol.

---

## Criterios de aceptación

### CA-002.1 — Acceso al panel según el rol

- **Dado que** ingreso credenciales válidas de una cuenta activa,
- **cuando** envío el formulario,
- **entonces** soy dirigido al panel de mi rol (`/aprendiz`, `/instructor`, `/coordinador` o `/admin`).

### CA-002.2 — Credenciales incorrectas

- **Dado que** ingreso un correo o una contraseña erróneos,
- **cuando** envío el formulario,
- **entonces** veo el mensaje "Credenciales incorrectas, intenta de nuevo" sin saber cuál de los dos falló.

### CA-002.3 — Cuenta inactiva

- **Dado que** mi cuenta tiene un estado distinto de `Activo`,
- **cuando** intento iniciar sesión,
- **entonces** veo un mensaje que me indica hablar con un administrador.

### CA-002.4 — Volver al inicio

- **Dado que** estoy en la pantalla de inicio de sesión,
- **cuando** quiero regresar a la página principal,
- **entonces** encuentro un botón "Volver al inicio".

---

## Cambios frente a la versión v11

- El token pasa de 24 horas a 15 minutos, con renovación (ver [RF-004](../RFs/RF-004_sesion_segura.md)).
- Se agrega límite de intentos fallidos.
- Se agrega el botón "Volver al inicio".
