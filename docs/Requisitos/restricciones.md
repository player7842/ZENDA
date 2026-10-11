# Restricciones del Proyecto — ZENDA

<!--
  ¿Qué? Documento que define las restricciones tecnológicas, de herramientas, de diseño, de idioma,
        organizacionales y de seguridad bajo las cuales se desarrolla ZENDA.
  ¿Para qué? Establecer los límites no negociables del proyecto, para que cada decisión técnica y de
        diseño sea coherente con lo que el SENA, el instructor y el equipo acordaron.
  ¿Impacto? Incumplir una restricción compromete la calidad, la seguridad o la aceptación del proyecto.
-->

---

## Identificación del documento

| Campo | Valor |
|---|---|
| **Proyecto** | ZENDA — Sistema de gestión y seguimiento de proyectos formativos ADSO |
| **Versión del documento** | 1.0 |
| **Fecha** | 10 de octubre de 2026 |
| **Base del análisis** | Código de `ZENDA-develop` (v11), `zenda_bd.sql`, Dockerfiles entregados y observaciones del instructor |
| **Ubicación** | `docs/requisitos/restricciones.md` |

### Cómo leer este documento

Cada restricción lleva un **estado** que indica qué tan cerca está de cumplirse en el código actual:

| Estado | Significado |
|:---:|---|
| ✅ **Vigente** | Ya se cumple en la versión v11 del código. |
| 🔄 **Adoptada** | Es obligatoria, pero el código aún no la cumple. Está pendiente de implementar. |
| ❓ **Por confirmar** | Es una propuesta del análisis que el equipo debe validar. |

Cada restricción también indica su **origen**: `Instructor` (observación del instructor), `Equipo` (decisión del equipo de desarrollo), `Institucional` (norma del SENA o ley) o `Código` (convención ya presente en el proyecto).

---

## Resumen

