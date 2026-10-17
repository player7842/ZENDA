# Matriz de permisos — ZENDA

<!--
  ¿Qué? Tabla que define qué puede hacer cada rol en cada funcionalidad del sistema.
  ¿Para qué? Tener una referencia única para implementar los middlewares de autorización y diseñar las pruebas de acceso.
  ¿Impacto? Un permiso mal definido deja pasar acciones que no corresponden o bloquea tareas legítimas.
-->

---

## Roles

| Rol | Origen | Descripción |
|---|---|---|
| **Visitante** | Sin sesión | Persona que aún no inició sesión. |
| **Aprendiz** | `APRENDIZ` | Integrante de un grupo de proyecto. Todos los aprendices tienen los mismos permisos. |
| **Líder** | `APRENDIZ` + `grupos.lider_id` | Aprendiz que creó el proyecto. Tiene todo lo del aprendiz y tres permisos adicionales. |
| **Instructor** | `INSTRUCTOR` | Evalúa las fichas a las que está vinculado. |
| **Coordinador** | `COORDINADOR` | Supervisa el programa ADSO (código `2338`). |
| **Administrador** | `ADMINISTRADOR` | Gestiona usuarios, fichas, programas y el sistema. |

> El **líder no es un rol de la base de datos**: es una condición del grupo (`grupos.lider_id`). No existen sub-roles Scrum ([RN-005](reglas-de-negocio.md#rn-005--roles-sin-sub-roles)).

## Leyenda

| Símbolo | Significado |
|:---:|---|
| ✅ | Permitido sin condiciones adicionales. |
| ⚠️ | Permitido solo bajo la condición indicada en la columna "Condición". |
| ❌ | No permitido. |

---

## 1. Autenticación y acceso público

| Funcionalidad | RF | Visitante | Aprendiz | Líder | Instructor | Coordinador | Admin | Condición |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|---|
| Registrarse | [RF-001](RFs/RF-001_registro_de_aprendiz.md) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | Solo aprendices nuevos con correo `@soy.sena.edu.co`. |
| Iniciar sesión | [RF-002](RFs/RF-002_inicio_de_sesion.md) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | La cuenta debe estar `Activo`. |
| Recuperar contraseña | [RF-003](RFs/RF-003_recuperacion_de_contrasena.md) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Cerrar y renovar sesión | [RF-004](RFs/RF-004_sesion_segura.md) | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | Requiere sesión. |
| Página de inicio y páginas legales | [RF-039](RFs/RF-039_paginas_legales_y_aviso_de_cookies.md), [RF-042](RFs/RF-042_pagina_de_inicio_publica.md) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Tema e interfaz del panel | [RF-040](RFs/RF-040_tema_e_interfaz_del_panel.md) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |

## 2. Administración

| Funcionalidad | RF | Aprendiz | Líder | Instructor | Coordinador | Admin | Condición |
|---|:---:|:---:|:---:|:---:|:---:|:---:|---|
| Crear, consultar, editar usuarios y cambiar roles | [RF-006](RFs/RF-006_gestion_de_usuarios.md) | ❌ | ❌ | ❌ | ❌ | ✅ | Confirma con su contraseña. No puede quitarse su propio rol. |
| Desactivar o eliminar usuarios | [RF-007](RFs/RF-007_desactivacion_y_eliminacion_de_usuarios.md) | ❌ | ❌ | ❌ | ❌ | ✅ | Confirma con su contraseña. |
| Carga masiva de usuarios | [RF-008](RFs/RF-008_carga_masiva_de_usuarios.md) | ❌ | ❌ | ❌ | ❌ | ✅ | — |
| Gestionar fichas | [RF-009](RFs/RF-009_gestion_de_fichas.md) | ❌ | ❌ | ❌ | ❌ | ✅ | Confirma con su contraseña. |
| Vincular o desvincular aprendices de una ficha | [RF-010](RFs/RF-010_aprendices_en_una_ficha.md) | ❌ | ❌ | ❌ | ❌ | ✅ | — |
| Asignar instructores a fichas | [RF-011](RFs/RF-011_asignacion_de_instructores_a_fichas.md) | ❌ | ❌ | ❌ | ⚠️ | ✅ | El coordinador solo en fichas del programa ADSO. |
| Gestionar programas | [RF-012](RFs/RF-012_gestion_de_programas_de_formacion.md) | ❌ | ❌ | ❌ | ❌ | ✅ | — |
| Diagnóstico y copia de seguridad | [RF-013](RFs/RF-013_diagnostico_y_copia_de_seguridad.md) | ❌ | ❌ | ❌ | ❌ | ✅ | Confirma con su contraseña para la copia. |
| Reasignar liderazgo | [RF-018](RFs/RF-018_reasignacion_de_liderazgo.md) | ❌ | ❌ | ❌ | ❌ | ✅ | Solo a un integrante activo del grupo. |

## 3. Grupos y proyectos

| Funcionalidad | RF | Aprendiz | Líder | Instructor | Coordinador | Admin | Condición |
|---|:---:|:---:|:---:|:---:|:---:|:---:|---|
| Crear proyecto | [RF-014](RFs/RF-014_creacion_de_proyecto.md) | ⚠️ | ❌ | ❌ | ❌ | ❌ | Inscrito en una ficha y sin proyecto activo. Al crearlo pasa a ser líder. |
| Unirse a un proyecto | [RF-015](RFs/RF-015_unirse_a_un_proyecto.md) | ⚠️ | ❌ | ❌ | ❌ | ❌ | Sin proyecto activo y con cupo disponible. |
| Consultar mi proyecto | [RF-016](RFs/RF-016_consulta_de_mi_proyecto.md) | ✅ | ✅ | ❌ | ❌ | ❌ | Del grupo al que pertenece. |
| Cambiar de ficha | [RF-017](RFs/RF-017_cambio_de_ficha_del_aprendiz.md) | ⚠️ | ❌ | ❌ | ❌ | ❌ | Solo si no tiene proyecto activo. |

## 4. Fases, evidencias y evaluación

| Funcionalidad | RF | Aprendiz | Líder | Instructor | Coordinador | Admin | Condición |
|---|:---:|:---:|:---:|:---:|:---:|:---:|---|
| Crear carpetas | [RF-019](RFs/RF-019_carpetas_de_una_fase.md) | ✅ | ✅ | ❌ | ❌ | ❌ | Integrante activo del grupo dueño de la fase. |
| Subir evidencias | [RF-020](RFs/RF-020_subida_de_evidencias.md) | ✅ | ✅ | ❌ | ❌ | ❌ | Integrante activo del grupo dueño de la carpeta. |
| Consultar carpetas y evidencias | [RF-021](RFs/RF-021_consulta_de_evidencias_y_fases.md) | ✅ | ✅ | ⚠️ | ❌ | ❌ | El instructor, solo de las fichas a las que está vinculado. |
| Reemplazar o eliminar una evidencia | [RF-022](RFs/RF-022_versiones_y_eliminacion_de_evidencias.md) | ⚠️ | ✅ | ❌ | ❌ | ❌ | El aprendiz, solo las que subió. Nadie puede si la evidencia está aprobada. |
| Evaluar evidencias | [RF-023](RFs/RF-023_evaluacion_de_evidencias.md) | ❌ | ❌ | ⚠️ | ❌ | ❌ | Ficha a su cargo con vinculación vigente. |
| Aprobar una carpeta en bloque | [RF-024](RFs/RF-024_aprobacion_de_carpetas_en_bloque.md) | ❌ | ❌ | ⚠️ | ❌ | ❌ | Ficha a su cargo. |
| Ver estado y porcentaje de avance | [RF-025](RFs/RF-025_estado_y_porcentaje_de_avance.md) | ✅ | ✅ | ⚠️ | ⚠️ | ❌ | Instructor: sus fichas. Coordinador: programa ADSO. |
| Crear observaciones | [RF-026](RFs/RF-026_observaciones_del_instructor.md) | ❌ | ❌ | ⚠️ | ❌ | ❌ | Proyecto de una ficha a su cargo. |
| Consultar observaciones | [RF-027](RFs/RF-027_consulta_de_observaciones.md) | ✅ | ✅ | ⚠️ | ❌ | ❌ | Del proyecto propio o de sus fichas. |

## 5. Tareas

| Funcionalidad | RF | Aprendiz | Líder | Instructor | Coordinador | Admin | Condición |
|---|:---:|:---:|:---:|:---:|:---:|:---:|---|
| Crear y asignar tareas | [RF-028](RFs/RF-028_creacion_y_asignacion_de_tareas.md) | ❌ | ✅ | ❌ | ❌ | ❌ | El responsable debe ser integrante activo del grupo. |
| Mover mis tareas (Pendiente → En proceso → Finalizada) | [RF-029](RFs/RF-029_avance_de_mis_tareas.md) | ⚠️ | ⚠️ | ❌ | ❌ | ❌ | Solo las tareas de las que es responsable. |
| Confirmar o marcar incompleta | [RF-030](RFs/RF-030_confirmacion_de_tareas.md) | ❌ | ✅ | ❌ | ❌ | ❌ | La tarea debe estar `Finalizada`. |
| Ver tablero y progreso | [RF-031](RFs/RF-031_tablero_y_progreso_de_tareas.md) | ✅ | ✅ | ❌ | ❌ | ❌ | Del grupo al que pertenece. |

## 6. Seguimiento, reportes y lista de chequeo

| Funcionalidad | RF | Aprendiz | Líder | Instructor | Coordinador | Admin | Condición |
|---|:---:|:---:|:---:|:---:|:---:|:---:|---|
| Panel de resumen | [RF-032](RFs/RF-032_paneles_de_resumen_por_rol.md) | ✅ | ✅ | ✅ | ✅ | ✅ | Cada rol ve solo los datos de su alcance. |
| Seguimiento de fichas, grupos y proyectos | [RF-033](RFs/RF-033_seguimiento_academico_de_fichas_y_proyectos.md) | ❌ | ❌ | ⚠️ | ⚠️ | ❌ | Instructor: sus fichas. Coordinador: programa ADSO. |
| Reporte en PDF | [RF-034](RFs/RF-034_reporte_en_pdf.md) | ✅ | ✅ | ✅ | ❌ | ❌ | Aprendiz: su proyecto. Instructor: sus fichas. |
| Reporte en Excel | [RF-035](RFs/RF-035_reporte_en_excel.md) | ❌ | ❌ | ⚠️ | ⚠️ | ❌ | Instructor: sus fichas. Coordinador: programa ADSO. |
| Crear, importar, exportar y copiar listas de chequeo | [RF-036](RFs/RF-036_creacion_de_lista_de_chequeo.md), [RF-037](RFs/RF-037_importacion_exportacion_y_copia_de_listas.md) | ❌ | ❌ | ⚠️ | ❌ | ❌ | Solo en fichas a su cargo. |
| Evaluar con lista de chequeo | [RF-038](RFs/RF-038_evaluacion_con_lista_de_chequeo.md) | ❌ | ❌ | ⚠️ | ❌ | ❌ | Ficha a su cargo con vinculación vigente. |
| Mensajes guiados | [RF-041](RFs/RF-041_mensajes_guiados.md) | ✅ | ✅ | ❌ | ❌ | ❌ | — |

---

## Permisos exclusivos del líder

El líder tiene los mismos permisos que cualquier aprendiz y, además:

1. **Crear y asignar tareas** ([RF-028](RFs/RF-028_creacion_y_asignacion_de_tareas.md)).
2. **Confirmar o marcar como incompleta** una tarea finalizada ([RF-030](RFs/RF-030_confirmacion_de_tareas.md)).
3. **Eliminar o reemplazar evidencias de otros integrantes** ([RF-022](RFs/RF-022_versiones_y_eliminacion_de_evidencias.md)).

## Cambios frente a la versión v11

| Permiso | v11 | Objetivo |
|---|---|---|
| Crear carpetas | Solo el líder (Scrum Master) | Cualquier integrante del grupo |
| Subir evidencias | Solo el líder (Scrum Master) | Cualquier integrante del grupo |
| Crear y asignar tareas | Scrum Master | Líder del grupo |
| Confirmar tareas | Scrum Master | Líder del grupo |
| Unirse a un proyecto | Elegía un rol Scrum | Solo el código; sin rol |

## Cómo se aplican los permisos en el código

| Capa | Mecanismo |
|---|---|
| Rol | Middlewares `auth` + `isAprendiz`, `isInstructor`, `isCoordinador`, `isAdmin`. |
| Líder | Comparación de `grupos.lider_id` con el usuario autenticado dentro del controlador. |
| Pertenencia al grupo | Consulta a `integrantes_grupo` con `estado_integrante = 'Activo'`. |
| Instructor de la ficha | Consulta a `instructor_ficha` con la vinculación vigente. |
| Coordinador | Filtro por el programa con código `2338`. |

Los controles del servidor son los que cuentan: ocultar un botón en la interfaz no es un permiso ([RS-004](restricciones.md#rs-004--autorización-siempre-en-el-servidor)).
