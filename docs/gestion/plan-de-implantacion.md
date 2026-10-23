# Plan de Implantación — ZENDA Semana 1 y 2

## Objetivo
Implementar únicamente las **semanas 1 y 2** del roadmap de ZENDA sin adelantar las semanas 3–6. Los cambios se integran en `develop` con *Conventional Commits* y **sin hacer `push`** a menos que exista autorización explícita.

## Alcance cubierto

### Semana 1 (cerrada)
- **Infraestructura**: Docker (Node 22, puerto 4000), `docker-compose.yml` con *healthchecks*, `frontend/nginx.conf`, `.env.example`, `render.yaml` (Render backend) y `frontend/vercel.json` (Vercel).
- **Seguridad/Backend base**: `src/config/env.js` con `JWT_SECRET` obligatorio, `src/app.js`, CORS restringido por entorno, cabeceras de seguridad, *rate-limit* básico, `/health`, seed `H-11`.
- **Calidad**: ESLint/Prettier, CI de validación.
- **Gestión**: `docs/gestion/backlog.csv` (42 HU), guía GitHub Projects, `.mailmap`, script `scripts/gestion/crear-issues.ps1`.

### Semana 2 (implementada)
- **Sin sub-roles Scrum**: se elimina `usuarios.sub_rol_intencion` e `integrantes_grupo.rol_scrum`. El liderazgo del grupo de trabajo es `grupos.lider_id`. Cualquier integrante activo puede crear carpetas y subir evidencias (autor registrado desde `req.user`).
- **Cupo del grupo (RN-009)**: `grupos.cupo_maximo` (`CHECK 1..50`, por defecto 6). Al crear o al unirse se valida; al unirse se bloquea con `SELECT ... FOR UPDATE` y se rechaza si está completo.
- **Historial de asignación instructor–ficha (H-07)**: `instructor_ficha` pasa a tener historial (`fecha_inicio`, `fecha_fin`, `estado`). Se cierra con `fecha_fin`/`estado = 'Inactivo'` en reasignaciones o cambio de rol; nunca se borra la fila. Única asignación vigente por par mediante índice único parcial.
- **Estados por cascada (RN-017/RN-018)**: `carpetas.estado_carpeta` y recálculo de `fases.estado_fase`. La **evaluación vigente** es la más reciente por `fecha_evaluacion, evaluacion_id` con `LATERAL`. Todo nuevo envío (evidencia o evaluación) recalcula carpeta y fase. La aprobación en bloque (`POST /api/instructor/carpetas/:carpetaId/aprobar`) crea evaluaciones `APROBADO` para las evidencias no aprobadas.
- **Migración idempotente**: `Database/migrations/2026-10-22-semana2.sql` (envolver en `BEGIN/COMMIT`).
- **Reglas puras y servicios**: `backend/src/domain/reglas.js`, `backend/src/services/cascada.js`, `backend/src/services/asignaciones.js`.

## Cambios en esquema

- **`Database/zenda_bd.sql`**: esquema actualizado (sin sub-roles, historial instructor–ficha, `grupos.cupo_maximo`, `carpetas.estado_carpeta`, *checks* e índices). El *seed* usa estados derivados por SQL.
- **Migración**: `Database/migrations/2026-10-22-semana2.sql`.

## Backend

| Archivo | Cambio |
| --- | --- |
| `backend/src/domain/reglas.js` | Reglas puras (cupo, cascada, progreso, normalización). |
| `backend/src/services/cascada.js` | Obtención de evaluación vigente con `LATERAL` y recálculo carpeta/fase. |
| `backend/src/services/asignaciones.js` | Sincronización/cierre con historial; cierre parcial por programa. |
| `backend/src/controllers/aprendizController/proyectoController.js` | Cupo, unirse sin rol, cualquier integrante crea carpetas/sube evidencias, recálculo en cascada, respuestas con progreso/evaluación vigente. |
| `backend/src/controllers/instructorController/instructorController.js` | Solo asignaciones vigentes, evaluación siempre `INSERT`, aprobación en bloque, carpetas con autor/estado/progreso. |
| `backend/src/routes/instructor/instructor.js` | Añade `POST /carpetas/:carpetaId/aprobar`. |
| `backend/src/controllers/adminController/authController.js` | Registro sin `sub_rol`. Grupo General con `cupo_maximo`. |
| `backend/src/controllers/adminController/userController.js` | Historial de fichas de instructor; cierre en cambio de rol. |
| `backend/src/controllers/adminController/fichasController.js` | Conteo de instructores vigentes; sin `rol_scrum`. |
| `backend/src/controllers/coordinadorController/coordinadorController.js` | Sincronización con historial; conteos vigentes; seguimiento con líder/cupo/estados. |

## Frontend

| Archivo | Cambio |
| --- | --- |
| `frontend/src/api.js` | `unirseProyectoAprendiz(codigo_grupo)` sin rol; `aprobarCarpetaInstructor`; comentarios actualizados. |
| `frontend/src/components/Auth/Register.jsx` | Eliminado campo Rol Scrum, refs/imports asociados. |
| `frontend/src/pages/aprendiz.jsx` | Selector crear/unirse, cupo, sin dependencia de `sub_rol_intencion`. |
| `frontend/src/pages/aprendiz/Equipo.jsx` | Sin badges Scrum; indicador `Líder` por `es_lider`. |
| `frontend/src/pages/aprendiz/Fases.jsx` | Nuevo shape `{fase, estado_fase, progreso, carpetas}`, cualquier integrante crea/sube. |
| `frontend/src/pages/aprendiz/Tareas.tsx` | Sin `rol_scrum` en selectores. |
| `frontend/src/pages/instructor/Proyectos.jsx` | Nuevo shape, mostrar autor, botón "Aprobar carpeta", progreso. |
| `frontend/src/pages/coordinador/Seguimiento.jsx` | `es_lider` en lugar de `rol_scrum`. |
| `frontend/src/pages/coordinador/Grupos.jsx` | Muestra cupo e indica líder. |

## Pruebas

- **Unitarias**: `backend/tests/reglas.test.js` con Vitest (cupo, cascada, progreso, normalización).
- **Configuración**: `backend/vitest.config.js`.

## Verificación

```bash
# Backend
cd backend
pnpm lint
pnpm test        # pruebas unitarias posibles sin PostgreSQL

# Frontend
cd frontend
pnpm lint
pnpm build
```

> Las pruebas de integración con PostgreSQL deben ejecutarse en CI (PostgreSQL 16, `psql -f Database/zenda_bd.sql` antes de `pnpm test`). El entorno local puede no tener Docker/`psql` disponible.

## Despliegue

- **Backend**: Render (`render.yaml`).
- **Frontend**: Vercel (`frontend/vercel.json`, Root Directory `frontend`, configurar `VITE_API_URL`).
- **BD**: Neon (PostgreSQL).

## Commits

Se realizan commits atómicos con *Conventional Commits* en rama `develop`. **No se hace `push` sin autorización**.
