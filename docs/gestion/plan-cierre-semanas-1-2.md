# Plan de cierre de Semanas 1 y 2 — ZENDA

<!--
  ¿Qué? Plan para cerrar al 100 % las Semanas 1 y 2 antes de iniciar la Semana 3.
  ¿Para qué? Que ninguna HU marcada "Implementado" tenga criterios de aceptación sin cumplir y que la documentación coincida con el código.
  ¿Impacto? Evita construir la Semana 3 sobre una base con brechas funcionales y documentales.
-->

> **Estado:** propuesto, pendiente de aprobación.
> **Fecha:** 24 de octubre de 2026.
> **Rama de trabajo:** `develop`.
> **Alcance:** únicamente el cierre de Semanas 1 y 2. **No** incluye las 8 HU de la Semana 3 ni el despliegue público.

---

## 1. Punto de partida

| Indicador | Estado actual |
|---|---|
| Backlog | 25 Implementado · 9 Parcial · 8 Planificado |
| HU de Semana 2 en `Parcial` | 0 |
| Pruebas | 9 unitarias + 8 de integración = **17/17** |
| CI | Verde sobre `855dfb6` |
| Documentación | Conteos globales correctos; ~20 causas raíz de desactualización |
| Despliegue público | Sigue sirviendo v11; el código actual no está desplegado |

### 1.1. Brechas funcionales detectadas

| # | Brecha | Evidencia | Tipo |
|---|---|---|---|
| B-01 | HU-002 · CA-002.4: falta el botón “Volver al inicio” en el login | `frontend/src/components/Auth/Login.jsx` | Código |
| B-02 | RF-028: no se valida que `fecha_limite` sea posterior a `fecha_inicio` | `backend/src/controllers/aprendizController/tareaController.js` | Código |
| B-03 | RF-001 / RS-006: faltan honeypot y verificación de correo | `backend/src/controllers/adminController/authController.js`, `frontend/src/components/Auth/Register.jsx` | Código |
| B-04 | HU-042 · CA-042.4: año fijo y sin enlaces legales en el pie | `frontend/src/pages/Home.jsx` | Código + alcance |
| B-05 | HU-033: alerta de “>15 días sin evidencias” simulada | `frontend/src/pages/coordinador/Resumen.jsx` | Código / estado |
| B-06 | H-13: token en `localStorage` | `frontend/src` | Seguridad |

### 1.2. Brechas documentales principales

| Documento | Problema |
|---|---|
| `docs/Requisitos/restricciones.md` | La tabla de desviaciones describe 11 problemas; 10 ya están corregidos. |
| `docs/Referencia-Tecnica/arquitectura.md` | Presenta como “hoy” el estado de v11: `services/` inexistente, sin pruebas, CORS abierto, migración no probada. |
| `docs/Testing/matriz-cobertura.md` | RF-024 sigue como `Planificado¹`; la nota aritmética dice `97/31/32` cuando corresponde `97/34/29`. |
| 9 RF (`RF-001`, `011`, `014`, `015`, `023`, `024`, `025`, `026`, `028`) | Estado `Parcial`/`Planificado` aunque su HU y el backlog dicen `Implementado`. |
| `docs/gestion/reparto-equipo.md` | Cargas y asignaciones no coinciden con `backlog.csv`; HU-028 aparece como pendiente y HU-038 con otro dueño. |
| `docs/Colaboracion/flujo-github.md` | Promete plantillas de PR/issues y un job `docker` que no existen; dice que la integración llega “más adelante”. |
| `docs/Referencia-Tecnica/api-endpoints.md` | Falta `nombre_grupo`; respuestas de aprobación y observación incorrectas; códigos de autenticación desactualizados. |
| `docs/Referencia-Tecnica/esquema-bd.md` | Dice que las funciones de cascada no están en `zenda_bd.sql`; confunde `DEFERRABLE` con validación al commit. |
| `docs/Testing/pruebas-unitarias.md` | Documenta funciones que no existen (`porcentajeFase`, `carpetasAprobadas`, `tieneCupo`, `generarCodigoGrupo`). |
| `docs/Testing/plan-de-pruebas.md` | Dice “6 automatizados” y mantiene riesgos de v11 ya resueltos. |
| `docs/Diagramas/componentes.md` | Dice “20 tablas”; el esquema tiene 14. |
| `docs/Conceptos/*` | Repite 21 dependencias con `^`, `nodemailer` en frontend, CORS abierto, MinIO y `ARG NODE_VERSION`. |

