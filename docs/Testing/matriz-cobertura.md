# Matriz de cobertura de pruebas — ZENDA

<!--
  ¿Qué? Relación entre cada requisito funcional y los casos de prueba que lo verifican.
  ¿Para qué? Comprobar que ningún requisito queda sin prueba y saber cuántas pruebas se pueden ejecutar hoy.
  ¿Impacto? Un requisito sin casos es un riesgo sin medir.
-->

---

## Resumen

| Indicador | Valor |
| --- | --- |
| Requisitos funcionales | 42 |
| Casos funcionales | 160 |
| Casos de requisitos **Implementados** | 94 |
| Casos de requisitos **Parciales** | 34 |
| Casos de requisitos **Planificados** | 32 |
| Cobertura de requisitos | 100 % (todos tienen al menos un caso) |

Además de estos casos hay pruebas de [integración](pruebas-de-integracion.md), [unitarias](pruebas-unitarias.md) y [no funcionales](pruebas-no-funcionales.md).

---

## Matriz

| Requisito | Nombre | Módulo | Prioridad | Estado | Casos | Rango de IDs | Niveles |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [RF-001](../Requisitos/RFs/RF-001_registro_de_aprendiz.md) | Registro de aprendiz | Autenticación | Alta | Implementado | 7 | CP-001.1 a CP-001.7 | API, E2E |
| [RF-002](../Requisitos/RFs/RF-002_inicio_de_sesion.md) | Inicio de sesión | Autenticación | Alta | Implementado | 4 | CP-002.1 a CP-002.4 | API, E2E |
| [RF-003](../Requisitos/RFs/RF-003_recuperacion_de_contrasena.md) | Recuperación de contraseña | Autenticación | Alta | Parcial | 4 | CP-003.1 a CP-003.4 | API, E2E |
| [RF-004](../Requisitos/RFs/RF-004_sesion_segura.md) | Sesión segura | Autenticación | Alta | Parcial | 4 | CP-004.1 a CP-004.4 | API, E2E |
| [RF-005](../Requisitos/RFs/RF-005_proteccion_de_rutas_por_rol.md) | Protección de rutas por rol | Autenticación | Alta | Implementado | 3 | CP-005.1 a CP-005.3 | API, E2E |
| [RF-006](../Requisitos/RFs/RF-006_gestion_de_usuarios.md) | Gestión de usuarios | Administración | Alta | Implementado | 5 | CP-006.1 a CP-006.5 | API, E2E |
| [RF-007](../Requisitos/RFs/RF-007_desactivacion_y_eliminacion_de_usuarios.md) | Desactivación y eliminación de usuarios | Administración | Media | Parcial | 4 | CP-007.1 a CP-007.4 | API, E2E |
| [RF-008](../Requisitos/RFs/RF-008_carga_masiva_de_usuarios.md) | Carga masiva de usuarios | Administración | Media | Parcial | 3 | CP-008.1 a CP-008.3 | API, E2E |
| [RF-009](../Requisitos/RFs/RF-009_gestion_de_fichas.md) | Gestión de fichas | Administración | Alta | Implementado | 4 | CP-009.1 a CP-009.4 | API, E2E |
| [RF-010](../Requisitos/RFs/RF-010_aprendices_en_una_ficha.md) | Aprendices en una ficha | Administración | Media | Implementado | 3 | CP-010.1 a CP-010.3 | API, E2E |
| [RF-011](../Requisitos/RFs/RF-011_asignacion_de_instructores_a_fichas.md) | Asignación de instructores a fichas | Administración | Alta | Implementado | 4 | CP-011.1 a CP-011.4 | API |
| [RF-012](../Requisitos/RFs/RF-012_gestion_de_programas_de_formacion.md) | Gestión de programas de formación | Administración | Media | Planificado | 3 | CP-012.1 a CP-012.3 | API, E2E |
| [RF-013](../Requisitos/RFs/RF-013_diagnostico_y_copia_de_seguridad.md) | Diagnóstico y copia de seguridad | Administración | Baja | Planificado | 3 | CP-013.1 a CP-013.3 | API, E2E |
| [RF-014](../Requisitos/RFs/RF-014_creacion_de_proyecto.md) | Creación de proyecto | Grupos y proyectos | Alta | Implementado | 5 | CP-014.1 a CP-014.5 | API, E2E |
| [RF-015](../Requisitos/RFs/RF-015_unirse_a_un_proyecto.md) | Unirse a un proyecto | Grupos y proyectos | Alta | Implementado | 4 | CP-015.1 a CP-015.4 | E2E |
| [RF-016](../Requisitos/RFs/RF-016_consulta_de_mi_proyecto.md) | Consulta de mi proyecto | Grupos y proyectos | Alta | Implementado | 4 | CP-016.1 a CP-016.4 | API, E2E |
| [RF-017](../Requisitos/RFs/RF-017_cambio_de_ficha_del_aprendiz.md) | Cambio de ficha del aprendiz | Grupos y proyectos | Media | Implementado | 3 | CP-017.1 a CP-017.3 | API, E2E |
| [RF-018](../Requisitos/RFs/RF-018_reasignacion_de_liderazgo.md) | Reasignación de liderazgo | Grupos y proyectos | Media | Planificado | 3 | CP-018.1 a CP-018.3 | API, E2E |
| [RF-019](../Requisitos/RFs/RF-019_carpetas_de_una_fase.md) | Carpetas de una fase | Fases y evidencias | Alta | Implementado | 4 | CP-019.1 a CP-019.4 | API, E2E |
| [RF-020](../Requisitos/RFs/RF-020_subida_de_evidencias.md) | Subida de evidencias | Fases y evidencias | Alta | Parcial | 5 | CP-020.1 a CP-020.5 | API |
| [RF-021](../Requisitos/RFs/RF-021_consulta_de_evidencias_y_fases.md) | Consulta de evidencias y fases | Fases y evidencias | Alta | Implementado | 4 | CP-021.1 a CP-021.4 | API, E2E |
| [RF-022](../Requisitos/RFs/RF-022_versiones_y_eliminacion_de_evidencias.md) | Versiones y eliminación de evidencias | Fases y evidencias | Media | Planificado | 5 | CP-022.1 a CP-022.5 | API |
| [RF-023](../Requisitos/RFs/RF-023_evaluacion_de_evidencias.md) | Evaluación de evidencias | Evaluación | Alta | Implementado | 4 | CP-023.1 a CP-023.4 | API, E2E |
| [RF-024](../Requisitos/RFs/RF-024_aprobacion_de_carpetas_en_bloque.md) | Aprobación de carpetas en bloque | Evaluación | Media | Planificado¹ | 3 | CP-024.1 a CP-024.3 | API, E2E |
| [RF-025](../Requisitos/RFs/RF-025_estado_y_porcentaje_de_avance.md) | Estado y porcentaje de avance | Evaluación | Alta | Implementado | 4 | CP-025.1 a CP-025.4 | API, E2E |
| [RF-026](../Requisitos/RFs/RF-026_observaciones_del_instructor.md) | Observaciones del instructor | Evaluación | Alta | Implementado | 3 | CP-026.1 a CP-026.3 | API, E2E |
| [RF-027](../Requisitos/RFs/RF-027_consulta_de_observaciones.md) | Consulta de observaciones | Evaluación | Alta | Implementado | 3 | CP-027.1 a CP-027.3 | E2E |
| [RF-028](../Requisitos/RFs/RF-028_creacion_y_asignacion_de_tareas.md) | Creación y asignación de tareas | Tareas | Alta | Implementado | 4 | CP-028.1 a CP-028.4 | API, E2E |
| [RF-029](../Requisitos/RFs/RF-029_avance_de_mis_tareas.md) | Avance de mis tareas | Tareas | Alta | Implementado | 4 | CP-029.1 a CP-029.4 | API, E2E |
| [RF-030](../Requisitos/RFs/RF-030_confirmacion_de_tareas.md) | Confirmación de tareas | Tareas | Alta | Parcial | 3 | CP-030.1 a CP-030.3 | API, E2E |
| [RF-031](../Requisitos/RFs/RF-031_tablero_y_progreso_de_tareas.md) | Tablero y progreso de tareas | Tareas | Alta | Implementado | 3 | CP-031.1 a CP-031.3 | API, E2E |
| [RF-032](../Requisitos/RFs/RF-032_paneles_de_resumen_por_rol.md) | Paneles de resumen por rol | Seguimiento | Media | Implementado | 4 | CP-032.1 a CP-032.4 | E2E |
| [RF-033](../Requisitos/RFs/RF-033_seguimiento_academico_de_fichas_y_proyectos.md) | Seguimiento académico de fichas y proyectos | Seguimiento | Alta | Implementado | 4 | CP-033.1 a CP-033.4 | E2E |
| [RF-034](../Requisitos/RFs/RF-034_reporte_en_pdf.md) | Reporte en PDF | Reportes | Media | Implementado | 3 | CP-034.1 a CP-034.3 | API, E2E |
| [RF-035](../Requisitos/RFs/RF-035_reporte_en_excel.md) | Reporte en Excel | Reportes | Media | Parcial | 3 | CP-035.1 a CP-035.3 | API |
| [RF-036](../Requisitos/RFs/RF-036_creacion_de_lista_de_chequeo.md) | Creación de lista de chequeo | Lista de chequeo | Media | Planificado | 3 | CP-036.1 a CP-036.3 | API |
| [RF-037](../Requisitos/RFs/RF-037_importacion_exportacion_y_copia_de_listas.md) | Importación, exportación y copia de listas | Lista de chequeo | Media | Planificado | 4 | CP-037.1 a CP-037.4 | API, E2E |
| [RF-038](../Requisitos/RFs/RF-038_evaluacion_con_lista_de_chequeo.md) | Evaluación con lista de chequeo | Lista de chequeo | Media | Planificado | 5 | CP-038.1 a CP-038.5 | API, E2E |
| [RF-039](../Requisitos/RFs/RF-039_paginas_legales_y_aviso_de_cookies.md) | Páginas legales y aviso de cookies | Interfaz y legal | Alta | Parcial | 4 | CP-039.1 a CP-039.4 | E2E |
| [RF-040](../Requisitos/RFs/RF-040_tema_e_interfaz_del_panel.md) | Tema e interfaz del panel | Interfaz y legal | Media | Parcial | 4 | CP-040.1 a CP-040.4 | E2E |
| [RF-041](../Requisitos/RFs/RF-041_mensajes_guiados.md) | Mensajes guiados | Interfaz y legal | Baja | Planificado | 3 | CP-041.1 a CP-041.3 | E2E |
| [RF-042](../Requisitos/RFs/RF-042_pagina_de_inicio_publica.md) | Página de inicio pública | Interfaz y legal | Media | Implementado | 4 | CP-042.1 a CP-042.4 | E2E |

¹ **RF-024:** la funcionalidad está implementada (HU-024), pero sus 3 casos siguen contados como planificados hasta que se automaticen por separado. Por eso el resumen da 94/34/32 y no 97/31/32.

---

## Archivos de casos

| Archivo | Módulos |
|---|---|
| [01 — Autenticación y administración](casos/01-autenticacion_y_administracion.md) | Autenticación, Administración |
| [02 — Grupos, fases y evaluación](casos/02-grupos_fases_y_evaluacion.md) | Grupos y proyectos, Fases y evidencias, Evaluación |
| [03 — Tareas, seguimiento, reportes, lista de chequeo e interfaz](casos/03-tareas_seguimiento_reportes_lista_de_chequeo_e_interfaz.md) | Tareas, Seguimiento, Reportes, Lista de chequeo, Interfaz y legal |
