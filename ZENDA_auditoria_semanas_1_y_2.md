# ZENDA — Auditoría crítica de las semanas 1 y 2

> **Fecha de la revisión:** 22 de octubre de 2026
> **Material revisado:** `ZENDA.zip` (repo `player7842/ZENDA`, rama `develop` al día con `origin/develop`)
> **Contraste:** roadmap y plan (`docs/gestion/*`), hallazgos H-01 a H-16 (`docs/Testing/hallazgos.md`), backlog, reparto del equipo y criterios de aceptación de cada HU.

> [!NOTE]
> **Actualización de resolución — 23-oct-2026.** El texto original se conserva como registro histórico. Esta sección resume qué se corrigió después y remite al detalle en [`SEMANA-1-2-IMPLEMENTACION-DEFINITIVO.md`](SEMANA-1-2-IMPLEMENTACION-DEFINITIVO.md) y en el [`CHANGELOG.md`](CHANGELOG.md).
>
> | Hallazgo | Estado actual |
> |---|---|
> | **C-01** (token de reset intercambiable) | Resuelto: `purpose: 'reset'`, hash SHA-256 de un solo uso y `token_version`. |
> | **C-02** (plan sin `helmet` ni rate-limit) | Resuelto: `helmet`, `express-rate-limit`, `trust proxy` y `/api/health` existen y están documentados. |
> | **C-03** (sin pruebas de integración) | Resuelto: 7 escenarios con Supertest contra PostgreSQL 16 y CI que los ejecuta con `REQUIRE_DB=1`. |
> | **C-04** (migración destructiva) | Resuelto: migración idempotente, probada dos veces y sobre una base v11 con datos (`V11_MIGRATION_OK`). |
> | **C-05** (General por nombre) | Resuelto: `grupos.es_general`, índice único parcial y conservación de grupos legados llamados “General”. |
> | **C-06** (carreras y bloqueos) | Resuelto: bloqueos en cascada, RN-007, cupo y evaluaciones con `clock_timestamp()`. |
> | **C-07** (URLs `javascript:`) | Resuelto en backend y frontend. |
> | **H-12** (Docker sin verificar) | Resuelto: `docker compose up --build` construye y levanta `db`, `migrate`, `backend` y `frontend`. |
> | **H-13** (token en `localStorage`) | **Abierto**: se mantiene la sesión de 24 h; la solución es HU-004 (Semanas 3–6). |
> | **Documentación vs. código** | Corregida: README, CHANGELOG, esquema, endpoints, pruebas, backlog y matriz de trazabilidad reflejan el código actual. |
>
> El despliegue público de Render/Vercel sigue sirviendo la versión v11; el código de las Semanas 1–2 está en `develop` pero aún no se ha desplegado.

## 0. Alcance y límites de esta revisión

- Es una **lectura de código y documentos**. No ejecuté el backend, la base de datos ni el CI.
- Lo marcado como **(inferido)** sale de razonar sobre el código y debe comprobarse ejecutándolo.
- No encontré un documento aparte con el feedback textual del instructor. Usé como roadmap el plan de implantación, los hallazgos, el backlog, el reparto y las HU. Si existe el feedback original, hay que cruzarlo punto por punto con este documento.
- Los 231 archivos que `git status` marca como modificados son solo diferencias de fin de línea (CRLF) del zip. No hay cambios reales sin commitear.

---

## 1. Resumen ejecutivo

| Área | Estado |
|---|---|
| Infraestructura (Docker, compose, Render, Vercel, CI) | Buena base, con huecos de seguridad y pruebas |
| Seguridad base (H-01, H-02, H-04, H-05) | Corregida en lo visible, pero con una falla grave nueva en recuperación de contraseña |
| Núcleo de semana 2 (cupo, historial, cascada) | Bien pensado en el diseño; sin pruebas de integración, con carreras y bugs de borde |
| HU de semana 2 según backlog | 4 incompletas (HU-001, HU-020, HU-026 y parte de HU-024/025) |
| Documentación | Muy completa, pero con afirmaciones que el código no cumple |
| Proceso de equipo | El historial no refleja el reparto ni la rotación de revisores |

