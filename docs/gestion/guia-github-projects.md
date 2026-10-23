# Guía para configurar GitHub Projects, etiquetas e identidades — ZENDA

<!--
  ¿Qué? Pasos para abrir el Project, importar el backlog, crear etiquetas e hitos y unificar las identidades de Git.
  ¿Para qué? Que el tablero refleje el backlog real y que el historial muestre a los cuatro integrantes.
  ¿Impacto? T7 evalúa el reparto del trabajo, el historial distribuido y la revisión de código; sin tablero ni identidades no hay evidencia.
-->

---

## 1. Antes de empezar

| Requisito | Detalle |
|---|---|
| Permiso en el repositorio | Rol **Admin** o **Maintain** para crear el Project, etiquetas e hitos. |
| GitHub CLI (opcional, recomendado) | `gh --version` y `gh auth login` con scopes `repo` y `project`. |
| Backlog | [`backlog.csv`](backlog.csv), con las 42 HU y su reparto. |
| Fecha de referencia | Semana 1: 19–23 de octubre de 2026. |

```bash
# Autenticación con los permisos que necesita el script
gh auth login --scopes repo,project
gh auth status
```

> El script `scripts/gestion/crear-issues.ps1` crea etiquetas, hitos e issues a partir del CSV. Es idempotente: si un issue con el mismo título ya existe, lo omite. Se puede ejecutar por partes con `-SoloEtiquetas` o `-SoloHitos`.

---

## 2. Crear el Project

1. En GitHub, abre el repositorio `player7842/ZENDA`.
2. Ve a **Projects → New project**.
3. Elige la plantilla **Team planning** (o **Board**) y ponle **ZENDA — Backlog v12**.
4. En **Settings → Custom fields**, crea estos campos con el tipo indicado:

| Campo | Tipo | Opciones |
|---|---|---|
| **Estado** | Single select | `Backlog`, `Listo`, `En curso`, `En revisión`, `Hecho`, `Bloqueado` |
| **Prioridad** | Single select | `Alta`, `Media`, `Baja` |
| **Módulo** | Single select | `Autenticación`, `Administración`, `Grupos y proyectos`, `Fases y evidencias`, `Evaluación`, `Tareas`, `Seguimiento`, `Reportes`, `Lista de chequeo`, `Interfaz y legal` |
| **Rol** | Text | — |
| **Semana** | Single select | `Semana 1` … `Semana 6`, `Hecho (v11)` |
| **Tamaño** | Single select | `S`, `M`, `L` |
| **Responsable** | Text | — |
| **Revisor** | Text | — |

5. En **Settings → Workflows**, activa **Auto-add to project** para que los issues nuevos del repositorio entren al tablero.

> El campo **Estado** del Project es independiente del estado de la matriz de trazabilidad. En el Project significa el avance del trabajo; en la matriz significa si la HU está implementada, parcial o planificada.

---

## 3. Importar el backlog

### Opción A — Importar el CSV como borradores (rápida)

1. Abre el Project → **⋯ → Import items** (o **Add items → Import from CSV**).
2. Selecciona [`backlog.csv`](backlog.csv).
3. Verifica que la columna **Title** se haya usado como título.
4. Los campos que no se importen se completan después con **Bulk edit** o con el script.

> GitHub Projects importa cada fila como **draft issue**. Es útil para ver el tablero de inmediato, pero los borradores no tienen número de issue ni etiquetas. Para trazabilidad completa usa la opción B.

### Opción B — Crear issues reales con el script (recomendada)

```powershell
# Desde la raíz del repositorio, con GitHub CLI autenticado
pwsh ./scripts/gestion/crear-issues.ps1 -Owner player7842 -Repo ZENDA

# Solo etiquetas e hitos, sin crear issues
pwsh ./scripts/gestion/crear-issues.ps1 -Owner player7842 -Repo ZENDA -SoloEtiquetas

# Crear los issues y añadirlos a un Project (número visible en la URL del Project)
pwsh ./scripts/gestion/crear-issues.ps1 -Owner player7842 -Repo ZENDA -Project 1
```

El script:

- Crea las etiquetas que falten (`funcionalidad`, `prioridad-*`, `modulo-*`, `semana-*`).
- Crea los hitos `Semana 1` … `Semana 6`.
- Crea un issue por HU con el cuerpo y las etiquetas, y lo asigna al hito de su semana.
- Omite los títulos ya existentes.
- Si se pasa `-Project`, agrega cada issue al Project.

> **No ejecutes el script dos veces con `-Project` distinto**: busca por título y omite duplicados. Si un issue quedó mal, ciérralo o edítalo a mano; no lo borres si ya tiene PR asociado.

---

## 4. Etiquetas e hitos

### Etiquetas

| Grupo | Etiquetas |
|---|---|
| Tipo | `funcionalidad`, `defecto`, `mejora-tecnica`, `documentacion` |
| Prioridad | `prioridad-alta`, `prioridad-media`, `prioridad-baja` |
| Módulo | `modulo-auth`, `modulo-administracion`, `modulo-proyecto`, `modulo-evidencias`, `modulo-evaluacion`, `modulo-tareas`, `modulo-seguimiento`, `modulo-reportes`, `modulo-lista-chequeo`, `modulo-ui`, `modulo-bd`, `modulo-docker`, `modulo-docs` |
| Estado | `listo-para-trabajar`, `en-curso`, `bloqueado`, `necesita-informacion` |
| Origen | `instructor`, `requisito`, `hallazgo` |

