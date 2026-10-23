# Registro de cambios

Todos los cambios relevantes de ZENDA se documentan aquí.
El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el versionado es [semántico](https://semver.org/lang/es/).

## [Sin publicar]

### Agregado
- Documentación completa en `docs/` (requisitos, diagramas, referencia técnica, instalación, pruebas y colaboración).
- Plantillas de GitHub: Pull Request, issues y flujo de CI.
- `docker-compose.yml`, Dockerfiles corregidos, `nginx.conf`, `.gitignore` y archivos `.env.example`.
- Migración `001_v12.sql` de la base de datos.
- **Semana 2**: `backend/src/domain/reglas.js`, `backend/src/services/cascada.js`, `backend/src/services/asignaciones.js`, `backend/vitest.config.js`, `backend/tests/reglas.test.js`, `Database/migrations/2026-10-22-semana2.sql`, `docs/gestion/plan-de-implantacion.md`.

### Cambiado
- Se eliminan los sub-roles Scrum (`usuarios.sub_rol_intencion`, `integrantes_grupo.rol_scrum`); el líder del grupo es `grupos.lider_id`. Cualquier integrante activo crea carpetas y sube evidencias con autor registrado.
- Cupo de grupo `grupos.cupo_maximo` (1–50, por defecto 6) con validación y bloqueo al unirse.
- Historial de `instructor_ficha` (`fecha_inicio`, `fecha_fin`, `estado`), cierre sin `DELETE` en reasignaciones/cambio de rol, asignación vigente por índice único parcial.
- Cascada de estados evidencia → carpeta → fase con evaluación vigente por `LATERAL` (`fecha_evaluacion, evaluacion_id`). Aprobación en bloque desde instructor.
- `Database/zenda_bd.sql` y controladores/rutas/frontend actualizados al nuevo esquema.

### Corregido
- Ver la lista de defectos conocidos en `docs/testing/hallazgos.md`.

## [11.0.0]

Versión de partida: base funcional descrita en el `README.md` anterior.