**Veredicto:** el diseño de datos y las reglas puras son sólidos. Lo que más daña la entrega es la distancia entre lo que dice la documentación y lo que hay en el código, la falta de pruebas sobre lo más difícil y una vulnerabilidad en el flujo de contraseñas.

---

## 2. Hallazgos críticos

### C-01. Token de recuperación y token de sesión son intercambiables

- **Dónde:** `backend/src/controllers/adminController/authController.js` (`forgotPassword`, `resetPassword`) y `middleware/auth.js`.
- **Qué pasa:**
  - `resetPassword` solo verifica la firma del JWT y usa `decoded.usuario_id`. Acepta cualquier token firmado con `JWT_SECRET`, incluido un token de sesión de 24 h.
  - Con un token de sesión robado se puede fijar una contraseña nueva sin conocer la actual.
  - El token de reset no es de un solo uso: se puede reutilizar durante 15 minutos.
  - Cambiar la contraseña no invalida las sesiones ya emitidas.
- **Agravantes:** token en `localStorage` (H-13, sigue abierto) y sin cabeceras de seguridad.
- **Arreglo:**
  1. Firmar el token de reset con `purpose: 'reset'` y comprobarlo en `resetPassword`.
  2. Rechazar en `middleware/auth.js` cualquier token con `purpose`.
  3. Idealmente guardar un hash del token de reset en base de datos para que sea de un solo uso.

```js
// forgotPassword
jwt.sign({ usuario_id, purpose: 'reset' }, env.jwtSecret, { expiresIn: '15m' });

// resetPassword
const decoded = jwt.verify(token, env.jwtSecret);
if (decoded.purpose !== 'reset') throw new Error('Token no válido para restablecer');

// middleware auth
if (decoded.purpose) return res.status(401).json({ message: 'Token inválido, intenta de nuevo' });
```

### C-02. El plan de implantación afirma cosas que no existen

- **Dónde:** `docs/gestion/plan-de-implantacion.md`, sección Semana 1.
- **Qué dice:** "cabeceras de seguridad, *rate-limit* básico, `/health`".
- **Qué hay:** no existe `helmet`, ni cabeceras manuales, ni limitador de peticiones en `app.js` ni en `package.json`. El endpoint real es `/api/health`.
- **Impacto:** si el instructor contrasta el plan con el código, cuestiona todo lo demás.
- **Arreglo:** implementarlo (`helmet` + `express-rate-limit`, con `trust proxy` por Render) o corregir el documento. Hacer ambas cosas es lo ideal.

### C-03. Casi no hay pruebas, y la parte difícil no tiene ninguna

- **Qué hay:** `backend/tests/reglas.test.js` con 9 pruebas unitarias de funciones puras.
- **Qué falta:** SQL con `LATERAL`, cascada de estados, cupo con `FOR UPDATE`, historial de `instructor_ficha`, evaluación con historial, aprobación en bloque.
- **CI decorativo:** el workflow levanta PostgreSQL y carga el esquema, pero ninguna prueba toca la base. `supertest` está instalado sin usar.
- **Contradicciones:** `app.js` dice que se separó "para pruebas de integración con Supertest" y el plan dice que esas pruebas "deben ejecutarse en CI". No existen.
- **Arreglo:** una suite de integración con Supertest que cubra como mínimo los criterios de HU-014, 015, 023, 024, 025 y 011.

### C-04. La migración probablemente falla sobre una base v11 (inferido)

- **Dónde:** `Database/migrations/2026-10-22-semana2.sql`.
- **Qué pasa:**
  - El paso 5 agrega `CHECK` a `fases.estado_fase` y `evaluaciones.resultado`.
  - El paso 6 recalcula los estados, pero ya es tarde: los datos v11 pueden violar el `CHECK` y abortar toda la transacción.
  - `UPDATE grupos SET cupo_maximo = 6` deja grupos existentes con más integrantes que su cupo.