El detalle completo está en la auditoría de solo lectura del 24-oct-2026 y se corregirá en la fase documental de este plan.

---

## 2. Definición de “Semanas 1 y 2 cerradas”

Se considera cerrado cuando se cumplan **todos** estos puntos:

1. Ninguna HU de Semanas 1–2 queda `Parcial` por un criterio de aceptación sin cumplir.
2. Las HUs de v11 que el acta declara corregidas no tienen brechas abiertas, o quedan `Parcial` con el pendiente escrito.
3. H-13 está cerrado o aceptado formalmente con su riesgo residual.
4. Las pruebas nuevas cubren cada corrección y el total sigue verde.
5. `backlog.csv`, `matriz-trazabilidad.md` y `matriz-cobertura.md` coinciden entre sí y con el código.
6. `restricciones.md`, `arquitectura.md`, `api-endpoints.md`, `esquema-bd.md` y `Testing/*` describen el código real.
7. Enlaces y anclas de documentación: 0 rotos.
8. Lint, pruebas, build y CI en verde.
9. Los cambios están publicados en `origin/develop`.

---

## 3. Alcance

### Dentro del alcance

- B-01 a B-06.
- Pruebas unitarias y de integración de cada corrección.
- Actualización de estados y conteos en backlog, trazabilidad y cobertura.
- Barrido documental completo (fase 2 de este plan).
- Verificación final y push.

### Fuera del alcance

- Las 8 HU de la Semana 3 (HU-007, 008, 012, 013, 018, 022, 030, 035).
- Las HU de Semanas 4–5 que no sean necesarias para cerrar H-13 o HU-042.
- Despliegue en Render/Vercel/Neon.
- Rotación de credenciales del seed, salvo que se autorice un despliegue.
- Nuevas funcionalidades no exigidas por un CA o una restricción.

---

## 4. Paquetes de trabajo

Las estimaciones son esfuerzo orientativo en días-persona; no son fechas comprometidas.

| WP | Alcance | Archivos principales | Criterio de aceptación | Pruebas | Est. |
|---|---|---|---|---|---:|
| **WP-01** | Botón “Volver al inicio” en el login | `frontend/src/components/Auth/Login.jsx` | El login muestra un enlace visible a `/`; no interfiere con el formulario | Verificación manual + build | 0,5 |
| **WP-02** | Validación de fechas de tareas | `backend/src/controllers/aprendizController/tareaController.js`, `backend/src/domain/reglas.js` | `fecha_limite < fecha_inicio` responde `400` con mensaje claro; fechas inválidas también se rechazan | Unitaria de la regla + integración | 0,5 |
| **WP-03** | Honeypot y verificación de correo | `authController.js`, `Register.jsx`, `mailer.js`, `Database/migrations/003_cierre.sql`, rutas de auth | El registro rechaza bots por honeypot; el correo debe verificarse antes de activar la cuenta; los usuarios existentes quedan verificados | Unitarias + integración + manual de correo | 2–3 |
| **WP-04** | Pie de página y páginas legales | `Home.jsx`, rutas públicas, páginas de términos/privacidad/cookies | Año calculado con `new Date().getFullYear()`; enlaces legales funcionan; HU-039 y HU-042 quedan coherentes | Build + revisión visual + enlaces | 1–2 |
| **WP-05** | Alerta real de 15 días | `coordinadorController.js`, `Resumen.jsx` | El dashboard cuenta grupos sin evidencias en los últimos 15 días; no usa porcentajes simulados | Integración + manual | 1 |
| **WP-06** | H-13 / HU-004: sesión segura | `authController.js`, `middleware/auth.js`, `api.js`, `AuthContext` o equivalente, `Database/migrations/003_cierre.sql` | Access token de 15 min, refresh de 7 días con rotación, logout que revoca, inactividad de 30 min con aviso; refresh en cookie `HttpOnly` | Unitarias + integración + manual | 3–4 |
| **WP-07** | Consistencia menor | `tareaController.js` | El mensaje dice “líder del grupo”, no “Scrum Master” | Revisión + prueba existente | 0,25 |
| **WP-08** | Barrido documental | Ver sección 7 | Documentos alineados con el código; 0 enlaces rotos | Revisión + script de enlaces | 2–3 |
| **WP-09** | Verificación y publicación | Todo el repo | Lint, pruebas, build, CI y push | Suite completa | 0,5 |

