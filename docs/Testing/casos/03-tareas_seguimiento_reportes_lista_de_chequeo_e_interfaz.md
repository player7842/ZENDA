# Casos de prueba funcionales 03 — Tareas, seguimiento, reportes, lista de chequeo e interfaz

<!--
  ¿Qué? Casos de prueba derivados de los criterios de aceptación de las historias de usuario del módulo.
  ¿Para qué? Verificar que cada requisito funcional hace lo que prometió, con pasos y resultados esperados concretos.
  ¿Impacto? Un criterio de aceptación sin caso de prueba nunca se verifica; un caso sin criterio no tiene dueño.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **Módulos** | Tareas, Seguimiento, Reportes, Lista de chequeo, Interfaz y legal |
| **Casos** | 55 |
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

### RF-028 — Creación y asignación de tareas

**Historia:** [HU-028](../../requisitos/HUs/HU-028_creacion_y_asignacion_de_tareas.md) · **Requisito:** [RF-028](../../requisitos/RFs/RF-028_creacion_y_asignacion_de_tareas.md) · **Estado del requisito:** Parcial

| ID | Escenario | Precondición (dado que) | Acción (cuando) | Resultado esperado (entonces) | Tipo | Nivel | Prioridad | Aplica a v11 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CP-028.1 | Crear tarea | soy el líder del grupo | creo una tarea con título, responsable y prioridad | la tarea queda en estado `Pendiente` asignada al responsable | Positivo | API | Alta | Parcial |
| CP-028.2 | Solo el líder | soy un integrante que no es líder | intento crear una tarea | el sistema me lo niega | Negativo | API | Alta | Parcial |
| CP-028.3 | Responsable del grupo | elijo como responsable a alguien que no pertenece a mi grupo | envío | veo el mensaje "El responsable no pertenece a tu grupo" | Negativo | E2E | Alta | Parcial |
| CP-028.4 | Prioridad válida | envío una prioridad distinta de alta, media o baja | guardo | veo el mensaje "Prioridad inválida" | Positivo | E2E | Alta | Parcial |

### RF-029 — Avance de mis tareas

**Historia:** [HU-029](../../requisitos/HUs/HU-029_avance_de_mis_tareas.md) · **Requisito:** [RF-029](../../requisitos/RFs/RF-029_avance_de_mis_tareas.md) · **Estado del requisito:** Implementado

| ID | Escenario | Precondición (dado que) | Acción (cuando) | Resultado esperado (entonces) | Tipo | Nivel | Prioridad | Aplica a v11 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CP-029.1 | Iniciar tarea | tengo una tarea `Pendiente` asignada | la muevo a "En proceso" | el estado de la tarea cambia | Positivo | API | Alta | Sí |
| CP-029.2 | Finalizar tarea | tengo una tarea `En proceso` | la muevo a "Finalizada" | queda pendiente de la confirmación del líder | Positivo | API | Alta | Sí |
| CP-029.3 | Tarea ajena | la tarea está asignada a otro integrante | intento moverla | veo el mensaje "Solo el responsable puede mover esta tarea" | Negativo | E2E | Alta | Sí |
| CP-029.4 | Transición inválida | intento saltar de `Pendiente` a `Finalizada` | envío el cambio | veo un mensaje que indica que no se puede pasar de un estado al otro | Negativo | E2E | Alta | Sí |

### RF-030 — Confirmación de tareas

**Historia:** [HU-030](../../requisitos/HUs/HU-030_confirmacion_de_tareas.md) · **Requisito:** [RF-030](../../requisitos/RFs/RF-030_confirmacion_de_tareas.md) · **Estado del requisito:** Parcial

| ID | Escenario | Precondición (dado que) | Acción (cuando) | Resultado esperado (entonces) | Tipo | Nivel | Prioridad | Aplica a v11 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CP-030.1 | Confirmar tarea | una tarea está `Finalizada` | la confirmo | la tarea pasa a `Confirmada` | Positivo | API | Alta | Parcial |
| CP-030.2 | Marcar incompleta | una tarea está `Finalizada` y no cumple lo esperado | la marco como incompleta | pasa a `Incompleta` y el responsable puede retomarla | Positivo | API | Alta | Parcial |
| CP-030.3 | Solo el líder | soy un integrante que no es líder | intento confirmar o rechazar una tarea | veo el mensaje que indica que solo el líder puede hacerlo | Negativo | E2E | Alta | Parcial |

### RF-031 — Tablero y progreso de tareas

**Historia:** [HU-031](../../requisitos/HUs/HU-031_tablero_y_progreso_de_tareas.md) · **Requisito:** [RF-031](../../requisitos/RFs/RF-031_tablero_y_progreso_de_tareas.md) · **Estado del requisito:** Implementado