- **Sin prueba:** el CI carga `zenda_bd.sql`, nunca la migración. La idempotencia que declara el archivo no está demostrada.
- **Arreglo:** recalcular estados **antes** de añadir los `CHECK`, y probar la migración sobre una copia de una base v11 con datos.

### C-05. El grupo `General` se identifica por un nombre que el usuario controla

- **Dónde:** `proyectoController.js` (`tieneProyectoActivo`, `unirseAProyecto`, `getMiProyecto`, `cambiarMiFicha`), `authController.js`.
- **Qué pasa:** el código usa `nombre_grupo = 'General'` / `<> 'General'`, y `nombre_grupo` es un campo que el aprendiz escribe al crear su proyecto.
  - Un proyecto llamado "General" no cuenta como proyecto activo: evade RN-007 (un proyecto por aprendiz).
  - Ese proyecto queda inaccesible por `getMiProyecto` y por el código de invitación.
- **Inconsistencia con RN-006:** la regla dice código `GEN-<número de ficha>`. El código y el seed usan `GRP-GENERAL-<ficha_id>` (id interno, no el número de ficha).
- **Arreglo:** distinguir el grupo por una columna (`es_general boolean`) o por el prefijo del `codigo_grupo`, prohibir ese nombre al crear, y unificar el formato del código con RN-006.

### C-06. Condiciones de carrera

| Escenario | Consecuencia |
|---|---|
| Crear proyecto y unirse a otro en paralelo (o doble clic) | El aprendiz queda en dos proyectos: se saltó RN-007. Solo se bloquea la fila del grupo, no al usuario |
| Subida de evidencia y evaluación simultáneas | `estado_carpeta` / `estado_fase` guardados quedan desincronizados (carpeta "Aprobada" con una evidencia sin evaluar) |
| Dos primeros registros a la vez en la misma ficha | Se crean dos grupos `General` porque no hay `UNIQUE` |
| Dos evaluaciones con transacciones solapadas | `now()` es la hora de **inicio** de la transacción: la "vigente" puede no ser la última confirmada |

- **Arreglo:**
  - Bloquear con `SELECT ... FOR UPDATE` la carpeta/fase antes de recalcular.
  - Usar un índice único parcial o un `pg_advisory_xact_lock` por usuario para RN-007.
  - Añadir `UNIQUE` para `General` por ficha.
  - Usar `clock_timestamp()` o decidir la vigente solo por `evaluacion_id`.

### C-07. XSS almacenado por el campo `ubicacion`

- **Dónde:** `frontend/src/pages/aprendiz/Fases.jsx` (≈ línea 278), `frontend/src/pages/instructor/Proyectos.jsx` (≈ líneas 338 y 600).
- **Qué pasa:** `<a href={e.ubicacion}>` pinta un valor que el backend guarda sin validar. Un esquema `javascript:` es un vector real. El instructor es quien suele abrir esos enlaces.
- **Combinado con:** token en `localStorage` y ausencia de cabeceras de seguridad.
- **Arreglo:** en el backend, aceptar solo URLs `http://` o `https://` (`new URL()` + comprobar `protocol`), con longitud máxima; en el frontend, no renderizar enlaces que no cumplan.

```js
function urlSegura(valor) {
  try {
    const u = new URL(valor);
    return ['http:', 'https:'].includes(u.protocol) && valor.length <= 500;
  } catch { return false; }
}
```

---

## 3. HU asignadas a la semana 2 que quedaron incompletas

