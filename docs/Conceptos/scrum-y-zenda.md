# Scrum y ZENDA — por qué el producto no usa roles Scrum

<!--
  ¿Qué? Qué es Scrum, qué parte de él usó ZENDA en v11, por qué v12 lo retira del producto y cómo queda el trabajo de los grupos.
  ¿Para qué? Dejar documentada la decisión y tener respuestas claras para la sustentación y para el instructor, que cuestionó la idea.
  ¿Impacto? Usar nombres de Scrum sin Scrum induce a error: parece una metodología aplicada y en realidad es solo etiquetas.
-->

---

## Identificación

| Campo | Valor |
|---|---|
| **Decisión** | El producto **no implementa roles ni ceremonias Scrum**; los grupos tienen un **líder** y todos los integrantes los mismos permisos |
| **Origen** | Observación del instructor ("los sub-roles no van") y decisión del equipo |
| **Reglas afectadas** | [RN-005](../requisitos/reglas-de-negocio.md#rn-005--roles-sin-sub-roles), [RN-008](../requisitos/reglas-de-negocio.md#rn-008--líder-del-grupo), [RN-021](../requisitos/reglas-de-negocio.md#rn-021--tareas-creadas-solo-por-el-líder), [RN-022](../requisitos/reglas-de-negocio.md#rn-022--flujo-de-estados-de-la-tarea) |
| **Restricción** | [RO-003 — Sin metodología Scrum en el producto](../requisitos/restricciones.md#ro-003--sin-metodología-scrum-en-el-producto) |
| **Fecha** | Octubre 2026 |

---

## 1. Qué es Scrum

**Scrum** es un marco de trabajo ligero para que equipos pequeños entreguen producto de forma iterativa, basado en inspeccionar y adaptar. Su guía oficial es la *Scrum Guide* (edición 2020).

| Elemento | Qué incluye |
|---|---|
| **Equipo Scrum** | Un *Scrum Master*, un *Product Owner* y *Developers* (sin jerarquías internas) |
| **Eventos** | *Sprint*, planificación del Sprint, *Daily Scrum*, revisión del Sprint y retrospectiva |
| **Artefactos** | *Product Backlog* (con la meta del producto), *Sprint Backlog* (con la meta del Sprint) e *Incremento* (con la definición de terminado) |

> **Scrum está deliberadamente incompleto: es un marco, no una receta.** Quitarle roles, eventos o artefactos deja "algo inspirado en Scrum", pero no Scrum. Por eso usar los **nombres** (Scrum Master, Product Owner, Developer) en un software obliga, para ser honestos, a **implementar el marco completo**: sprints, backlog, revisiones y retrospectivas.

---

## 2. Dos cosas distintas

| | **A. Cómo se construye ZENDA** | **B. Qué hace ZENDA como producto** |
|---|---|---|
| **Es** | El proceso del equipo de desarrollo | Lo que el sistema ofrece a aprendices e instructores |
| **Metodología** | Puede usar Scrum: Product Backlog, 3 sprints, historias con prioridad y puntos | **No** usa Scrum |
| **Ejemplo** | El cronograma de 8 semanas con 3 sprints | Un grupo que sube evidencias y un instructor que las evalúa |
| **Dónde se documenta** | `docs/gestion/` (backlog, cronograma, riesgos) | Requisitos, reglas de negocio y matriz de permisos |

La decisión de esta página es **solo sobre B**. El equipo puede seguir organizando su propio trabajo con Scrum.

---

## 3. Qué hacía v11 y por qué no era Scrum

| Elemento de v11 | Lo que se veía | Por qué no era Scrum |
|---|---|---|
| Sub-rol en el registro (`sub_rol_intencion`) | "Scrum Master" o "Developer" al registrarse | Los roles Scrum los asume un equipo para un sprint, no se eligen para siempre al crear la cuenta |
| Rol en el grupo (`rol_scrum`) | Una etiqueta por integrante | No había Product Owner con autoridad sobre un backlog |
| Regla "1 Scrum Master, 1 Product Owner, 2 o más Developers" | El sistema validaba combinaciones | Es una regla de plantilla, no de Scrum |
| "Solo el Scrum Master crea carpetas y sube evidencias" | Permisos por sub-rol | Scrum no define quién puede subir qué; ahí solo se concentraba el trabajo |
| Tablero de tareas | Estados Pendiente → En proceso → Finalizada | Es un tablero tipo Kanban; no había sprints, metas ni revisiones |

El proyecto formativo del SENA se organiza por **cinco fases fijas** (Análisis, Diseño, Desarrollo, Pruebas y Cierre/Entrega), que **no son sprints**.

---

## 4. Opciones que se evaluaron

| Opción | Descripción | Resultado |
|---|---|---|
| **A. Scrum completo en el producto** | Roles, sprints, backlog y ceremonias dentro de ZENDA | ❌ Mucho más sistema del que pide el SENA; las fases ya estructuran el trabajo |
| **B. Mantener los roles sin ceremonias** | Dejar Scrum Master, Product Owner y Developer como etiquetas | ❌ Sería Scrum a medias y concentraría los permisos en una persona |
| **C. Un líder y permisos iguales** | El que crea el proyecto es líder; el resto, integrantes | ✅ **Elegida**: simple, clara y sin pretender ser una metodología |
| **D. Sin líder** | Todos pueden hacer todo | ❌ Nadie confirma las tareas como terminadas |

---

## 5. Cómo queda en v12

| Concepto | Antes (v11) | Ahora (v12) |
|---|---|---|
| Quién crea el proyecto | Scrum Master | **Aprendiz sin proyecto**, que queda como **líder** |
| Roles en el grupo | Scrum Master, Product Owner, Developer | **Integrante** (todos iguales) y **líder** (uno, fijo) |
| Subir carpetas y evidencias | Solo el Scrum Master | **Cualquier integrante** |
| Crear y asignar tareas | Scrum Master | **Líder** |
| Mover una tarea | Responsable | **Responsable** |
| Dar por terminada una tarea | Scrum Master confirma o rechaza | **Líder** confirma o marca incompleta |
| Cambiar de líder | No contemplado | **Solo el administrador** (si el líder sale o su cuenta se desactiva) |
| Tamaño del equipo | 1 SM + 1 PO + 2 o más Developers | **Cupo** que define el líder al crear el proyecto |
| Nombre de la sección de tareas | Sprint Backlog | **Tablero de tareas** |

Cómo se refleja en el sistema:

| Capa | Cambio |
|---|---|
| **Base de datos** | Se eliminan `usuarios.sub_rol_intencion` e `integrantes_grupo.rol_scrum`; el líder es `grupos.lider_id`; se agrega `cupo_integrantes` ([migración](../../Database/migraciones/001_v12.sql)) |
| **API** | `register` ya no recibe `sub_rol`; `unirse` ya no recibe `rol_scrum` ([contrato](../referencia-tecnica/api-endpoints.md#12-cambios-de-contrato-planificados)) |
| **Interfaz** | Desaparece el selector de sub-rol; el equipo muestra "Líder" en lugar de etiquetas Scrum |
| **Permisos** | [Matriz de permisos](../requisitos/matriz-permisos.md): el líder solo agrega tres permisos al aprendiz |

---

## 6. Qué conserva ZENDA del espíritu de Scrum

Sin usar sus nombres, el sistema mantiene las ideas que sí aportan:

| Idea de Scrum | Cómo aparece en ZENDA |
|---|---|
| **Transparencia** | El tablero de tareas y el estado de fases y carpetas los ve todo el grupo |
| **Inspección** | El líder revisa cada tarea finalizada; el instructor evalúa cada evidencia |
| **Adaptación** | Una evidencia reprobada se corrige subiendo una versión nueva; nada bloquea el avance |
| **Definición de terminado** | Una tarea solo cuenta cuando el líder la confirma; una fase, cuando todas sus evidencias están aprobadas |

---

## 7. Decisiones relacionadas

| Decisión | Motivo |
|---|---|
| **El liderazgo no rota ni se transfiere entre aprendices** | El instructor mencionó que los roles cambian cada semana; **no se aplica** para no complicar el sistema. El grupo define quién lidera, por escrito o de palabra, y ZENDA lo refleja ([RN-008](../requisitos/reglas-de-negocio.md#rn-008--líder-del-grupo)) |
| **El administrador es la única vía para cambiar de líder** | Evita desorden en la gestión; resuelve el caso de un grupo sin líder ([RN-030](../requisitos/reglas-de-negocio.md#rn-030--reasignación-de-liderazgo-por-el-administrador)) |
| **La organización interna del grupo queda fuera del sistema** | Quién sube qué se acuerda en el grupo; todos pueden hacerlo |

**Riesgo conocido:** un líder único puede convertirse en un cuello de botella. Mitigación: la confirmación de tareas es lo único exclusivo del líder; todo lo demás es de todos.

---

## 8. Cómo nombrar las cosas

| Para decir… | Usa | Evita |
|---|---|---|
| La persona que creó el proyecto | **Líder del grupo** | Scrum Master |
| El resto del equipo | **Integrantes** | Developers, Product Owner |
| La lista de tareas | **Tablero de tareas** | Sprint Backlog, Sprint |
| El proceso de ZENDA | "Tablero de tareas **inspirado en** Scrum" (si hace falta mencionarlo) | "ZENDA usa Scrum" |
| El proceso del equipo de desarrollo | Scrum, con su backlog y sus sprints, en `docs/gestion/` | Mezclarlo con el producto |

---

## 9. Preguntas para la sustentación

| Pregunta | Respuesta breve |
|---|---|
| **¿ZENDA usa Scrum?** | No como producto. Usamos Scrum para organizar **nuestro** desarrollo. ZENDA ofrece a los grupos un tablero de tareas con un líder; el trabajo del proyecto formativo se estructura por las cinco fases del SENA. |
| **¿Por qué quitaron los roles Scrum?** | Porque usar los nombres sin implementar sprints, backlog ni revisiones es Scrum a medias, y porque concentraban los permisos en una persona cuando todos los aprendices deben poder subir sus evidencias. |
| **Si hay un líder, ¿no es lo mismo que un Scrum Master?** | No: el Scrum Master facilita y protege el proceso del equipo; el líder de ZENDA es quien crea el proyecto y confirma tareas. Tiene un nombre neutro precisamente para no sugerir una metodología. |
| **¿Qué pasa si el líder abandona?** | El administrador reasigna el liderazgo a otro integrante activo. |
| **¿Por qué el liderazgo no rota cada semana?** | Para no complicar el sistema; cada grupo acuerda su organización interna y el líder queda fijo, lo que ordena la logística. |
| **¿Qué quedó de Scrum?** | La transparencia del tablero, la revisión del líder, la corrección por versiones y la definición de "terminado". |

---

## Documentos relacionados

- [Reglas de negocio](../requisitos/reglas-de-negocio.md) · [Matriz de permisos](../requisitos/matriz-permisos.md) · [Restricciones](../requisitos/restricciones.md)
- [Estados de la tarea](../diagramas/estados.md#1-tarea) · [Requisitos de tareas](../requisitos/RFs/RF-028_creacion_y_asignacion_de_tareas.md) · [Esquema de base de datos](../referencia-tecnica/esquema-bd.md)
