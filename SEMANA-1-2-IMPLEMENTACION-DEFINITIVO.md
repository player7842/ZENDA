# ZENDA — Implementación definitiva de las Semanas 1 y 2

> **Documento de referencia oficial** para el estado real del repositorio al cerrar la Semana 2.
> **Rama:** `develop` · **Fecha de cierre:** 23-oct-2026 · **Auditoría aplicada:** `ZENDA_auditoria_semanas_1_y_2.md`
> **Estado:** cambios de la auditoría commiteados localmente. **No se hizo `push`.**
> **Alcance:** este documento no autoriza ni describe funcionalidad de las Semanas 3–6. Los pendientes se indican explícitamente.

---

## Índice

1. [Resumen ejecutivo](#1-resumen-ejecutivo)
2. [Decisiones de alcance y reglas](#2-decisiones-de-alcance-y-reglas)
3. [Correcciones críticas C-01 a C-07](#3-correcciones-críticas-c-01-a-c-07)
4. [Historias de usuario de la Semana 2](#4-historias-de-usuario-de-la-semana-2)
5. [Base de datos y migración](#5-base-de-datos-y-migración)
6. [Backend](#6-backend)
7. [Frontend](#7-frontend)
8. [Seguridad](#8-seguridad)
9. [Infraestructura y despliegue](#9-infraestructura-y-despliegue)
10. [Pruebas y evidencias de ejecución](#10-pruebas-y-evidencias-de-ejecución)
11. [Limpieza documental y de calidad](#11-limpieza-documental-y-de-calidad)
12. [Fuera de alcance y pendientes](#12-fuera-de-alcance-y-pendientes)
13. [Riesgos y limitaciones](#13-riesgos-y-limitaciones)
14. [Operación local](#14-operación-local)
15. [Commits de esta entrega](#15-commits-de-esta-entrega)
16. [Checklist de aceptación](#16-checklist-de-aceptación)

---

## 1. Resumen ejecutivo

La Semana 2 queda implementada sobre una regla central: **no hay sub-roles Scrum**. El liderazgo se expresa con `grupos.lider_id`; cualquier integrante activo del grupo puede crear carpetas y subir evidencias. El grupo **General** de cada ficha es el mecanismo de inscripción y no cuenta como proyecto activo.

Se aplicaron los siete hallazgos críticos de la auditoría, se completaron las HU de la Semana 2 que estaban incompletas, se agregaron pruebas automatizadas y se corrigieron los problemas de documentación, dependencias e infraestructura. El resultado verificado es:

| Verificación | Resultado |
|---|---|
| Pruebas unitarias | **9/9 aprobadas** |
| Pruebas de integración | **6/6 aprobadas** contra PostgreSQL 18.6 |
| Migración `002_semana2.sql` | Aplicada **dos veces** sin errores; también sobre una copia del esquema previo (`HEAD`) |
| Lint backend | Pasa |
| Lint frontend | Pasa; solo advertencias preexistentes en archivos no tocados |
| Build frontend | Pasa |
| `docker compose config` | Válido |
| Build de imagen Docker | **No ejecutado**: el daemon de Docker no está disponible en este equipo |

**Aclaración importante:** `HU-020` no se declara completa. En la Semana 2 solo se admiten **enlaces `http/https`** como evidencia. La carga de archivos reales se trasladó a la **Semana 4**.

---

## 2. Decisiones de alcance y reglas

### 2.1 Grupos y roles

- No existen sub-roles Scrum (`rol_scrum`, `sub_rol_intencion` u equivalentes). Fueron eliminados del esquema y de la API.
- El líder es el aprendiz registrado en `grupos.lider_id`.
- Cualquier integrante con `estado_integrante = 'Activo'` puede crear carpetas y subir evidencias; el autor queda registrado.
- Un aprendiz solo puede pertenecer a **un proyecto activo** a la vez. El grupo General no cuenta para esta regla.
- Un aprendiz solo puede unirse a grupos de **su misma ficha**.
- El nombre `General` está reservado y la API rechaza crear proyectos con ese nombre.

### 2.2 Grupo General

- Se identifica por la columna booleana `grupos.es_general`, no por el nombre.
- Existe un **índice único parcial** que garantiza un solo General por ficha.
- Su código es `GEN-<numero_ficha>`.
- Se crea de forma atómica con `INSERT ... ON CONFLICT ... DO NOTHING`; dos registros simultáneos no generan duplicados.
- Su cupo es **50** y no se edita desde el flujo de proyecto.

### 2.3 Cupo

- Rango válido: **1 a 50** integrantes.
- Valor por defecto al crear un proyecto: **6**.
- El líder puede modificarlo con `PUT /api/aprendiz/proyectos/mio/cupo`.
- No se permite reducirlo por debajo del número actual de integrantes activos.
- El líder cuenta como integrante para el cálculo del cupo.

### 2.4 Evaluaciones y cascada

- Cada evaluación es un **`INSERT`**; nunca se sobrescribe la anterior.
- La evaluación vigente es la de mayor `evaluacion_id` para cada evidencia.
- Las fechas usan `clock_timestamp()` para evitar empates dentro de una misma transacción.
- La cascada es: evidencia → carpeta → fase → progreso del proyecto.
- Las funciones SQL `zenda_recalcular_carpeta` y `zenda_recalcular_fase` son la única implementación de persistencia de estados.

### 2.5 Fechas y sesión

- `fecha_inicio` y `fecha_fin_estimada` se validan con formato `YYYY-MM-DD` y fecha real; se rechazan fechas normalizadas por JavaScript como `2026-02-31`.
- La fecha fin debe ser **estrictamente posterior** a la fecha inicio.
- La sesión actual dura **24 h** (`JWT_SESSION_EXPIRES=24h`). La reducción a 15 minutos con refresh rotativo pertenece a **HU-004**, fuera de las Semanas 1–2.
- El token de recuperación dura **15 minutos**, tiene `purpose: 'reset'` y no abre sesión.

### 2.6 Migraciones y dependencias

- La base oficial se crea desde `Database/zenda_bd.sql`.
- Las bases existentes se actualizan con migraciones numeradas en `Database/migrations/`; la de Semana 2 es `002_semana2.sql`.
- `pnpm` es el único gestor de paquetes.
- Las versiones de dependencias son exactas y ambos paquetes declaran `packageManager: pnpm@11.24.0`.
- El despliegue usa el contexto raíz del repositorio para incluir `Database/` en la imagen.

---

## 3. Correcciones críticas C-01 a C-07

| ID | Hallazgo | Solución aplicada | Archivos principales |
|---|---|---|---|
| **C-01** | Token de reset y token de sesión intercambiables | Los tokens de sesión llevan `purpose: 'session'` y `tv`; el reset usa `purpose: 'reset'`. El token de reset se guarda como hash SHA-256, es de un solo uso, se marca `usado_en` y el cambio de contraseña incrementa `token_version`. El middleware valida contra la base que la cuenta esté activa y que `tv` coincida. | `authController.js`, `middleware/auth.js`, `002_semana2.sql` |
| **C-02** | El plan afirmaba seguridad y salud inexistentes | Se agregaron `helmet`, `express-rate-limit` (opción `limit`), `trust proxy`, `GET /health` y `GET /api/health`. | `app.js`, `server.js`, documentación |
| **C-03** | Casi no había pruebas | Se agregaron 9 pruebas unitarias y 6 de integración con Vitest + Supertest. Las de integración se omiten si no hay PostgreSQL, y en CI se ejecutan con la base cargada. | `backend/tests/`, `package.json` |
| **C-04** | Migración frágil sobre una base anterior | `002_semana2.sql` quedó reordenada, idempotente y con normalización de datos antes de agregar `CHECK`. Se verificó dos veces sobre el esquema actual y sobre una copia del esquema previo. | `Database/migrations/002_semana2.sql` |
| **C-05** | `General` se identificaba por un nombre editable | Se agregó `grupos.es_general`, un índice único parcial por ficha y el helper `services/grupos.js`. Todas las consultas usan `es_general`; la API bloquea el nombre “General” en proyectos. | `grupos.js`, `authController.js`, `proyectoController.js`, esquema |
| **C-06** | Condiciones de carrera en cupo, evaluación, aprobación y General | Bloqueos `FOR UPDATE` de usuario, carpeta y fase; cupo recalculado dentro de la transacción; evaluaciones siempre `INSERT`; General con `ON CONFLICT`; aprobación en bloque con `INSERT ... SELECT`; timestamps con `clock_timestamp()`. | `proyectoController.js`, `instructorController.js`, `services/cascada.js` |
| **C-07** | XSS almacenado mediante `ubicacion` | Backend y frontend solo aceptan y renderizan URLs `http://` o `https://`, con máximo de 500 caracteres. Esquemas `javascript:`, `data:` y `file:` se muestran como texto plano. | `proyectoController.js`, `utils/urlSegura.js`, `Fases.jsx`, `Proyectos.jsx` |

### 3.1 Detalle de C-01

- `firmarSesion()` agrega `purpose: 'session'` y `tv: token_version`.
- `auth` rechaza cualquier token sin `purpose === 'session'` o sin `usuario_id`.
- `forgotPassword` responde siempre igual exista o no el correo, y solo conserva el enlace más reciente.
- `resetPassword` verifica `purpose === 'reset'`, busca el hash con `FOR UPDATE`, exige `usado_en IS NULL` y `expira_en > now()`, marca el token como usado y ejecuta `token_version = token_version + 1`.
- Un JWT de sesión no sirve para resetear contraseña; un JWT de reset no sirve para autenticar rutas.

### 3.2 Detalle de C-06

- `crearProyecto` y `unirseAProyecto` bloquean primero la fila del usuario; así se serializa la pertenencia a un solo proyecto.
- `subirEvidencia`, `evaluarEvidencia` y `aprobarCarpeta` bloquean la carpeta antes de modificarla.
- La aprobación en bloque verifica que todas las evidencias sigan sin evaluación vigente y las aprueba con un solo `INSERT ... SELECT`, dentro de la misma transacción.
- El cupo se valida contra el total real de integrantes activos antes de actualizarlo.

### 3.3 Detalle de C-07

- Función backend `esUrlSegura()`: usa `new URL()` y acepta solo `http:`/`https:`.
- Función frontend `esUrlSegura()`: misma regla antes de crear un `<a href>`.
- Los enlaces inseguros se muestran como texto, no como enlaces clicables.
- Las evidencias aceptan únicamente ese tipo de enlace en Semana 2.

---

## 4. Historias de usuario de la Semana 2

| HU | Estado | Implementación verificable |
|---|---|---|
| **HU-001** | Completa | Registro con cuatro aceptaciones legales, tipo de documento `CC/TI/CE/PA/PPT` y vinculación automática al General de la ficha. |
| **HU-011** | Completa | La reasignación de fichas de un instructor conserva el historial: cierra la asignación anterior con `fecha_fin` y estado `Inactivo`, y deja una sola asignación vigente. |
| **HU-014** | Completa | Creación de proyecto con nombre, descripción, problema, objetivo, alcance, tecnologías, cupo y fechas; genera 5 fases, código `PRY-XXXXXXXXXX` y deja al creador como líder en `grupos.lider_id`. No se crean sub-roles. |
| **HU-015** | Completa | Unión por código, misma ficha, cupo y bloqueo de doble proyecto; RN-007 serializado. |
| **HU-020** | **Parcial y trasladada** | En Semana 2 solo se admiten enlaces `http/https` de máximo 500 caracteres. Archivos reales, almacenamiento y descarga quedan para **Semana 4**. |
| **HU-023** | Completa | Historial de evaluaciones; la vigente es la de mayor `evaluacion_id`; se muestra el resultado vigente y la fecha. |
| **HU-024** | Completa | Aprobación en bloque de todas las evidencias pendientes de una carpeta, con confirmación en la UI y `INSERT ... SELECT` en backend. |
| **HU-025** | Completa | Progreso por evidencias aprobadas sobre el total, con estados de carpeta y fase; se muestra en la lista de chequeo y en el resumen del aprendiz. |
| **HU-026** | Completa | Observaciones con `evidencia_id` opcional, validadas contra el proyecto y visibles para aprendiz e instructor. |

> Las HU restantes no forman parte de la Semana 2 y no se declaran implementadas aquí.

---

## 5. Base de datos y migración

### 5.1 Esquema oficial

`Database/zenda_bd.sql` es la base completa y actualizada. Incluye, entre otros:

- `usuarios.token_version`, columnas de aceptación legal, tipo y número de documento.
- `grupos.es_general`, `grupos.cupo_maximo` y el índice único parcial del General.
- `carpetas.estado_carpeta` y estados de fase.
- Historial de `instructor_ficha` con asignación vigente única por índice parcial.
- `observaciones.evidencia_id`.
- `recuperacion_contrasena` con `token_hash`, `expira_en` y `usado_en`.
- Funciones `zenda_recalcular_carpeta` y `zenda_recalcular_fase`.

### 5.2 Migración `002_semana2.sql`

La migración está diseñada para ejecutarse sobre una base de Semana 2 ya existente sin fallar. Ordena las operaciones para que los datos se normalicen antes de aplicar restricciones y usa `IF NOT EXISTS`/bloques condicionales donde corresponde.

Contenido relevante:

1. Elimina restos de sub-roles si existieran.
2. Agrega `token_version` y aceptaciones legales.
3. Agrega `es_general`, `cupo_maximo` y estados.
4. Normaliza datos antes de agregar `CHECK`.
5. Crea el índice único parcial del General.
6. Crea o reemplaza las funciones de cascada.
7. Deja la base lista para las consultas de la API.

### 5.3 Evidencia de la migración

```text
Base zenda_audit_test:
  - Database/zenda_bd.sql cargado sin errores.
  - 002_semana2.sql aplicado dos veces: OK.
  - node backend/scripts/migrar.js: OK.

Base zenda_v11_test (esquema previo de HEAD):
  - Esquema anterior cargado.
  - 002_semana2.sql aplicado dos veces: OK.
  - Verificación: exactamente 1 grupo General por ficha.
```

---

## 6. Backend

### 6.1 Archivos principales

| Archivo | Responsabilidad |
|---|---|
| `src/app.js` | Helmet, CORS, rate limit, salud, rutas y manejo de errores. |
| `src/config/env.js` | Carga de `.env`, validación de `JWT_SECRET`, sesión de 24 h y programa del coordinador. |
| `src/config/db.js` | Pool PostgreSQL, soporte de `DATABASE_URL` y conexión local. |
| `src/middleware/auth.js` | Verificación de JWT de sesión, cuenta activa y `token_version`. |
| `src/controllers/adminController/authController.js` | Registro, login, recuperación y reset con tokens de un solo uso. |
| `src/controllers/aprendizController/proyectoController.js` | Creación, unión, cupo, ficha, carpetas, evidencias, observaciones y resumen. |
| `src/controllers/instructorController/instructorController.js` | Fichas, grupos, listas de chequeo, evaluación, aprobación en bloque y observaciones. |
| `src/services/grupos.js` | Helper único para obtener o crear el General. |
| `src/services/cascada.js` | Bloqueos y recálculo de carpeta/fase con funciones SQL. |
| `src/domain/reglas.js` | Cupo, unión, resultado, estados y progreso. |
| `scripts/migrar.js` | Migración para Render; lee `DATABASE_URL` y ejecuta el SQL. |
| `tests/integracion.test.js` | 6 escenarios HTTP con Supertest y PostgreSQL real. |

### 6.2 Cupo y pertenencia

- `validarCupo()` exige obligatoriedad, entero y rango 1–50.
- `crearProyecto` usa 6 si no se envía cupo; nunca recurre al alias `cupo_integrantes`.
- `actualizarCupoProyecto` verifica que quien llama sea el líder del proyecto activo.
- La actualización no baja del total de integrantes activos.
- `unirseAProyecto` verifica ficha, cupo, estado del grupo y bloqueo del usuario.

### 6.3 Evaluaciones y aprobación

- `evaluarEvidencia` valida que el instructor sea dueño de la fase y que la evidencia pertenezca a una carpeta de esa fase.
- Cada evaluación se inserta; no hay `UPDATE` de la evaluación anterior.
- La consulta vigente usa `LATERAL ... ORDER BY evaluacion_id DESC LIMIT 1`.
- `aprobarCarpeta` bloquea la carpeta, comprueba que no haya evaluación vigente y aprueba todas las evidencias en una sola sentencia.
- Después de evaluar o aprobar se recalcula carpeta y fase, y se responde con el estado actualizado.

### 6.4 Observaciones

- `crearObservacion` acepta `evidencia_id` opcional.
- Si se envía, valida que la evidencia pertenezca al proyecto del instructor.
- Las consultas devuelven nombre de evidencia y autor para mostrarlos en la UI.

### 6.5 Registro

- Correo institucional, contraseña de 8 a 72 caracteres, nombre, apellido, tipo de documento y número.
- Cuatro aceptaciones obligatorias: términos, privacidad, cookies y tratamiento de datos.
- La fecha de aceptación se registra con `now()`.
- El aprendiz queda vinculado al General de su ficha en la misma transacción.
- Los errores de correo o documento duplicado devuelven un mensaje claro sin filtrar detalles internos.

---

## 7. Frontend

| Pantalla | Cambios de la Semana 2 |
|---|---|
| `Register.jsx` | Tipo de documento, cuatro aceptaciones legales, fuerza de contraseña, validación de documento y contraseña, texto legal corregido. |
| `MiProyecto.jsx` | Integrantes, cupo máximo, edición del cupo por el líder, sincronización tras recargar y estado de guardado. |
| `Fases.jsx` | Progreso, historial de evidencias, estados de carpeta, enlaces `http/https` seguros y formulario de enlace. |
| `Proyectos.jsx` | Lista de chequeo, evaluación, aprobación en bloque con confirmación, observaciones y enlaces seguros. |
| `Observaciones.jsx` | Muestra la evidencia asociada y el autor de la observación. |
| `aprendiz.jsx` | Envía `esLider`, refresca el proyecto y usa el nuevo endpoint de cupo. |
| `api.js` | Funciones de cupo, aprobación en bloque y observaciones con `evidencia_id`. |
| `utils/urlSegura.js` | Validación compartida de URLs antes de renderizar un enlace. |

La UI no crea ni muestra sub-roles Scrum. La columna de integrantes se rotula **“Rol en el grupo”** y se limita a líder/integrante.

---

## 8. Seguridad

- **Contraseñas:** bcrypt con costo 10, mínimo 8 y máximo 72 caracteres.
- **Sesión:** JWT firmado con secreto obligatorio de al menos 32 caracteres; 24 h en esta etapa.
- **Reset:** token de 15 min, hash SHA-256 en base, un solo uso, invalidación de sesiones previas por `token_version`.
- **Cabeceras:** Helmet.
- **Fuerza bruta:** rate limit general de 300 solicitudes cada 15 minutos y límite específico en autenticación.
- **CORS:** orígenes explícitos por `FRONTEND_URL`, sin comodín.
- **SQL:** consultas parametrizadas; no se concatenan datos del usuario.
- **XSS:** URLs restringidas a `http/https` y escape normal de React.
- **Autorización:** cada endpoint valida rol, pertenencia a ficha, pertenencia al grupo o propiedad de la fase/proyecto.
- **Secretos:** no se versionan `.env` reales; `backend/.env.example` y `.env.example` solo contienen valores de ejemplo.

---

## 9. Infraestructura y despliegue

### 9.1 Docker

- `backend/Dockerfile` usa Node 22 Alpine, instala con pnpm, ejecuta como `USER node` y declara `HEALTHCHECK`.
- El contexto de build es la **raíz del repositorio**, para que `Database/` esté disponible.
- `frontend/Dockerfile` compila con pnpm y sirve la SPA con Nginx.
- `docker-compose.yml` levanta PostgreSQL, ejecuta un servicio `migrate` y solo después inicia el backend.
- `migrate` aplica `Database/migrations/002_semana2.sql` dentro del contenedor.
- El backend depende de que la migración termine correctamente.

### 9.2 Render

- `render.yaml` declara el servicio con contexto raíz.
- `preDeployCommand: node scripts/migrar.js` aplica la migración antes de poner la nueva versión en línea.
- El script usa `DATABASE_URL` y falla con código distinto de cero si la migración no se aplica.

### 9.3 CI

`.github/workflows/ci.yml`:

1. Instala pnpm 11.24.0.
2. Instala dependencias con lockfile congelado.
3. Levanta PostgreSQL como servicio.
4. Carga `Database/zenda_bd.sql`.
5. Aplica `002_semana2.sql` dos veces para comprobar idempotencia.
6. Ejecuta lint backend y frontend.
7. Ejecuta las pruebas.
8. Compila el frontend.

### 9.4 Estado de la verificación

| Elemento | Estado |
|---|---|
| `docker compose config` | Válido |
| Build de imagen | No ejecutado (daemon no disponible) |
| Compose en ejecución | No ejecutado (daemon no disponible) |
| Migración con `node scripts/migrar.js` | Ejecutada correctamente contra PostgreSQL local |
| CI | Configurado; no se ejecutó desde este equipo porque no se hizo push |

---

## 10. Pruebas y evidencias de ejecución

### 10.1 Comandos ejecutados

```bash
# Backend
cd backend
pnpm lint
pnpm test

# Frontend
cd frontend
pnpm lint
pnpm build

# Base de datos local
psql -h localhost -U postgres -d zenda_audit_test -f Database/zenda_bd.sql
psql -h localhost -U postgres -d zenda_audit_test -f Database/migrations/002_semana2.sql
psql -h localhost -U postgres -d zenda_audit_test -f Database/migrations/002_semana2.sql

# Script de Render
cd backend
node scripts/migrar.js

# Configuración de Compose
docker compose config --quiet
```

### 10.2 Resultados

| Prueba | Resultado |
|---|---|
| `tests/reglas.test.js` | 9 aprobadas |
| `tests/integracion.test.js` | 6 aprobadas |
| Total | **15/15** |
| Migración dos veces | Sin errores |
| General por ficha tras migrar | Exactamente 1 |
| Lint backend | Sin errores |
| Lint frontend | Sin errores; advertencias preexistentes |
| Build frontend | Correcto |

### 10.3 Cobertura de los 6 escenarios de integración

1. HU-001: registro con correo institucional, documento y cuatro aceptaciones.
2. HU-014/HU-015: cupo, unión por código y validación de la ficha del aprendiz.
3. HU-023/HU-024/HU-025: cascada, aprobación en bloque, historial y progreso.
4. HU-026: observación asociada a una evidencia del proyecto.
5. HU-011: reasignación de fichas conservando el historial del instructor.
6. C-01: el token de sesión no sirve para reset y el token de reset es de un solo uso.

> Las pruebas de integración se omiten automáticamente si no hay PostgreSQL o si el esquema no está cargado. En CI se ejecutan siempre porque el workflow prepara la base.

---

## 11. Limpieza documental y de calidad

### 11.1 Hallazgos documentales D-01 a D-10

| ID | Estado | Acción |
|---|---|---|
| **D-01** | Corregido | Todas las referencias a `001_v12.sql` fueron reemplazadas por `Database/migrations/002_semana2.sql`. |
| **D-02** | Corregido | Se documentó la convención de migraciones numeradas (`001_`, `002_`, ...). |
| **D-03** | Corregido | `env.js` apunta a `backend/.env.example`; se corrigieron las guías. |
| **D-04** | Corregido | La documentación distingue sesión de 24 h y reset de 15 min; HU-004 queda para Semanas 3–6. |
| **D-05** | Corregido | Versiones exactas y `packageManager: pnpm@11.24.0` en backend y frontend. |
| **D-06** | Corregido | Eliminados `docs/estados (1).md` y `docs/Conceptos/ee.txt`. |
| **D-07** | Corregido | Se agregó `.gitattributes`; no se renormalizaron masivamente los archivos existentes para no generar un diff artificial. |
| **D-08** | Documentado, no corregible retroactivamente | La distribución histórica de commits no se puede cambiar sin reescribir la historia. Se documenta como deuda de proceso y se aplica revisión por bloques en esta entrega. |
| **D-09** | Corregido en el flujo | El trabajo de esta auditoría quedó local; **no se hizo `push`**. |
| **D-10** | Corregido en el repositorio | No se versionan `.env` reales. El equipo debe rotar cualquier credencial que haya viajado en un ZIP. |

### 11.2 Hallazgos de calidad Q-01 a Q-11

| ID | Estado | Acción |
|---|---|---|
| **Q-01** | Corregido | Los `catch` registran el error con contexto antes de responder 500. |
| **Q-02** | Corregido | La cascada se centralizó en funciones SQL y en `services/cascada.js`. |
| **Q-03** | Corregido | El General se obtiene con un único helper. |
| **Q-04** | Corregido | Se eliminó el N+1 de carpetas/evidencias con una consulta agregada. |
| **Q-05** | Corregido | La aprobación en bloque usa `INSERT ... SELECT`. |
| **Q-06** | Corregido | La respuesta informa solo las evidencias realmente aprobadas. |
| **Q-07** | Corregido | Las evidencias se leen dentro de la transacción y con la carpeta bloqueada. |
| **Q-08** | Corregido | Fechas reales, orden estricto y longitudes máximas validadas. |
| **Q-09** | Corregido | El código de invitación usa `crypto.randomBytes`. |
| **Q-10** | Corregido | El programa del coordinador se configura con `CODIGO_PROGRAMA_COORDINADOR`. |
| **Q-11** | Corregido | `getMiProyecto` usa `ORDER BY` explícito y el General se identifica por `es_general`. |

### 11.3 Hallazgos de v11

| ID | Estado |
|---|---|
| H-01 a H-07 | Corregidos |
| **H-08** | Corregido: `observaciones.evidencia_id` validado y visible |
| H-09 a H-11 | Corregidos |
| **H-12** | Dockerfiles corregidos; build pendiente por falta de daemon |
| **H-13** | **Abierto**: token en `localStorage`; se resolverá con HU-004 (Semanas 3–6) |
| H-14 | Corregido |
| **H-15** | Corregido con `.gitattributes`, sin renormalización masiva |
| **H-16** | Corregido: versiones exactas |

---

## 12. Fuera de alcance y pendientes

| Elemento | Decisión |
|---|---|
| **HU-020 completa** | **Semana 4**. En Semana 2 solo enlaces `http/https` de máximo 500 caracteres. No se implementan archivos binarios, almacenamiento, descarga ni antivirus. |
| **HU-004** | Semanas 3–6. Sesión de 15 min con refresh rotativo. |
| **H-13** | Se mantiene el token en `localStorage` durante la sesión actual de 24 h; se corrige con HU-004. |
| **Build Docker** | Pendiente de un entorno con daemon. No se declara verificado. |
| **Migración en producción** | Requiere respaldo y ensayo previo en Neon. No se ejecutó contra producción. |
| **Semanas 3–6** | No se adelantó funcionalidad. |
| **Push** | No realizado. |

---

## 13. Riesgos y limitaciones

1. **Docker no verificado en ejecución.** El `docker-compose.yml` y los Dockerfiles son válidos a nivel de configuración, pero falta probar el arranque completo en un equipo con Docker Desktop o en CI con daemon.
2. **Migración sobre producción.** Se probó sobre el esquema previo disponible en `HEAD`, no sobre una copia restaurada de una base real. Antes de desplegar se debe hacer respaldo y ensayo.
3. **Token en `localStorage`.** Sigue expuesto a XSS; la mitigación actual es la restricción de URLs y el escape de React. La solución definitiva pertenece a HU-004.
4. **Archivos de evidencia.** La Semana 2 no almacena archivos; solo enlaces. Cualquier prueba con archivos reales debe hacerse cuando se implemente HU-020 en Semana 4.
5. **Advertencias de lint frontend.** Son preexistentes y no bloquean el build; se recomienda limpiarlas en una tarea aparte.
6. **Dependencias y pnpm.** `pnpm` muestra una advertencia porque `pnpm.onlyBuiltDependencies` ya no se lee desde `package.json`; no afecta lint, pruebas ni build. Si se migra a la configuración nueva, hacerlo en una tarea de infraestructura.

---

## 14. Operación local

### 14.1 Requisitos

- Node.js 22 o superior.
- pnpm 11.24.0 (Corepack lo toma del campo `packageManager`).
- PostgreSQL 16 o superior.
- Docker Desktop solo si se usará Compose.

### 14.2 Base de datos

```bash
# Crear la base y cargar el esquema oficial
psql -U postgres -h localhost -c "CREATE DATABASE zenda;"
psql -U postgres -h localhost -d zenda -f Database/zenda_bd.sql

# Actualizar una base existente
psql -U postgres -h localhost -d zenda -f Database/migrations/002_semana2.sql
```

### 14.3 Backend

```bash
cd backend
cp .env.example .env
# Editar DB_*, JWT_SECRET y FRONTEND_URL
pnpm install
pnpm dev
```

### 14.4 Frontend

```bash
cd frontend
cp .env.example .env
# VITE_API_URL=http://localhost:4000
pnpm install
pnpm dev
```

### 14.5 Docker Compose

```bash
docker compose up --build
```

El servicio `migrate` aplica la migración y el backend arranca después.

### 14.6 Salud

```bash
curl http://localhost:4000/health
curl http://localhost:4000/api/health
```

---

## 15. Commits de esta entrega

Los cambios se agruparon por bloque funcional. **Todos son locales; no se ejecutó `push`.**

| Hash | Commit |
|---|---|
| `289641c` | `chore(repo): normalizar finales de línea y contexto de Docker` |
| `3fbe0b6` | `feat(db): actualizar esquema y migración de Semana 2` |
| `28e6566` | `feat(backend): aplicar reglas, seguridad y pruebas de Semana 2` |
| `d6b68f5` | `feat(frontend): completar registro, cupo, avance y evaluación` |
| `4a257c2` | `chore(infra): fijar dependencias y automatizar migración y salud` |

El commit de documentación incluye este archivo, el `CHANGELOG`, la auditoría histórica y la alineación de las guías. Para verificar el estado:

```bash
git log --oneline --decorate -10
git status
```

No debe aparecer ningún `push` en el historial local de esta entrega.

---

## 16. Checklist de aceptación

### Código y base de datos

- [x] No existen sub-roles Scrum en esquema, API ni UI.
- [x] El líder se toma de `grupos.lider_id`.
- [x] Cualquier integrante activo crea carpetas y sube evidencias.
- [x] El General se identifica por `es_general` y es único por ficha.
- [x] El cupo se valida entre 1 y 50 y no baja del total actual.
- [x] Un aprendiz solo se une a grupos de su ficha.
- [x] Un aprendiz no puede tener dos proyectos activos.
- [x] Las evaluaciones se insertan y la vigente es la de mayor ID.
- [x] La cascada usa funciones SQL y `clock_timestamp()`.
- [x] Las URLs de evidencia solo aceptan `http/https` y máximo 500 caracteres.
- [x] El reset usa token con propósito, hash, un solo uso y `token_version`.

### Documentación e infraestructura

- [x] Migración numerada, referenciada y probada dos veces.
- [x] `pnpm` único, versiones exactas y `packageManager` declarado.
- [x] Docker con contexto raíz, usuario no root y healthcheck.
- [x] Compose ejecuta migración antes del backend.
- [x] Render ejecuta `scripts/migrar.js` como predeploy.
- [x] CI carga esquema, migra dos veces, lint, pruebas y build.
- [x] Documentación de API, esquema, reglas, RF/HU, pruebas y variables alineada.
- [x] Archivos obsoletos eliminados.
- [x] HU-020 declarada parcial y trasladada a Semana 4.
- [x] Sin `push`.

### Verificación ejecutada

- [x] 9 pruebas unitarias aprobadas.
- [x] 6 pruebas de integración aprobadas con PostgreSQL real.
- [x] Migración aplicada dos veces sin errores.
- [x] Script de migración de Render ejecutado.
- [x] Lint backend aprobado.
- [x] Lint frontend aprobado con advertencias preexistentes.
- [x] Build frontend aprobado.
- [x] `docker compose config` válido.
- [ ] Build y arranque real de Docker (pendiente por daemon no disponible).

---

**Fin del documento.** Cualquier cambio posterior a las Semanas 1–2 debe registrarse en el `CHANGELOG`, actualizar la documentación afectada y respetar el alcance de las Semanas 3–6.