| HU | Criterio | Estado real |
|---|---|---|
| **HU-001** Registro de aprendiz | CA-001.3 (medidor de 5 niveles), CA-001.4 (sin pegar), CA-001.5 (4 casillas legales) | Solo se quitó el campo Rol Scrum. La UI tiene 1 casilla legal (RN-004 pide 4); no encontré medidor ni bloqueo de pegado. El backend no valida aceptaciones legales; `tipo_documento` cae a `'CC'` en silencio; `numero_documento` cae a `''`; el texto `@soy.sena.edu.co` sin parte local pasa la validación |
| **HU-020** Subida de evidencias | CA-020.1, .3, .4 | Sigue siendo solo una URL escrita a mano. No hay archivos, lista blanca de tipos, tamaño máximo ni compresión (RN-013). `tipo_evidencia` no tiene `CHECK`. El plan no la menciona |
| **HU-026** Observaciones | CA-026.2 | `crearObservacion` no acepta `evidencia_id` (H-08 sigue abierto) |
| **HU-024** Aprobación en bloque | CA-024.1 ("pulso y **confirmo**") | El botón en `Proyectos.jsx` llama directo a `aprobarCarpeta`, sin confirmación, y sobrescribe evaluaciones REPROBADO con un clic |
| **HU-025** Estado y avance | CA-025.2, CA-025.3 | El backend devuelve `porcentaje` y `carpetas_aprobadas`, pero no encontré dónde `Fases.jsx` los muestra ("70 %", "3 de 4 carpetas aprobadas") |
| **HU-014 / HU-015** (RN-009) | Cupo | Ver sección 3.1 |

### 3.1. Cupo del grupo (RN-009)

- La regla dice "el rango permitido está por definir". El código fija 1–50 con valor 6 por defecto (en `reglas.js`, en el `CHECK` del esquema y en la migración) sin que conste aprobación.
- `validarCupo` exige que el cupo sea obligatorio, pero `cupo_maximo ?? cupo_integrantes ?? CUPO_POR_DEFECTO` hace que nunca se dispare. Además existe un alias `cupo_integrantes` sin documentar en la API.
- La regla dice "el cupo no puede ser menor que el número actual de integrantes", pero no existe ninguna ruta ni `UPDATE grupos` para modificarlo.
- El grupo `General` se crea con cupo 50 fijo, pero el registro nunca comprueba ese cupo: el valor no significa nada.
- `unirseAProyecto` no comprueba que el grupo pertenezca a la ficha del aprendiz. Es una decisión no documentada que permite que un aprendiz de la ficha A sea evaluado por instructores de la ficha B.

---

## 4. Documentación y proceso

| # | Hallazgo | Dónde |
|---|---|---|
| D-01 | El CHANGELOG cita `001_v12.sql`, que no existe. Varios documentos apuntan a `Database/migraciones/001_v12.sql` (carpeta distinta y nombre distinto de la real `Database/migrations/2026-10-22-semana2.sql`) | `CHANGELOG.md`, `docs/Setup/*`, `docs/Testing/*`, `docs/Colaboracion/*` |
| D-02 | Tu propia convención exige migraciones numeradas (`001_`, `002_`), y la semana 2 usa fecha | `docs/Colaboracion/flujo-github.md` |
| D-03 | `env.js` manda a copiar `backend/env.example`, que ya se renombró a `.env.example` | `backend/src/config/env.js` |
| D-04 | La documentación habla de tokens de 15 minutos; el código emite sesiones de 24 h | `docs/Testing/hallazgos.md` vs `authController.js` |
| D-05 | H-16 sigue abierto: 25 dependencias con `^` (13 backend, 12 frontend) y RH-003 es una restricción | `package.json` |
| D-06 | Archivos sobrantes: `docs/estados (1).md` duplicado y `docs/Conceptos/ee.txt` vacío | `docs/` |
| D-07 | Sin `.gitattributes`: 230 archivos con CRLF en el árbol de trabajo y uno con fin de línea mixto (H-15) | repo |
| D-08 | De 16 commits, 15 son de Hernán y 1 de Nicolás, en un equipo de 4 con rotación de revisores definida. No hay PRs visibles y `main` no se actualizó | `git log`, `docs/gestion/reparto-equipo.md` |
| D-09 | El plan dice "sin `push` sin autorización", pero `develop` está empujado | `plan-de-implantacion.md` |
| D-10 | `backend/.env` contiene `DB_PASSWORD=123`. No está versionado (bien), pero viaja en el zip. `JWT_SECRET` corto solo genera advertencia, no error | `backend/.env`, `env.js` |

---

## 5. Infraestructura y seguridad base

