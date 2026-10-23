# Casos de prueba funcionales 02 — Grupos, fases y evaluación

<!--
  ¿Qué? Casos de prueba derivados de los criterios de aceptación de las historias de usuario del módulo.
  ¿Para qué? Verificar que cada requisito funcional hace lo que prometió, con pasos y resultados esperados concretos.
  ¿Impacto? Un criterio de aceptación sin caso de prueba nunca se verifica; un caso sin criterio no tiene dueño.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **Módulos** | Grupos y proyectos, Fases y evidencias, Evaluación |
| **Casos** | 54 |
| **Origen** | Criterios de aceptación (Dado/Cuando/Entonces) de las HU |
| **Plan** | [Plan de pruebas](../plan-de-pruebas.md) |
| **Fecha** | Octubre 2026 |

**Cómo leer las columnas**

| Columna | Significado |
|---|---|
| **ID** | `CP-<número de RF>.<número de criterio>`; coincide con el criterio `CA-<RF>.<n>` de la historia. |
| **Tipo** | *Positivo*: el camino feliz. *Negativo*: un dato o permiso inválido que debe rechazarse. |
| **Nivel** | Dónde conviene automatizarlo: `API` (petición HTTP) o `E2E` (navegador). |
| **Aplica a v11** | `Sí` se puede ejecutar hoy · `Parcial` el requisito cambia en v12 (ejecutar y comparar con "Cambios frente a la versión v11") · `No` la funcionalidad aún no existe. |

