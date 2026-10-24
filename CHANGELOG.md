# Registro de cambios

Todos los cambios relevantes de ZENDA se documentan aquí.
El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el versionado es [semántico](https://semver.org/lang/es/).

## [Sin publicar] — Semanas 1 y 2 + auditoría

### Agregado

- Documentación completa en `docs/` (requisitos, diagramas, referencia técnica, instalación, pruebas y colaboración).
- Flujo de CI en `.github/workflows/ci.yml`: lint, pruebas con PostgreSQL 16, build del frontend y migración desde una base v11.
- `docker-compose.yml`, Dockerfiles, `nginx.conf`, `.gitignore`, `.dockerignore`, `.gitattributes` y archivos `.env.example`.
- **Semana 2:**
  - Reglas puras en `backend/src/domain/reglas.js`.
  - Servicios `cascada.js`, `asignaciones.js` y `grupos.js`.
  - 9 pruebas unitarias y 8 de integración con Supertest (17 en total).
  - Migración incremental e idempotente `Database/migrations/002_semana2.sql`.
  - Servicio `migrate` en Compose y `startCommand` con migración en Render (el plan free no admite `preDeployCommand`).
  - *Fixtures* `Database/fixtures/v11_migracion.sql` y `v11_migracion_assert.sql` para probar el upgrade desde v11.
- **Seguridad:** `helmet`, `express-rate-limit`, `trust proxy`, `/health` y `/api/health`.
- **Recuperación de contraseña:** tabla `recuperacion_contrasena`, tokens con `purpose: 'reset'`, hash SHA-256 de un solo uso y `token_version`.
- **Esquema:** `grupos.es_general`, `grupos.cupo_maximo`, `instructor_ficha` con historial, funciones `zenda_recalcular_carpeta`/`zenda_recalcular_fase`, checks de URLs de evidencias y de tipos.
- **UI:** medidor de contraseña, cuatro aceptaciones legales, anti-pegado, cupo editable por el líder, progreso por fase, confirmación de aprobación en bloque y observación asociada a evidencia.
- **Operación:** validación de `ubicacion` en backend y frontend, migración automática y SSL validado.

### Cambiado

- Se eliminan los sub-roles Scrum (`usuarios.sub_rol_intencion`, `integrantes_grupo.rol_scrum`); el líder es `grupos.lider_id`. Cualquier integrante activo crea carpetas y sube evidencias con autor registrado.
- Cupo `grupos.cupo_maximo` (1–50, por defecto 6; General 50), editable por el líder sin bajar del total actual.
- El grupo General se identifica por `es_general` y código `GEN-<número_ficha>`; ya no por el nombre.
- Un aprendiz solo puede unirse a un grupo de su ficha; se bloquea al usuario para evitar dobles proyectos.
- Historial de `instructor_ficha` (`fecha_inicio`, `fecha_fin`, `estado`), cierre sin `DELETE` y único vigente por índice parcial.
- Evaluaciones siempre `INSERT`; la vigente se elige por `evaluacion_id DESC` y se registra con `clock_timestamp()`.
- Aprobación en bloque con `INSERT ... SELECT`; respuesta con el número real de evidencias aprobadas.
- Versiones exactas en `backend/package.json` y `frontend/package.json`; `packageManager: pnpm@11.24.0`.
- Duración real de sesión documentada como 24 h (`JWT_SESSION_EXPIRES`); 15 min + refresh queda para HU-004.
- `backend/.env.example`, `.env.example` y `docs/Setup/variables-de-entorno.md` alineados con `DB_SSL_REJECT_UNAUTHORIZED`, `JWT_SESSION_EXPIRES` y `CODIGO_PROGRAMA_COORDINADOR`.
- **HU-020** (archivos reales) queda fuera de las Semanas 1–2 y se traslada a la Semana 4. En Semana 2 solo se admiten enlaces `http/https`.
- **HU-001, HU-011, HU-014, HU-015, HU-019, HU-023, HU-024, HU-025, HU-026 y HU-028** pasan a “Implementado” en el backlog y en la matriz de trazabilidad (25 implementadas, 9 parciales, 8 planificadas).
- **HU-019:** `crearCarpeta` distingue fase inexistente (`404`) de fase ajena (`403`), valida el nombre con el mensaje de RF-019 y el límite de 150 caracteres; la UI muestra el error en vez de ignorarlo.

### Corregido

- **C-01:** un token de sesión ya no sirve para restablecer contraseña; el token de reset es de un solo uso y las sesiones anteriores se invalidan.
- **C-02:** el plan ahora coincide con el código (`helmet`, rate-limit, `/health`).
- **C-04:** la migración recalcula datos antes de añadir `CHECK`, normaliza cupos y es idempotente.
- **C-05:** se elimina la comparación por `nombre_grupo = 'General'` y la posibilidad de crear un proyecto “General”.
- **Colisión `GEN-<ficha>`:** si un General legado con proyecto ya ocupa el código, se conserva y el General nuevo recibe un sufijo estable. El *fixture* v11 cubre ese caso y las *assertions* comprueban que el grupo legado y su proyecto siguen intactos.
- **C-06:** bloqueos en cascada, RN-007, cupo y evaluaciones; `clock_timestamp()`.
- **C-07:** URLs `javascript:` rechazadas en backend y frontend.
- **Q-01 a Q-11:** logging en `catch`, funciones SQL únicas, helper General, listados sin N+1, aprobación en bloque atómica, validación de fechas/longitudes, código criptográfico y `ORDER BY` antes de `LIMIT 1`.
- **HU-026/H-08:** `evidencia_id` aceptado, validado y visible en las consultas.
- **HU-024:** confirmación antes de aprobar y aviso si hay reprobadas.
- **HU-025:** porcentaje y carpetas aprobadas visibles.
- **HU-001:** validaciones de correo institucional, tipo de documento y documento; las cuatro aceptaciones se validan en backend.
- **D-01/D-02:** referencias a `001_v12.sql` y `Database/migraciones/` reemplazadas por `Database/migrations/002_semana2.sql`; convención de migraciones numeradas documentada.
- **D-03:** mensaje de `env.js` apunta a `backend/.env.example`.
- **D-04:** documentación alineada con la sesión real de 24 h y el objetivo futuro de 15 min.
- **D-06:** eliminados `docs/estados (1).md` y `docs/Conceptos/ee.txt`.
- **D-07/H-15:** agregado `.gitattributes` con `* text=auto eol=lf`.
- **D-10:** `JWT_SECRET` corto falla en producción; SSL valida certificados por defecto.
- **H-16:** dependencias exactas y `pnpm` fijado.
- Infraestructura: backend corre como `node`, tiene `HEALTHCHECK`, Compose aplica migraciones y CI las ejecuta dos veces.
- **Healthchecks de Compose:** `db` y `frontend` usan `127.0.0.1` para forzar IPv4; el frontend ya no queda en `unhealthy` cuando `localhost` resuelve a `::1`.

### Pruebas

- `pnpm --dir backend lint` y `pnpm --dir frontend build`.
- 9 pruebas unitarias de reglas puras (`backend/tests/reglas.test.js`).
- 8 pruebas de integración con Supertest (`backend/tests/integracion.test.js`). Se omiten sin PostgreSQL; en CI se ejecutan con `REQUIRE_DB=1`.
- **Total: 17/17.**
- Migración probada sobre una base v11 con datos: se aplica dos veces seguidas sin errores y las *assertions* confirman que no se pierden evidencias, grupos ni proyectos (`V11_MIGRATION_OK`).
- `docker compose up --build` verificado: `db`, `migrate`, `backend` y `frontend` arrancan; `GET /api/health` responde 200, el frontend responde 200 y el login de administrador y aprendiz responde 200.

### Verificación

- Stack local verificado con PostgreSQL 16 (imagen `postgres:16-alpine`), Node 22 y Docker Compose.
- CI de GitHub Actions con PostgreSQL 16.
- Commits de cierre: `5be156a` (cascada y verificación), `bacaa2b` (migración v11 sin destruir datos), merge `4e54425`, `9488c9f` (infra), `fd33bd0` (documentación), `4fb186f` (HU-019) y `88579ef` (cierre documental de HU-019) en `develop`.

### Limitaciones conocidas

- **H-13:** el token sigue en `localStorage` y dura 24 h; la solución completa es HU-004 (Semanas 3–6).
- **HU-020:** archivos reales, lista blanca, tamaño máximo y compresión quedan para la Semana 4. En Semana 2 solo se admiten enlaces `http/https`.
- **Despliegue público:** la URL de Render/Vercel sigue sirviendo la versión v11; el código de las Semanas 1–2 no se ha desplegado. En Render free la migración va en `startCommand`, no en `preDeployCommand`.
- **D-08:** el historial previo concentra los commits y no refleja la rotación de revisores. No se reescribe; se documenta y se corrige el proceso desde esta entrega.

## [11.0.0]

Versión de partida: base funcional descrita en el `README.md` anterior.
