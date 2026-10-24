# Plan de Implantación — ZENDA Semanas 1 y 2

> **Alcance:** únicamente las semanas 1 y 2. No se adelantan funcionalidades de las semanas 3–6.
> **Rama de trabajo:** `develop`, publicada en `origin/develop` (commits `5be156a`, `bacaa2b` y merge `4e54425`).
> **Fecha de cierre:** 23 de octubre de 2026.

## Objetivo

Cerrar las semanas 1 y 2 del roadmap, aplicar la auditoría crítica de `ZENDA_auditoria_semanas_1_y_2.md` y dejar una base verificable para que el equipo continúe con las semanas 3–6.

## Alcance cubierto

### Semana 1 (cerrada)

- **Infraestructura:** Docker con Node 22 y puerto 4000, `docker-compose.yml` con *healthchecks* y servicio de migración, Nginx para el frontend, `.env.example`, `render.yaml` y `frontend/vercel.json`.
- **Seguridad/backend base:** `JWT_SECRET` obligatorio (falla al arrancar si falta), CORS con lista blanca, `helmet`, `express-rate-limit`, `trust proxy`, `/health` y `/api/health`.
- **Calidad:** ESLint en backend, oxlint en frontend, Vitest y CI con PostgreSQL 16.
- **Gestión:** backlog de 42 HU, reparto del equipo, guía de GitHub Projects, `.mailmap` y script de issues.

### Semana 2 (implementada y auditada)

- **Sin sub-roles Scrum:** se eliminan `usuarios.sub_rol_intencion` e `integrantes_grupo.rol_scrum`. El liderazgo es `grupos.lider_id`; cualquier integrante activo crea carpetas y sube evidencias con autor tomado de `req.user`.
- **Cupo del grupo (RN-009):** `grupos.cupo_maximo` con rango **1–50** y valor por defecto **6** (General: 50). Se valida al crear y al unirse, con bloqueo `SELECT ... FOR UPDATE`. El líder puede modificarlo con `PUT /api/aprendiz/proyectos/mio/cupo` sin bajarlo del número actual de integrantes. La UI está en `MiProyecto.jsx`.
- **Grupo General (RN-006):** se identifica con `grupos.es_general`, no por el nombre. Índice único parcial por ficha; código `GEN-<número_ficha>`; helper único `backend/src/services/grupos.js`.
- **Un proyecto por aprendiz (RN-007):** se bloquea la fila del usuario con `SELECT ... FOR UPDATE` antes de crear o unirse. Un aprendiz solo puede unirse a grupos de su ficha.
- **Historial instructor–ficha (RN-024):** `instructor_ficha` conserva `fecha_inicio`, `fecha_fin` y `estado`; las reasignaciones cierran la fila vigente sin `DELETE`. Índice único parcial de asignaciones vigentes.
- **Evaluaciones e historial (RN-017/RN-018):** toda evaluación es un `INSERT`; la vigente se elige por `evaluacion_id DESC` y se registra con `clock_timestamp()`. La cascada evidencia → carpeta → fase usa funciones SQL únicas (`zenda_recalcular_carpeta`, `zenda_recalcular_fase`) y bloqueos por usuario, carpeta y fase.
- **Aprobación en bloque:** `POST /api/instructor/carpetas/:carpetaId/aprobar` usa `INSERT ... SELECT` y devuelve cuántas evidencias aprobó realmente. La UI pide confirmación y advierte si hay reprobadas.
- **Progreso:** porcentaje y “N de M carpetas aprobadas” visibles en `Fases.jsx`.
- **Observaciones:** `crearObservacion` acepta y valida `evidencia_id`; las consultas devuelven el nombre de la evidencia.
- **Registro (HU-001):** cuatro aceptaciones legales, medidor de fuerza de 5 niveles, bloqueo de pegado, tipo de documento `CC/TI/CE/PA/PPT`, correo institucional estricto y documento de 6–11 dígitos, validados en backend y frontend.
- **Recuperación de contraseña (C-01):** token con `purpose: 'reset'`, hash SHA-256 de un solo uso en `recuperacion_contrasena`, expiración de 15 min y `token_version` para invalidar sesiones anteriores. Un token de sesión no sirve para resetear y uno de reset no sirve como sesión.
- **URLs de evidencias (C-07):** solo `http://` o `https://`, máximo 500 caracteres, validadas en backend y con `urlSegura` en frontend.
- **Migración idempotente:** `Database/migrations/002_semana2.sql` (recalcula antes de añadir `CHECK`, normaliza datos y puede ejecutarse dos veces).

