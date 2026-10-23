# Diagramas de actividades — ZENDA

<!--
  ¿Qué? Flujo paso a paso de los procesos principales de ZENDA, con las decisiones y los responsables de cada actividad.
  ¿Para qué? Ver el comportamiento de extremo a extremo que los requisitos describen por separado.
  ¿Impacto? Revela pasos olvidados, decisiones sin salida y responsabilidades poco claras antes de programar.
-->

---

## Identificación

| Campo | Valor |
|---|---|
| **Notación** | UML de actividades con carriles (Mermaid `flowchart`) |
| **Procesos** | 6 |
| **Complementa** | [Estados](estados.md) · [BPMN](bpmn.md) · [Mapa de procesos](mapa-procesos.md) |
| **Fecha** | Octubre 2026 |

**Leyenda:** ⬭ inicio y fin · ▭ actividad · ◇ decisión · cada carril (*subgraph*) es un actor.

---

## 1. Registro de aprendiz

Requisito: [RF-001](../requisitos/RFs/RF-001_registro_de_aprendiz.md) · Historia: [HU-001](../requisitos/HUs/HU-001_registro_de_aprendiz.md)

```mermaid
flowchart TD
    subgraph APR["🎓 Aprendiz nuevo"]
        A1(["Inicio"])
        A2["Abre el registro"]
        A3["Completa datos, correo institucional y ficha"]
        A4["Escribe contraseña y la confirma sin pegar"]
        A5["Acepta las 4 casillas legales"]
        A6["Envía el formulario"]
        A7["Abre el enlace de verificación"]
        A8(["Accede a su panel"])
    end

    subgraph SIS["⚙️ Sistema"]
        S1{"¿Datos completos, correo institucional<br/>y 4 aceptaciones?"}
        S2{"¿Correo sin registrar?"}
        S3{"¿La ficha existe?"}
        S4["Crea la cuenta con contraseña cifrada"]
        S5["Inscribe al aprendiz en el grupo General de su ficha"]
        S6["Envía el correo de verificación"]
        S7["Marca el correo como verificado"]
        SE["Muestra el mensaje de error"]
    end

    A1 --> A2 --> A3 --> A4 --> A5 --> A6 --> S1
    S1 -- "No" --> SE
    S1 -- "Sí" --> S2
    S2 -- "No" --> SE
    S2 -- "Sí" --> S3
    S3 -- "No" --> SE
    S3 -- "Sí" --> S4 --> S5 --> S6 --> A7 --> S7 --> A8
    SE --> A3
```