| ID | Escenario | Precondición (dado que) | Acción (cuando) | Resultado esperado (entonces) | Tipo | Nivel | Prioridad | Aplica a v11 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CP-031.1 | Ver tablero | pertenezco a un proyecto | abro "Tareas" | veo las tareas agrupadas por estado, con su responsable y prioridad | Positivo | E2E | Alta | Sí |
| CP-031.2 | Mis tareas | hay tareas asignadas a varios integrantes | reviso el tablero | identifico cuáles son mías | Positivo | API | Alta | Sí |
| CP-031.3 | Progreso | el grupo tiene tareas confirmadas | consulto el progreso | veo el porcentaje de tareas confirmadas sobre el total | Positivo | E2E | Alta | Sí |

### RF-032 — Paneles de resumen por rol

**Historia:** [HU-032](../../requisitos/HUs/HU-032_paneles_de_resumen_por_rol.md) · **Requisito:** [RF-032](../../requisitos/RFs/RF-032_paneles_de_resumen_por_rol.md) · **Estado del requisito:** Implementado

| ID | Escenario | Precondición (dado que) | Acción (cuando) | Resultado esperado (entonces) | Tipo | Nivel | Prioridad | Aplica a v11 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CP-032.1 | Resumen del aprendiz | soy aprendiz | abro mi panel | veo el avance de mis fases y mis tareas | Positivo | E2E | Media | Sí |
| CP-032.2 | Resumen del instructor | soy instructor | abro mi panel | veo las evidencias aprobadas y reprobadas de mis fichas | Positivo | E2E | Media | Sí |
| CP-032.3 | Resumen del coordinador | soy coordinador | abro mi panel | veo el estado de los proyectos y las alertas pedagógicas | Positivo | E2E | Media | Sí |
| CP-032.4 | Resumen del administrador | soy administrador | abro mi panel | veo los totales de usuarios, fichas y proyectos | Positivo | E2E | Media | Sí |

### RF-033 — Seguimiento académico de fichas y proyectos

**Historia:** [HU-033](../../requisitos/HUs/HU-033_seguimiento_academico_de_fichas_y_proyectos.md) · **Requisito:** [RF-033](../../requisitos/RFs/RF-033_seguimiento_academico_de_fichas_y_proyectos.md) · **Estado del requisito:** Implementado

| ID | Escenario | Precondición (dado que) | Acción (cuando) | Resultado esperado (entonces) | Tipo | Nivel | Prioridad | Aplica a v11 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CP-033.1 | Fichas del instructor | soy instructor | abro "Mis fichas" | veo solo las fichas a las que estoy vinculado | Positivo | E2E | Alta | Sí |
| CP-033.2 | Aprendices y grupos | selecciono una ficha | abro sus aprendices y grupos | veo quién está en cada grupo y su proyecto | Positivo | E2E | Alta | Sí |
| CP-033.3 | Seguimiento del proyecto | selecciono un proyecto | abro su detalle | veo su información, fases, evidencias y observaciones | Positivo | E2E | Alta | Sí |
| CP-033.4 | Alcance del coordinador | soy coordinador | consulto fichas y proyectos | veo solo los del programa ADSO | Positivo | E2E | Alta | Sí |

### RF-034 — Reporte en PDF

**Historia:** [HU-034](../../requisitos/HUs/HU-034_reporte_en_pdf.md) · **Requisito:** [RF-034](../../requisitos/RFs/RF-034_reporte_en_pdf.md) · **Estado del requisito:** Implementado

| ID | Escenario | Precondición (dado que) | Acción (cuando) | Resultado esperado (entonces) | Tipo | Nivel | Prioridad | Aplica a v11 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CP-034.1 | Reporte del aprendiz | estoy en mi proyecto | pido el reporte en PDF | obtengo un documento con el estado de mis fases, evidencias y tareas | Positivo | API | Media | Sí |
| CP-034.2 | Reporte del instructor | estoy en una ficha | pido el reporte en PDF | obtengo un documento con el avance de sus grupos | Positivo | API | Media | Sí |
| CP-034.3 | Diseño imprimible | abro el reporte | lo reviso en pantalla o impreso | el contenido se ve completo y legible | Positivo | E2E | Media | Sí |

### RF-035 — Reporte en Excel

**Historia:** [HU-035](../../requisitos/HUs/HU-035_reporte_en_excel.md) · **Requisito:** [RF-035](../../requisitos/RFs/RF-035_reporte_en_excel.md) · **Estado del requisito:** Parcial