- El contenedor del backend corre como `root` (falta `USER node`) y el `Dockerfile` no declara `HEALTHCHECK` propio (solo el compose).
- `pnpm` no está fijado (no hay `packageManager` en `package.json`), mientras el CI usa la versión 10.
- La conexión a PostgreSQL usa `ssl: { rejectUnauthorized: false }`, que acepta cualquier certificado. Neon ofrece certificados válidos.
- `render.yaml` no incluye ningún paso para aplicar migraciones en Neon: queda como tarea manual.
- `docker-compose.yml` solo carga `zenda_bd.sql` en el primer arranque del volumen: una base existente no recibe la migración automáticamente.
- H-13 (token en `localStorage`) sigue abierto y no hay CSP.

---

## 6. Calidad de código

| # | Hallazgo |
|---|---|
| Q-01 | Los `catch` de `proyectoController.js` e `instructorController.js` no registran nada. Ante un 500 en producción no hay pista, lo que contradice RNF-011 |
| Q-02 | La cascada de estados está copiada en 4 sitios: `reglas.js`, SQL dentro de `proyectoController.js`, la migración y el seed |
| Q-03 | La función de buscar o crear `General` está duplicada en 3 controladores. El primer aprendiz de una ficha queda como `lider_id` de `General`, lo que ensucia el significado de líder |
| Q-04 | `getCarpetasDeFaseAprendiz` hace una consulta por carpeta (N+1) y devuelve el estado de fase por dos vías (guardado y recalculado en JS) |
| Q-05 | `aprobarCarpeta` inserta una evaluación por evidencia en bucle; podría ser un solo `INSERT ... SELECT` |
| Q-06 | La respuesta de `aprobarCarpeta` devuelve `evidencias_aprobadas: evidencias.length`, que es el total de evidencias, no las aprobadas |
| Q-07 | `aprobarCarpeta` lee las evidencias fuera de la transacción y sin bloqueo |
| Q-08 | `crearProyecto` no valida `fecha_fin_estimada >= fecha_inicio` en la API ni longitudes de texto |
| Q-09 | `generarCodigoProyecto` usa `Math.random()`: no es criptográfico (el código es un secreto de invitación) y una colisión da un 500 genérico |
| Q-10 | El coordinador está atado al programa ADSO con la constante `2338` en el código, no en datos |
| Q-11 | `getMiProyecto` usa `LIMIT 1` sin `ORDER BY`: depende de un invariante que nada garantiza (ver C-05 y C-06) |

---

## 7. Lo que está bien hecho

- `JWT_SECRET` obligatorio con fallo al arrancar (H-02 corregido) y CORS con lista blanca (H-04).
- Respuesta uniforme en recuperación de contraseña (H-01) y longitud mínima en el registro (H-05).
- Evaluaciones como `INSERT` con historial y evaluación vigente con `LATERAL` (H-06).
- Historial de `instructor_ficha` con índice único parcial y `CHECK` coherente entre `estado` y `fecha_fin` (H-07).
- `SELECT ... FOR UPDATE` en el cupo al unirse.
- Reglas de negocio puras en `reglas.js`, fáciles de probar.
- `docker-compose.yml` con healthchecks, `nginx.conf`, Node 22 y puerto 4000 unificados (H-12).
- Seed reescrito para reflejar el flujo real (H-11), ruta duplicada eliminada (H-09), `nodemailer` fuera del frontend (H-14).
- Documentación extensa y trazable (RF ↔ HU ↔ RN).

---

## 8. Estado de los hallazgos de v11

