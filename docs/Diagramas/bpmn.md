# Diagramas BPMN — ZENDA

<!--
  ¿Qué? Procesos de colaboración entre participantes (aprendices, sistema, instructores, administración) con eventos, tareas, decisiones y mensajes.
  ¿Para qué? Mostrar quién hace qué y qué se envían entre sí los participantes, algo que el diagrama de actividades no destaca.
  ¿Impacto? Aclara los traspasos entre personas y sistema, que es donde más se pierden las responsabilidades.
-->

---

## Identificación

| Campo | Valor |
|---|---|
| **Notación** | BPMN **representado** con Mermaid `flowchart` (no es BPMN 2.0 formal) |
| **Procesos** | 4 |
| **Complementa** | [Actividades](actividades.md) · [Mapa de procesos](mapa-procesos.md) |
| **Fecha** | Octubre 2026 |

> **Limitación:** Mermaid no soporta BPMN 2.0 de forma nativa. Estos diagramas usan la misma lógica y los mismos símbolos, y cada uno trae una **tabla de elementos** con tipo, participante y requisito, de modo que se pueden redibujar tal cual en [bpmn.io](https://bpmn.io) si el instructor exige el formato `.bpmn` estricto.

## Equivalencia de símbolos

| BPMN 2.0 | En estos diagramas |
|---|---|
| Evento de inicio | Círculo `(( ))` con el texto "Inicio" o el disparador |
| Evento de fin | Círculo doble `((( )))` |
| Tarea | Rectángulo redondeado `( )` |
| Pasarela exclusiva (XOR) | Rombo `{ }` con "✕" |
| Evento intermedio de mensaje | Círculo con ✉ |
| Flujo de secuencia | Flecha continua `-->` |
| Flujo de mensaje entre participantes | Flecha punteada `-.->` |
| Piscina (participante) | Recuadro con el nombre del participante |

---

## 1. Evaluación de una evidencia

Requisitos: [RF-020](../requisitos/RFs/RF-020_subida_de_evidencias.md), [RF-023](../requisitos/RFs/RF-023_evaluacion_de_evidencias.md), [RF-025](../requisitos/RFs/RF-025_estado_y_porcentaje_de_avance.md)

```mermaid
flowchart LR
    subgraph P1["🎓 Integrante del grupo"]
        a0(("Inicio"))
        a1("Subir la evidencia")
        a2(("✉ Resultado recibido"))
        a3("Revisar resultado y observaciones")
        a4{"✕ ¿Aprobada?"}
        a5("Subir versión nueva")
        a6((("Fin")))
        a0 --> a1
        a2 --> a3 --> a4
        a4 -- "No" --> a5 --> a1
        a4 -- "Sí" --> a6
    end

    subgraph P2["⚙️ ZENDA"]
        s0(("✉ Evidencia recibida"))
        s1("Validar permisos, tipo y tamaño")
        s2{"✕ ¿Es válida?"}
        s3("Rechazar y explicar el motivo")
        s4("Guardar archivo y registrar la versión")
        s5("Recalcular estado: En revisión")
        s6(("✉ Evaluación recibida"))
        s7("Registrar evaluación y archivar la anterior")
        s8("Recalcular carpeta y fase en cascada")
        s0 --> s1 --> s2
        s2 -- "No" --> s3
        s2 -- "Sí" --> s4 --> s5
        s6 --> s7 --> s8
    end

    subgraph P3["👨‍🏫 Instructor de la ficha"]
        i0(("✉ Evidencia por evaluar"))
        i1("Revisar la evidencia")
        i2{"✕ ¿Aprueba?"}
        i3("Marcar APROBADO")
        i4("Marcar REPROBADO y observar")
        i5((("Fin")))
        i0 --> i1 --> i2
        i2 -- "Sí" --> i3 --> i5
        i2 -- "No" --> i4 --> i5
    end

    a1 -. "mensaje: evidencia" .-> s0
    s3 -. "mensaje: rechazo" .-> a1
    s5 -. "mensaje: pendiente de revisión" .-> i0
    i3 -. "mensaje: evaluación" .-> s6
    i4 -. "mensaje: evaluación y observación" .-> s6
    s8 -. "mensaje: resultado" .-> a2
```

| ID | Tipo | Elemento | Participante | Requisito |
|---|---|---|---|---|
| a1 | Tarea | Subir la evidencia | Integrante | [RF-020](../requisitos/RFs/RF-020_subida_de_evidencias.md) |
| s1–s2 | Tarea y pasarela | Validar permisos, tipo y tamaño | ZENDA | [RN-012](../requisitos/reglas-de-negocio.md#rn-012--carpetas-y-evidencias-por-cualquier-integrante), [RN-013](../requisitos/reglas-de-negocio.md#rn-013--tipos-de-evidencia-y-límites) |
| s4–s5 | Tarea | Registrar versión y recalcular a En revisión | ZENDA | [RN-014](../requisitos/reglas-de-negocio.md#rn-014--versionado-y-borrado-lógico) |
| i1–i2 | Tarea y pasarela | Revisar y decidir | Instructor | [RN-016](../requisitos/reglas-de-negocio.md#rn-016--evaluación-por-el-instructor-asignado) |
| s7 | Tarea | Registrar evaluación y archivar la anterior | ZENDA | [RN-017](../requisitos/reglas-de-negocio.md#rn-017--historial-de-evaluaciones) |
| s8 | Tarea | Recalcular en cascada | ZENDA | [RN-018](../requisitos/reglas-de-negocio.md#rn-018--cascada-de-estados) |
| a4 | Pasarela | ¿Aprobada? | Integrante | [RF-025](../requisitos/RFs/RF-025_estado_y_porcentaje_de_avance.md) |

---

## 2. Incorporación del aprendiz y conformación del grupo

Requisitos: [RF-001](../requisitos/RFs/RF-001_registro_de_aprendiz.md), [RF-014](../requisitos/RFs/RF-014_creacion_de_proyecto.md), [RF-015](../requisitos/RFs/RF-015_unirse_a_un_proyecto.md)

El grupo define **fuera del sistema** (en papel o de palabra) quién será el líder y qué integrantes lo forman; ZENDA solo refleja esa decisión.

```mermaid
flowchart LR
    subgraph P1["🎓 Aprendiz nuevo"]
        n0(("Inicio"))
        n1("Registrarse con correo institucional")
        n2(("✉ Código recibido"))
        n3("Ingresar el código de invitación")
        n4("Ver el proyecto del grupo")
        n5((("Fin")))
        n0 --> n1
        n2 --> n3 --> n4 --> n5
    end

    subgraph P2["⭐ Aprendiz líder"]
        l0(("Inicio: el grupo ya eligió líder"))
        l1("Crear el proyecto con su cupo")
        l2("Compartir el código con el grupo")
        l3((("Fin")))
        l0 --> l1 --> l2 --> l3
    end

    subgraph P3["⚙️ ZENDA"]
        z0("Crear cuenta e inscribir en el grupo General")
        z1("Crear grupo, proyecto y 5 fases")
        z2("Generar el código PRY-XXXXXX")
        z3{"✕ ¿Hay cupo?"}
        z4("Rechazar: grupo completo")
        z5("Inscribir al aprendiz en el grupo")
        z1 --> z2
        z3 -- "No" --> z4
        z3 -- "Sí" --> z5
    end

    n1 -. "mensaje: datos de registro" .-> z0
    l1 -. "mensaje: datos del proyecto" .-> z1
    z2 -. "mensaje: código" .-> l2
    l2 -. "fuera del sistema: se comparte el código" .-> n2
    n3 -. "mensaje: código" .-> z3
    z5 -. "mensaje: pertenencia confirmada" .-> n4
    z4 -. "mensaje: error" .-> n3
```

| ID | Tipo | Elemento | Participante | Requisito |
|---|---|---|---|---|
| n1 / z0 | Tarea | Registro e inscripción en `General` | Aprendiz / ZENDA | [RN-006](../requisitos/reglas-de-negocio.md#rn-006--grupo-general-por-ficha) |
| l1 / z1 | Tarea | Crear grupo, proyecto y fases | Líder / ZENDA | [RN-008](../requisitos/reglas-de-negocio.md#rn-008--líder-del-grupo), [RN-011](../requisitos/reglas-de-negocio.md#rn-011--cinco-fases-fijas) |
| z2 | Tarea | Generar código | ZENDA | [RN-010](../requisitos/reglas-de-negocio.md#rn-010--código-de-invitación) |
| l2 → n2 | Mensaje externo | Compartir el código | Líder → Aprendiz | Fuera del sistema |
| z3 | Pasarela | ¿Hay cupo? | ZENDA | [RN-009](../requisitos/reglas-de-negocio.md#rn-009--cupo-del-grupo) |

---

## 3. Cambio de instructor de una ficha

Requisito: [RF-011](../requisitos/RFs/RF-011_asignacion_de_instructores_a_fichas.md)

```mermaid
flowchart LR
    subgraph P1["🧭 Coordinador o 🛡️ Administrador"]
        c0(("Inicio: cambia el instructor"))
        c1("Elegir instructor y fichas")
        c2("Confirmar con su contraseña")
        c3("Revisar el error")
        c4((("Fin")))
        c0 --> c1 --> c2
        c3 --> c1
    end

    subgraph P2["⚙️ ZENDA"]
        z1{"✕ ¿Contraseña correcta?"}
        z2{"✕ ¿Fichas dentro del alcance?"}
        z3("Cerrar vinculaciones retiradas con fecha de fin")
        z4("Crear vinculaciones nuevas con fecha de inicio")
        z5("Registrar en auditoría")
        z6("Conservar lista de chequeo y evaluaciones en la ficha")
        z7("Rechazar y explicar el motivo")
        z1 -- "No" --> z7
        z1 -- "Sí" --> z2
        z2 -- "No" --> z7
        z2 -- "Sí" --> z3 --> z4 --> z5 --> z6
    end

    subgraph P3["👨‍🏫 Instructor entrante"]
        e1(("✉ Ficha asignada"))
        e2("Ver la ficha con su historial")
        e3((("Fin")))
        e1 --> e2 --> e3
    end

    subgraph P4["👨‍🏫 Instructor saliente"]
        o1(("✉ Ficha retirada"))
        o2("Deja de poder evaluar esa ficha")
        o3((("Fin")))
        o1 --> o2 --> o3
    end

    c2 -. "mensaje: cambio" .-> z1
    z7 -. "mensaje: error" .-> c3
    z6 -. "mensaje: ficha" .-> e1
    z6 -. "mensaje: retiro" .-> o1
    z6 -. "mensaje: confirmación" .-> c4
```

| ID | Tipo | Elemento | Participante | Requisito |
|---|---|---|---|---|
| c2 / z1 | Tarea y pasarela | Confirmación con contraseña | Coordinador o administrador / ZENDA | [RN-028](../requisitos/reglas-de-negocio.md#rn-028--confirmación-con-contraseña) |
| z2 | Pasarela | El coordinador solo opera en fichas ADSO | ZENDA | [RN-025](../requisitos/reglas-de-negocio.md#rn-025--alcance-del-coordinador) |
| z3–z4 | Tarea | Cerrar y crear vinculaciones con fechas | ZENDA | [RN-024](../requisitos/reglas-de-negocio.md#rn-024--asignación-instructorficha-con-historial) |
| z6 | Tarea | La lista y las evaluaciones pertenecen a la ficha | ZENDA | [RN-026](../requisitos/reglas-de-negocio.md#rn-026--lista-de-chequeo-por-ficha) |
| o2 | Tarea | Pierde el permiso de evaluar, conserva su historial | Instructor saliente | [RN-016](../requisitos/reglas-de-negocio.md#rn-016--evaluación-por-el-instructor-asignado) |

> Hoy (v11) la reasignación borra las vinculaciones y las vuelve a crear, por lo que no queda historial. Este es el flujo objetivo.

---

## 4. Reasignación de liderazgo

Requisito: [RF-018](../requisitos/RFs/RF-018_reasignacion_de_liderazgo.md)

```mermaid
flowchart LR
    subgraph P1["⚙️ ZENDA"]
        z0(("Inicio: el líder sale o su cuenta se desactiva"))
        z1("Marcar el grupo como sin líder y alertar")
        z2{"✕ ¿El nuevo líder es integrante activo?"}
        z3{"✕ ¿Contraseña correcta?"}
        z4("Actualizar el líder del grupo")
        z5("Registrar en auditoría")
        z6("Rechazar y explicar el motivo")
        z0 --> z1
        z3 -- "No" --> z6
        z3 -- "Sí" --> z2
        z2 -- "No" --> z6
        z2 -- "Sí" --> z4 --> z5
    end

    subgraph P2["🛡️ Administrador"]
        a1(("✉ Alerta recibida"))
        a2("Consultar el grupo y sus integrantes")
        a3("Elegir al nuevo líder y confirmar con su contraseña")
        a4((("Fin")))
        a1 --> a2 --> a3
    end

    subgraph P3["🎓 Integrante designado"]
        n1(("✉ Liderazgo asignado"))
        n2("Puede crear tareas y confirmar su cumplimiento")
        n3((("Fin")))
        n1 --> n2 --> n3
    end

    z1 -. "mensaje: grupo sin líder" .-> a1
    a3 -. "mensaje: reasignación" .-> z3
    z6 -. "mensaje: error" .-> a3
    z5 -. "mensaje: confirmación" .-> a4
    z5 -. "mensaje: nuevo rol" .-> n1
```

| ID | Tipo | Elemento | Participante | Requisito |
|---|---|---|---|---|
| z0–z1 | Evento y tarea | Detectar grupo sin líder y alertar | ZENDA | [RF-007](../requisitos/RFs/RF-007_desactivacion_y_eliminacion_de_usuarios.md) |
| a3 / z3 | Tarea y pasarela | Confirmación con contraseña | Administrador / ZENDA | [RN-028](../requisitos/reglas-de-negocio.md#rn-028--confirmación-con-contraseña) |
| z2 | Pasarela | Solo integrantes activos pueden ser líder | ZENDA | [RN-030](../requisitos/reglas-de-negocio.md#rn-030--reasignación-de-liderazgo-por-el-administrador) |
| n2 | Tarea | Ejerce los permisos del líder | Integrante designado | [RN-008](../requisitos/reglas-de-negocio.md#rn-008--líder-del-grupo) |

> El liderazgo **no se transfiere entre aprendices**: esta es la única vía, y la ejecuta el administrador.

---

## Documentos relacionados

- [Actividades](actividades.md) · [Mapa de procesos](mapa-procesos.md) · [Estados](estados.md)
- [Reglas de negocio](../requisitos/reglas-de-negocio.md) · [Matriz de permisos](../requisitos/matriz-permisos.md)