## Fuera de alcance y traslados

| Tema | Decisión |
|---|---|
| **HU-020, archivos reales** (CA-020.1, .3 y .4) | **Fuera de las Semanas 1–2.** Se traslada a la **Semana 4** con almacenamiento compatible con S3 (por definir), lista blanca, tamaño máximo y compresión. En Semana 2 solo quedan enlaces validados (CA-020.2) y autoría de cualquier integrante (CA-020.5). |
| **HU-004, sesión de 15 min + refresh** | Semana 4. Hoy la sesión dura 24 h (`JWT_SESSION_EXPIRES=24h`); no se cambia el contrato del frontend todavía. |
| **HU-022, versiones y eliminación** | Semana 3. |
| **H-13, token en `localStorage`** | Sigue abierto. Se mitiga con Helmet, CORS, rate-limit y validación de URLs; la solución completa depende de HU-004. |
| **HU-003, recuperación completa** | La base de C-01 queda corregida; el pulido de correo y experiencia pertenece a Semana 5. |

## Cambios en esquema

- **`Database/zenda_bd.sql`**: base completa actualizada (sin sub-roles, historial de instructor–ficha, cupo, `es_general`, `token_version`, tabla de recuperación, checks, funciones e índices).
- **`Database/migrations/002_semana2.sql`**: migración incremental e idempotente para bases existentes. Convención: la base inicial es `zenda_bd.sql`; las migraciones incrementales van numeradas en `Database/migrations/`.
- El *seed* usa el grupo `GEN-2724285` y no cuelga proyectos del grupo General.

## Backend

| Archivo | Cambio |
| --- | --- |
| `backend/src/config/env.js` | `JWT_SECRET` obligatorio (mínimo 32 en producción), `JWT_SESSION_EXPIRES`, `CODIGO_PROGRAMA_COORDINADOR`. |
| `backend/src/config/db.js` | SSL con `DB_SSL_REJECT_UNAUTHORIZED=true` por defecto. |
| `backend/src/app.js` | Helmet, rate-limit general y de autenticación, `trust proxy`, `/health` y `/api/health`. |
| `backend/src/domain/reglas.js` | Reglas puras de cupo, cascada, progreso y normalización. |
| `backend/src/services/grupos.js` | Única función para obtener o crear el grupo General. |
| `backend/src/services/cascada.js` | Bloqueos, evaluación vigente y recálculo con funciones SQL. |
| `backend/src/services/asignaciones.js` | Cierre con historial y unicidad de asignaciones vigentes. |
| `backend/src/controllers/adminController/authController.js` | Registro completo, sesión con `purpose`, reset de un solo uso y `token_version`. |
| `backend/src/middleware/auth.js` | Rechaza tokens de reset, valida estado/rol y `token_version` contra la BD. |
| `backend/src/controllers/aprendizController/proyectoController.js` | Cupo, RN-007, ficha, General, URLs, N+1, progreso y cupo editable. |
| `backend/src/controllers/instructorController/instructorController.js` | Evaluación con historial, aprobación en bloque y observaciones con evidencia. |
| `backend/src/controllers/adminController/fichasController.js` | Helper General y cierre de membresías al mover aprendiz. |
| `backend/src/controllers/adminController/userController.js` | Asignaciones de instructor con historial. |
| `backend/src/controllers/coordinadorController/coordinadorController.js` | Programa por entorno, asignaciones vigentes y `es_general`. |
| `backend/src/routes/aprendiz/proyecto.js` | Ruta de actualización de cupo. |

## Frontend