| Categoría | Prefijo | Cantidad |
|---|:---:|:---:|
| [Tecnológicas](#1-restricciones-tecnológicas) | `RT` | 8 |
| [Herramientas y entorno](#2-restricciones-de-herramientas-y-entorno) | `RH` | 5 |
| [Diseño visual](#3-restricciones-de-diseño-visual) | `RD` | 7 |
| [Idioma](#4-restricciones-de-idioma) | `RI` | 3 |
| [Organizacionales](#5-restricciones-organizacionales) | `RO` | 7 |
| [Seguridad](#6-restricciones-de-seguridad) | `RS` | 8 |
| **Total** | | **38** |

---

## 1. Restricciones Tecnológicas

### RT-001 — Stack de backend obligatorio

| Estado | Origen |
|:---:|---|
| ✅ Vigente | Código |

El backend debe desarrollarse exclusivamente con:

- **Node.js** (versión LTS, ver [RH-002](#rh-002--versión-lts-de-nodejs-fija)) con módulos ES (`"type": "module"`).
- **Express 4** como framework web.
- **`pg`** para acceder a PostgreSQL con **SQL directo**, sin ORM.

No se permite el uso de otros frameworks web (Fastify, Nest, Koa, etc.) ni de ORMs (Sequelize, Prisma, TypeORM, etc.).

### RT-002 — Stack de frontend obligatorio

| Estado | Origen |
|:---:|---|
| ✅ Vigente | Código |

El frontend debe desarrollarse exclusivamente con:

- **React 19** como biblioteca de interfaz.
- **Vite** como bundler y servidor de desarrollo.
- **React Router 7** para el enrutamiento del lado del cliente.
- **Tailwind CSS 4** como framework de estilos.
- **Recharts** para las gráficas.

No se permite el uso de otros frameworks de interfaz (Angular, Vue, Svelte, etc.).

> **Nota:** el lenguaje del frontend es JavaScript (`.jsx`). Hoy existe un único archivo TypeScript (`Tareas.tsx`); ver el apartado [Pendientes de confirmación](#pendientes-de-confirmación).

### RT-003 — Base de datos obligatoria

| Estado | Origen |
|:---:|---|
| ✅ Vigente | Código |

La base de datos debe ser **PostgreSQL 14 o superior**. No se permiten bases de datos alternativas (MySQL, SQLite, MongoDB, etc.). El esquema oficial es `Database/zenda_bd.sql` (13 tablas y un tipo `ENUM` para los roles).

### RT-004 — Método de autenticación

| Estado | Origen |
|:---:|---|
| 🔄 Adoptada | Equipo |

La autenticación debe implementarse exclusivamente mediante **JWT (JSON Web Tokens)** con enfoque *stateless*. No se permiten sesiones de servidor, OAuth de terceros ni proveedores de identidad externos.

El objetivo de duración es un **token de acceso de 15 minutos con token de refresco** y cierre de sesión por inactividad. Hoy el token dura 24 horas.

### RT-005 — Algoritmo de hash de contraseñas

| Estado | Origen |
|:---:|---|
| ✅ Vigente | Código |

Las contraseñas deben almacenarse exclusivamente con **bcrypt** (paquete `bcryptjs`, costo 10). No se permiten otros algoritmos (MD5, SHA-256, etc.) sin aprobación explícita.

### RT-006 — Evidencias como archivo o enlace

| Estado | Origen |
|:---:|---|
| 🔄 Adoptada | Equipo |

Una evidencia puede ser un **archivo** o un **enlace**. Para los archivos se debe usar almacenamiento externo **compatible con S3** (MinIO en desarrollo y un servicio como Cloudflare R2 o AWS S3 en producción), y PostgreSQL guarda solo los **metadatos** (nombre, tipo, tamaño, hash y ruta).

No se permite guardar archivos dentro del contenedor del backend ni dentro de la base de datos. Las imágenes que superen el umbral de tamaño definido deben **comprimirse** antes de almacenarse.

> El proveedor de producción queda por definir según el despliegue (ver [Pendientes de confirmación](#pendientes-de-confirmación)).

### RT-007 — Correo electrónico limitado

| Estado | Origen |
|:---:|---|
| ✅ Vigente | Equipo |

El sistema solo envía correos para la **recuperación de contraseña**, mediante SMTP de Gmail con **contraseña de aplicación**. No se implementan notificaciones masivas ni recordatorios por correo.

### RT-008 — Contenedores con Docker

| Estado | Origen |
|:---:|---|
| 🔄 Adoptada | Instructor |

El sistema debe poder ejecutarse con **Docker**:

- Un `Dockerfile` por servicio (`backend` y `frontend`).
- Un `docker-compose.yml` que levante base de datos, backend y frontend.
- Las imágenes de Node deben basarse en una versión **LTS mínima 22**.
- El proceso del backend no debe ejecutarse como `root`.

---

## 2. Restricciones de Herramientas y Entorno

### RH-001 — Gestor de paquetes

| Estado | Origen |
|:---:|---|
| 🔄 Adoptada | Instructor |

Las dependencias del backend y del frontend deben gestionarse exclusivamente con **pnpm**. Queda **prohibido** usar `npm` o `yarn` en cualquier operación (instalar, agregar, ejecutar).

- Los archivos `pnpm-lock.yaml` deben estar versionados.
- En contenedores se usa `pnpm install --frozen-lockfile`.
- Cada `package.json` debe declarar el campo `packageManager`.

### RH-002 — Versión LTS de Node.js fija

| Estado | Origen |
|:---:|---|
| 🔄 Adoptada | Instructor |

Solo se permiten versiones **LTS** de Node.js, porque reciben mantenimiento periódico y son estables. No se permiten versiones *Current*. La versión exacta se fija en:

- `.nvmrc`
- el campo `engines` de cada `package.json`
- el argumento `NODE_VERSION` de cada `Dockerfile`

Hoy los Dockerfiles usan `node:20-alpine`, que debe actualizarse.

### RH-003 — Versiones exactas de dependencias

| Estado | Origen |
|:---:|---|
| 🔄 Adoptada | Instructor |

Los archivos `package.json` no deben contener comodines de versión (`^`, `~`, `*`, `latest`). Cada dependencia se declara con su versión exacta. Hoy existen 21 dependencias con rango `^`.

### RH-004 — Linter del frontend

| Estado | Origen |
|:---:|---|
| ✅ Vigente | Código |

El frontend se analiza con **oxlint** (`pnpm lint`). No se mezclan linters alternativos. El linter del backend queda [por confirmar](#pendientes-de-confirmación).

### RH-005 — Variables de entorno por servicio

| Estado | Origen |
|:---:|---|
| ✅ Vigente | Código |

La configuración de cada servicio se lee de variables de entorno:

| Servicio | Variables |
|---|---|
| Backend | `PORT`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `EMAIL_USER`, `EMAIL_PASS` |
| Frontend | `VITE_API_URL` |

---

## 3. Restricciones de Diseño Visual

### RD-001 — Contraste mínimo accesible

| Estado | Origen |
|:---:|---|
| 🔄 Adoptada | Instructor |

Todo texto e icono debe cumplir contraste **WCAG 2.1 nivel AA** en tema claro y en tema oscuro:

- **4.5 : 1** para texto normal.
- **3 : 1** para texto grande (desde 24 px o 19 px en negrita) y para componentes de interfaz.

Mejorar el contraste no debe eliminar iconos ni descuadrar el espaciado.

### RD-002 — Animaciones consistentes

| Estado | Origen |
|:---:|---|
| 🔄 Adoptada | Instructor |

Si un tipo de componente (por ejemplo, las tarjetas) tiene animación en una parte de una página, **todos los componentes equivalentes de esa página** deben tener la misma animación.

### RD-003 — Menú de tres puntos para acciones secundarias

| Estado | Origen |
|:---:|---|
| 🔄 Adoptada | Instructor |

Las acciones secundarias de listas y tablas (editar, eliminar, etc.) se agrupan en un **menú de tres puntos** para ahorrar espacio. Las acciones principales siguen visibles.

### RD-004 — Barra lateral colapsable

| Estado | Origen |
|:---:|---|
| 🔄 Adoptada | Instructor |

La barra lateral del dashboard debe poder **colapsarse mostrando solo los iconos**.

### RD-005 — Tema claro y oscuro

| Estado | Origen |
|:---:|---|
| ✅ Vigente | Código |

La interfaz debe ofrecer **tema claro y tema oscuro**, administrados por `ThemeContext`. Ambos temas deben cumplir [RD-001](#rd-001--contraste-mínimo-accesible).

### RD-006 — Pie de página con año vigente y enlaces legales

| Estado | Origen |
|:---:|---|
| 🔄 Adoptada | Instructor |

El pie de página debe mostrar el **año vigente calculado automáticamente** (no escrito a mano) y enlazar a las páginas de **Términos de uso**, **Política de privacidad**, **Política de cookies** y **Protección de datos**.

### RD-007 — Navegación de la página de inicio y de acceso

| Estado | Origen |
|:---:|---|
| 🔄 Adoptada | Instructor |

- Las secciones "Funcionalidad" y "Cómo funciona" de la barra de navegación del Home deben tener información clara, o retirarse.
- Las pantallas de **Iniciar sesión** y **Registrarse** deben ofrecer un botón para **volver al inicio**.

---

## 4. Restricciones de Idioma

### RI-001 — Código y base de datos en español de dominio

| Estado | Origen |
|:---:|---|
| ✅ Vigente | Código |

Los nombres del dominio se escriben en español:

- Tablas y columnas en `snake_case` (`integrantes_grupo`, `usuario_id`).
- Rutas de la API (`/api/aprendiz/proyectos`).
- Controladores y funciones del negocio (`subirEvidencia`, `evaluarEvidencia`).

Los términos técnicos estándar (`middleware`, `token`, `pool`, `router`) se mantienen en inglés. En JavaScript se usa `camelCase`.

### RI-002 — Documentación y comentarios profesionales en español

| Estado | Origen |
|:---:|---|
| 🔄 Adoptada | Instructor |

Toda la documentación (`.md`) y los comentarios del código se escriben en **español claro y profesional**. Quedan prohibidos los comentarios y los mensajes de la API con groserías o lenguaje coloquial. Hoy existen comentarios en `server.js` y mensajes de error en `userController.js` con ese tipo de lenguaje que deben corregirse.

### RI-003 — Interfaz en español

| Estado | Origen |
|:---:|---|
| ✅ Vigente | Código |

Todos los textos que ve el usuario (etiquetas, mensajes y errores) se escriben en español de Colombia.

---

## 5. Restricciones Organizacionales

### RO-001 — Proyecto formativo del SENA

| Estado | Origen |
|:---:|---|
| ✅ Vigente | Institucional |

ZENDA es un proyecto formativo del programa **Análisis y Desarrollo de Software (ADSO)**. La supervisión del coordinador se limita a las fichas del programa con código **2338**.

### RO-002 — Registro limitado a aprendices con correo institucional

| Estado | Origen |
|:---:|---|
| ✅ Vigente | Institucional |

El autorregistro es **solo para aprendices** y exige un correo del dominio `@soy.sena.edu.co`. Las cuentas de instructor, coordinador y administrador las crea un administrador.

### RO-003 — Sin metodología Scrum en el producto

| Estado | Origen |
|:---:|---|
| 🔄 Adoptada | Instructor |

El sistema **no implementa roles Scrum**. Se eliminan los sub-roles *Scrum Master*, *Product Owner* y *Developer* de la base de datos, del registro y de los permisos. Todos los aprendices de un grupo tienen los mismos permisos, con una sola figura diferenciada: el **líder de grupo**, que es quien crea el proyecto y queda fijo.

### RO-004 — Alcance excluido

| Estado | Origen |
|:---:|---|
| ✅ Vigente | Equipo |

Quedan **fuera del alcance** y no deben desarrollarse:

- Chatbot.
- Calendario de eventos.
- Anuncios.
- Recordatorios masivos (se reemplazan por **mensajes guiados** dentro de la interfaz).

### RO-005 — Flujo de ramas en Git

| Estado | Origen |
|:---:|---|
| ✅ Vigente | Instructor |

El repositorio usa:

- `main`: versión estable.
- `develop`: integración y versionamiento.
- Ramas `feat/*`, `fix/*` y `docs/*` que se fusionan en `develop` mediante *Pull Request*.

### RO-006 — Documentación en el repositorio

| Estado | Origen |
|:---:|---|
| 🔄 Adoptada | Instructor |

La documentación vive en la carpeta `docs/`, en archivos **Markdown compatibles con GitHub**, con la estructura del repositorio de referencia y las mismas secciones de cada tipo de documento. No se agregan formatos propietarios. Los diagramas se escriben en **Mermaid** dentro de los `.md`.

### RO-007 — Plazo de entrega

| Estado | Origen |
|:---:|---|
| ✅ Vigente | Institucional |

La documentación debe entregarse a más tardar el **domingo 11 de octubre de 2026 a las 11:59 p. m.**

---

## 6. Restricciones de Seguridad

### RS-001 — Secretos fuera del código y del repositorio

| Estado | Origen |
|:---:|---|
| 🔄 Adoptada | Equipo |

Toda información sensible (claves, credenciales de base de datos, configuración SMTP) debe vivir en archivos `.env` **no versionados**. Queda prohibido el uso de valores sensibles por defecto en el código.

Hoy el código tiene un secreto de respaldo para JWT (`zenda_secret_key`) y credenciales de ejemplo para el correo. El repositorio tampoco contiene `.gitignore`.

### RS-002 — Archivos `.env.example` obligatorios

| Estado | Origen |
|:---:|---|
| 🔄 Adoptada | Equipo |

Debe existir un `.env.example` actualizado, con valores de ejemplo no sensibles, en la raíz del proyecto, en `backend/` y en `frontend/`.

### RS-003 — No exponer contraseñas

| Estado | Origen |
|:---:|---|
| ✅ Vigente | Código |

Las contraseñas, hasheadas o en texto plano, nunca deben aparecer en respuestas de la API, registros del servidor ni mensajes de error.

### RS-004 — Autorización siempre en el servidor

| Estado | Origen |
|:---:|---|
| ✅ Vigente | Código |

Todo permiso se valida en el **backend** con los middlewares `auth` y `is<Rol>`. Ocultar un botón en la interfaz no cuenta como control de acceso.

### RS-005 — Consultas SQL parametrizadas

| Estado | Origen |
|:---:|---|
| ✅ Vigente | Código |

Toda consulta que incluya datos del usuario debe usar parámetros (`$1`, `$2`, ...). Queda prohibido concatenar entradas dentro del texto SQL.

### RS-006 — Registro seguro y humano

| Estado | Origen |
|:---:|---|
| 🔄 Adoptada | Instructor |

El registro y el inicio de sesión deben:

- **Bloquear el pegado** en el campo de confirmación de contraseña.
- Mostrar un **medidor de fortaleza** de 5 niveles: muy baja, baja, media, fuerte y muy segura.
- Limitar los intentos fallidos y usar un campo trampa (*honeypot*) para frenar bots.
- Verificar el correo del aprendiz antes de activar la cuenta.

> Bloquear el pegado por sí solo no detiene a los bots, que envían la petición directamente. Por eso se acompaña de las demás medidas.

### RS-007 — Aceptación legal obligatoria

| Estado | Origen |
|:---:|---|
| 🔄 Adoptada | Instructor e Institucional |

Para registrarse, el usuario debe aceptar **de forma obligatoria** (no opcional), mediante casillas separadas:

- Términos de uso.
- Política de privacidad.
- Política de cookies.
- Protección de datos personales, conforme a la **Ley 1581 de 2012** (Habeas Data).

Cada aceptación enlaza a una página con el texto legal completo, que también se enlaza desde el pie de página.

### RS-008 — Archivos subidos

| Estado | Origen |
|:---:|---|
| 🔄 Adoptada | Equipo |

Los archivos que suban los aprendices deben cumplir:

- Solo tipos permitidos (lista blanca), verificados por su **contenido real** y no por la extensión.
- Un tamaño máximo por archivo y una cuota por proyecto.
- Un nombre aleatorio en el almacenamiento (el nombre original se guarda como metadato).
- Nunca se ejecutan ni se sirven con un tipo que el navegador interprete como código.

---

## Desviaciones frente al código actual

Estas restricciones ya están decididas, pero el código de `develop` aún no las cumple:

| Restricción | Estado actual | Acción requerida |
|---|---|---|
| [RH-002](#rh-002--versión-lts-de-nodejs-fija), [RT-008](#rt-008--contenedores-con-docker) | Los Dockerfiles usan `node:20-alpine`. | Pasar a una versión LTS 22 o superior. |
| [RH-001](#rh-001--gestor-de-paquetes) | Falta el campo `packageManager`. | Declararlo en ambos `package.json`. |
| [RH-003](#rh-003--versiones-exactas-de-dependencias) | 21 dependencias con `^`. | Fijar versiones exactas. |
| [RT-008](#rt-008--contenedores-con-docker) | El Dockerfile del backend expone el puerto 3000 y el servidor usa 4000. | Exponer 4000. Falta `nginx.conf` y `docker-compose.yml`. |
| [RT-008](#rt-008--contenedores-con-docker) | Los archivos `dockerignore` no tienen el punto inicial. | Renombrarlos a `.dockerignore`. |
| [RS-001](#rs-001--secretos-fuera-del-código-y-del-repositorio) | Hay un secreto JWT por defecto y credenciales de ejemplo en `mailer.js`. | Eliminar los valores por defecto. |
| [RS-001](#rs-001--secretos-fuera-del-código-y-del-repositorio), [RS-002](#rs-002--archivos-envexample-obligatorios) | No existen `.gitignore` ni `.env.example`. | Crearlos (incluidos en la entrega de infraestructura). |
| [RT-007](#rt-007--correo-electrónico-limitado) | El enlace de recuperación apunta a `http://localhost:5173`. | Leer la URL base desde una variable de entorno. |
| [RO-003](#ro-003--sin-metodología-scrum-en-el-producto) | Existen `sub_rol_intencion` y `rol_scrum` en la base de datos y en el registro. | Eliminar las columnas y el campo del formulario. |
| [RI-002](#ri-002--documentación-y-comentarios-profesionales-en-español) | Comentarios y mensajes de error de la API con groserías (por ejemplo, en `userController.js`). | Reescribirlos con un tono profesional. |
| [RT-002](#rt-002--stack-de-frontend-obligatorio) | Existe un archivo `Tareas.tsx` en un proyecto JavaScript. | Definir el criterio (ver pendientes). |

---

## Pendientes de confirmación

| # | Tema | Propuesta |
|:---:|---|---|
| 1 | **Lenguaje del frontend** | Convertir `Tareas.tsx` a `.jsx` para unificar en JavaScript. |
| 2 | **Proveedor de almacenamiento en producción** | Depende de dónde se despliegue el sistema (VPS, Render, Railway u otro). |
| 3 | **Linter y formateador del backend** | Usar oxlint también en el backend, y Prettier en ambos. |
| 4 | **Versionamiento de la API** | Mantener `/api/...` sin versión durante el proyecto formativo. |
| 5 | **Biblioteca de iconos** | Usar exclusivamente `lucide-react`, con excepción de los logotipos propios. |
| 6 | **Versión exacta de Node.js LTS** | Verificar en nodejs.org la versión LTS vigente y fijarla en `.nvmrc`, `engines` y los Dockerfiles. |