| ID | Hallazgo | Estado verificado |
|---|---|---|
| H-01 | Enumeración de usuarios | Corregido |
| H-02 | Secreto JWT por defecto | Corregido (`grep zenda_secret_key` sin resultados) |
| H-03 | Enlace de recuperación fijo | Corregido vía `FRONTEND_URL` |
| H-04 | CORS abierto | Corregido |
| H-05 | Contraseña sin longitud mínima | Corregido |
| H-06 | Recalificar sobrescribe | Corregido (con carreras, ver C-06) |
| H-07 | Reasignar borra historial | Corregido |
| H-08 | Observaciones sin `evidencia_id` | **Abierto** |
| H-09 | `GET /programas` duplicado | Corregido |
| H-10 | Mensajes informales | Corregido según los commits; revisar el resto del frontend |
| H-11 | Seed inconsistente | Corregido |
| H-12 | Dockerfiles | Corregido; falta probarlo |
| H-13 | Token en `localStorage` | **Abierto** |
| H-14 | `nodemailer` en frontend | Corregido |
| H-15 | CRLF mezclado | **Abierto** (sin `.gitattributes`) |
| H-16 | Versiones con `^` | **Abierto** |

---

## 9. Plan de corrección priorizado

### Antes de la semana 3 (bloqueantes)

- [ ] **C-01** Token de reset con `purpose` y rechazo en `auth`.
- [ ] **C-02** Añadir `helmet` y `express-rate-limit` (o corregir el plan).
- [ ] **C-05** Identificar `General` por columna o por código; `UNIQUE` por ficha; unificar con RN-006.
- [ ] **C-04** Reordenar la migración y probarla sobre una base v11 con datos.
- [ ] **C-03** Suite de integración con Supertest para HU-014, 015, 023, 024, 025 y 011.
- [ ] **C-07** Validar `ubicacion` en el servidor (solo `http/https`).

### Seguridad y consistencia

- [ ] **C-06** Bloqueos en la cascada y en RN-007; `clock_timestamp()` o criterio por id.
- [ ] Confirmación de la aprobación en bloque (HU-024).
- [ ] Mostrar porcentaje y "N de M carpetas aprobadas" en `Fases.jsx` (HU-025).
- [ ] Registro: 4 casillas legales validadas en el backend, medidor y bloqueo de pegado, validación de `tipo_documento` y del correo (HU-001).
- [ ] `evidencia_id` en observaciones (HU-026).

### Alcance que hay que declarar

- [ ] HU-020 (archivos reales): implementarla o moverla explícitamente a otra semana en el plan y el backlog.
- [ ] Cupo (RN-009): decidir con el instructor el rango y el valor por defecto, y documentarlo; definir cómo se edita el cupo.
- [ ] Decidir si un aprendiz puede unirse a un grupo de otra ficha.

### Limpieza

- [ ] Corregir CHANGELOG y todas las rutas a `001_v12.sql`; decidir la convención de nombre de migraciones.
- [ ] Corregir `env.js` (`.env.example`), la duración del token en la documentación y el `/health` del plan.
- [ ] Eliminar `docs/estados (1).md` y `docs/Conceptos/ee.txt`; añadir `.gitattributes` (`* text=auto eol=lf`).
- [ ] Fijar versiones exactas (H-16) y `packageManager`.
- [ ] `USER node` y `HEALTHCHECK` en el Dockerfile del backend; `rejectUnauthorized: true` con certificados de Neon.
- [ ] Registrar errores en los `catch` de los controladores.
- [ ] Unificar la cascada (una sola fuente) y la función de `General`.
- [ ] Repartir los commits y las revisiones según `reparto-equipo.md`, y trabajar con PRs hacia `develop`.

---

## 10. Cómo comprobar los puntos principales

```bash
# C-02: seguridad que el plan promete
grep -rn -i "helmet\|rate-limit\|ratelimit" backend/src backend/package.json   # hoy: sin resultados

# C-01: token de sesión usado como token de reset (con el servidor en marcha)
curl -X POST http://localhost:4000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"<TOKEN_DE_SESION>","contrasena":"NuevaClave123"}'
# Esperado tras la corrección: 400. Hoy: 200

# C-05: proyecto llamado "General" que evade RN-007
# 1) crear proyecto con nombre_grupo = "General"  2) intentar crear otro  → hoy se permite

# C-04: migración sobre base v11 (con datos)
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f Database/migrations/2026-10-22-semana2.sql

# H-16 / D-05: dependencias con rango
grep -c '"\^' backend/package.json frontend/package.json
```
