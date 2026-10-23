# Modelos MER y MR — ZENDA v12

<!--
  ¿Qué? Modelo entidad-relación (conceptual) y modelo relacional (lógico) de la base de datos de ZENDA.
  ¿Para qué? Entender primero el negocio (MER) y luego su implementación en tablas, tipos y restricciones (MR).
  ¿Impacto? El MR es lo que el backend consulta con SQL directo: un cambio aquí afecta a todas las consultas.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **Motor** | PostgreSQL 14 o superior |
| **Tablas** | 20 (de las cuales 7 son nuevas en v12) |
| **Fuente** | `Database/zenda_bd.sql` + `Database/migrations/002_semana2.sql` |
| **Diccionario y restricciones** | [`esquema-bd.md`](../referencia-tecnica/esquema-bd.md) |
| **Fecha** | Octubre 2026 |

---

## 1. MER y MR: en qué se diferencian

| | MER (conceptual) | MR (relacional) |
|---|---|---|
| **Pregunta que responde** | ¿Qué cosas existen en el negocio y cómo se relacionan? | ¿Cómo se guardan en tablas? |
| **Muestra** | Entidades, atributos clave y relaciones con cardinalidad | Tablas, columnas, tipos, `PK`, `FK`, `UK` y nulabilidad |
| **Relaciones N:M** | Se dibujan directas | Se resuelven con tabla asociativa (`instructor_ficha`, `integrantes_grupo`) |
| **Audiencia** | Instructor, coordinador, equipo | Quien escribe el SQL |

---

## 2. Diagrama entidad-relación (MER)

```mermaid
erDiagram
    programas ||--o{ fichas : tiene
    fichas ||--o{ grupos : agrupa
    fichas ||--o{ instructor_ficha : "es atendida por"
    usuarios ||--o{ instructor_ficha : atiende
    usuarios |o--o{ grupos : lidera
    grupos ||--o{ integrantes_grupo : incluye
    usuarios ||--o{ integrantes_grupo : participa
    grupos ||--o| proyectos : desarrolla
    proyectos ||--|{ fases : "5 fases"
    proyectos ||--o{ tareas : organiza
    usuarios ||--o{ tareas : "es responsable"
    fases ||--o{ carpetas : contiene
    carpetas ||--o{ evidencias : contiene
    usuarios ||--o{ evidencias : sube
    evidencias ||--|{ evidencia_versiones : versiona
    evidencias ||--o{ evaluaciones : recibe
    usuarios ||--o{ evaluaciones : realiza
    proyectos ||--o{ observaciones : recibe
    evidencias |o--o{ observaciones : "se refiere"
    usuarios ||--o{ observaciones : escribe
    fichas ||--o| listas_chequeo : define
    listas_chequeo ||--o{ lista_chequeo_items : contiene
    lista_chequeo_items ||--o{ lista_chequeo_evaluaciones : se_evalua
    grupos ||--o{ lista_chequeo_evaluaciones : es_evaluado
    usuarios ||--o{ sesiones_refresh : abre
    usuarios ||--o{ tokens_verificacion_correo : recibe
    usuarios |o--o{ auditoria : genera
```


## 2.1 Modelo Relacional (MR)

Solo el dominio del negocio: se omiten las tablas técnicas (`sesiones_refresh`, `tokens_verificacion_correo`, `auditoria`).

