# Reparto del trabajo por integrante — ZENDA

<!--
  ¿Qué? Asignación de cada historia de usuario a un responsable y a un revisor, con la carga estimada.
  ¿Para qué? Que el historial de Git y los PR reflejen trabajo distribuido y que cada integrante pueda explicar el sistema completo.
  ¿Impacto? T7 evalúa el historial distribuido, la revisión de código y la explicación individual; sin reparto explícito el trabajo se concentra.
-->

---

## 1. Criterio del reparto

| Criterio | Aplicación |
|---|---|
| **Un responsable por HU** | Cada fila de `backlog.csv` tiene un dueño. Nadie trabaja una HU sin dueño. |
| **Un revisor distinto del autor** | Cada PR lo aprueba alguien que no lo escribió. Parejas fijas para evitar cuellos de botella. |
| **Carga equilibrada por esfuerzo** | Se estima en puntos: `S` = 1, `M` = 2, `L` = 3. La meta es 14–17 puntos pendientes por persona. |
| **Rotación de módulos** | Nadie queda dueño de un solo módulo: todos tocan backend, frontend y base de datos a lo largo de las seis semanas. |
| **Documentación compartida** | Los documentos transversales (plan de implantación, manuales, retrospectiva) se escriben entre todos, con un facilitador. |

> **Regla de oro:** una HU no se considera terminada si no tiene pruebas, documentación actualizada y un PR aprobado por otra persona.

---

## 2. Carga por integrante

### Hernán Eduardo Robledo Montaña — liderazgo, autenticación y administración

| HU | Título | Semana | Tamaño | Revisor |
|---|---|---|---|---|
| HU-001 | Registro de aprendiz | Semana 2 | M | Nicolás Aparicio |
| HU-003 | Recuperación de contraseña | Semana 5 | S | Nicolás Aparicio |
| HU-004 | Sesión segura | Semana 4 | M | Nicolás Aparicio |
| HU-007 | Desactivación y eliminación de usuarios | Semana 3 | S | Nicolás Aparicio |
| HU-011 | Asignación de instructores a fichas | Semana 2 | M | Nicolás Aparicio |
| HU-013 | Diagnóstico y copia de seguridad | Semana 3 | L | Nicolás Aparicio |
| HU-018 | Reasignación de liderazgo | Semana 3 | L | Nicolás Aparicio |
| HU-026 | Observaciones del instructor | Semana 2 | S | Nicolás Aparicio |

- **Pendientes:** 8 HU · **15 puntos** · **Total en el backlog:** 12 HU (4 ya implementadas en v11).
- **Foco:** autenticación, seguridad, administración, copias de seguridad y despliegue.
- **Responsabilidad adicional:** mantiene `render.yaml`, variables de entorno y la coordinación de la rama `develop`.

### Leyner David Buitrago Thomas — documentación, reportes e interfaz

| HU | Título | Semana | Tamaño | Revisor |
|---|---|---|---|---|
| HU-012 | Gestión de programas de formación | Semana 3 | L | Omar González |
| HU-035 | Reporte en Excel | Semana 3 | M | Omar González |
| HU-037 | Importación, exportación y copia de listas | Semana 4 | L | Omar González |
| HU-039 | Páginas legales y aviso de cookies | Semana 5 | M | Omar González |
| HU-040 | Tema e interfaz del panel | Semana 4 | M | Omar González |
| HU-041 | Mensajes guiados | Semana 5 | M | Omar González |

- **Pendientes:** 6 HU · **14 puntos** · **Total en el backlog:** 8 HU (2 ya implementadas en v11).
- **Foco:** reportes, interfaz, textos legales y documentación.
- **Responsabilidad adicional:** es el **facilitador de documentación**: coordina el plan de implantación, el manual de usuario, el CHANGELOG y las actas. Esa carga no se cuenta como HU y explica su menor número de historias.

### Nicolás Aparicio Camacho — grupos, evidencias y listas de chequeo

| HU | Título | Semana | Tamaño | Revisor |
|---|---|---|---|---|
| HU-008 | Carga masiva de usuarios | Semana 3 | L | Hernán Robledo |
| HU-014 | Creación de proyecto | Semana 2 | M | Hernán Robledo |
| HU-015 | Unirse a un proyecto | Semana 2 | M | Hernán Robledo |
| HU-019 | Carpetas de una fase | Semana 2 | M | Hernán Robledo |
| HU-020 | Subida de evidencias | Semana 2 | M | Hernán Robledo |
| HU-022 | Versiones y eliminación de evidencias | Semana 3 | L | Hernán Robledo |
| HU-036 | Creación de lista de chequeo | Semana 4 | L | Hernán Robledo |

