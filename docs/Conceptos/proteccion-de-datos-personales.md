# Protección de datos personales (Habeas Data) — ZENDA

<!--
  ¿Qué? Los conceptos de la normativa colombiana de protección de datos personales y cómo se traducen en ZENDA: autorización, textos legales y derechos de las personas.
  ¿Para qué? Que el registro obligatorio de las cuatro aceptaciones, las páginas legales y el tratamiento de los datos tengan una base clara.
  ¿Impacto? ZENDA guarda nombres, documentos y correos de aprendices y trabajo académico: tratarlos sin autorización o sin seguridad tiene consecuencias legales.
-->

---

## Identificación

| Campo | Valor |
|---|---|
| **Norma principal** | Ley 1581 de 2012 (régimen general de protección de datos personales) y su reglamentación (Decreto 1377 de 2013, hoy compilado en el Decreto 1074 de 2015) |
| **Autoridad** | Superintendencia de Industria y Comercio (SIC) |
| **Origen del requisito** | Observación del instructor: aceptación **obligatoria** de términos, privacidad, cookies y protección de datos ("es de ley") |
| **Requisitos** | [RS-007](../requisitos/restricciones.md#rs-007--aceptación-legal-obligatoria), [RN-004](../requisitos/reglas-de-negocio.md#rn-004--aceptación-legal-obligatoria), [RNF-007](../requisitos/RNFs/RNF-007_privacidad_y_cumplimiento_legal.md), [RF-039](../requisitos/RFs/RF-039_paginas_legales_y_aviso_de_cookies.md) |
| **Fecha** | Octubre 2026 |

> **Aviso importante:** este documento es **informativo y técnico**, no asesoría jurídica. Los textos legales definitivos y las decisiones marcadas como "por confirmar" deben revisarse con el área jurídica o de protección de datos del SENA antes de publicar el sistema. Las normas pueden cambiar: verifica siempre la versión vigente.

---

## 1. Conceptos básicos

| Término | Significado | En ZENDA |
|---|---|---|
| **Dato personal** | Información que identifica o puede identificar a una persona | Nombre, apellido, documento, correo, ficha |
| **Titular** | La persona a quien pertenecen los datos | El aprendiz, el instructor, el coordinador |
| **Responsable del tratamiento** | Quien decide para qué y cómo se usan los datos | Por definir: la entidad que opera ZENDA (**por confirmar con el SENA**) |
| **Encargado del tratamiento** | Quien trata los datos por cuenta del responsable | Proveedores como el correo (Gmail) o el almacenamiento en la nube |
| **Tratamiento** | Cualquier operación: recoger, guardar, usar, compartir, borrar | Todo lo que hace el sistema con los datos |
| **Autorización** | Consentimiento **previo, expreso e informado** del titular | Las cuatro casillas del registro |
| **Habeas data** | Derecho a conocer, actualizar y rectificar lo que se guarda sobre uno | Base de los derechos de la sección 4 |

### Principios del tratamiento

| Principio | Qué exige | Cómo lo cumple ZENDA |
|---|---|---|
| **Legalidad** | Tratar datos conforme a la ley | Autorización y política publicada |
| **Finalidad** | Usarlos solo para un fin legítimo e informado | Seguimiento de proyectos formativos |
| **Libertad** | Con consentimiento del titular | Casillas de aceptación en el registro |
| **Veracidad o calidad** | Datos exactos y actualizados | Permitir corregir el perfil |
| **Transparencia** | El titular puede saber qué se guarda de él | Páginas legales y canal de consulta |
| **Acceso y circulación restringida** | Solo ve los datos quien debe | Permisos por rol ([matriz](../requisitos/matriz-permisos.md)) |
| **Seguridad** | Proteger los datos | [Seguridad y OWASP](seguridad-owasp.md), bcrypt, HTTPS |
| **Confidencialidad** | Reservar los datos aunque termine la relación | Nada de datos reales en capturas, registros ni respaldos compartidos |

---

## 2. Qué datos trata ZENDA

| Dato | Para qué | ¿Sensible? | Dónde |
|---|---|:---:|---|
| Nombre y apellido | Identificar al usuario | No | `usuarios` |
| Tipo y número de documento (CC, TI, CE, PA, PPT) | Identificación institucional | No (pero requiere especial cuidado) | `usuarios` |
| Correo institucional | Acceso y recuperación | No | `usuarios` |
| Contraseña | Autenticación | No (se guarda solo como hash) | `usuarios.contrasena` |
| Ficha, grupo y rol | Organización académica | No | `fichas`, `grupos`, `integrantes_grupo` |
| Evidencias, observaciones y evaluaciones | Seguimiento del proyecto | No (pueden contener datos personales dentro de los archivos) | `evidencias`, `observaciones`, `evaluaciones` |
| Registro de acciones | Seguridad y auditoría | No | `auditoria` |
| Aceptación de textos legales | Prueba de la autorización | No | `usuarios.acepto_legales_en` |

> **Datos sensibles** (salud, origen étnico, orientación política, biométricos…): ZENDA **no los recoge ni los pide**. Un archivo subido como evidencia podría contenerlos por error: las políticas de uso deben indicarlo.

### Menores de edad

Si hay aprendices **menores de 18 años**, el tratamiento de sus datos exige condiciones especiales (interés superior del menor y, en general, autorización del representante legal). **Por confirmar con el SENA** si la población de ADSO incluye menores y cómo se gestiona.

---

## 3. Las cuatro aceptaciones del registro

El instructor pidió que sean **obligatorias, separadas y enlazadas** ([RN-004](../requisitos/reglas-de-negocio.md#rn-004--aceptación-legal-obligatoria)).

| Casilla | Qué contiene la página que enlaza | Por qué existe |
|---|---|---|
| **Términos de uso** | Qué puede y qué no puede hacer el usuario; responsabilidades; reglas de las evidencias; suspensión de cuentas | Reglas del servicio |
| **Política de privacidad** | Qué datos se recogen, para qué, con quién se comparten, cuánto tiempo se guardan | Transparencia |
| **Política de cookies** | Qué almacenamiento usa el navegador y para qué | Informar sobre cookies y almacenamiento local |
| **Protección de datos** | Autorización para el tratamiento de datos personales, derechos del titular y cómo ejercerlos | Autorización previa, expresa e informada |

### Contenido que debe tener la política de tratamiento

Resumen de lo que la reglamentación pide que incluya (**revisar con el área jurídica**):

| # | Contenido |
|:---:|---|
| 1 | Identificación del **responsable** (nombre, domicilio, correo y teléfono) |
| 2 | **Tratamiento y finalidad** de cada tipo de dato |
| 3 | **Derechos** del titular |
| 4 | Área o persona encargada de **consultas y reclamos** |
| 5 | **Procedimiento** para ejercer los derechos |
| 6 | **Fecha de entrada en vigencia** y período de conservación de las bases de datos |
| 7 | Si hay **transmisión o transferencia internacional** de datos |

### Esquema de contenido por página

| Página | Secciones sugeridas |
|---|---|
| **Términos de uso** | Objeto y aceptación · Quién puede registrarse (correo `@soy.sena.edu.co`) · Uso permitido y prohibido · Evidencias y propiedad del trabajo · Suspensión o eliminación de cuentas · Limitación de responsabilidad · Cambios y vigencia · Contacto |
| **Política de privacidad** | Responsable · Datos que se recogen · Finalidades · Con quién se comparten (instructores, coordinación, proveedores) · Seguridad · Conservación · Derechos · Contacto |
| **Política de cookies** | Qué es una cookie y el almacenamiento local · Cuáles usa ZENDA (token de sesión, preferencia de tema, aceptación del aviso) · Para qué · Cómo gestionarlas · Vigencia |
| **Protección de datos** | Autorización expresa · Derechos del titular · Canal y plazos de atención · Datos de menores · Cambios de la política |

---

## 4. Derechos del titular

| Derecho | Qué permite | Cómo se atiende en ZENDA | Estado |
|---|---|---|:---:|
| **Conocer** | Saber qué datos se guardan | Consulta al responsable; vista de su perfil | ⚠️ |
| **Actualizar y rectificar** | Corregir datos inexactos | El administrador edita el usuario; **pendiente** que el usuario edite su perfil | ⚠️ |
| **Solicitar prueba de la autorización** | Ver cuándo y qué aceptó | `acepto_legales_en` ([esquema](../referencia-tecnica/esquema-bd.md)) | ✅ v12 |
| **Ser informado del uso** | Conocer para qué se usan | Política de privacidad | ✅ v12 |
| **Revocar la autorización y pedir supresión** | Retirar el consentimiento y que se borren los datos | Desactivar la cuenta; ver "supresión" abajo | ⚠️ |
| **Presentar quejas ante la SIC** | Acudir a la autoridad | Se informa en la política | ✅ v12 |

### Plazos de atención (referencia de la Ley 1581)

| Solicitud | Plazo | Prórroga |
|---|:---:|:---:|
| **Consulta** | 10 días hábiles | 5 días hábiles más |
| **Reclamo** (corrección, supresión, revocatoria) | 15 días hábiles | 8 días hábiles más |

### Supresión frente a historial académico

Un derecho de supresión puede chocar con la necesidad de conservar **evaluaciones y evidencias** como registro académico y con el [historial inmutable](../requisitos/RNFs/RNF-009_integridad_de_datos.md). Opciones:

| Opción | Efecto | Valoración |
|---|---|---|
| **Desactivar** la cuenta | Deja de poder entrar; los datos se conservan | Es lo que existe hoy |
| **Anonimizar** | Reemplaza nombre, documento y correo por valores genéricos y conserva los registros académicos | **Propuesta**; por confirmar con el SENA |
| **Eliminar** todo | Borra datos y trabajo | Solo cuando no haya obligación de conservarlos; hoy puede fallar por las claves foráneas ([RF-007](../requisitos/RFs/RF-007_desactivacion_y_eliminacion_de_usuarios.md)) |

---

## 5. Qué debe hacer el sistema

| # | Función | Estado | Requisito |
|:---:|---|:---:|---|
| 1 | Pedir las 4 aceptaciones **obligatorias** antes de crear la cuenta | 🔄 v12 | [RF-001](../requisitos/RFs/RF-001_registro_de_aprendiz.md) |
| 2 | Guardar **cuándo** se aceptó | 🔄 v12 | `usuarios.acepto_legales_en` |
| 3 | Publicar las 4 páginas y enlazarlas desde el pie de página y el registro | 🔄 v12 | [RF-039](../requisitos/RFs/RF-039_paginas_legales_y_aviso_de_cookies.md) |
| 4 | Mostrar el aviso de cookies | ✅ | `CookieBanner` |
| 5 | Pedir la aceptación a los **usuarios existentes** en su próximo inicio de sesión | 🆕 por definir | [Notas de migración](../referencia-tecnica/esquema-bd.md#6-notas-de-migración) |
| 6 | Guardar la **versión** del texto aceptado | 🆕 propuesta | Columna `version_legales` (por confirmar) |
| 7 | Controlar el acceso por rol y pertenencia | ✅ parcial | [Matriz de permisos](../requisitos/matriz-permisos.md) |
| 8 | Proteger los datos: hash, HTTPS, auditoría | ⚠️ | [OWASP](seguridad-owasp.md) |
| 9 | Canal para consultas y reclamos (correo o formulario) | 🆕 por definir | Política de privacidad |
| 10 | Permitir al usuario ver y corregir su perfil | 🆕 propuesta | Nuevo requisito |
| 11 | Anonimizar o suprimir a solicitud | 🆕 propuesta | Ver sección 4 |

---

## 6. Cookies y almacenamiento local

| Elemento | Para qué | ¿Necesario? |
|---|---|:---:|
| Token de sesión (`localStorage`) | Mantener la sesión | Sí |
| Preferencia de tema (claro u oscuro) | Recordar la elección | Funcional |
| Aceptación del aviso de cookies | Recordar que se aceptó | Funcional |

| Tema | Criterio |
|---|---|
| **Decisión del proyecto** | La aceptación de la política de cookies es **obligatoria** en el registro, como pidió el instructor |
| **Normativa colombiana** | No hay una ley específica de cookies; se aplican los principios de la Ley 1581 cuando las cookies tratan datos personales |
| **Buena práctica** | Si más adelante se agregan cookies de analítica o de terceros no esenciales, deben ser **opcionales** y estar desactivadas hasta que la persona acepte |

---

## 7. Transmisión y transferencia a terceros

ZENDA usa servicios externos que pueden **procesar datos fuera de Colombia**:

| Servicio | Datos que recibe | Observación |
|---|---|---|
| **Gmail (SMTP)** | Correo del usuario y el enlace de recuperación | La política debe mencionarlo |
| **Almacenamiento en la nube** (S3, R2) | Archivos de evidencias | Elegir proveedor y región con las garantías adecuadas; informarlo |
| **Alojamiento del servidor** | Todo el sistema | Idem |

La ley distingue **transmisión** (el proveedor trata datos por cuenta del responsable) de **transferencia** (se entregan a otro responsable), y exige condiciones para enviar datos a países sin nivel adecuado de protección. **Por confirmar con el SENA** el proveedor y su marco contractual.

---

## 8. Decisiones por confirmar

| # | Tema | Propuesta | Quién decide |
|:---:|---|---|---|
| 1 | **Responsable del tratamiento** y datos de contacto | La entidad que opera ZENDA | SENA / equipo |
| 2 | ¿Hay **menores de edad** entre los aprendices? | Definir el procedimiento de autorización | SENA |
| 3 | **Tiempo de conservación** de los datos | Mientras dure la formación más el período académico exigido | SENA |
| 4 | **Supresión**: desactivar, anonimizar o eliminar | Anonimizar manteniendo el registro académico | SENA / equipo |
| 5 | **Usuarios existentes**: cómo recoger la aceptación nueva | Solicitarla al iniciar sesión | Equipo |
| 6 | **Versión del texto** aceptado | Guardar `version_legales` | Equipo |
| 7 | **Canal de reclamos** | Correo institucional dedicado | SENA |
| 8 | **Registro Nacional de Bases de Datos** | Verificar si aplica al responsable | SENA (jurídico) |
| 9 | **Proveedores en el exterior** | Elegir con garantías y documentarlo | Equipo / SENA |

---

## 9. Lista de verificación antes de publicar

| # | Control | ✅ |
|:---:|---|:---:|
| 1 | Las cuatro páginas legales existen, están completas y revisadas por el área jurídica | ☐ |
| 2 | El registro exige las cuatro aceptaciones y guarda la fecha | ☐ |
| 3 | El pie de página enlaza a las cuatro páginas | ☐ |
| 4 | Está definido el responsable y el canal de consultas y reclamos | ☐ |
| 5 | Los usuarios existentes aceptan los textos al volver a entrar | ☐ |
| 6 | Los datos de prueba y los respaldos con datos reales no están en el repositorio | ☐ |
| 7 | HTTPS, hash de contraseñas y control de acceso verificados | ☐ |
| 8 | Se sabe qué proveedores externos reciben datos y está informado | ☐ |

---

## Documentos relacionados

- [Seguridad y OWASP](seguridad-owasp.md) · [Autenticación y JWT](autenticacion-jwt.md)
- [RNF-007 Privacidad y cumplimiento legal](../requisitos/RNFs/RNF-007_privacidad_y_cumplimiento_legal.md) · [Restricciones de seguridad](../requisitos/restricciones.md#6-restricciones-de-seguridad)
- [Esquema de base de datos](../referencia-tecnica/esquema-bd.md) · [Páginas legales — RF-039](../requisitos/RFs/RF-039_paginas_legales_y_aviso_de_cookies.md)
