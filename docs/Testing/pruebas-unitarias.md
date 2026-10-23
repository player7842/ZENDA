# Pruebas unitarias — ZENDA

<!--
  ¿Qué? Pruebas de las reglas de negocio puras (cálculos, validaciones y transiciones) sin base de datos ni red.
  ¿Para qué? Proteger las reglas que más cambian al refactorizar y que, si fallan, producen resultados equivocados sin dar error.
  ¿Impacto? Son las pruebas más rápidas y baratas: se ejecutan en segundos y señalan exactamente qué regla se rompió.
-->

---

## Identificación

| Campo | Valor |
| --- | --- |
| **Casos** | 108 |
| **Herramienta** | Vitest (propuesta) |
| **Dónde** | `backend/tests/` y `frontend/src/**/*.test.js` |
| **Plan** | [Plan de pruebas](plan-de-pruebas.md) |
| **Fecha** | Octubre 2026 |

> **Requisito previo:** hoy estas reglas viven dentro de los controladores. Para probarlas hay que **extraerlas a funciones puras** en `services/` ([clases](../diagramas/clases.md#2-servicios-y-controladores)). Una función pura recibe datos y devuelve un resultado, sin leer ni escribir en la base de datos.

---

## 1. Cómo se escribe una prueba (TDD)

| Paso | Qué haces | Resultado |
|:---:|---|---|
| 🔴 **Rojo** | Escribes la prueba de una regla que aún no existe. | La prueba **falla** |
| 🟢 **Verde** | Escribes el código mínimo para que pase. | La prueba **pasa** |
| 🔵 **Refactor** | Ordenas el código sin cambiar lo que hace. | Sigue en **verde** |

Ejemplo con la regla de la carpeta (caso `PU-01` a `PU-11`):

```js
// backend/src/services/cascada.js  (función pura: no toca la base de datos)
export function calcularEstadoCarpeta(resultados) {
  if (resultados.length === 0) return 'Pendiente';
  if (resultados.includes('REPROBADO')) return 'Desaprobada';
  if (resultados.every((r) => r === 'APROBADO')) return 'Aprobada';
  return 'En revisión';
}
```

```js
// backend/tests/cascada.test.js
import { describe, it, expect } from 'vitest';
import { calcularEstadoCarpeta } from '../src/services/cascada.js';

describe('calcularEstadoCarpeta', () => {
  it.each([
    [[], 'Pendiente'],
    [[null], 'En revisión'],
    [['APROBADO', 'APROBADO'], 'Aprobada'],
    [['APROBADO', 'REPROBADO'], 'Desaprobada'],
    [['APROBADO', null], 'En revisión'],
  ])('%j devuelve %s', (resultados, esperado) => {
    expect(calcularEstadoCarpeta(resultados)).toBe(esperado);
  });
});
```

---

## 2. Casos de prueba

Convención: `PU-<número>`. La tabla de cada sección indica la función, la entrada y el resultado esperado.

### 1. Estado de una carpeta

`calcularEstadoCarpeta(resultados)` recibe el resultado **vigente** de cada evidencia no eliminada (`null` = aún sin evaluar). Regla: [RN-018](../requisitos/reglas-de-negocio.md#rn-018--cascada-de-estados).

| ID | Entrada | Resultado esperado | Nota |
| --- | --- | --- | --- |
| PU-01 | `[]` | `Pendiente` | Carpeta sin evidencias |
| PU-02 | `[null]` | `En revisión` | Evidencia por evaluar |
| PU-03 | `["APROBADO"]` | `Aprobada` |  |
| PU-04 | `["REPROBADO"]` | `Desaprobada` |  |
| PU-05 | `["APROBADO","APROBADO","APROBADO"]` | `Aprobada` | Todas aprobadas |
| PU-06 | `["APROBADO",null]` | `En revisión` | Falta evaluar una |
| PU-07 | `["APROBADO","REPROBADO"]` | `Desaprobada` | Una reprobada desaprueba la carpeta |
| PU-08 | `[null,"REPROBADO"]` | `Desaprobada` | La reprobada pesa más que la pendiente |
| PU-09 | `["REPROBADO","REPROBADO"]` | `Desaprobada` |  |
| PU-10 | `["APROBADO","APROBADO",null]` | `En revisión` | Evidencia nueva en una carpeta aprobada ([RN-015](../requisitos/reglas-de-negocio.md#rn-015--sin-bloqueo-por-fase)) |
| PU-11 | Evidencia eliminada con `REPROBADO` y otra `APROBADO` | `Aprobada` | Las eliminadas no cuentan ([RN-014](../requisitos/reglas-de-negocio.md#rn-014--versionado-y-borrado-lógico)) |

### 2. Estado de una fase

`calcularEstadoFase(estadosCarpetas)`. Vacía o todas `Pendiente` → `Pendiente`; alguna `Desaprobada` → `Desaprobada`; todas `Aprobada` → `Aprobada`; si no, `En revisión`.

| ID | Entrada | Resultado esperado | Nota |
| --- | --- | --- | --- |
| PU-12 | `[]` | `Pendiente` |  |
| PU-13 | `["Pendiente"]` | `Pendiente` | Carpetas vacías |
| PU-14 | `["Aprobada","Aprobada"]` | `Aprobada` |  |
| PU-15 | `["Aprobada","En revisión"]` | `En revisión` |  |
| PU-16 | `["Aprobada","Desaprobada"]` | `Desaprobada` |  |
| PU-17 | `["En revisión","Pendiente"]` | `En revisión` |  |
| PU-18 | `["Desaprobada","En revisión","Aprobada"]` | `Desaprobada` | La desaprobada manda |
| PU-19 | `["Aprobada","Pendiente"]` | `En revisión` |  |

### 3. Porcentaje y conteo de carpetas

`porcentajeFase(aprobadas, total)` redondea al entero más cercano; `carpetasAprobadas(aprobadas, total)` devuelve el texto "X de Y". Regla: [RN-020](../requisitos/reglas-de-negocio.md#rn-020--porcentaje-de-avance-de-la-fase).

| ID | Entrada (aprobadas, total) | Resultado esperado | Nota |
| --- | --- | --- | --- |
| PU-20 | `(0, 0)` | `0` | Sin evidencias: no divide por cero |
| PU-21 | `(0, 10)` | `0` |  |
| PU-22 | `(7, 10)` | `70` |  |
| PU-23 | `(10, 10)` | `100` |  |
| PU-24 | `(1, 3)` | `33` | Redondeo |
| PU-25 | `(2, 3)` | `67` | Redondeo |
| PU-26 | `carpetasAprobadas(3, 4)` | `"3 de 4"` |  |

### 4. Transiciones de una tarea

`puedeTransicionar(de, a, actor)` con `actor` ∈ {`responsable`, `lider`, `otro`}. Regla: [RN-022](../requisitos/reglas-de-negocio.md#rn-022--flujo-de-estados-de-la-tarea).

| ID | Entrada (de → a, actor) | Resultado esperado | Nota |
| --- | --- | --- | --- |
| PU-27 | `Pendiente → En proceso`, responsable | Permitida |  |
| PU-28 | `En proceso → Finalizada`, responsable | Permitida |  |
| PU-29 | `Finalizada → Confirmada`, líder | Permitida |  |
| PU-30 | `Finalizada → Incompleta`, líder | Permitida |  |
| PU-31 | `Incompleta → En proceso`, responsable | Permitida | Borra la fecha de finalización |
| PU-32 | `Pendiente → Finalizada`, responsable | Rechazada | No se puede saltar un estado |
| PU-33 | `Pendiente → Confirmada`, líder | Rechazada |  |
| PU-34 | `En proceso → Confirmada`, líder | Rechazada | Debe estar `Finalizada` |
| PU-35 | `Finalizada → En proceso`, responsable | Rechazada |  |
| PU-36 | `Confirmada → En proceso`, responsable | Rechazada | `Confirmada` es final |
| PU-37 | `Incompleta → Finalizada`, responsable | Rechazada | Debe pasar por `En proceso` |
| PU-38 | `En proceso → Pendiente`, responsable | Rechazada | No se retrocede |
| PU-39 | `Finalizada → Confirmada`, responsable no líder | Rechazada | Solo el líder confirma |
| PU-40 | `Pendiente → En proceso`, otro integrante | Rechazada | Solo el responsable mueve |
| PU-41 | `Pendiente → En proceso`, líder que no es responsable | Rechazada | El líder no mueve tareas ajenas |
| PU-42 | `Finalizada → Confirmada`, otro | Rechazada |  |

### 5. Correo institucional

`esCorreoInstitucional(correo)`. Regla: [RN-001](../requisitos/reglas-de-negocio.md#rn-001--registro-limitado-a-aprendices-con-correo-institucional).

| ID | Entrada | Resultado esperado | Nota |
| --- | --- | --- | --- |
| PU-43 | `ana@soy.sena.edu.co` | Válido |  |
| PU-44 | `ANA@SOY.SENA.EDU.CO` | Válido | Sin distinguir mayúsculas (propuesto) |
| PU-45 | `ana@sena.edu.co` | Inválido | Falta `soy.` |
| PU-46 | `ana@gmail.com` | Inválido |  |
| PU-47 | `ana@soy.sena.edu.co.evil.com` | Inválido | Dominio engañoso |
| PU-48 | `ana@evilsoy.sena.edu.co` | Inválido | Debe ser exactamente `@soy.sena.edu.co` |
| PU-49 | `@soy.sena.edu.co` | Inválido | Sin usuario |
| PU-50 | `""` o `null` | Inválido |  |

### 6. Política de contraseña

`cumplePolitica(clave)`: mínimo 8 caracteres y al menos un número ([RNF-001.8](../requisitos/RNFs/RNF-001_seguridad.md)).

| ID | Entrada | Resultado esperado | Nota |
| --- | --- | --- | --- |
| PU-51 | `Abcdef12` | Cumple |  |
| PU-52 | `12345678` | Cumple | Cumple la política aunque el medidor la marque débil |
| PU-53 | `contraseña1` | Cumple | Admite `ñ` |
| PU-54 | `abcdefgh` | No cumple | Sin número |
| PU-55 | `abc1` | No cumple | Corta |
| PU-56 | `a1b2c3d` | No cumple | 7 caracteres |
| PU-57 | `""` | No cumple |  |
| PU-58 | `null` | No cumple |  |

### 7. Medidor de fortaleza (propuesta de algoritmo)

`nivelFortaleza(clave)` suma 1 punto por: 8 o más caracteres, 12 o más caracteres, mayúscula y minúscula, número y símbolo. Puntaje 0–1 `muy baja`, 2 `baja`, 3 `media`, 4 `fuerte`, 5 `muy segura`. Las contraseñas de una lista de comunes no superan `baja`. **Por confirmar con el equipo.**

| ID | Entrada | Resultado esperado | Nota |
| --- | --- | --- | --- |
| PU-59 | `""` | `muy baja` |  |
| PU-60 | `abc` | `muy baja` |  |
| PU-61 | `abcdefg1` | `baja` | 8 caracteres y número |
| PU-62 | `Abcdefg1` | `media` |  |
| PU-63 | `Abcdefg1!` | `fuerte` |  |
| PU-64 | `Abcdefghij1!` | `muy segura` | 12 caracteres o más |
| PU-65 | `password1` | `baja` | Contraseña común |
| PU-66 | `12345678` | `baja` | Contraseña común |

### 8. Cupo y código de invitación

`tieneCupo(integrantesActivos, cupo)` y `generarCodigoGrupo()`. Reglas: [RN-009](../requisitos/reglas-de-negocio.md#rn-009--cupo-del-grupo), [RN-010](../requisitos/reglas-de-negocio.md#rn-010--código-de-invitación).

| ID | Entrada | Resultado esperado | Nota |
| --- | --- | --- | --- |
| PU-67 | `tieneCupo(0, 5)` | `true` |  |
| PU-68 | `tieneCupo(4, 5)` | `true` | Queda un cupo |
| PU-69 | `tieneCupo(5, 5)` | `false` | Grupo completo |
| PU-70 | `tieneCupo(6, 5)` | `false` | Dato inconsistente: nunca se admite |
| PU-71 | `generarCodigoProyecto()` | Coincide con `/^PRY-[A-F0-9]{10}$/` |  |
| PU-72 | 1000 llamadas a `generarCodigoGrupo()` | Sin repeticiones | Unicidad práctica |

### 9. Validación de archivos

`validarArchivo({ nombre, bytes, tamano })`: lista blanca por **contenido real**, tamaño máximo de 10 MB (10 × 1024 × 1024 bytes) y nombre seguro. Regla: [RNF-012](../requisitos/RNFs/RNF-012_gestion_de_archivos_y_almacenamiento.md).

| ID | Entrada | Resultado esperado | Nota |
| --- | --- | --- | --- |
| PU-73 | `informe.pdf` con cabecera PDF real, 1 MB | Aceptado |  |
| PU-74 | `foto.png` con cabecera PNG real, 2 MB | Aceptado | Se comprime por superar 1 MB |
| PU-75 | `informe.pdf` cuyo contenido es un ejecutable (`MZ`) | Rechazado | La extensión miente |
| PU-76 | `programa.exe` | Rechazado | Tipo no permitido |
| PU-77 | `documento.pdf.exe` | Rechazado | Doble extensión |
| PU-78 | Archivo PDF de exactamente 10 MB | Aceptado | Límite inclusivo |
| PU-79 | Archivo PDF de 10 MB + 1 byte | Rechazado | Excede el máximo |
| PU-80 | Archivo de 0 bytes | Rechazado | Vacío |
| PU-81 | `../../etc/passwd.pdf` | Rechazado o nombre saneado | Recorrido de directorios |
| PU-82 | `grafico.svg` | Rechazado | Puede contener código ejecutable |
| PU-83 | `.docx`, `.xlsx` y `.pptx` reales | Aceptados | Formatos de Office |

### 10. Sesión y tokens

`SesionService`. Regla: [RF-004](../requisitos/RFs/RF-004_sesion_segura.md).

| ID | Entrada | Resultado esperado | Nota |
| --- | --- | --- | --- |
| PU-84 | `emitirTokens(usuario)` | Acceso con expiración a 15 minutos y refresco a 7 días | Con reloj simulado |
| PU-85 | `rotarRefresco(token)` válido | Devuelve un par nuevo y revoca el anterior |  |
| PU-86 | `rotarRefresco(token)` usado dos veces | La segunda llamada se rechaza | Detecta reutilización |
| PU-87 | `rotarRefresco(token)` vencido | Se rechaza |  |
| PU-88 | `rotarRefresco(token)` revocado | Se rechaza | Tras cerrar sesión |
| PU-89 | Guardado en `sesiones_refresh` | Solo el hash SHA-256; nunca el token | El valor guardado no es igual al token |

### 11. Avances de tareas y lista de chequeo

`AvanceService`. Reglas: [RN-027](../requisitos/reglas-de-negocio.md#rn-027--avance-de-la-lista-de-chequeo), [RF-031](../requisitos/RFs/RF-031_tablero_y_progreso_de_tareas.md).

| ID | Entrada | Resultado esperado | Nota |
| --- | --- | --- | --- |
| PU-90 | Tareas: 0 confirmadas de 0 | `0` | Sin dividir por cero |
| PU-91 | Tareas: 3 confirmadas de 6 | `50` |  |
| PU-92 | Tareas: 6 confirmadas de 6 | `100` |  |
| PU-93 | Tareas: 4 `Finalizada` y 0 `Confirmada` | `0` | Solo cuentan las confirmadas |
| PU-94 | Lista: 1 obligatorio aprobado de 2 obligatorios | `50` |  |
| PU-95 | Lista: solo ítems opcionales aprobados | `0` | Sin obligatorios no hay avance |
| PU-96 | Lista: un obligatorio `No aprobado` | No suma |  |
| PU-97 | Lista: evaluación histórica `Aprobado` y vigente `No aprobado` | No suma | Solo cuenta la vigente |
| PU-98 | Ficha: grupos con 100, 50 y 0 | `50` | Promedio de grupos |
| PU-99 | Ficha sin grupos | `0` |  |

### 12. Permisos

`PermisosService`. Matriz: [permisos](../requisitos/matriz-permisos.md).

| ID | Entrada | Resultado esperado | Nota |
| --- | --- | --- | --- |
| PU-100 | `esLider(u, grupo)` con `lider_id = u` | `true` |  |
| PU-101 | `esLider(otro, grupo)` | `false` |  |
| PU-102 | `esLider(u, General)` (sin líder) | `false` | El grupo `General` no tiene líder |
| PU-103 | `esIntegranteActivo` con estado `Activo` | `true` |  |
| PU-104 | `esIntegranteActivo` con `fecha_salida` o estado distinto de `Activo` | `false` |  |
| PU-105 | `esIntegranteActivo` de otro grupo | `false` |  |
| PU-106 | `instructorDeFicha` con vinculación vigente | `true` |  |
| PU-107 | `instructorDeFicha` con `fecha_fin` cerrada | `false` | Ya no evalúa esa ficha ([RN-024](../requisitos/reglas-de-negocio.md#rn-024--asignación-instructorficha-con-historial)) |
| PU-108 | `instructorDeFicha` de otra ficha | `false` |  |

---

## 3. Qué no es una prueba unitaria

| Caso | Dónde va |
|---|---|
| Consultas SQL y transacciones | [Pruebas de integración](pruebas-de-integracion.md) |
| Permisos por ruta y por rol | [Matriz de permisos en integración](pruebas-de-integracion.md#3-pruebas-de-autorización-desde-la-matriz-de-permisos) |
| Pantallas y flujos del navegador | [Casos funcionales](casos/) (E2E) |
| Rendimiento, seguridad y accesibilidad | [Pruebas no funcionales](pruebas-no-funcionales.md) |

---

## Documentos relacionados

- [Plan de pruebas](plan-de-pruebas.md) · [Matriz de cobertura](matriz-cobertura.md)
- [Reglas de negocio](../requisitos/reglas-de-negocio.md) · [Clases](../diagramas/clases.md) · [Estados](../diagramas/estados.md)