```mermaid
erDiagram
    PROGRAMA ||--o{ FICHA : "ofrece"
    FICHA ||--o{ GRUPO : "agrupa"
    USUARIO }o--o{ FICHA : "instructor atiende"
    USUARIO }o--o{ GRUPO : "integra"
    USUARIO |o--o{ GRUPO : "lidera"
    GRUPO ||--o| PROYECTO : "desarrolla"
    PROYECTO ||--|{ FASE : "se divide en 5"
    PROYECTO ||--o{ TAREA : "organiza"
    USUARIO ||--o{ TAREA : "es responsable de"
    FASE ||--o{ CARPETA : "contiene"
    CARPETA ||--o{ EVIDENCIA : "contiene"
    USUARIO ||--o{ EVIDENCIA : "sube"
    EVIDENCIA ||--|{ VERSION : "tiene"
    EVIDENCIA ||--o{ EVALUACION : "recibe"
    USUARIO ||--o{ EVALUACION : "realiza"
    PROYECTO ||--o{ OBSERVACION : "recibe"
    EVIDENCIA |o--o{ OBSERVACION : "motiva"
    FICHA ||--o| LISTA_CHEQUEO : "tiene"
    LISTA_CHEQUEO ||--o{ ITEM : "contiene"
    ITEM }o--o{ GRUPO : "se evalua por grupo"
    PROGRAMA {
        int codigo
        string nombre
    }
    FICHA {
        int numero
        date inicio
        date fin
        string jornada
    }
    USUARIO {
        string correo
        string nombre
        enum rol
        string estado
    }
    GRUPO {
        string codigo
        string tipo
        int cupo
    }
    PROYECTO {
        string nombre
        string problema
        string objetivo
        date fecha_fin_estimada
    }
    FASE {
        int numero
        string nombre
        string estado
    }
    CARPETA {
        string nombre
        string estado
    }
    EVIDENCIA {
        string nombre
        string tipo
        bool eliminada
    }
    VERSION {
        int numero
        string ubicacion
        string hash
    }
    EVALUACION {
        string resultado
        date fecha
        bool vigente
    }
    OBSERVACION {
        string titulo
        string descripcion
    }
    TAREA {
        string titulo
        string prioridad
        string estado
        date limite
    }
    LISTA_CHEQUEO {
        string nombre
    }
    ITEM {
        int fase
        string evidencia
        bool obligatorio
    }
```
---

| Relación | Cardinalidad | Cómo se lee |
|---|:---:|---|
| Programa – Ficha | 1 : N | Un programa ofrece varias fichas; cada ficha es de un programa. |
| Usuario (instructor) – Ficha | N : M | Un instructor atiende varias fichas y una ficha puede cambiar de instructor. Se guarda con historial. |
| Usuario – Grupo | N : M | Un usuario integra grupos (el `General` y, a lo sumo, uno de proyecto activo). |
| Usuario – Grupo (líder) | 1 : N, opcional | Un grupo de proyecto tiene un líder; el grupo `General` no. |
| Grupo – Proyecto | 1 : 0..1 | Un grupo de proyecto tiene un proyecto. |
| Proyecto – Fase | 1 : 5 | Cada proyecto tiene exactamente 5 fases fijas. |
| Fase – Carpeta – Evidencia | 1 : N : N | Las fases contienen carpetas y estas, evidencias. |
| Evidencia – Versión | 1 : 1..N | Toda evidencia tiene al menos una versión. |
| Evidencia – Evaluación | 1 : N | Se conserva el historial; solo una es la vigente. |
| Ficha – Lista de chequeo | 1 : 0..1 | Una lista por ficha. |
| Ítem – Grupo | N : M | Cada ítem se evalúa por grupo. |

---

## 3. Modelo relacional (MR)

**Cómo leerlo:** cada columna muestra `tipo nombre llaves "nulabilidad y restricciones"`.

