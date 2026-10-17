# RNF-001 — Seguridad

<!--
  ¿Qué? Requisito no funcional que define: seguridad.
  ¿Para qué? Proteger credenciales, sesiones, datos y archivos de los usuarios frente a ataques comunes.
  ¿Impacto? Un fallo de seguridad expondría datos personales y el trabajo académico de los aprendices.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **ID** | RNF-001 |
| **Nombre** | Seguridad |
| **Categoría** | Seguridad de la información |
| **Prioridad** | Crítica |
| **Estado** | Parcial |
| **Fecha** | Octubre 2026 |

---

## Requisitos

### RNF-001.1 — Hash de contraseñas

Las contraseñas se almacenan con **bcrypt** (costo 10) y nunca aparecen en respuestas, registros ni mensajes de error.

**Estado:** Vigente

### RNF-001.2 — Sesión con JWT

La autenticación usa tokens JWT. Meta: token de acceso de 15 minutos, token de refresco de 7 días con rotación y cierre por inactividad a los 30 minutos. Hoy el token dura 24 horas y se guarda en `localStorage`.

**Estado:** Parcial

### RNF-001.3 — Secretos fuera del código

Claves, credenciales de base de datos y datos SMTP viven en archivos `.env` no versionados, con un `.env.example` por servicio. No existen valores sensibles por defecto en el código.

**Estado:** Parcial

### RNF-001.4 — Autorización en el servidor

Cada ruta protegida valida el token (`auth`) y el rol (`isAdmin`, `isCoordinador`, `isInstructor`, `isAprendiz`). Ocultar un botón en la interfaz no es un control de acceso.

**Estado:** Vigente

### RNF-001.5 — Consultas SQL parametrizadas

Toda consulta con datos del usuario usa parámetros (`$1`, `$2`). Se prohíbe concatenar entradas en el texto SQL.

**Estado:** Vigente

### RNF-001.6 — Prevención de enumeración de usuarios

Los mensajes de inicio de sesión y de recuperación no revelan si un correo existe. Hoy la recuperación responde 404 cuando no existe.

**Estado:** Parcial

### RNF-001.7 — Protección contra bots y abuso

Límite de intentos en inicio de sesión, registro y recuperación; campo trampa en el registro; bloqueo de pegado en la confirmación de contraseña y verificación del correo. El aviso por correo tras 3 intentos fallidos del documento original no se implementa: el correo se reserva para la recuperación de contraseña.

**Estado:** Adoptada

### RNF-001.8 — Medidor de fortaleza

El registro y el restablecimiento muestran un medidor de cinco niveles (muy baja, baja, media, fuerte, muy segura) y exigen mínimo 8 caracteres con al menos un número.

**Estado:** Adoptada

### RNF-001.9 — CORS restringido

En producción solo se permiten los orígenes del frontend desplegado. Hoy `cors()` acepta cualquier origen.

**Estado:** Parcial

### RNF-001.10 — Cabeceras HTTP seguras

El servidor web y la API envían cabeceras de seguridad (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`). La API usa `helmet`.

**Estado:** Parcial

### RNF-001.11 — Confirmación de acciones críticas

Crear o editar usuarios y fichas, cambiar roles y eliminar exigen la contraseña del administrador.

**Estado:** Vigente

### RNF-001.12 — Seguridad de archivos subidos

Lista blanca de tipos verificada por contenido real, tamaño máximo, cuota por proyecto, nombre aleatorio en el almacenamiento y entrega con un tipo que el navegador no ejecute.

**Estado:** Adoptada

### RNF-001.13 — Errores sin detalles técnicos

Ante un fallo interno el usuario ve un mensaje claro y en español, sin trazas, consultas SQL ni rutas del servidor. El detalle técnico solo se registra en el servidor.

**Estado:** Parcial

---

## Documentos relacionados

- [Restricciones](../restricciones.md)
- [Reglas de negocio](../reglas-de-negocio.md)