**Esfuerzo total:** ~11–15 días-persona. Con trabajo paralelo de 2–3 personas, el calendario realista es **4–6 días hábiles**.

---

## 5. Decisiones que hay que tomar antes de empezar

| ID | Decisión | Opción A | Opción B | Recomendación |
|---|---|---|---|---|
| **DG-1** | Verificación de correo (B-03) | Implementarla completa: token, correo, pantalla de verificación y bloqueo de login | Implementar solo honeypot y marcar RF-001 `Parcial` | **A** si el instructor exige RS-006; **B** si se acepta dejar la verificación para Semana 4 |
| **DG-2** | Enlaces legales (B-04) | Hacer HU-039 ahora con tres páginas mínimas | Dejar HU-042 `Parcial` hasta Semana 5 | **A**: cierra HU-039 y HU-042 de una vez |
| **DG-3** | Alerta de 15 días (B-05) | Implementar la consulta real | Marcar HU-033 `Parcial` y moverla a Semana 3 | **A**: es acotado y evita un estado falso |
| **DG-4** | H-13 / HU-004 (B-06) | Traer HU-004 al cierre y usar cookie `HttpOnly` para el refresh | Mantener `localStorage`, reducir el token y documentar el riesgo residual | **A** para cerrar H-13 de verdad; **B** si el tiempo no alcanza |
| **DG-5** | `main` y `develop` sin ancestro común | Reconstruir `main` desde `develop` con una decisión de release | Mantener `main` como histórico y publicar solo desde `develop` | Decidir antes de la entrega final; no bloquea el cierre funcional |

> Sin DG-1 a DG-4 aprobadas no se puede afirmar que las Semanas 1–2 quedan cerradas. La opción B en cualquiera de ellas obliga a cambiar el estado de la HU a `Parcial` y a escribir el pendiente.

---

## 6. Orden de ejecución

### Fase 0 — Decisiones y preparación

- Aprobar DG-1 a DG-4.
- Crear una rama de trabajo, por ejemplo `cierre/semanas-1-2`.
- Confirmar el alcance de la migración `003_cierre.sql`.
- Respaldar la base local antes de migrar.

### Fase 1 — Correcciones rápidas

1. WP-01: botón del login.
2. WP-02: validación de fechas.
3. WP-05: alerta real de 15 días.
4. WP-07: mensaje “Scrum Master”.

Cada WP se cierra con su prueba y su actualización de estado.

### Fase 2 — Correcciones grandes

1. WP-03: honeypot y verificación de correo.
2. WP-04: pie y páginas legales.
3. WP-06: sesión segura y H-13.

WP-03 y WP-06 comparten migración; se hacen en ese orden para no reabrir el esquema.

### Fase 3 — Pruebas y verificación funcional

- Ejecutar unitarias e integración con PostgreSQL real.
- Probar el flujo de registro, verificación, login, refresh, inactividad y logout.
- Probar el dashboard del coordinador con datos reales.
- Revisar el pie y las páginas legales en escritorio y móvil.

### Fase 4 — Barrido documental

- Aplicar la sección 7 en el orden de prioridad.
- Revisar que `backlog.csv` siga siendo la fuente de verdad.
- Ejecutar el verificador de enlaces y anclas.

### Fase 5 — Publicación

- Revisar `git diff`.
- Commits por bloque.
- Push a `origin/develop`.
- Confirmar CI verde.

---

## 7. Plan de corrección documental

Se ejecuta **después** de que el código esté cerrado, para no documentar dos veces el mismo cambio.