| Archivo | Cambio |
| --- | --- |
| `frontend/src/api.js` | Cupo, aprobación en bloque, observación con `evidencia_id` y errores legibles. |
| `frontend/src/components/Auth/Register.jsx` | Cuatro casillas legales, medidor, anti-pegado, documento y correo institucional. |
| `frontend/src/pages/aprendiz/Fases.jsx` | Porcentaje, carpetas aprobadas, enlaces seguros y estado de fase. |
| `frontend/src/pages/aprendiz/MiProyecto.jsx` | Integrantes/cupo y edición por el líder. |
| `frontend/src/pages/aprendiz/Observaciones.jsx` | Nombre de la evidencia asociada. |
| `frontend/src/pages/instructor/Proyectos.jsx` | Confirmación de aprobación en bloque, advertencia de reprobadas, observación con evidencia y enlaces seguros. |
| `frontend/src/utils/urlSegura.js` | Solo `http/https`, longitud máxima 500. |

## Pruebas

- **Unitarias:** `backend/tests/reglas.test.js` (9 pruebas de reglas puras).
- **Integración:** `backend/tests/integracion.test.js` con Vitest + Supertest y PostgreSQL real. Cubre HU-001, HU-014/015, HU-023/024/025, RN-018 (evidencia mixta), HU-026, HU-011 y C-01 (7 escenarios). Si no hay base de datos o falta el esquema, se omiten; en CI se ejecutan con `REQUIRE_DB=1`.
- **CI:** carga `Database/zenda_bd.sql`, aplica `002_semana2.sql` dos veces, migra desde el *fixture* v11, ejecuta lint, pruebas y build del frontend.
- **Ejecución local verificada (23-oct-2026):** PostgreSQL 16, base cargada desde `Database/zenda_bd.sql`, migración aplicada **dos veces** sin errores y `pnpm test` con **16 pruebas aprobadas** (9 unitarias + 7 de integración). También se probó la migración sobre el *fixture* v11 con datos (`V11_MIGRATION_OK`) y se verificó un único General por ficha.
- **Docker verificado:** `docker compose up --build` construye `zenda-backend` y `zenda-frontend`, y levanta `db`, `migrate`, `backend` y `frontend`. `GET /api/health` responde 200, el frontend 200 y el login de administrador y aprendiz 200.

## Verificación

```bash
# Backend
cd backend
pnpm install --frozen-lockfile
pnpm lint
pnpm test

# Frontend
cd frontend
pnpm install --frozen-lockfile
pnpm lint
pnpm build
```

## Despliegue

- **Backend:** Render (`render.yaml`) con `startCommand: sh -c "node scripts/migrar.js && node server.js"`. El plan free no admite `preDeployCommand`; la migración se ejecuta al arrancar y es idempotente.
- **Migración local:** el servicio `migrate` de Compose aplica `002_semana2.sql` cuando la base ya existía.
- **Frontend:** Vercel (`frontend/vercel.json`, Root Directory `frontend`, `VITE_API_URL`).
- **BD:** Neon (PostgreSQL) con SSL validado.

## Proceso y limitaciones

- Los commits se hacen por bloques con *Conventional Commits* en español y ya están publicados en `origin/develop`.
- **D-08:** el historial anterior concentra la mayoría de commits en un integrante y no refleja el reparto ni la rotación de revisores. No se reescribe la historia; a partir de esta entrega se documentan los commits por bloque y se recomienda usar PRs hacia `develop` con el revisor asignado.
- **D-09:** `develop` ya estaba publicado antes de esta tarea. Los cambios nuevos también se publicaron (`5be156a`, `bacaa2b`, merge `4e54425`).
- La migración se probó sobre el *fixture* v11 y sobre el esquema actual, no sobre una copia restaurada de producción. Antes de desplegar en Neon debe hacerse un respaldo y ejecutar `backend/scripts/migrar.js` en un entorno de ensayo.
- El despliegue público de Render/Vercel sigue sirviendo la versión v11; el código actual no se ha desplegado.

## Criterio de cierre

1. `pnpm lint` pasa en backend y frontend.
2. `pnpm test` pasa (unitarias y, con BD, integración).
3. `pnpm build` del frontend termina sin errores.
4. `002_semana2.sql` se ejecuta dos veces sin errores en CI.
5. HU-020 queda declarada fuera de alcance y trasladada a la Semana 4.
