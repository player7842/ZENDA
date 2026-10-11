# Matriz de trazabilidad — ZENDA

<!--
  ¿Qué? Tabla que relaciona cada historia de usuario con su requisito funcional, módulo, estado y reglas de negocio.
  ¿Para qué? Verificar que todo lo pedido por el usuario tiene una especificación técnica, y viceversa.
  ¿Impacto? Sin trazabilidad no se puede saber qué falta por construir ni qué se afecta al cambiar una regla.
-->

---

## Resumen

| Estado | Cantidad |
| --- | --- |
| Implementado | 16 |
| Parcial | 17 |
| Planificado | 9 |
| **Total** | **42** |

| Estado | Significado |
|---|---|
| **Implementado** | Ya funciona en la versión v11. |
| **Parcial** | Funciona, pero requiere cambios aprobados (ver sección "Cambios frente a la versión v11" de cada archivo). |
| **Planificado** | Aprobado, aún no construido. |

---

## Matriz

| Historia | Requisito | Módulo | Rol | Prioridad | Estado | Reglas de negocio |
| --- | --- | --- | --- | --- | --- | --- |
| [HU-001](HUs/HU-001_registro_de_aprendiz.md) | [RF-001](RFs/RF-001_registro_de_aprendiz.md) | Autenticación | Aprendiz nuevo | Alta | Parcial | RN-001, RN-002, RN-004, RN-005, RN-006 |
| [HU-002](HUs/HU-002_inicio_de_sesion.md) | [RF-002](RFs/RF-002_inicio_de_sesion.md) | Autenticación | Usuario registrado | Alta | Implementado | RN-002, RN-003 |
| [HU-003](HUs/HU-003_recuperacion_de_contrasena.md) | [RF-003](RFs/RF-003_recuperacion_de_contrasena.md) | Autenticación | Usuario registrado | Alta | Parcial | RN-002 |
| [HU-004](HUs/HU-004_sesion_segura.md) | [RF-004](RFs/RF-004_sesion_segura.md) | Autenticación | Usuario autenticado | Alta | Parcial | RN-003 |
| [HU-005](HUs/HU-005_proteccion_de_rutas_por_rol.md) | [RF-005](RFs/RF-005_proteccion_de_rutas_por_rol.md) | Autenticación | Usuario autenticado | Alta | Implementado | RN-003, RN-005 |
| [HU-006](HUs/HU-006_gestion_de_usuarios.md) | [RF-006](RFs/RF-006_gestion_de_usuarios.md) | Administración | Administrador | Alta | Implementado | RN-001, RN-002, RN-005, RN-028 |
| [HU-007](HUs/HU-007_desactivacion_y_eliminacion_de_usuarios.md) | [RF-007](RFs/RF-007_desactivacion_y_eliminacion_de_usuarios.md) | Administración | Administrador | Media | Parcial | RN-003, RN-028, RN-030 |
| [HU-008](HUs/HU-008_carga_masiva_de_usuarios.md) | [RF-008](RFs/RF-008_carga_masiva_de_usuarios.md) | Administración | Administrador | Media | Parcial | RN-001, RN-002, RN-028 |
| [HU-009](HUs/HU-009_gestion_de_fichas.md) | [RF-009](RFs/RF-009_gestion_de_fichas.md) | Administración | Administrador | Alta | Implementado | RN-028 |
| [HU-010](HUs/HU-010_aprendices_en_una_ficha.md) | [RF-010](RFs/RF-010_aprendices_en_una_ficha.md) | Administración | Administrador | Media | Implementado | RN-006, RN-029 |
| [HU-011](HUs/HU-011_asignacion_de_instructores_a_fichas.md) | [RF-011](RFs/RF-011_asignacion_de_instructores_a_fichas.md) | Administración | Administrador | Alta | Parcial | RN-024, RN-025, RN-028 |
| [HU-012](HUs/HU-012_gestion_de_programas_de_formacion.md) | [RF-012](RFs/RF-012_gestion_de_programas_de_formacion.md) | Administración | Administrador | Media | Planificado | RN-028 |
| [HU-013](HUs/HU-013_diagnostico_y_copia_de_seguridad.md) | [RF-013](RFs/RF-013_diagnostico_y_copia_de_seguridad.md) | Administración | Administrador | Baja | Planificado | RN-028 |
| [HU-014](HUs/HU-014_creacion_de_proyecto.md) | [RF-014](RFs/RF-014_creacion_de_proyecto.md) | Grupos y proyectos | Aprendiz | Alta | Parcial | RN-007, RN-008, RN-009, RN-010, RN-011 |
| [HU-015](HUs/HU-015_unirse_a_un_proyecto.md) | [RF-015](RFs/RF-015_unirse_a_un_proyecto.md) | Grupos y proyectos | Aprendiz | Alta | Parcial | RN-007, RN-009, RN-010 |
| [HU-016](HUs/HU-016_consulta_de_mi_proyecto.md) | [RF-016](RFs/RF-016_consulta_de_mi_proyecto.md) | Grupos y proyectos | Aprendiz | Alta | Implementado | RN-007, RN-008, RN-011 |
| [HU-017](HUs/HU-017_cambio_de_ficha_del_aprendiz.md) | [RF-017](RFs/RF-017_cambio_de_ficha_del_aprendiz.md) | Grupos y proyectos | Aprendiz | Media | Implementado | RN-006, RN-029 |
| [HU-018](HUs/HU-018_reasignacion_de_liderazgo.md) | [RF-018](RFs/RF-018_reasignacion_de_liderazgo.md) | Grupos y proyectos | Administrador | Media | Planificado | RN-008, RN-028, RN-030 |
| [HU-019](HUs/HU-019_carpetas_de_una_fase.md) | [RF-019](RFs/RF-019_carpetas_de_una_fase.md) | Fases y evidencias | Aprendiz | Alta | Parcial | RN-012, RN-015 |
| [HU-020](HUs/HU-020_subida_de_evidencias.md) | [RF-020](RFs/RF-020_subida_de_evidencias.md) | Fases y evidencias | Aprendiz | Alta | Parcial | RN-012, RN-013, RN-015 |
| [HU-021](HUs/HU-021_consulta_de_evidencias_y_fases.md) | [RF-021](RFs/RF-021_consulta_de_evidencias_y_fases.md) | Fases y evidencias | Aprendiz | Alta | Implementado | RN-012, RN-016 |
| [HU-022](HUs/HU-022_versiones_y_eliminacion_de_evidencias.md) | [RF-022](RFs/RF-022_versiones_y_eliminacion_de_evidencias.md) | Fases y evidencias | Aprendiz | Media | Planificado | RN-012, RN-014, RN-015, RN-018 |
| [HU-023](HUs/HU-023_evaluacion_de_evidencias.md) | [RF-023](RFs/RF-023_evaluacion_de_evidencias.md) | Evaluación | Instructor | Alta | Parcial | RN-016, RN-017, RN-018 |
| [HU-024](HUs/HU-024_aprobacion_de_carpetas_en_bloque.md) | [RF-024](RFs/RF-024_aprobacion_de_carpetas_en_bloque.md) | Evaluación | Instructor | Media | Planificado | RN-016, RN-017, RN-018, RN-019 |
| [HU-025](HUs/HU-025_estado_y_porcentaje_de_avance.md) | [RF-025](RFs/RF-025_estado_y_porcentaje_de_avance.md) | Evaluación | Aprendiz | Alta | Parcial | RN-018, RN-019, RN-020 |
| [HU-026](HUs/HU-026_observaciones_del_instructor.md) | [RF-026](RFs/RF-026_observaciones_del_instructor.md) | Evaluación | Instructor | Alta | Implementado | RN-016, RN-023 |
| [HU-027](HUs/HU-027_consulta_de_observaciones.md) | [RF-027](RFs/RF-027_consulta_de_observaciones.md) | Evaluación | Aprendiz | Alta | Implementado | RN-023 |
| [HU-028](HUs/HU-028_creacion_y_asignacion_de_tareas.md) | [RF-028](RFs/RF-028_creacion_y_asignacion_de_tareas.md) | Tareas | Líder de grupo | Alta | Parcial | RN-008, RN-021 |
| [HU-029](HUs/HU-029_avance_de_mis_tareas.md) | [RF-029](RFs/RF-029_avance_de_mis_tareas.md) | Tareas | Aprendiz | Alta | Implementado | RN-022 |
| [HU-030](HUs/HU-030_confirmacion_de_tareas.md) | [RF-030](RFs/RF-030_confirmacion_de_tareas.md) | Tareas | Líder de grupo | Alta | Parcial | RN-008, RN-022 |
| [HU-031](HUs/HU-031_tablero_y_progreso_de_tareas.md) | [RF-031](RFs/RF-031_tablero_y_progreso_de_tareas.md) | Tareas | Aprendiz | Alta | Implementado | RN-021, RN-022 |
| [HU-032](HUs/HU-032_paneles_de_resumen_por_rol.md) | [RF-032](RFs/RF-032_paneles_de_resumen_por_rol.md) | Seguimiento | Usuario autenticado | Media | Implementado | RN-025 |
| [HU-033](HUs/HU-033_seguimiento_academico_de_fichas_y_proyectos.md) | [RF-033](RFs/RF-033_seguimiento_academico_de_fichas_y_proyectos.md) | Seguimiento | Instructor o coordinador | Alta | Implementado | RN-016, RN-024, RN-025 |
| [HU-034](HUs/HU-034_reporte_en_pdf.md) | [RF-034](RFs/RF-034_reporte_en_pdf.md) | Reportes | Aprendiz o instructor | Media | Implementado | — |
| [HU-035](HUs/HU-035_reporte_en_excel.md) | [RF-035](RFs/RF-035_reporte_en_excel.md) | Reportes | Instructor o coordinador | Media | Parcial | RN-016, RN-025 |
| [HU-036](HUs/HU-036_creacion_de_lista_de_chequeo.md) | [RF-036](RFs/RF-036_creacion_de_lista_de_chequeo.md) | Lista de chequeo | Instructor | Media | Planificado | RN-016, RN-026 |
| [HU-037](HUs/HU-037_importacion_exportacion_y_copia_de_listas.md) | [RF-037](RFs/RF-037_importacion_exportacion_y_copia_de_listas.md) | Lista de chequeo | Instructor | Media | Planificado | RN-026 |
| [HU-038](HUs/HU-038_evaluacion_con_lista_de_chequeo.md) | [RF-038](RFs/RF-038_evaluacion_con_lista_de_chequeo.md) | Lista de chequeo | Instructor | Media | Planificado | RN-016, RN-024, RN-026, RN-027 |
| [HU-039](HUs/HU-039_paginas_legales_y_aviso_de_cookies.md) | [RF-039](RFs/RF-039_paginas_legales_y_aviso_de_cookies.md) | Interfaz y legal | Visitante | Alta | Parcial | RN-004 |
| [HU-040](HUs/HU-040_tema_e_interfaz_del_panel.md) | [RF-040](RFs/RF-040_tema_e_interfaz_del_panel.md) | Interfaz y legal | Usuario autenticado | Media | Parcial | — |
| [HU-041](HUs/HU-041_mensajes_guiados.md) | [RF-041](RFs/RF-041_mensajes_guiados.md) | Interfaz y legal | Aprendiz | Baja | Planificado | — |
| [HU-042](HUs/HU-042_pagina_de_inicio_publica.md) | [RF-042](RFs/RF-042_pagina_de_inicio_publica.md) | Interfaz y legal | Visitante | Media | Implementado | — |

---

## Documentos relacionados

- [Reglas de negocio](reglas-de-negocio.md)
- [Restricciones](restricciones.md)
- [Requisitos no funcionales](RNFs/)