### 7.1. Prioridad 0 — Contradicciones con el código

| Documento | Corrección |
|---|---|
| `docs/Requisitos/restricciones.md` | Reescribir “Desviaciones frente al código actual”: 10 de 11 resueltas; dejar solo `Tareas.tsx`. Actualizar RH-002, RH-003, RS-001, RS-002, RO-003, RI-002, RT-007 y RT-008. |
| `docs/Referencia-Tecnica/arquitectura.md` | Separar “v11” de “estado actual”; actualizar `services/`, pruebas, CORS, migración y deuda técnica. |
| `docs/Testing/matriz-cobertura.md` | Pasar RF-024 a `Implementado`; recalcular a `97/34/29` o justificar el estado con una nota correcta. |
| `docs/Requisitos/RFs/RF-001, 011, 014, 015, 023, 024, 025, 026, 028` | Alinear el campo `Estado` con la HU y el backlog; quitar “(propuesto)” de RF-024. |
| `docs/gestion/reparto-equipo.md` | Recalcular cargas (5/7/4/1), corregir la semana de HU-028 y el dueño de HU-038. |
| `docs/Colaboracion/flujo-github.md` | Quitar plantillas y job `docker` inexistentes; decir que la integración ya corre en CI; corregir la ruta de `git add`. |
| `docs/Referencia-Tecnica/api-endpoints.md` | Añadir `nombre_grupo`; corregir respuestas de aprobación y observación; actualizar códigos de auth y JWT `tv`. |
| `docs/Referencia-Tecnica/esquema-bd.md` | Corregir el párrafo de funciones, `DEFERRABLE INITIALLY IMMEDIATE` y `estado_proyecto` con `Pausado`. |
| `docs/Testing/pruebas-unitarias.md` | Cambiar los contratos por `calcularEstadoFase`, `calcularProgreso`, `puedeUnirse` y `generarCodigoProyecto`. |
| `docs/Testing/plan-de-pruebas.md` | 8 integraciones automatizadas; actualizar la tabla de riesgos. |
| `docs/Diagramas/componentes.md` | 14 tablas; `services` existente; quitar `🆕` de lo ya construido. |
| `docs/Conceptos/*` | Corregir dependencias exactas, `nodemailer`, CORS, MinIO, `NODE_VERSION`, servicios y versionado. |

### 7.2. Prioridad 1 — Detalles técnicos

- `docs/Testing/pruebas-no-funcionales.md`: 54/28, no 49/33; revisar PNF-D04, PNF-I01 y PNF-I07.
- `docs/Testing/pruebas-de-integracion.md`: `409` por correo duplicado, `401` por contraseña incorrecta, quitar la columna `vigente`, corregir aislamiento y reloj.
- `docs/Testing/casos/*`: estados de RF y mensajes reales.
- `docs/gestion/guia-github-projects.md`: checklist de Semana 1, autores reales, `.mailmap` y script de issues.
- `docs/Setup/sin-docker.md`: funciones de cascada y validez de `chk_evidencias_ubicacion`.
- `docs/Setup/variables-de-entorno.md`: `DB_SSL` con `DATABASE_URL`.
- `docs/Setup/con-docker.md`: usuario y healthcheck del frontend.
- `docs/Diagramas/modelo-dominio.md`, `mer-mr.md`, `estados.md`: cardinalidades, versionado, lista de chequeo y cupo.
- `docs/Conceptos/patrones-arquitectonicos.md`: cascada, `vigente`, borrado lógico y `fecha_actualizacion`.
- `docs/gestion/plan-de-implantacion.md`: incluir el HEAD actual y ajustar “Semana 1 cerrada”.

### 7.3. Prioridad 2 — Histórico y menores

- `docs/Testing/hallazgos.md`: dejar claro que la sección 2 es histórica de v11; no reescribir el registro.
- `docs/Requisitos/restricciones.md`: fecha de entrega vencida y `.nvmrc`/`engines`.
- `docs/Diagramas/modelo-dominio.md`: quitar la referencia al glosario inexistente.
- `README.md`, `CHANGELOG.md`, `SEMANA-1-2-IMPLEMENTACION-DEFINITIVO.md`: ajustar solo lo que cambie con el cierre.