### Hitos

| Hito | Fecha objetivo | Contenido |
|---|---|---|
| Semana 1 | 23 oct 2026 | Gate Docker, CI, backlog y reparto |
| Semana 2 | 30 oct 2026 | Núcleo y primeras pruebas |
| Semana 3 | 6 nov 2026 | Despliegue, backup y archivos |
| Semana 4 | 13 nov 2026 | Calidad y lista de chequeo |
| Semana 5 | 20 nov 2026 | Documentación y congelación |
| Semana 6 | 27 nov 2026 | Entrega |

Las fechas son las del roadmap; si el equipo se retrasa, se mueve el hito y se anota en la retrospectiva.

---

## 5. Mapear las identidades de Git

T7 revisa el historial. Hoy la historia solo muestra dos autores; hay que unificar nombres y correos para que aparezcan los cuatro.

### 5.1. Cada integrante configura su máquina

```bash
git config --global user.name "Nombre Apellido"
git config --global user.email "correo@ejemplo.com"
```

| Integrante | Nombre sugerido | Correo |
|---|---|---|
| Hernán Eduardo Robledo Montaña | `Hernán Eduardo Robledo Montaña` | `rbldhernan@gmail.com` (ya en la historia) |
| Leyner David Buitrago Thomas | `Leyner David Buitrago Thomas` | _completar_ |
| Nicolás Aparicio Camacho | `Nicolás Aparicio Camacho` | `nicoapariciocamacho@gmail.com` (ya en la historia) |
| Omar David González Cardozo | `Omar David González Cardozo` | _completar_ |

> Usa el mismo correo en GitHub (**Settings → Emails**) y en Git. Si quieres ocultar el correo, usa el correo `noreply` de GitHub en ambos lugares.

### 5.2. Completar `.mailmap`

El archivo `.mailmap` de la raíz unifica cómo se muestran los autores sin reescribir la historia. Ya tiene mapeados los dos autores existentes; completa las dos líneas pendientes:

```text
Leyner David Buitrago Thomas <correo@ejemplo.com> Leyner <correo@ejemplo.com>
Omar David González Cardozo <correo@ejemplo.com> Omar <correo@ejemplo.com>
```

Verifica:

```bash
git shortlog -sne --all
git log --format="%an <%ae>" | sort -u
```

Deben aparecer los cuatro nombres, sin variantes como `Hernan` sin tilde, `nicolas-22-ux` ni correos repetidos.

### 5.3. Si un integrante ya hizo commits con otro correo

No reescribas la historia compartida sin avisar. Primero agrega la equivalencia al `.mailmap`; si de verdad hace falta reescribir, se hace con `git filter-repo` en una ventana acordada y todos vuelven a clonar.

---

## 6. Protección de ramas y flujo de PR

En **Settings → Branches**, crea reglas para `main` y `develop`:

| Ajuste | `main` | `develop` |
|---|:---:|:---:|
| Exigir Pull Request | ✅ | ✅ |
| Aprobaciones requeridas | 1 | 1 |
| Descartar aprobaciones al subir cambios | ✅ | ✅ |
| Exigir CI en verde | ✅ | ✅ |
| Exigir rama actualizada | ✅ | — |
| Prohibir force push | ✅ | ✅ |
| Prohibir borrar la rama | ✅ | ✅ |

**Cada semana, como mínimo:**

1. Cada integrante abre un PR desde `feat/<issue>-<descripcion>` hacia `develop`.
2. Otro integrante lo revisa y aprueba.
3. La CI queda en verde.
4. Se fusiona con **Squash and merge** y se borra la rama.

> El detalle del flujo está en [`flujo-github.md`](../Colaboracion/flujo-github.md). Esta guía solo cubre la configuración inicial.

---

## 7. Lista de verificación de la Semana 1

- [ ] Project **ZENDA — Backlog v12** creado con los campos de la sección 2.
- [ ] Backlog importado (42 HU visibles).
- [ ] Etiquetas e hitos creados.
- [ ] Issues reales creados con el script (si se eligió la opción B).
- [ ] Los cuatro integrantes tienen `user.name` y `user.email` configurados.
- [ ] `.mailmap` completo y `git shortlog -sne --all` muestra cuatro nombres.
- [ ] Reglas de protección activas en `main` y `develop`.
- [ ] Cada integrante tiene al menos una HU asignada en el tablero.
- [ ] El primer PR de la semana tiene revisor asignado.

---

## Documentos relacionados

- [Backlog importable](backlog.csv) · [Reparto del equipo](reparto-equipo.md)
- [Flujo de GitHub](../Colaboracion/flujo-github.md) · [Revisión de código](../Colaboracion/revision-de-codigo.md)
- [Matriz de trazabilidad](../Requisitos/matriz-trazabilidad.md)