- **Pendientes:** 7 HU · **17 puntos** · **Total en el backlog:** 11 HU (4 ya implementadas en v11).
- **Foco:** flujo del aprendiz (proyecto, fases, evidencias) y lista de chequeo.
- **Responsabilidad adicional:** dueño del contrato de la API de proyecto/evidencias y de sus pruebas de integración.

### Omar David González Cardozo — evaluación, tareas y seguimiento

| HU | Título | Semana | Tamaño | Revisor |
|---|---|---|---|---|
| HU-023 | Evaluación de evidencias | Semana 2 | M | Leyner Buitrago |
| HU-024 | Aprobación de carpetas en bloque | Semana 2 | L | Leyner Buitrago |
| HU-025 | Estado y porcentaje de avance | Semana 2 | M | Leyner Buitrago |
| HU-028 | Creación y asignación de tareas | Semana 5 | M | Leyner Buitrago |
| HU-030 | Confirmación de tareas | Semana 3 | M | Leyner Buitrago |
| HU-038 | Evaluación con lista de chequeo | Semana 4 | L | Leyner Buitrago |

- **Pendientes:** 6 HU · **14 puntos** · **Total en el backlog:** 11 HU (5 ya implementadas en v11).
- **Foco:** evaluación en cascada, porcentajes de avance, tareas y seguimiento.
- **Responsabilidad adicional:** mantiene la colección Postman y los casos de prueba de evaluación.

---

## 3. Parejas de revisión

| Autor | Revisor asignado | Regla |
|---|---|---|
| Hernán Robledo | Nicolás Aparicio | Ningún PR se fusiona sin aprobación del revisor. |
| Nicolás Aparicio | Hernán Robledo | Si el revisor no está disponible, revisa Leyner u Omar. |
| Leyner Buitrago | Omar González | La revisión cubre código, pruebas y documentación. |
| Omar González | Leyner Buitrago | Se rota cada semana para que todos revisen a todos. |

**Rotación semanal de revisores** (para que nadie revise siempre a la misma persona):

| Semana | Hernán revisa a | Nicolás revisa a | Leyner revisa a | Omar revisa a |
|---|---|---|---|---|
| 1 | Nicolás | Hernán | Omar | Leyner |
| 2 | Omar | Leyner | Hernán | Nicolás |
| 3 | Nicolás | Hernán | Omar | Leyner |
| 4 | Omar | Leyner | Hernán | Nicolás |
| 5 | Nicolás | Hernán | Omar | Leyner |
| 6 | Todos revisan las correcciones bloqueantes | | | |

> En GitHub, la aprobación se registra en el PR. Un comentario verbal no cuenta para T7.

---

## 4. Compromisos por semana

| Semana | Entregable común | Responsable de consolidar |
|---|---|---|
| 1 | Gate Docker verde, CI, backlog y reparto | Hernán |
| 2 | Núcleo (evaluaciones, `instructor_ficha`, cupo, evidencias) + primeras pruebas | Hernán y Nicolás |
| 3 | Despliegue, backup, archivos y reasignación | Hernán y Omar |
| 4 | Lista de chequeo, cobertura ≥ 60 % e informe de calidad | Omar y Leyner |
| 5 | Manuales, backlog final, retrospectiva y ensayo de demo | Leyner |
| 6 | Correcciones bloqueantes y sustentación | Hernán |

**Mínimo semanal por integrante:**

1. Un PR propio fusionado (o en revisión) con su HU.
2. Una revisión de PR a otra persona.
3. Un commit con su identidad de Git correcta.
4. Diez minutos en la reunión semanal explicando lo que hizo y lo que falta.

---

## 5. Cómo verificar que el reparto se cumple

```bash
# Contribuciones por autor en toda la historia
git shortlog -sne --all

# Autores de la última semana
git log --since="1 week ago" --format="%an <%ae>" | sort | uniq -c | sort -rn

# PRs fusionados por autor (requiere GitHub CLI)
gh pr list --state merged --limit 100 --json author,title --jq '.[] | "\(.author.login)\t\(.title)"'
```

| Señal de alerta | Acción |
|---|---|
| Un integrante concentra más del 50 % de los commits | Repartir la siguiente HU y pedir que otro abra el PR. |
| No hay PRs revisados en la semana | Bloquear la fusión hasta que exista una aprobación. |
| Commits con correo personal distinto | Corregir `user.email` y actualizar `.mailmap`. |
| Una HU sin pruebas ni documentación | No se marca como terminada en el Project. |

---

## Documentos relacionados

- [Backlog importable](backlog.csv) · [Guía de GitHub Projects](guia-github-projects.md)
- [Flujo de GitHub](../Colaboracion/flujo-github.md) · [Guía de contribución](../Colaboracion/guia-de-contribucion.md)
- [Matriz de trazabilidad](../Requisitos/matriz-trazabilidad.md)