| ID | Escenario | Precondición (dado que) | Acción (cuando) | Resultado esperado (entonces) | Tipo | Nivel | Prioridad | Aplica a v11 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CP-035.1 | Exportar ficha | estoy en una ficha | pido el reporte en Excel | obtengo un `.xlsx` con grupos, aprendices y estado de las fases | Positivo | API | Media | Parcial |
| CP-035.2 | Exportar el coordinador | soy coordinador | pido el reporte del programa | obtengo el reporte con las fichas y proyectos de ADSO | Positivo | API | Media | Parcial |
| CP-035.3 | Datos completos | abro el archivo | reviso las columnas | encuentro encabezados claros y los datos sin truncar | Positivo | API | Media | Parcial |

### RF-036 — Creación de lista de chequeo

**Historia:** [HU-036](../../requisitos/HUs/HU-036_creacion_de_lista_de_chequeo.md) · **Requisito:** [RF-036](../../requisitos/RFs/RF-036_creacion_de_lista_de_chequeo.md) · **Estado del requisito:** Planificado

| ID | Escenario | Precondición (dado que) | Acción (cuando) | Resultado esperado (entonces) | Tipo | Nivel | Prioridad | Aplica a v11 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CP-036.1 | Crear lista | soy instructor de una ficha | creo una lista de chequeo para esa ficha | la lista queda asociada a la ficha | Positivo | API | Media | No |
| CP-036.2 | Agregar ítems | estoy editando la lista | agrego un ítem con fase, nombre de la evidencia, descripción, si es obligatoria y su orden | el ítem aparece en la fase indicada | Positivo | API | Media | No |
| CP-036.3 | Editar y ordenar | la lista tiene ítems | los edito, reordeno o elimino | la lista se actualiza sin perder las evaluaciones ya hechas | Positivo | API | Media | No |

### RF-037 — Importación, exportación y copia de listas

**Historia:** [HU-037](../../requisitos/HUs/HU-037_importacion_exportacion_y_copia_de_listas.md) · **Requisito:** [RF-037](../../requisitos/RFs/RF-037_importacion_exportacion_y_copia_de_listas.md) · **Estado del requisito:** Planificado

| ID | Escenario | Precondición (dado que) | Acción (cuando) | Resultado esperado (entonces) | Tipo | Nivel | Prioridad | Aplica a v11 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CP-037.1 | Importar con asistente | tengo un Excel con mi lista | lo subo y veo la vista previa | puedo indicar qué columna es la fase, el nombre y la descripción | Positivo | E2E | Media | No |
| CP-037.2 | Importación completada | confirmé la correspondencia de columnas | importo | los ítems se crean y el archivo original queda guardado como referencia | Positivo | API | Media | No |
| CP-037.3 | Exportar | tengo una lista de chequeo | pido exportarla | obtengo un Excel con sus ítems en el mismo orden | Positivo | API | Media | No |
| CP-037.4 | Copiar a otra ficha | acompaño varias fichas | copio la lista a otra ficha | la ficha destino recibe una lista independiente con los mismos ítems | Positivo | API | Media | No |

### RF-038 — Evaluación con lista de chequeo

**Historia:** [HU-038](../../requisitos/HUs/HU-038_evaluacion_con_lista_de_chequeo.md) · **Requisito:** [RF-038](../../requisitos/RFs/RF-038_evaluacion_con_lista_de_chequeo.md) · **Estado del requisito:** Planificado

| ID | Escenario | Precondición (dado que) | Acción (cuando) | Resultado esperado (entonces) | Tipo | Nivel | Prioridad | Aplica a v11 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CP-038.1 | Evaluar ítem | estoy en la lista de una ficha | marco un ítem de un grupo como aprobado o no aprobado | queda registrado con mi nombre y la fecha | Positivo | API | Media | No |
| CP-038.2 | Avance por grupo | evalué los ítems de un grupo | consulto su avance | veo el porcentaje de ítems obligatorios aprobados | Positivo | E2E | Media | No |
| CP-038.3 | Avance por ficha | la ficha tiene varios grupos evaluados | consulto el avance de la ficha | veo el promedio de sus grupos | Positivo | E2E | Media | No |
| CP-038.4 | Cambio de instructor | otro instructor asume la ficha | abre la lista | hereda la lista y las evaluaciones, con el autor de cada una | Positivo | API | Media | No |
| CP-038.5 | Reevaluar | ya evalué un ítem | lo cambio | se agrega una evaluación nueva y la anterior queda en el historial | Positivo | API | Media | No |

### RF-039 — Páginas legales y aviso de cookies

**Historia:** [HU-039](../../requisitos/HUs/HU-039_paginas_legales_y_aviso_de_cookies.md) · **Requisito:** [RF-039](../../requisitos/RFs/RF-039_paginas_legales_y_aviso_de_cookies.md) · **Estado del requisito:** Parcial