> Los usuarios y fichas de prueba están en [Instalación sin Docker](../../setup/sin-docker.md#6-usuarios-de-prueba).

---

### RF-014 — Creación de proyecto

**Historia:** [HU-014](../../requisitos/HUs/HU-014_creacion_de_proyecto.md) · **Requisito:** [RF-014](../../requisitos/RFs/RF-014_creacion_de_proyecto.md) · **Estado del requisito:** Parcial

| ID | Escenario | Precondición (dado que) | Acción (cuando) | Resultado esperado (entonces) | Tipo | Nivel | Prioridad | Aplica a v11 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CP-014.1 | Formulario del proyecto | soy un aprendiz inscrito en una ficha y sin proyecto activo | abro "Crear proyecto" | veo los campos nombre, descripción, problema, objetivo, alcance, tecnologías, fechas y cupo de integrantes | Positivo | E2E | Alta | Parcial |
| CP-014.2 | Creación exitosa | completé los campos obligatorios | envío el formulario | el proyecto se crea, recibo un código `PRY-XXXXXXXXXX`, quedo como líder y se generan las 5 fases | Positivo | API | Alta | Parcial |
| CP-014.3 | Un solo proyecto | ya pertenezco a un proyecto activo | intento crear otro | veo el mensaje "Ya perteneces a un proyecto activo" | Negativo | E2E | Alta | Parcial |
| CP-014.4 | Campos obligatorios | dejo vacío un campo obligatorio | envío el formulario | veo el mensaje "Faltan campos obligatorios del proyecto" | Negativo | E2E | Alta | Parcial |
| CP-014.5 | Sin ficha | no estoy inscrito en ninguna ficha | intento crear un proyecto | veo el mensaje "No estás inscrito en ninguna ficha" | Negativo | E2E | Alta | Parcial |

### RF-015 — Unirse a un proyecto

**Historia:** [HU-015](../../requisitos/HUs/HU-015_unirse_a_un_proyecto.md) · **Requisito:** [RF-015](../../requisitos/RFs/RF-015_unirse_a_un_proyecto.md) · **Estado del requisito:** Parcial

| ID | Escenario | Precondición (dado que) | Acción (cuando) | Resultado esperado (entonces) | Tipo | Nivel | Prioridad | Aplica a v11 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CP-015.1 | Unión exitosa | tengo un código válido y no pertenezco a ningún proyecto | lo ingreso y confirmo | quedo como integrante del grupo y veo el proyecto | Positivo | E2E | Alta | Parcial |
| CP-015.2 | Código inexistente | ingreso un código que no existe | envío | veo el mensaje "Código de grupo no encontrado" | Negativo | E2E | Alta | Parcial |
| CP-015.3 | Grupo lleno | el grupo ya alcanzó su cupo | intento unirme | veo un mensaje que indica que el grupo está completo | Negativo | E2E | Alta | Parcial |
| CP-015.4 | Ya tengo proyecto | ya pertenezco a un proyecto activo | intento unirme a otro | veo el mensaje "Ya perteneces a un proyecto activo" | Positivo | E2E | Alta | Parcial |

### RF-016 — Consulta de mi proyecto

**Historia:** [HU-016](../../requisitos/HUs/HU-016_consulta_de_mi_proyecto.md) · **Requisito:** [RF-016](../../requisitos/RFs/RF-016_consulta_de_mi_proyecto.md) · **Estado del requisito:** Implementado

| ID | Escenario | Precondición (dado que) | Acción (cuando) | Resultado esperado (entonces) | Tipo | Nivel | Prioridad | Aplica a v11 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CP-016.1 | Ficha del proyecto | pertenezco a un proyecto | abro "Mi proyecto" | veo su nombre, descripción, problema, objetivo, alcance, tecnologías y fechas | Positivo | E2E | Alta | Sí |
| CP-016.2 | Integrantes | estoy en "Mi proyecto" | reviso la sección del equipo | veo a todos los integrantes y quién es el líder | Positivo | E2E | Alta | Sí |
| CP-016.3 | Código de invitación | soy integrante del grupo | reviso el encabezado del proyecto | puedo ver el código para invitar a otros compañeros | Positivo | API | Alta | Sí |
| CP-016.4 | Sin proyecto | no pertenezco a ningún proyecto | abro "Mi proyecto" | veo las opciones "Crear proyecto" o "Unirme con código" | Negativo | E2E | Alta | Sí |

### RF-017 — Cambio de ficha del aprendiz

**Historia:** [HU-017](../../requisitos/HUs/HU-017_cambio_de_ficha_del_aprendiz.md) · **Requisito:** [RF-017](../../requisitos/RFs/RF-017_cambio_de_ficha_del_aprendiz.md) · **Estado del requisito:** Implementado

| ID | Escenario | Precondición (dado que) | Acción (cuando) | Resultado esperado (entonces) | Tipo | Nivel | Prioridad | Aplica a v11 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CP-017.1 | Consultar mi ficha | estoy inscrito en una ficha | abro la sección de ficha | veo mi ficha actual | Positivo | E2E | Media | Sí |
| CP-017.2 | Cambio exitoso | no tengo proyecto activo | elijo otra ficha y confirmo | quedo inscrito en la nueva ficha | Positivo | API | Media | Sí |
| CP-017.3 | Con proyecto activo | pertenezco a un proyecto | intento cambiar de ficha | veo el mensaje "Ya tienes un proyecto activo, no puedes cambiar de ficha" | Positivo | E2E | Media | Sí |

### RF-018 — Reasignación de liderazgo

**Historia:** [HU-018](../../requisitos/HUs/HU-018_reasignacion_de_liderazgo.md) · **Requisito:** [RF-018](../../requisitos/RFs/RF-018_reasignacion_de_liderazgo.md) · **Estado del requisito:** Planificado

| ID | Escenario | Precondición (dado que) | Acción (cuando) | Resultado esperado (entonces) | Tipo | Nivel | Prioridad | Aplica a v11 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CP-018.1 | Reasignar líder | selecciono un grupo cuyo líder está inactivo o salió | elijo a otro integrante activo y confirmo con mi contraseña | ese integrante pasa a ser el líder del grupo | Positivo | API | Media | No |
| CP-018.2 | Solo integrantes activos | elijo un usuario que no es integrante activo del grupo | envío | el sistema lo rechaza | Negativo | API | Media | No |
| CP-018.3 | Aviso de grupo sin líder | un líder se desactiva | guardo el cambio | veo una alerta que indica que el grupo necesita un líder nuevo | Negativo | E2E | Media | No |

### RF-019 — Carpetas de una fase

**Historia:** [HU-019](../../requisitos/HUs/HU-019_carpetas_de_una_fase.md) · **Requisito:** [RF-019](../../requisitos/RFs/RF-019_carpetas_de_una_fase.md) · **Estado del requisito:** Parcial

| ID | Escenario | Precondición (dado que) | Acción (cuando) | Resultado esperado (entonces) | Tipo | Nivel | Prioridad | Aplica a v11 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CP-019.1 | Crear carpeta | pertenezco al grupo dueño de la fase | creo una carpeta con un nombre | la carpeta aparece dentro de la fase | Positivo | API | Alta | Parcial |
| CP-019.2 | Nombre obligatorio | dejo el nombre vacío | envío | veo el mensaje "El nombre de la carpeta es obligatorio" | Negativo | E2E | Alta | Parcial |
| CP-019.3 | Cualquier integrante | soy un integrante que no es líder | creo una carpeta | el sistema me lo permite | Positivo | API | Alta | Parcial |
| CP-019.4 | Fase ajena | la fase pertenece a otro grupo | intento crear una carpeta | el sistema me lo niega | Negativo | API | Alta | Parcial |

### RF-020 — Subida de evidencias

**Historia:** [HU-020](../../requisitos/HUs/HU-020_subida_de_evidencias.md) · **Requisito:** [RF-020](../../requisitos/RFs/RF-020_subida_de_evidencias.md) · **Estado del requisito:** Parcial

| ID | Escenario | Precondición (dado que) | Acción (cuando) | Resultado esperado (entonces) | Tipo | Nivel | Prioridad | Aplica a v11 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CP-020.1 | Subir archivo | estoy en una carpeta de mi proyecto | selecciono un archivo permitido y envío | la evidencia aparece en la carpeta con mi nombre como autor | Positivo | API | Alta | Parcial |
| CP-020.2 | Subir enlace | tengo un enlace a mi evidencia (Drive, GitHub, video) | lo registro con un nombre | la evidencia queda guardada como enlace | Positivo | API | Alta | Parcial |
| CP-020.3 | Tipo o tamaño no permitido | elijo un archivo de un tipo no permitido o demasiado grande | envío | el sistema lo rechaza y me indica el motivo | Negativo | API | Alta | Parcial |
| CP-020.4 | Imagen grande | subo una imagen que supera el umbral de tamaño | envío | el sistema la comprime antes de almacenarla | Positivo | API | Alta | Parcial |
| CP-020.5 | Cualquier integrante | soy un integrante que no es líder | subo una evidencia | el sistema me lo permite | Positivo | API | Alta | Parcial |

### RF-021 — Consulta de evidencias y fases

**Historia:** [HU-021](../../requisitos/HUs/HU-021_consulta_de_evidencias_y_fases.md) · **Requisito:** [RF-021](../../requisitos/RFs/RF-021_consulta_de_evidencias_y_fases.md) · **Estado del requisito:** Implementado

| ID | Escenario | Precondición (dado que) | Acción (cuando) | Resultado esperado (entonces) | Tipo | Nivel | Prioridad | Aplica a v11 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CP-021.1 | Ver fases | estoy en "Fases" | abro el módulo | veo las 5 fases con su estado | Positivo | E2E | Alta | Sí |
| CP-021.2 | Ver evidencias | selecciono una fase | abro sus carpetas | veo cada carpeta con sus evidencias, su autor y su resultado | Positivo | E2E | Alta | Sí |
| CP-021.3 | Fase de otro grupo | la fase pertenece a otro grupo | intento consultarla | el sistema me lo niega con el mensaje "No perteneces al grupo dueño de esta fase" | Positivo | API | Alta | Sí |
| CP-021.4 | Vista del instructor | soy instructor de la ficha | abro una fase de un proyecto de mi ficha | veo sus carpetas y evidencias para evaluarlas | Positivo | E2E | Alta | Sí |

### RF-022 — Versiones y eliminación de evidencias

**Historia:** [HU-022](../../requisitos/HUs/HU-022_versiones_y_eliminacion_de_evidencias.md) · **Requisito:** [RF-022](../../requisitos/RFs/RF-022_versiones_y_eliminacion_de_evidencias.md) · **Estado del requisito:** Planificado

| ID | Escenario | Precondición (dado que) | Acción (cuando) | Resultado esperado (entonces) | Tipo | Nivel | Prioridad | Aplica a v11 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CP-022.1 | Reemplazar evidencia | subí una evidencia reprobada | subo una versión nueva | la nueva versión queda activa y la anterior se conserva en el historial | Positivo | API | Media | No |
| CP-022.2 | Eliminar evidencia propia | soy quien subió la evidencia | la elimino | deja de verse en la carpeta pero queda registrada | Positivo | API | Media | No |
| CP-022.3 | El líder elimina | soy el líder del grupo | elimino una evidencia de otro integrante | el sistema me lo permite | Positivo | API | Media | No |
| CP-022.4 | Evidencia ajena | no la subí yo y no soy el líder | intento eliminarla o reemplazarla | el sistema me lo niega | Negativo | API | Media | No |
| CP-022.5 | Evidencia aprobada | la evidencia ya fue aprobada | intento reemplazarla o eliminarla | el sistema me lo impide | Positivo | API | Media | No |

### RF-023 — Evaluación de evidencias

**Historia:** [HU-023](../../requisitos/HUs/HU-023_evaluacion_de_evidencias.md) · **Requisito:** [RF-023](../../requisitos/RFs/RF-023_evaluacion_de_evidencias.md) · **Estado del requisito:** Parcial

| ID | Escenario | Precondición (dado que) | Acción (cuando) | Resultado esperado (entonces) | Tipo | Nivel | Prioridad | Aplica a v11 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CP-023.1 | Aprobar o reprobar | soy el instructor de la ficha | evalúo una evidencia como aprobada o reprobada | el resultado se guarda y el estado de la fase se recalcula | Positivo | API | Alta | Parcial |
| CP-023.2 | Resultado inválido | envío un resultado distinto de aprobado o reprobado | confirmo | veo el mensaje "Resultado inválido, debe ser APROBADO o REPROBADO" | Negativo | E2E | Alta | Parcial |
| CP-023.3 | Evidencia ajena | la evidencia es de una ficha que no tengo a cargo | intento evaluarla | veo el mensaje "Esta evidencia no está a tu cargo" | Negativo | E2E | Alta | Parcial |
| CP-023.4 | Recalificar | ya evalué una evidencia | la evalúo de nuevo | se agrega la nueva evaluación y la anterior queda en el historial | Positivo | API | Alta | Parcial |

### RF-024 — Aprobación de carpetas en bloque

**Historia:** [HU-024](../../requisitos/HUs/HU-024_aprobacion_de_carpetas_en_bloque.md) · **Requisito:** [RF-024](../../requisitos/RFs/RF-024_aprobacion_de_carpetas_en_bloque.md) · **Estado del requisito:** Planificado

| ID | Escenario | Precondición (dado que) | Acción (cuando) | Resultado esperado (entonces) | Tipo | Nivel | Prioridad | Aplica a v11 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CP-024.1 | Aprobar carpeta | soy el instructor de la ficha | pulso "Aprobar carpeta" y confirmo | todas las evidencias de la carpeta quedan aprobadas | Positivo | E2E | Media | No |
| CP-024.2 | Reprobar una evidencia | una carpeta tiene varias evidencias aprobadas | reapruebo una sola como reprobada | la carpeta pasa a `Desaprobada` | Positivo | API | Media | No |
| CP-024.3 | Carpeta vacía | la carpeta no tiene evidencias | intento aprobarla | el sistema me lo impide | Positivo | API | Media | No |

### RF-025 — Estado y porcentaje de avance

**Historia:** [HU-025](../../requisitos/HUs/HU-025_estado_y_porcentaje_de_avance.md) · **Requisito:** [RF-025](../../requisitos/RFs/RF-025_estado_y_porcentaje_de_avance.md) · **Estado del requisito:** Parcial

| ID | Escenario | Precondición (dado que) | Acción (cuando) | Resultado esperado (entonces) | Tipo | Nivel | Prioridad | Aplica a v11 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CP-025.1 | Estado de la fase | mi proyecto tiene evidencias evaluadas | abro "Fases" | cada fase muestra su estado: `Pendiente`, `En revisión`, `Aprobada` o `Desaprobada` | Positivo | E2E | Alta | Parcial |
| CP-025.2 | Porcentaje | una fase tiene 10 evidencias y 7 aprobadas | la consulto | veo un avance del 70 % | Positivo | E2E | Alta | Parcial |
| CP-025.3 | Carpetas aprobadas | una fase tiene 4 carpetas y 3 aprobadas | la consulto | veo "3 de 4 carpetas aprobadas" | Positivo | E2E | Alta | Parcial |
| CP-025.4 | Una reprobada desaprueba la fase | una carpeta tiene una evidencia reprobada | se registra la evaluación | la carpeta y la fase pasan a `Desaprobada` | Positivo | API | Alta | Parcial |

### RF-026 — Observaciones del instructor

**Historia:** [HU-026](../../requisitos/HUs/HU-026_observaciones_del_instructor.md) · **Requisito:** [RF-026](../../requisitos/RFs/RF-026_observaciones_del_instructor.md) · **Estado del requisito:** Parcial

| ID | Escenario | Precondición (dado que) | Acción (cuando) | Resultado esperado (entonces) | Tipo | Nivel | Prioridad | Aplica a v11 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CP-026.1 | Crear observación | soy instructor de la ficha | escribo un título y una descripción y guardo | la observación queda registrada en el proyecto | Positivo | API | Alta | Parcial |
| CP-026.2 | Ligada a una evidencia | estoy evaluando una evidencia | agrego una observación sobre ella | la observación queda asociada a esa evidencia | Positivo | API | Alta | Parcial |
| CP-026.3 | Consultar observaciones | abro un proyecto de mi ficha | reviso sus observaciones | veo el historial con fecha y título | Positivo | E2E | Alta | Parcial |

### RF-027 — Consulta de observaciones

**Historia:** [HU-027](../../requisitos/HUs/HU-027_consulta_de_observaciones.md) · **Requisito:** [RF-027](../../requisitos/RFs/RF-027_consulta_de_observaciones.md) · **Estado del requisito:** Implementado

| ID | Escenario | Precondición (dado que) | Acción (cuando) | Resultado esperado (entonces) | Tipo | Nivel | Prioridad | Aplica a v11 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CP-027.1 | Ver observaciones | mi proyecto tiene observaciones | abro la sección "Observaciones" | veo la lista con título, descripción, fecha e instructor | Positivo | E2E | Alta | Sí |
| CP-027.2 | Sin observaciones | mi proyecto no tiene observaciones | abro la sección | veo un mensaje que lo indica | Negativo | E2E | Alta | Sí |
| CP-027.3 | Sin proyecto | mi grupo aún no tiene proyecto | abro la sección | veo el mensaje "Tu grupo aún no tiene proyecto" | Negativo | E2E | Alta | Sí |

---

## Documentos relacionados

- [Plan de pruebas](../plan-de-pruebas.md) · [Matriz de cobertura](../matriz-cobertura.md)
- [Pruebas de integración](../pruebas-de-integracion.md) · [Pruebas no funcionales](../pruebas-no-funcionales.md)
