# Seguridad web y OWASP Top 10:2025 — ZENDA

<!--
  ¿Qué? Explicación de los diez riesgos de seguridad web más críticos según OWASP y de cómo ZENDA los enfrenta hoy y qué queda para las Semanas 3–6.
  ¿Para qué? Que el equipo entienda no solo qué hacer sino por qué, y que cada medida del proyecto tenga un riesgo real detrás.
  ¿Impacto? ZENDA guarda datos personales de aprendices y su trabajo académico: un fallo de seguridad tiene consecuencias legales y de confianza.
-->

---

## Identificación

| Campo | Valor |
|---|---|
| **Referencia** | [OWASP Top 10:2025](https://owasp.org/Top10/2025/) (octava edición, vigente en 2026; reemplaza a la de 2021) |
| **Alcance** | Backend, frontend, base de datos, contenedores y cadena de dependencias de ZENDA |
| **Relacionado** | [RNF-001 Seguridad](../Requisitos/RNFs/RNF-001_seguridad.md) · [Hallazgos](../Testing/hallazgos.md) · [Pruebas no funcionales](../Testing/pruebas-no-funcionales.md) |
| **Fecha** | Octubre 2026 |

> **El Top 10 es un documento de concienciación, no una lista de verificación completa.** Cubrirlo no garantiza que una aplicación sea segura; sirve para no cometer los errores más frecuentes.

**Leyenda de estado:** ✅ mitigado · ⚠️ parcial o por verificar · ❌ pendiente · ➖ no aplica.

---

## 1. Resumen de estado

| # | Categoría 2025 | Estado actual | Pendiente Semanas 3–6 | Evidencia |
|:---:|---|:---:|---|---|
| A01 | Pérdida de control de acceso | ⚠️ | Pertenencia y líder verificados con pruebas | [Matriz de permisos](../Requisitos/matriz-permisos.md), PI-01 a PI-30 |
| A02 | Configuración de seguridad incorrecta | ✅ | CORS cerrado, sin secretos por defecto, cabeceras | [H-02](../Testing/hallazgos.md), [H-04](../Testing/hallazgos.md) |
| A03 | Fallas en la cadena de suministro de software | ⚠️ | Versiones exactas, `pnpm audit`, `frozen-lockfile` | [Dependencias](dependencias-y-cadena-de-suministro.md), [H-16](../Testing/hallazgos.md) |
| A04 | Fallas criptográficas | ⚠️ | HTTPS en producción, tokens cortos | [bcrypt y JWT](autenticacion-jwt.md) |
| A05 | Inyección | ✅ | Pruebas de inyección y de XSS | [RS-005](../Requisitos/restricciones.md#rs-005--consultas-sql-parametrizadas), PNF-S02, PNF-S13 |
| A06 | Diseño inseguro | ⚠️ | Historial inmutable, límites de intentos, cupos | [Reglas de negocio](../Requisitos/reglas-de-negocio.md) |
| A07 | Fallas de autenticación | ⚠️ | Contraseña con política, límite de intentos; sesión actual de 24 h (objetivo: 15 min + refresh en HU-004) | [RF-001](../Requisitos/RFs/RF-001_registro_de_aprendiz.md), [RF-004](../Requisitos/RFs/RF-004_sesion_segura.md) |
| A08 | Fallas en la integridad del software o de los datos | ⚠️ | Archivos validados, CI, evaluaciones sin sobrescribir | [H-06](../Testing/hallazgos.md), [RNF-012](../Requisitos/RNFs/RNF-012_gestion_de_archivos_y_almacenamiento.md) |
| A09 | Fallas en el registro, alerta y monitoreo | ❌ | Tabla `auditoria` y registro de errores | [RNF-011](../Requisitos/RNFs/RNF-011_observabilidad_y_auditoria.md) |
| A10 | Manejo inadecuado de condiciones excepcionales | ⚠️ | Manejador de errores central y mensajes sin detalles | [RNF-001.13](../Requisitos/RNFs/RNF-001_seguridad.md) |

---

## 2. Detalle por categoría

### A01 — Pérdida de control de acceso

| | |
|---|---|
| **Qué es** | Un usuario hace algo que no le corresponde: leer datos de otro, ejecutar acciones de otro rol o modificar lo ajeno. En 2025 esta categoría **incluye el SSRF** (que el servidor haga peticiones a destinos elegidos por el atacante). |
| **Cómo se vería en ZENDA** | Un aprendiz pide `GET /fases/7/carpetas` de un grupo ajeno; un instructor evalúa una evidencia de una ficha que no es suya; un integrante que no es líder confirma una tarea. |
| **Qué hace ZENDA hoy** | Middlewares de rol (`auth`, `isAprendiz`…) y verificación de pertenencia en varios controladores. |
| **Qué falta** | Verificar **cada ruta** con las [30 pruebas de autorización](../Testing/pruebas-de-integracion.md#3-pruebas-de-autorización-desde-la-matriz-de-permisos); centralizar en `PermisosService`. |
| **SSRF** | ➖ ZENDA guarda enlaces de evidencias pero **no los descarga ni los visita**; si alguna vez se previsualizan en el servidor, habrá que validar destinos. |

**Regla práctica:** *denegar por defecto.* Una ruta nueva nace cerrada y se abre solo al rol que debe usarla.

### A02 — Configuración de seguridad incorrecta

| | |
|---|---|
| **Qué es** | Valores por defecto inseguros, funciones innecesarias activas, cabeceras ausentes o errores que revelan detalles. Subió del puesto 5 al 2. |
| **ZENDA hoy** | `cors()` abierto ([H-04](../Testing/hallazgos.md)); secreto JWT por defecto en el código ([H-02](../Testing/hallazgos.md)); credenciales de ejemplo en `mailer.js`. |
| **Correcciones** | CORS limitado al frontend (`FRONTEND_URL`); el servidor **no arranca** sin `JWT_SECRET`; Dockerfiles con usuario sin privilegios; cabeceras en Nginx y la API; datos de prueba fuera de producción. |

### A03 — Fallas en la cadena de suministro de software

| | |
|---|---|
| **Qué es** | Ataques o fallos en las dependencias, las herramientas de construcción y la distribución del software. Es la categoría **nueva en el puesto 3** y amplía a "componentes vulnerables y desactualizados". |
| **ZENDA hoy** | Ya usa `pnpm-lock.yaml`; pero hay 21 dependencias con `^` ([H-16](../Testing/hallazgos.md)) y una librería de servidor en el frontend ([H-14](../Testing/hallazgos.md)). |
| **Correcciones** | Versiones exactas, `--frozen-lockfile`, `pnpm audit` en el CI, elegir solo paquetes mantenidos y elegir versiones con al menos dos semanas de antigüedad. Detalle en [dependencias](dependencias-y-cadena-de-suministro.md). |

### A04 — Fallas criptográficas

| | |
|---|---|
| **Qué es** | Datos sensibles sin protección adecuada: contraseñas mal guardadas, tráfico sin cifrar, claves débiles. |
| **ZENDA hoy** | ✅ Contraseñas con **bcrypt** (costo 10). ⚠️ En producción falta HTTPS; el token vive en `localStorage`. |
| **Correcciones** | HTTPS obligatorio, `JWT_SECRET` largo y aleatorio, hash SHA-256 del token de recuperación en la base de datos y nunca guardarlo en claro. |

### A05 — Inyección

| | |
|---|---|
| **Qué es** | Datos del usuario que se interpretan como código: SQL, comandos y, desde esta edición, también **XSS**. |
| **ZENDA hoy** | ✅ Consultas parametrizadas (`$1`, `$2`) ([RS-005](../Requisitos/restricciones.md#rs-005--consultas-sql-parametrizadas)); React escapa el texto por defecto. |
| **Riesgo residual** | Usar `dangerouslySetInnerHTML`, construir SQL con texto, o mostrar nombres de proyecto y observaciones sin escapar en reportes. |
| **Prueba** | PNF-S02 (SQL) y PNF-S13 (XSS almacenado) en [pruebas no funcionales](../Testing/pruebas-no-funcionales.md). |

```js
// ❌ Vulnerable: concatenar la entrada
pool.query(`SELECT * FROM usuarios WHERE correo = '${correo}'`);
// ✅ Seguro: parámetro
pool.query('SELECT usuario_id FROM usuarios WHERE correo = $1', [correo]);
```

### A06 — Diseño inseguro

| | |
|---|---|
| **Qué es** | Fallas de **diseño**, no de programación: faltan controles que ningún código correcto podría compensar. |
| **Ejemplos en ZENDA** | Permitir que una evaluación se sobrescriba; no limitar intentos de inicio de sesión; no definir cupos; permitir que un grupo quede sin líder. |
| **Decisiones de diseño** | Historial inmutable ([RN-017](../Requisitos/reglas-de-negocio.md#rn-017--historial-de-evaluaciones)), cupo del grupo ([RN-009](../Requisitos/reglas-de-negocio.md#rn-009--cupo-del-grupo)), reasignación de liderazgo solo por el administrador ([RN-030](../Requisitos/reglas-de-negocio.md#rn-030--reasignación-de-liderazgo-por-el-administrador)), borrado lógico. |

### A07 — Fallas de autenticación

| | |
|---|---|
| **Qué es** | Identidad débil: contraseñas triviales, ataques de fuerza bruta, sesiones que no se invalidan, mensajes que revelan qué cuentas existen. |
| **ZENDA hoy** | `forgot-password` responde igual exista o no el correo ([H-01](../Testing/hallazgos.md) corregido); contraseña con mínimo de 8 caracteres ([H-05](../Testing/hallazgos.md) corregido); rate-limit en autenticación; sesión de 24 h. |
| **Pendiente (Semanas 3–6)** | Política de contraseña y medidor, respuestas idénticas, límite de intentos, *honeypot*, verificación de correo, sesión de 15 minutos con refresco rotativo. Ver [autenticación](autenticacion-jwt.md). |

> Bloquear el pegado en la confirmación de contraseña **no detiene a los bots** (envían la petición directamente); por eso se acompaña de las demás medidas.

### A08 — Fallas en la integridad del software o de los datos

| | |
|---|---|
| **Qué es** | Confiar en código, actualizaciones o datos sin verificar su integridad; datos que cambian sin dejar rastro. |
| **ZENDA** | Evaluaciones que se sobrescriben ([H-06](../Testing/hallazgos.md)); archivos subidos sin validar su contenido real; CI que debe usar `--frozen-lockfile`. |
| **Correcciones** | Registros con historial; validación por contenido y huella `SHA-256` de cada archivo; imágenes construidas desde el lockfile. |

### A09 — Fallas en el registro, alerta y monitoreo de seguridad

| | |
|---|---|
| **Qué es** | Sin registros útiles no se detecta un ataque ni se reconstruye qué pasó. |
| **ZENDA hoy** | ❌ Solo `console.error`; nada de quién hizo qué. |
| **Correcciones** | Tabla `auditoria` para acciones críticas (cambio de rol, eliminar usuario, reasignar liderazgo, evaluar); registros de error con fecha, ruta y usuario; **sin contraseñas ni tokens**; alerta ante muchos fallos de inicio de sesión. |

### A10 — Manejo inadecuado de condiciones excepcionales

| | |
|---|---|
| **Qué es** | Errores mal manejados: fallos que dejan el sistema en un estado inseguro, mensajes que revelan detalles o excepciones sin capturar. Es **nueva** en 2025. |
| **ZENDA hoy** | Cada controlador captura errores a su manera; algunos mensajes son informales. Las transacciones usan `ROLLBACK`. |
| **Correcciones** | Manejador de errores central; mensajes genéricos al usuario y detalle solo en el servidor; **fallar cerrado** (ante la duda, denegar); transacción con `ROLLBACK` y `release()` en `finally`. |

```js
// ✅ Falla cerrado y no revela detalles
} catch (error) {
  console.error('Error al evaluar la evidencia:', error.message);
  return res.status(500).json({ message: 'No fue posible guardar la evaluación. Inténtelo de nuevo.' });
}
```

---

## 3. Lista de verificación antes de desplegar

| # | Control | ✅ |
|:---:|---|:---:|
| 1 | `JWT_SECRET` largo, aleatorio y distinto del de desarrollo; el servidor falla si falta | ☐ |
| 2 | CORS limitado al dominio del frontend | ☐ |
| 3 | HTTPS activo y HTTP redirige | ☐ |
| 4 | Datos de prueba y usuarios de ejemplo **eliminados** | ☐ |
| 5 | `.env` fuera del repositorio; `gitleaks` sin hallazgos | ☐ |
| 6 | `pnpm audit --prod` sin vulnerabilidades altas ni críticas | ☐ |
| 7 | Las 30 pruebas de autorización pasan | ☐ |
| 8 | Contenedores sin `root` y puerto de la base de datos no expuesto | ☐ |
| 9 | Copias de seguridad programadas y restauración probada | ☐ |
| 10 | Registro de auditoría activo y sin datos sensibles | ☐ |

---

## 4. Principios que guían las decisiones

| Principio | En ZENDA |
|---|---|
| **Defensa en profundidad** | Varias capas: navegador, API, base de datos, contenedor. Ninguna es la única. |
| **Mínimo privilegio** | Cada rol y cada proceso con solo lo necesario. |
| **Denegar por defecto** | Lo no permitido expresamente, queda prohibido. |
| **Fallar cerrado** | Ante un error, no se concede acceso. |
| **No confiar en el cliente** | Toda validación y permiso se repite en el servidor. |
| **Menos es más** | Cada dependencia o función extra es superficie de ataque. |

---

## Documentos relacionados

- [Autenticación y JWT](autenticacion-jwt.md) · [Dependencias](dependencias-y-cadena-de-suministro.md) · [Protección de datos](proteccion-de-datos-personales.md)
- [RNF-001 Seguridad](../Requisitos/RNFs/RNF-001_seguridad.md) · [Restricciones de seguridad](../Requisitos/restricciones.md#6-restricciones-de-seguridad)
- [Pruebas no funcionales](../Testing/pruebas-no-funcionales.md) · [Hallazgos](../Testing/hallazgos.md)