### 7.4. Reglas del barrido

1. `docs/gestion/backlog.csv` es la fuente de verdad de estados.
2. No se marca `Implementado` una HU con un CA pendiente.
3. No se reescribe el texto histórico de la auditoría; se añade una nota de resolución.
4. Cada cambio de estado se refleja en HU, RF, trazabilidad y cobertura.
5. Cada conteo se verifica con un script, no a ojo.
6. Al final: 0 enlaces y 0 anclas rotas.

---

## 8. Plan de pruebas

| Nivel | Qué se agrega |
|---|---|
| Unitarias | Regla de fechas de tareas; cualquier helper nuevo de sesión. |
| Integración | Fechas inválidas, honeypot, verificación de correo, refresh/logout, alerta de 15 días. |
| Manual | Botón del login, pie legal, flujo de verificación y aviso de inactividad. |
| Regresión | Las 17 pruebas actuales deben seguir pasando. |
| Documentación | Verificador de enlaces y anclas. |

**Resultado esperado:** el total sube de 17 a aproximadamente **20–23 pruebas**, según DG-1 y DG-4. El número exacto se fija al cerrar los WP.

---

## 9. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| La verificación de correo bloquea a usuarios existentes | Alto | Migración con `correo_verificado = true` para usuarios y seed; probar login de admin, instructor y aprendiz. |
| HU-004 rompe todas las sesiones | Alto | Desplegar con compatibilidad temporal; probar refresh, logout y token vencido; documentar el cambio. |
| El refresh en cookie `HttpOnly` exige CORS con credenciales | Medio | Configurar `credentials: true` y origen exacto; probar en local y Docker. |
| Las páginas legales no se pueden inventar | Medio | Usar la política de tratamiento de datos del SENA y revisar con el instructor. |
| El barrido documental introduce nuevas contradicciones | Medio | Fuente de verdad única, script de conteos y revisión por pares. |
| `main` y `develop` no comparten historia | Alto para la entrega | Decidir DG-5 antes del release; no intentar un merge normal. |
| El tiempo no alcanza para todo | Medio | Recortar por decisión explícita: marcar `Parcial` y documentar, nunca simular que está cerrado. |

---

## 10. Criterios de aceptación del plan

- [ ] B-01 a B-06 resueltas o marcadas `Parcial` con justificación aprobada.
- [ ] H-13 cerrado o aceptado por escrito.
- [ ] Todas las HU de Semanas 1–2 sin CA pendiente.
- [ ] Pruebas nuevas y regresión en verde.
- [ ] `backlog.csv`, trazabilidad y cobertura coinciden.
- [ ] Documentación de prioridad 0 y 1 corregida.
- [ ] 0 enlaces y anclas rotos.
- [ ] Lint, build y CI en verde.
- [ ] Push a `origin/develop`.

---

## 11. Commits sugeridos

| Commit | Contenido |
|---|---|
| `fix(hu-002): agregar volver al inicio en el login` | WP-01 |
| `fix(hu-028): validar orden de fechas de tareas` | WP-02 |
| `feat(rs-006): honeypot y verificacion de correo` | WP-03 |
| `feat(hu-039): paginas legales y pie dinamico` | WP-04 |
| `feat(hu-033): alerta real de grupos sin evidencias` | WP-05 |
| `feat(hu-004): sesion con refresh y cierre por inactividad` | WP-06 |
| `fix(hu-030): mensaje de confirmacion del lider` | WP-07 |
| `test(cierre): cubrir las brechas de semanas 1-2` | Pruebas |
| `docs(cierre): alinear la documentacion con el codigo` | WP-08 |
| `chore(cierre): verificar y publicar` | WP-09 |

---

## 12. Próximo paso

1. Confirmar DG-1 a DG-4 (y idealmente DG-5).
2. Aprobar este plan.
3. Crear la rama `cierre/semanas-1-2`.
4. Empezar por la Fase 1 (WP-01, WP-02, WP-05 y WP-07).

> Mientras no se aprueben las decisiones, no se modifica código ni documentación existente.