| ID | Escenario | Precondición (dado que) | Acción (cuando) | Resultado esperado (entonces) | Tipo | Nivel | Prioridad | Aplica a v11 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CP-039.1 | Enlaces en el pie de página | estoy en cualquier pantalla pública | miro el pie de página | encuentro enlaces a las cuatro páginas legales | Positivo | E2E | Alta | Parcial |
| CP-039.2 | Página legal | pulso uno de los enlaces | se abre la página | veo el texto legal completo en una página propia | Positivo | E2E | Alta | Parcial |
| CP-039.3 | Enlaces desde el registro | estoy en el registro | miro las casillas de aceptación | cada casilla enlaza a su página legal | Positivo | E2E | Alta | Parcial |
| CP-039.4 | Aviso de cookies | entro por primera vez | veo el aviso de cookies | puedo aceptarlo y no vuelve a mostrarse | Positivo | E2E | Alta | Parcial |

### RF-040 — Tema e interfaz del panel

**Historia:** [HU-040](../../requisitos/HUs/HU-040_tema_e_interfaz_del_panel.md) · **Requisito:** [RF-040](../../requisitos/RFs/RF-040_tema_e_interfaz_del_panel.md) · **Estado del requisito:** Parcial

| ID | Escenario | Precondición (dado que) | Acción (cuando) | Resultado esperado (entonces) | Tipo | Nivel | Prioridad | Aplica a v11 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CP-040.1 | Cambiar tema | estoy en cualquier pantalla | alterno entre tema claro y oscuro | la interfaz cambia y mi elección se recuerda | Positivo | E2E | Media | Parcial |
| CP-040.2 | Barra lateral colapsable | estoy en mi panel | colapso la barra lateral | solo veo los iconos y gano espacio | Positivo | E2E | Media | Parcial |
| CP-040.3 | Menú de tres puntos | veo una lista o tabla con acciones | abro el menú de tres puntos de una fila | encuentro las acciones secundarias (editar, eliminar, etc.) | Positivo | E2E | Media | Parcial |
| CP-040.4 | Contraste | uso cualquiera de los dos temas | reviso textos e iconos | todos son legibles | Positivo | E2E | Media | Parcial |

### RF-041 — Mensajes guiados

**Historia:** [HU-041](../../requisitos/HUs/HU-041_mensajes_guiados.md) · **Requisito:** [RF-041](../../requisitos/RFs/RF-041_mensajes_guiados.md) · **Estado del requisito:** Planificado

| ID | Escenario | Precondición (dado que) | Acción (cuando) | Resultado esperado (entonces) | Tipo | Nivel | Prioridad | Aplica a v11 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CP-041.1 | Mensaje contextual | me falta una evidencia en una fase | abro esa fase | veo un mensaje que me orienta sobre qué falta | Positivo | E2E | Baja | No |
| CP-041.2 | Estado vacío | aún no tengo proyecto | abro mi panel | veo un mensaje que me explica cómo crear uno o unirme | Positivo | E2E | Baja | No |
| CP-041.3 | Sin saturación | uso el sistema normalmente | navego por las pantallas | no recibo ventanas emergentes repetitivas | Negativo | E2E | Baja | No |

### RF-042 — Página de inicio pública

**Historia:** [HU-042](../../requisitos/HUs/HU-042_pagina_de_inicio_publica.md) · **Requisito:** [RF-042](../../requisitos/RFs/RF-042_pagina_de_inicio_publica.md) · **Estado del requisito:** Implementado

| ID | Escenario | Precondición (dado que) | Acción (cuando) | Resultado esperado (entonces) | Tipo | Nivel | Prioridad | Aplica a v11 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CP-042.1 | Presentación | entro a la página principal | la reviso | entiendo qué es ZENDA y cómo me ayuda | Positivo | E2E | Media | Sí |
| CP-042.2 | Navegación clara | uso la barra de navegación | reviso sus apartados | "Funcionalidad" y "Cómo funciona" tienen contenido claro, o no aparecen | Positivo | E2E | Media | Sí |
| CP-042.3 | Acceso | quiero entrar o registrarme | pulso "Iniciar sesión" o "Registrarse" | accedo al formulario correspondiente | Positivo | E2E | Media | Sí |
| CP-042.4 | Pie de página | bajo hasta el final de la página | lo reviso | veo el año vigente automático y los enlaces legales | Positivo | E2E | Media | Sí |

---

## Documentos relacionados

- [Plan de pruebas](../plan-de-pruebas.md) · [Matriz de cobertura](../matriz-cobertura.md)
- [Pruebas de integración](../pruebas-de-integracion.md) · [Pruebas no funcionales](../pruebas-no-funcionales.md)