| Símbolo | Significado |
|---|---|
| `PK` | Clave primaria (identidad generada) |
| `FK` | Clave foránea |
| `UK` | Valor único por sí solo |
| `NOT NULL` / `NULL` | Obligatoria u opcional |
| `CHECK` | Valores limitados (ver [valores permitidos](../referencia-tecnica/esquema-bd.md#3-valores-permitidos)) |
| `DEF x` | Valor por defecto `x` |

Los diagramas se dividen por módulo para que sean legibles. Las tablas de otros módulos aparecen solo con su clave.

### 3.1 Acceso y estructura académica

**Tablas:** `programas`, `fichas`, `usuarios`, `instructor_ficha`, `sesiones_refresh`, `tokens_verificacion_correo`, `auditoria`. Tablas referenciadas desde otros módulos (solo su clave): `carpetas`, `evaluaciones`, `evidencia_versiones`, `evidencias`, `grupos`, `integrantes_grupo`, `lista_chequeo_evaluaciones`, `listas_chequeo`, `observaciones`, `tareas`.

```mermaid
erDiagram
    programas ||--o{ fichas : "tiene"
    fichas ||--o{ grupos : "agrupa"
    fichas ||--o{ instructor_ficha : "asigna"
    usuarios ||--o{ instructor_ficha : "atiende"
    usuarios |o--o{ grupos : "lidera"
    usuarios ||--o{ integrantes_grupo : "participa"
    usuarios ||--o{ tareas : "responsable"
    usuarios |o--o{ carpetas : "crea"
    usuarios ||--o{ evidencias : "sube"
    usuarios |o--o{ evidencias : "elimina"
    usuarios ||--o{ evidencia_versiones : "sube version"
    usuarios ||--o{ evaluaciones : "evalua"
    usuarios ||--o{ observaciones : "escribe"
    fichas ||--o| listas_chequeo : "define"
    usuarios ||--o{ listas_chequeo : "crea"
    usuarios ||--o{ lista_chequeo_evaluaciones : "evalua"
    usuarios ||--o{ sesiones_refresh : "abre"
    usuarios ||--o{ tokens_verificacion_correo : "recibe"
    usuarios |o--o{ auditoria : "genera"
    programas {
        INT programa_id PK "NOT NULL"
        INT codigo_programa UK "NOT NULL"
        VARCHAR(220) nombre_programa "NOT NULL"
    }
    fichas {
        INT ficha_id PK "NOT NULL"
        INT programa_id FK "NOT NULL"
        INT numero_ficha UK "NOT NULL"
        DATE fecha_inicio "NOT NULL"
        DATE fecha_fin "NOT NULL"
        VARCHAR(20) jornada "NULL"
    }
    usuarios {
        INT usuario_id PK "NOT NULL"
        tipo_rol rol "NOT NULL"
        VARCHAR(100) nombre "NOT NULL"
        VARCHAR(100) apellido "NOT NULL"
        VARCHAR(150) correo UK "NOT NULL"
        VARCHAR(255) contrasena "NOT NULL"
        VARCHAR(10) tipo_documento "NULL, CHECK, DEF CC"
        VARCHAR(30) numero_documento "NULL"
        VARCHAR(20) estado "NOT NULL, DEF Activo"
        TIMESTAMP acepto_legales_en "NULL"
        TIMESTAMP correo_verificado_en "NULL"
        TIMESTAMP fecha_creacion "NOT NULL"
        TIMESTAMP fecha_actualizacion "NOT NULL"
    }
    instructor_ficha {
        INT instructor_ficha_id PK "NOT NULL"
        INT instructor_id FK "NOT NULL"
        INT ficha_id FK "NOT NULL"
        TIMESTAMP fecha_inicio "NOT NULL"
        TIMESTAMP fecha_fin "NOT NULL"
    }
    sesiones_refresh {
        INT sesion_id PK "NOT NULL"
        INT usuario_id FK "NOT NULL"
        CHAR(64) token_hash UK "NOT NULL"
        TIMESTAMP fecha_creacion "NOT NULL"
        TIMESTAMP fecha_expiracion "NOT NULL"
        BOOLEAN revocada "NOT NULL"
    }
    tokens_verificacion_correo {
        INT token_id PK "NOT NULL"
        INT usuario_id FK "NOT NULL"
        CHAR(64) token_hash UK "NOT NULL"
        TIMESTAMP fecha_expiracion "NOT NULL"
        TIMESTAMP usado_en "NULL"
    }
    auditoria {
        INT auditoria_id PK "NOT NULL"
        INT usuario_id FK "NULL"
        VARCHAR(60) accion "NOT NULL"
        VARCHAR(40) entidad "NOT NULL"
        INT entidad_id "NULL"
        JSONB detalle "NULL"
        TIMESTAMP fecha "NOT NULL"
    }
    carpetas {
        INT carpeta_id PK
    }
    evaluaciones {
        INT evaluacion_id PK
    }
    evidencia_versiones {
        INT version_id PK
    }
    evidencias {
        INT evidencia_id PK
    }
    grupos {
        INT grupo_id PK
    }
    integrantes_grupo {
        INT integrante_id PK
    }
    lista_chequeo_evaluaciones {
        INT evaluacion_id PK
    }
    listas_chequeo {
        INT lista_id PK
    }
    observaciones {
        INT observacion_id PK
    }
    tareas {
        INT tarea_id PK
    }
```

### 3.2 Grupos, proyecto, fases y tareas

**Tablas:** `grupos`, `integrantes_grupo`, `proyectos`, `fases`, `tareas`. Tablas referenciadas desde otros módulos (solo su clave): `carpetas`, `fichas`, `lista_chequeo_evaluaciones`, `observaciones`, `usuarios`.

```mermaid
erDiagram
    fichas ||--o{ grupos : "agrupa"
    usuarios |o--o{ grupos : "lidera"
    grupos ||--o{ integrantes_grupo : "incluye"
    usuarios ||--o{ integrantes_grupo : "participa"
    grupos ||--o| proyectos : "desarrolla"
    proyectos ||--|{ fases : "tiene 5"
    proyectos ||--o{ tareas : "organiza"
    usuarios ||--o{ tareas : "responsable"
    fases ||--o{ carpetas : "contiene"
    proyectos ||--o{ observaciones : "recibe"
    grupos ||--o{ lista_chequeo_evaluaciones : "es evaluado"
    grupos {
        INT grupo_id PK "NOT NULL"
        INT ficha_id FK "NOT NULL"
        INT lider_id FK "NOT NULL"
        VARCHAR(50) nombre_grupo "NOT NULL, CHECK"
        VARCHAR(30) codigo_grupo UK "NOT NULL"
        VARCHAR(20) estado_grupo "NOT NULL, DEF Activo"
        BOOLEAN es_general "NOT NULL, DEF false"
        INT cupo_maximo "NOT NULL, CHECK 1..50"
        TIMESTAMP fecha_creacion "NOT NULL"
    }
    integrantes_grupo {
        INT integrante_id PK "NOT NULL"
        INT grupo_id FK "NOT NULL"
        INT usuario_id FK "NOT NULL"
        VARCHAR(20) estado_integrante "NOT NULL, DEF Activo"
        TIMESTAMP fecha_ingreso "NOT NULL"
        TIMESTAMP fecha_salida "NULL"
    }
    proyectos {
        INT proyecto_id PK "NOT NULL"
        INT grupo_id FK, UK "NOT NULL"
        VARCHAR(150) nombre_proyecto "NOT NULL"
        VARCHAR(500) descripcion "NOT NULL"
        VARCHAR(500) problema "NOT NULL"
        VARCHAR(500) objetivo "NOT NULL"
        VARCHAR(500) alcance "NOT NULL"
        VARCHAR(500) tecnologias "NULL"
        DATE fecha_inicio "NOT NULL"
        DATE fecha_fin_estimada "NOT NULL"
        VARCHAR(30) estado_proyecto "NOT NULL, DEF Activo"
        TIMESTAMP fecha_actualizacion "NOT NULL"
    }
    fases {
        INT fase_id PK "NOT NULL"
        INT proyecto_id FK "NOT NULL"
        INT numero_fase "NOT NULL"
        VARCHAR(100) nombre_fase "NOT NULL"
        VARCHAR(30) estado_fase "NOT NULL, CHECK"
    }
    tareas {
        INT tarea_id PK "NOT NULL"
        INT proyecto_id FK "NOT NULL"
        INT responsable_id FK "NOT NULL"
        VARCHAR(150) titulo "NOT NULL"
        VARCHAR(500) descripcion "NULL"
        VARCHAR(20) prioridad "NOT NULL, CHECK"
        VARCHAR(20) estado "NOT NULL, CHECK"
        DATE fecha_inicio "NULL"
        DATE fecha_limite "NULL"
        DATE fecha_finalizacion "NULL"
        TIMESTAMP fecha_creacion "NOT NULL"
        TIMESTAMP fecha_actualizacion "NOT NULL"
    }
    carpetas {
        INT carpeta_id PK
    }
    fichas {
        INT ficha_id PK
    }
    lista_chequeo_evaluaciones {
        INT evaluacion_id PK
    }
    observaciones {
        INT observacion_id PK
    }
    usuarios {
        INT usuario_id PK
    }
```

### 3.3 Carpetas, evidencias y evaluación

**Tablas:** `carpetas`, `evidencias`, `evidencia_versiones`, `evaluaciones`, `observaciones`. Tablas referenciadas desde otros módulos (solo su clave): `fases`, `proyectos`, `usuarios`.

```mermaid
erDiagram
    fases ||--o{ carpetas : "contiene"
    usuarios |o--o{ carpetas : "crea"
    carpetas ||--o{ evidencias : "contiene"
    usuarios ||--o{ evidencias : "sube"
    usuarios |o--o{ evidencias : "elimina"
    evidencias ||--|{ evidencia_versiones : "versiona"
    usuarios ||--o{ evidencia_versiones : "sube version"
    evidencias ||--o{ evaluaciones : "recibe"
    usuarios ||--o{ evaluaciones : "evalua"
    proyectos ||--o{ observaciones : "recibe"
    evidencias |o--o{ observaciones : "motiva"
    usuarios ||--o{ observaciones : "escribe"
    carpetas {
        INT carpeta_id PK "NOT NULL"
        INT fase_id FK "NOT NULL"
        VARCHAR(150) nombre_carpeta "NOT NULL"
        TIMESTAMP fecha_creacion "NOT NULL"
        VARCHAR(20) estado_carpeta "NOT NULL, CHECK"
        INT creada_por FK "NULL"
        TIMESTAMP fecha_actualizacion "NOT NULL"
    }
    evidencias {
        INT evidencia_id PK "NOT NULL"
        INT carpeta_id FK "NOT NULL"
        INT usuario_id FK "NOT NULL"
        VARCHAR(200) nombre_evidencia "NOT NULL"
        VARCHAR(20) tipo_evidencia "NOT NULL, CHECK"
        TEXT ubicacion "NOT NULL"
        TIMESTAMP fecha_subida "NOT NULL"
        BOOLEAN eliminada "NOT NULL"
        INT eliminada_por FK "NULL"
        TIMESTAMP fecha_eliminacion "NULL"
        TIMESTAMP fecha_actualizacion "NOT NULL"
    }
    evidencia_versiones {
        INT version_id PK "NOT NULL"
        INT evidencia_id FK "NOT NULL"
        INT numero_version "NOT NULL"
        VARCHAR(20) tipo_evidencia "NOT NULL, CHECK"
        TEXT ubicacion "NOT NULL"
        VARCHAR(255) nombre_original "NULL"
        VARCHAR(100) tipo_mime "NULL"
        BIGINT tamano_bytes "NULL"
        CHAR(64) hash_sha256 "NULL"
        INT subida_por FK "NOT NULL"
        TIMESTAMP fecha_subida "NOT NULL"
        BOOLEAN vigente "NOT NULL"
    }
    evaluaciones {
        INT evaluacion_id PK "NOT NULL"
        INT evidencia_id FK "NOT NULL"
        INT instructor_id FK "NOT NULL"
        VARCHAR(20) resultado "NOT NULL, CHECK"
        TIMESTAMP fecha_evaluacion "NOT NULL"
        BOOLEAN vigente "NOT NULL"
    }
    observaciones {
        INT observacion_id PK "NOT NULL"
        INT evidencia_id FK "NULL"
        INT proyecto_id FK "NOT NULL"
        INT instructor_id FK "NOT NULL"
        VARCHAR(150) titulo "NOT NULL"
        VARCHAR(500) descripcion "NOT NULL"
        TIMESTAMP fecha_observacion "NOT NULL"
    }
    fases {
        INT fase_id PK
    }
    proyectos {
        INT proyecto_id PK
    }
    usuarios {
        INT usuario_id PK
    }
```

### 3.4 Lista de chequeo

**Tablas:** `listas_chequeo`, `lista_chequeo_items`, `lista_chequeo_evaluaciones`. Tablas referenciadas desde otros módulos (solo su clave): `fichas`, `grupos`, `usuarios`.

```mermaid
erDiagram
    fichas ||--o| listas_chequeo : "define"
    usuarios ||--o{ listas_chequeo : "crea"
    listas_chequeo ||--o{ lista_chequeo_items : "contiene"
    lista_chequeo_items ||--o{ lista_chequeo_evaluaciones : "se evalua"
    grupos ||--o{ lista_chequeo_evaluaciones : "es evaluado"
    usuarios ||--o{ lista_chequeo_evaluaciones : "evalua"
    listas_chequeo {
        INT lista_id PK "NOT NULL"
        INT ficha_id FK, UK "NOT NULL"
        VARCHAR(150) nombre "NOT NULL"
        INT creada_por FK "NOT NULL"
        TEXT archivo_origen "NULL"
        TIMESTAMP fecha_creacion "NOT NULL"
        TIMESTAMP fecha_actualizacion "NOT NULL"
    }
    lista_chequeo_items {
        INT item_id PK "NOT NULL"
        INT lista_id FK "NOT NULL"
        INT numero_fase "NOT NULL, CHECK"
        VARCHAR(200) nombre_evidencia "NOT NULL"
        VARCHAR(500) descripcion "NULL"
        BOOLEAN obligatorio "NOT NULL"
        INT orden "NOT NULL"
    }
    lista_chequeo_evaluaciones {
        INT evaluacion_id PK "NOT NULL"
        INT item_id FK "NOT NULL"
        INT grupo_id FK "NOT NULL"
        VARCHAR(20) resultado "NOT NULL, CHECK"
        VARCHAR(500) comentario "NULL"
        INT evaluador_id FK "NOT NULL"
        TIMESTAMP fecha_evaluacion "NOT NULL"
        BOOLEAN vigente "NOT NULL"
    }
    fichas {
        INT ficha_id PK
    }
    grupos {
        INT grupo_id PK
    }
    usuarios {
        INT usuario_id PK
    }
```

---

## 4. Restricciones compuestas y parciales

No caben en el diagrama por columna; están en el [esquema](../referencia-tecnica/esquema-bd.md#4-restricciones-de-integridad-clave):

| Restricción | Tabla | Tipo |
|---|---|---|
| `(grupo_id, usuario_id)` | `integrantes_grupo` | Única compuesta |
| `(proyecto_id, numero_fase)` | `fases` | Única compuesta |
| `(evidencia_id, numero_version)` | `evidencia_versiones` | Única compuesta |
| `(instructor_id, ficha_id)` donde `fecha_fin IS NULL` | `instructor_ficha` | Única parcial |
| `(evidencia_id)` donde `vigente` | `evaluaciones`, `evidencia_versiones` | Única parcial |
| `(item_id, grupo_id)` donde `vigente` | `lista_chequeo_evaluaciones` | Única parcial |

---

## Documentos relacionados

- [Esquema de base de datos](../referencia-tecnica/esquema-bd.md) · [Arquitectura](../referencia-tecnica/arquitectura.md)
- [Reglas de negocio](../requisitos/reglas-de-negocio.md)
