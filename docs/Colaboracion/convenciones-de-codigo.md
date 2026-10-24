# Convenciones de código — ZENDA

<!--
  ¿Qué? Reglas de estilo, nombres y estructura para el código, el SQL, la API y la interfaz de ZENDA.
  ¿Para qué? Que todo el código parezca escrito por una sola persona: se lee más rápido, se revisa mejor y se rompe menos.
  ¿Impacto? Sin convenciones, cada archivo usa su propio estilo y cada revisión se convierte en una discusión de gustos.
-->

---

## Identificación

| Campo | Valor |
|---|---|
| **Aplica a** | Backend (Node.js + Express), frontend (React), SQL y documentación |
| **Origen** | Restricciones del proyecto y observaciones del instructor ([RI-001](../Requisitos/restricciones.md#ri-001--código-y-base-de-datos-en-español-de-dominio), [RI-002](../Requisitos/restricciones.md#ri-002--documentación-y-comentarios-profesionales-en-español), [RNF-005](../Requisitos/RNFs/RNF-005_mantenibilidad_y_calidad.md)) |
| **Herramientas** | `oxlint` (ya en el frontend), `.editorconfig` y `.gitattributes` entregados; formateador propuesto: Prettier |
| **Fecha** | Octubre 2026 |

> **Principio rector:** *el código se escribe una vez y se lee cien.* Prefiere claro sobre ingenioso, y pequeño sobre completo.

---

## 1. Idioma

| Qué | Idioma | Ejemplo |
|---|---|---|
| Nombres del dominio (entidades, tablas, columnas, rutas, funciones de negocio) | **Español** | `integrantes_grupo`, `/api/instructor/fichas`, `subirEvidencia` |
| Términos técnicos estándar | Inglés | `middleware`, `token`, `pool`, `router`, `hash` |
| Comentarios, mensajes de error, commits, issues y documentación | **Español profesional** | "El grupo ya alcanzó su cupo" |
| Textos de la interfaz | Español de Colombia | "Cerrar sesión" |

**Sin groserías, sin bromas, sin coloquialismos** en comentarios, mensajes ni nombres. Los mensajes de error los lee el usuario final.

| ❌ No | ✅ Sí |
|---|---|
| `"¿cómo entraste sin permiso?"` | `"No tiene autorización para acceder a este recurso"` |
| `"máquina bien aceitada"` | `"Servidor en funcionamiento"` |
| Cualquier grosería | Un mensaje que diga qué pasó y qué hacer |

---

## 2. Nombres

| Elemento | Convención | Ejemplo |
|---|---|---|
| Variables y funciones (JavaScript) | `camelCase` | `calcularEstadoCarpeta`, `integrantesActivos` |
| Booleanos | Prefijo `es`, `tiene`, `puede` | `esLider`, `tieneCupo`, `puedeEvaluar` |
| Constantes | `MAYUSCULAS_CON_GUION_BAJO` | `FASES_FIJAS`, `MAX_TAMANO_MB` |
| Componentes de React | `PascalCase`, archivo `.jsx` | `MiProyecto.jsx`, `TarjetaFase.jsx` |
| Hooks | Prefijo `use` | `useInactividad.js` |
| Archivos de backend | `<módulo>.<rol>.js` | `proyecto.controller.js`, `cascada.service.js`, `fichas.routes.js` |
| Carpetas | minúsculas, sin tildes ni espacios | `controllers`, `lista-chequeo` |
| Tablas y columnas de la base de datos | `snake_case`, español, plural en tablas | `integrantes_grupo`, `fecha_creacion` |
| Clave primaria | `<tabla en singular>_id` | `evidencia_id` |
| Rutas de la API | `kebab-case`, sustantivos en plural | `/api/lista-chequeo/:listaId` |
| Variables de entorno | `MAYUSCULAS_CON_GUION_BAJO` | `DB_PASSWORD`, `VITE_API_URL` |
| Ramas | `<tipo>/<n>-<descripción>` | `feat/42-lider-de-grupo` |

**Reglas de nombres**

| Regla | Detalle |
|---|---|
| El nombre dice **qué es o qué hace** | `evaluarEvidencia`, no `procesar` ni `hacerCosa` |
| Nada de abreviaturas oscuras | `fechaFinEstimada`, no `ffe` |
| Una función de acción empieza con verbo | `crearTarea`, `confirmarTarea` |
| Sin números mágicos | `15 * 60` va en `TIEMPO_ACCESO_SEGUNDOS`, no suelto |

---

## 3. Estructura del backend

Las capas y su responsabilidad están en [Arquitectura, sección 4](../Referencia-Tecnica/arquitectura.md#41-capas).

| Capa | Hace | No hace |
|---|---|---|
| `routes` | Asocia método y ruta con middlewares y controlador | Lógica de negocio |
| `controllers` | Valida la entrada, llama a servicios o a la base y responde | Duplicar reglas entre controladores |
| `services` | Reglas reutilizables, sin `req` ni `res` | Conocer HTTP |
| `middleware` | Autenticación, roles, errores | Consultar datos del negocio |
| `config` | Pool y variables de entorno | Valores por defecto sensibles |

### Una función, una responsabilidad

| ✅ Haz | ❌ Evita |
|---|---|
| Funciones de menos de 40 líneas | Controladores de 200 líneas con SQL, reglas y respuesta mezclados |
| Retornos tempranos para los errores | Anidar `if` en cuatro niveles |
| Extraer reglas a `services/` como funciones puras | Repetir la misma regla en dos controladores |

```js
// ✅ Retorno temprano: se lee de arriba abajo
export async function crearCarpeta(req, res) {
  const { nombre_carpeta } = req.body;
  if (!nombre_carpeta?.trim()) {
    return res.status(400).json({ message: 'El nombre de la carpeta es obligatorio' });
  }
  if (!(await permisos.esIntegranteActivo(req.user.usuario_id, req.params.faseId))) {
    return res.status(403).json({ message: 'No pertenece al grupo dueño de esta fase' });
  }
  // ...crear la carpeta
}
```

---

## 4. Manejo de errores y respuestas de la API

| Regla | Detalle |
|---|---|
| Formato de error | `{ "message": "texto en español" }` ([RNF-013.3](../Requisitos/RNFs/RNF-013_interoperabilidad_y_api.md)) |
| Código HTTP correcto | `400` datos inválidos · `401` sin sesión · `403` sin permiso · `404` no existe · `409` conflicto · `500` fallo interno |
| El `500` no filtra detalles | Mensaje genérico al usuario; el detalle va solo al registro del servidor |
| Todo `try` tiene su `catch` | Ninguna promesa sin manejar |
| Sin datos sensibles en la respuesta | Nunca `contrasena`, hashes, tokens de otros ni rutas del servidor |

```js
// ✅ Error interno: registra el detalle, responde sin exponerlo
try {
  // ...
} catch (error) {
  console.error('Error al crear la carpeta:', error.message);
  return res.status(500).json({ message: 'No fue posible crear la carpeta. Inténtelo de nuevo.' });
}
```

---

## 5. SQL y acceso a datos

| Regla | Detalle |
|---|---|
| **Siempre parametrizado** | `WHERE usuario_id = $1`. Nunca concatenar entradas del usuario ([RS-005](../Requisitos/restricciones.md#rs-005--consultas-sql-parametrizadas)). |
| Palabras clave en MAYÚSCULAS | `SELECT`, `FROM`, `WHERE`, `JOIN` |
| Nombres de columnas explícitos | Evitar `SELECT *` salvo en pruebas |
| Transacciones en operaciones compuestas | `BEGIN` → pasos → `COMMIT`; `ROLLBACK` en el `catch` |
| Liberar siempre la conexión | `client.release()` en `finally` |
| Cambios de esquema | Migración numerada; no editar migraciones ya fusionadas ([flujo](flujo-github.md#8-versiones-y-publicación)) |

```js
// ✅ Patrón de transacción
const client = await pool.connect();
try {
  await client.query('BEGIN');
  const { rows } = await client.query(
    'INSERT INTO grupos (ficha_id, lider_id, nombre_grupo, codigo_grupo) VALUES ($1, $2, $3, $4) RETURNING grupo_id',
    [fichaId, liderId, nombreGrupo, codigo],
  );
  // ...más pasos
  await client.query('COMMIT');
  return rows[0].grupo_id;
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
}
```

---

## 6. Frontend (React)

| Tema | Convención |
|---|---|
| **Llamadas a la API** | Solo a través de la capa `api/`; las pantallas no usan `fetch` directo. |
| **Estado** | `useState` local; `ThemeContext` y `AuthContext` para lo global. |
| **Componentes** | Pequeños y con un propósito; si pasan de ~150 líneas, dividir. |
| **Permisos** | Ocultar un botón es comodidad, no seguridad: el servidor decide ([RS-004](../Requisitos/restricciones.md#rs-004--autorización-siempre-en-el-servidor)). |
| **Tailwind** | Clases en el orden: disposición → espaciado → tipografía → color → estado. Los colores salen de las variables del tema, no de valores sueltos. |
| **Tema** | Todo componente se ve bien en claro y oscuro ([RD-005](../Requisitos/restricciones.md#rd-005--tema-claro-y-oscuro)). |
| **Contraste** | Texto e iconos cumplen WCAG AA ([RD-001](../Requisitos/restricciones.md#rd-001--contraste-mínimo-accesible)). |
| **Accesibilidad** | `label` en cada campo, `aria-label` en iconos sin texto, foco visible, navegación por teclado. |
| **Animaciones** | Las mismas en componentes equivalentes de una misma página ([RD-002](../Requisitos/restricciones.md#rd-002--animaciones-consistentes)). |
| **Acciones secundarias** | En el menú de tres puntos ([RD-003](../Requisitos/restricciones.md#rd-003--menú-de-tres-puntos-para-acciones-secundarias)). |
| **Iconos** | `lucide-react`. |
| **Año del pie de página** | `new Date().getFullYear()`, nunca fijo ([RD-006](../Requisitos/restricciones.md#rd-006--pie-de-página-con-año-vigente-y-enlaces-legales)). |
| **Lenguaje** | JavaScript (`.jsx`); `Tareas.tsx` se unifica a `.jsx`. |

```jsx
// ✅ Estados de carga, vacío y error siempre visibles
if (cargando) return <Cargando />;
if (error) return <MensajeError texto={error} />;
if (tareas.length === 0) return <EstadoVacio texto="Aún no hay tareas. El líder puede crear la primera." />;
```

---

## 7. Comentarios

| Regla | Detalle |
|---|---|
| Explican **por qué**, no **qué** | El código ya dice qué hace |
| Cabecera breve en archivos de servicio | Qué responsabilidad tiene y qué regla de negocio aplica |
| Cita la regla o el requisito | `// RN-018: una evidencia reprobada desaprueba la carpeta` |
| `TODO` con dueño y fecha | `// TODO(ana, 2026-11): paginar este listado (RNF-002.4)` |
| Sin código comentado | Para eso está Git |
| Profesionales | Sin groserías, chistes ni quejas |

| ❌ No | ✅ Sí |
|---|---|
| `// suma 1 al contador` | `// El grupo General no cuenta como proyecto (RN-006)` |
| `// esto no sé por qué funciona` | Reescribirlo hasta entenderlo, o dejar un issue |

```js
/**
 * Calcula el estado de una carpeta a partir de las evaluaciones vigentes de sus evidencias.
 * Regla: RN-018. `null` representa una evidencia sin evaluar.
 */
export function calcularEstadoCarpeta(resultados) { /* ... */ }
```

---

## 8. Formato y herramientas

| Tema | Convención | Herramienta |
|---|---|---|
| Sangría | 2 espacios, sin tabuladores | `.editorconfig` |
| Saltos de línea | `LF` en todo el repositorio | `.gitattributes` |
| Codificación | UTF-8 | `.editorconfig` |
| Comillas | Simples en JavaScript | Prettier (propuesto) |
| Punto y coma | Sí | Prettier (propuesto) |
| Ancho de línea | 100 caracteres | Prettier (propuesto) |
| Análisis estático | Sin errores de `pnpm lint` | `oxlint` |
| Importaciones | Primero externas, luego internas; sin importaciones sin usar | `oxlint` |

> Los archivos `coordinador.js` y `mailer.js` de v11 usan saltos de línea CRLF; el `.gitattributes` los unifica ([H-15](../Testing/hallazgos.md)).

---

## 9. Seguridad en el código

| Regla | Detalle |
|---|---|
| Ningún secreto en el código | Variables de entorno ([RS-001](../Requisitos/restricciones.md#rs-001--secretos-fuera-del-código-y-del-repositorio)) |
| Sin valores por defecto sensibles | Si falta `JWT_SECRET`, el servidor **no arranca** |
| No registrar datos sensibles | Nada de contraseñas, tokens ni documentos en `console.log` |
| Validar toda entrada | Tipo, longitud y formato, en el servidor |
| Autorizar en el servidor | Con middleware de rol y verificación de pertenencia |
| Dependencias | Versión exacta, de uso necesario y revisadas con `pnpm audit` |

---

## 10. Pruebas

| Regla | Detalle |
|---|---|
| Una regla de negocio nueva nace con su prueba | Primero rojo, luego verde ([TDD](../Testing/pruebas-unitarias.md#1-cómo-se-escribe-una-prueba-tdd)) |
| Las pruebas viven junto al código | `backend/tests/` y `*.test.js` en el frontend |
| Un nombre de prueba describe el comportamiento | `rechaza un archivo de más de 10 MB` |
| Una prueba no depende de otra | Cada una crea sus datos |
| Un defecto corregido deja una prueba | Para que no vuelva |

---

## Archivo `.editorconfig`

Entregado en el paquete de colaboración y se copia a la raíz del repositorio.

---

## Documentos relacionados

- [Flujo de GitHub](flujo-github.md) · [Guía de contribución](guia-de-contribucion.md) · [Revisión de código](revision-de-codigo.md)
- [Arquitectura](../Referencia-Tecnica/arquitectura.md) · [Restricciones](../Requisitos/restricciones.md) · [Pruebas unitarias](../Testing/pruebas-unitarias.md)