| Regla | Detalle |
|---|---|
| Correo | Debe terminar en `@soy.sena.edu.co` ([RN-001](../requisitos/reglas-de-negocio.md#rn-001--registro-limitado-a-aprendices-con-correo-institucional)). |
| Aceptación legal | Las 4 casillas son obligatorias ([RN-004](../requisitos/reglas-de-negocio.md#rn-004--aceptación-legal-obligatoria)). |
| Grupo `General` | Se crea si la ficha aún no lo tiene ([RN-006](../requisitos/reglas-de-negocio.md#rn-006--grupo-general-por-ficha)). |
| Verificación | Paso de v12; las cuentas existentes se consideran verificadas. |

---

## 2. Crear un proyecto o unirse a uno

Requisitos: [RF-014](../requisitos/RFs/RF-014_creacion_de_proyecto.md), [RF-015](../requisitos/RFs/RF-015_unirse_a_un_proyecto.md) · Historias: [HU-014](../requisitos/HUs/HU-014_creacion_de_proyecto.md), [HU-015](../requisitos/HUs/HU-015_unirse_a_un_proyecto.md)

```mermaid
flowchart TD
    subgraph APR["🎓 Aprendiz"]
        A1(["Inicio"])
        A2["Abre Mi proyecto"]
        A3{"¿Crear o unirse?"}
        A4["Completa nombre, problema, objetivo,<br/>alcance, fechas y cupo"]
        A5["Ingresa el código PRY-XXXXXXXXXX"]
        A6(["Ve su proyecto"])
        A7["Comparte el código con su grupo"]
    end

    subgraph SIS["⚙️ Sistema"]
        S1{"¿Ya tiene un proyecto activo?"}
        S2{"¿Está inscrito en una ficha?"}
        S3["Abre una transacción"]
        S4["Crea el grupo con el aprendiz como líder"]
        S5["Crea el proyecto y las 5 fases fijas"]
        S6["Confirma la transacción y genera el código"]
        S7{"¿El código existe?"}
        S8{"¿Hay cupo disponible?"}
        S9["Inscribe al aprendiz como integrante"]
        SE["Muestra el mensaje de error"]
    end

    A1 --> A2 --> S1
    S1 -- "Sí" --> A6
    S1 -- "No" --> A3
    A3 -- "Crear" --> A4 --> S2
    S2 -- "No" --> SE
    S2 -- "Sí" --> S3 --> S4 --> S5 --> S6 --> A7 --> A6
    A3 -- "Unirse" --> A5 --> S7
    S7 -- "No" --> SE
    S7 -- "Sí" --> S8
    S8 -- "No" --> SE
    S8 -- "Sí" --> S9 --> A6
    SE --> A3
```

| Regla | Detalle |
|---|---|
| Un proyecto activo | [RN-007](../requisitos/reglas-de-negocio.md#rn-007--un-proyecto-activo-por-aprendiz) |
| El creador es el líder y queda fijo | [RN-008](../requisitos/reglas-de-negocio.md#rn-008--líder-del-grupo) |
| Cupo | [RN-009](../requisitos/reglas-de-negocio.md#rn-009--cupo-del-grupo) |
| La creación es **atómica**: si falla un paso, no queda nada a medias | [Arquitectura 6.4](../referencia-tecnica/arquitectura.md#64-creación-de-proyecto) |

---

## 3. Entrega y evaluación de evidencias

Requisitos: [RF-019](../requisitos/RFs/RF-019_carpetas_de_una_fase.md), [RF-020](../requisitos/RFs/RF-020_subida_de_evidencias.md), [RF-022](../requisitos/RFs/RF-022_versiones_y_eliminacion_de_evidencias.md), [RF-023](../requisitos/RFs/RF-023_evaluacion_de_evidencias.md), [RF-025](../requisitos/RFs/RF-025_estado_y_porcentaje_de_avance.md)

```mermaid
flowchart TD
    subgraph APR["🎓 Integrante del grupo"]
        A1(["Inicio"])
        A2["Crea una carpeta en la fase"]
        A3["Sube un archivo o registra un enlace"]
        A4["Consulta el resultado y las observaciones"]
        A5{"¿La carpeta quedó aprobada?"}
        A6["Sube una versión nueva de la evidencia reprobada"]
        A7(["Fase completada"])
    end

    subgraph SIS["⚙️ Sistema"]
        S1{"¿Es integrante activo<br/>y el archivo es válido?"}
        S2["Comprime imágenes grandes y guarda el archivo"]
        S3["Registra la evidencia y su versión"]
        S4["Recalcula carpeta y fase: En revisión"]
        S5["Registra la evaluación y marca la anterior como histórica"]
        S6["Recalcula en cascada y calcula el porcentaje"]
        SE["Rechaza y explica el motivo"]
    end

    subgraph INS["👨‍🏫 Instructor de la ficha"]
        I1["Revisa la evidencia"]
        I2{"¿La aprueba?"}
        I3["Marca APROBADO"]
        I4["Marca REPROBADO y escribe una observación"]
    end

    A1 --> A2 --> A3 --> S1
    S1 -- "No" --> SE --> A3
    S1 -- "Sí" --> S2 --> S3 --> S4 --> I1 --> I2
    I2 -- "Sí" --> I3 --> S5
    I2 -- "No" --> I4 --> S5
    S5 --> S6 --> A4 --> A5
    A5 -- "Sí" --> A7
    A5 -- "No" --> A6 --> S1
```

| Regla | Detalle |
|---|---|
| Nadie queda bloqueado: se puede seguir subiendo con la fase en revisión | [RN-015](../requisitos/reglas-de-negocio.md#rn-015--sin-bloqueo-por-fase) |
| Una evidencia aprobada queda protegida | [RN-014](../requisitos/reglas-de-negocio.md#rn-014--versionado-y-borrado-lógico) |
| La evaluación se agrega, no se sobrescribe | [RN-017](../requisitos/reglas-de-negocio.md#rn-017--historial-de-evaluaciones) |
| Cascada y porcentaje | [RN-018](../requisitos/reglas-de-negocio.md#rn-018--cascada-de-estados), [RN-020](../requisitos/reglas-de-negocio.md#rn-020--porcentaje-de-avance-de-la-fase) |

---

## 4. Gestión de tareas

Requisitos: [RF-028](../requisitos/RFs/RF-028_creacion_y_asignacion_de_tareas.md) a [RF-031](../requisitos/RFs/RF-031_tablero_y_progreso_de_tareas.md)

```mermaid
flowchart TD
    subgraph LID["⭐ Líder"]
        L1(["Inicio"])
        L2["Crea la tarea y elige al responsable y la prioridad"]
        L3["Revisa la tarea finalizada"]
        L4{"¿Cumple lo esperado?"}
        L5["Confirma la tarea"]
        L6["La marca como incompleta"]
        L7(["Tarea cerrada"])
    end

    subgraph SIS["⚙️ Sistema"]
        S1{"¿El responsable es integrante activo?"}
        S2["Guarda la tarea en Pendiente"]
        S3["Actualiza el estado y el progreso del grupo"]
        SE["Muestra el mensaje de error"]
    end

    subgraph RES["🎓 Responsable"]
        R1["Mueve la tarea a En proceso"]
        R2["Mueve la tarea a Finalizada"]
    end

    L1 --> L2 --> S1
    S1 -- "No" --> SE --> L2
    S1 -- "Sí" --> S2 --> R1 --> R2 --> L3 --> L4
    L4 -- "Sí" --> L5 --> S3 --> L7
    L4 -- "No" --> L6 --> R1
```

| Regla | Detalle |
|---|---|
| Solo el líder crea, asigna y confirma | [RN-021](../requisitos/reglas-de-negocio.md#rn-021--tareas-creadas-solo-por-el-líder) |
| Solo el responsable mueve su tarea | [RN-022](../requisitos/reglas-de-negocio.md#rn-022--flujo-de-estados-de-la-tarea) |

---

## 5. Lista de chequeo del instructor

Requisitos: [RF-036](../requisitos/RFs/RF-036_creacion_de_lista_de_chequeo.md), [RF-037](../requisitos/RFs/RF-037_importacion_exportacion_y_copia_de_listas.md), [RF-038](../requisitos/RFs/RF-038_evaluacion_con_lista_de_chequeo.md)

```mermaid
flowchart TD
    subgraph INS["👨‍🏫 Instructor"]
        I1(["Inicio"])
        I2{"¿Crea desde cero o importa un Excel?"}
        I3["Agrega ítems por fase en el editor"]
        I4["Sube su Excel"]
        I5["Indica qué columna es fase, nombre y descripción"]
        I6{"¿La copia a otras fichas?"}
        I7["Copia la lista a la ficha destino"]
        I8["Marca cada ítem por grupo"]
        I9(["Consulta el avance"])
    end

    subgraph SIS["⚙️ Sistema"]
        S1["Muestra la vista previa"]
        S2{"¿Las filas son válidas?"}
        S3["Crea la lista de la ficha y sus ítems"]
        S4["Registra la evaluación y marca la anterior como histórica"]
        S5["Calcula el avance por grupo y por ficha"]
        SE["Informa las filas rechazadas"]
    end

    I1 --> I2
    I2 -- "Desde cero" --> I3 --> S3
    I2 -- "Importar" --> I4 --> S1 --> I5 --> S2
    S2 -- "No" --> SE --> I5
    S2 -- "Sí" --> S3
    S3 --> I6
    I6 -- "Sí" --> I7 --> I8
    I6 -- "No" --> I8
    I8 --> S4 --> S5 --> I9
```

| Regla | Detalle |
|---|---|
| La lista pertenece a la ficha, no al instructor | [RN-026](../requisitos/reglas-de-negocio.md#rn-026--lista-de-chequeo-por-ficha) |
| El avance cuenta ítems obligatorios aprobados | [RN-027](../requisitos/reglas-de-negocio.md#rn-027--avance-de-la-lista-de-chequeo) |
| Es independiente de la cascada de evidencias | [Dominio, sección 5](modelo-dominio.md#5-cómo-se-calcula-lo-que-importa) |

---

## 6. Recuperación de contraseña

Requisito: [RF-003](../requisitos/RFs/RF-003_recuperacion_de_contrasena.md) · Historia: [HU-003](../requisitos/HUs/HU-003_recuperacion_de_contrasena.md)

```mermaid
flowchart TD
    subgraph USR["👤 Usuario"]
        U1(["Inicio"])
        U2["Pide recuperar su contraseña con su correo"]
        U3["Abre el enlace del correo"]
        U4["Escribe la contraseña nueva"]
        U5(["Inicia sesión con la nueva"])
    end

    subgraph SIS["⚙️ Sistema"]
        S1["Responde siempre el mismo mensaje"]
        S2{"¿El correo está registrado?"}
        S3["Genera un token de 15 minutos y envía el correo"]
        S4{"¿El token es válido y vigente?"}
        S5{"¿La contraseña cumple la política?"}
        S6["Guarda la contraseña cifrada e invalida el token"]
        SE["Muestra el mensaje de error"]
    end

    U1 --> U2 --> S1 --> S2
    S2 -- "Sí" --> S3 --> U3
    S2 -- "No" --> U1
    U3 --> U4 --> S4
    S4 -- "No" --> SE --> U2
    S4 -- "Sí" --> S5
    S5 -- "No" --> SE
    S5 -- "Sí" --> S6 --> U5
```

> El sistema responde igual exista o no el correo, para no revelar qué cuentas están registradas ([RNF-001.6](../requisitos/RNFs/RNF-001_seguridad.md)). Hoy (v11) responde `404` si no existe; es un cambio aprobado.

---

## Documentos relacionados

- [Estados](estados.md) · [BPMN](bpmn.md) · [Mapa de procesos](mapa-procesos.md)
- [Requisitos](../requisitos/matriz-trazabilidad.md) · [Reglas de negocio](../requisitos/reglas-de-negocio.md)
