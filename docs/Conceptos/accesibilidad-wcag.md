# Accesibilidad web, WCAG y ARIA — ZENDA

<!--
  ¿Qué? Los conceptos de accesibilidad que ZENDA debe cumplir (WCAG 2.1 nivel AA) y cómo aplicarlos a sus pantallas y componentes.
  ¿Para qué? Que cualquier aprendiz, instructor o coordinador pueda usar el sistema, con o sin discapacidad, con cualquier dispositivo.
  ¿Impacto? El instructor pidió mejorar los contrastes en toda la aplicación; la accesibilidad es la forma medible de hacerlo.
-->

---

## Identificación

| Campo | Valor |
|---|---|
| **Estándar objetivo** | **WCAG 2.1 nivel AA** ([RD-001](../Requisitos/restricciones.md#rd-001--contraste-mínimo-accesible), [RNF-004](../Requisitos/RNFs/RNF-004_accesibilidad.md)) |
| **Origen del requisito** | Observación del instructor: mejorar contrastes sin perder iconos ni espaciado |
| **Pruebas** | [PNF-A01 a A15](../Testing/pruebas-no-funcionales.md#2-pruebas) |
| **Marco normativo en Colombia** | NTC 5854 y los lineamientos de accesibilidad web del MinTIC para entidades públicas (Resolución 1519 de 2020), que se apoyan en WCAG. *Referencias informativas: confirmar con el SENA cuál aplica al proyecto.* |
| **Fecha** | Octubre 2026 |

> **WCAG 2.2** (2023) agrega criterios sobre el tamaño de los objetivos táctiles, el arrastre y el foco. No es obligatorio en este proyecto, pero varios de esos criterios se señalan abajo porque ZENDA los necesita (tablero de tareas con arrastre, menús).

---

## 1. Qué es la accesibilidad

Es lograr que **todas las personas** puedan percibir, entender, navegar e interactuar con el sistema. Beneficia a quien tiene una discapacidad visual, auditiva, motriz o cognitiva, y también a quien usa el teléfono bajo el sol, tiene el brazo enyesado o una conexión lenta.

### Los cuatro principios (POUR)

| Principio | Significa | Ejemplo en ZENDA |
|---|---|---|
| **P**erceptible | La información se puede percibir con al menos un sentido | Texto con buen contraste; estados con texto **y** color; alternativas de texto para gráficas |
| **O**perable | Se puede usar con teclado, ratón o tacto | Todo alcanzable con Tab; foco visible; el tablero de tareas se maneja sin arrastrar |
| **C**omprensible | Es claro y predecible | Mensajes de error que dicen qué hacer; etiquetas en cada campo; idioma declarado |
| **R**obusto | Funciona con tecnologías de apoyo | HTML semántico; roles ARIA correctos; lectores de pantalla |

---

## 2. Contraste de color

El contraste mide la diferencia de luminosidad entre el texto y su fondo. Se expresa como una razón de 1:1 (sin contraste) a 21:1 (negro sobre blanco).

| Elemento | Mínimo AA | Criterio |
|---|:---:|---|
| Texto normal | **4.5 : 1** | 1.4.3 |
| Texto grande (24 px, o 18.66 px en negrita) | **3 : 1** | 1.4.3 |
| Iconos informativos, bordes de campos, controles y gráficas | **3 : 1** | 1.4.11 |
| Texto desactivado y logotipos | Sin requisito | — |

### Ejemplos con razones calculadas

Valores calculados con la fórmula de WCAG (luminancia relativa). El verde `#1e7e22` es el color institucional que usa el correo de recuperación.

| Texto | Fondo | Razón | ¿Texto normal? | ¿Texto grande o iconos? |
|---|---|:---:|:---:|:---:|
| `#1e7e22` (verde) | `#ffffff` (blanco) | **5.17** | ✅ | ✅ |
| `#ffffff` (blanco) | `#1e7e22` (verde) | **5.17** | ✅ (texto de botón) | ✅ |
| `#1e7e22` (verde) | `#0f172a` (fondo oscuro) | **3.45** | ❌ | ✅ |
| `#4b5563` (gris oscuro) | `#ffffff` | **7.56** | ✅ | ✅ |
| `#6b7280` (gris medio) | `#ffffff` | **4.83** | ✅ | ✅ |
| `#9ca3af` (gris claro) | `#ffffff` | **2.54** | ❌ | ❌ |
| `#22c55e` (verde vivo) | `#ffffff` | **2.28** | ❌ | ❌ |

**Qué enseña la tabla**

| Lección | Aplicación |
|---|---|
| El mismo color puede pasar en un tema y fallar en el otro | El verde pasa sobre blanco (5.17) pero no como texto sobre fondo oscuro (3.45): el tema oscuro necesita una variante más clara del verde. |
| Los grises claros "elegantes" suelen fallar | El gris `#9ca3af` es habitual para textos secundarios y no cumple. |
| Un verde vivo rara vez sirve para texto sobre blanco | Usar un verde más oscuro para texto y reservar el vivo para decoración. |

### Cómo calcularlo

```js
// Luminancia relativa y razón de contraste (WCAG)
const canal = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const luminancia = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => canal(parseInt(hex.slice(i, i + 2), 16) / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const contraste = (a, b) => {
  const [alta, baja] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (alta + 0.05) / (baja + 0.05);
};
// contraste('#1e7e22', '#ffffff') → 5.17
```

**Reglas para ZENDA**

| Regla | Detalle |
|---|---|
| Definir los colores como **variables** del tema | Se prueban una vez y se usan en todas partes |
| Probar **ambos temas** | Claro y oscuro, incluidas las gráficas ([RD-005](../Requisitos/restricciones.md#rd-005--tema-claro-y-oscuro)) |
| **No comunicar solo con color** | Aprobado, reprobado y pendiente llevan texto o icono además del color |
| Probar también los **estados** | `hover`, `focus`, deshabilitado y seleccionado |

---

## 3. Teclado y foco

| Requisito | Qué significa | Criterio |
|---|---|---|
| Todo se puede hacer con teclado | Enlaces, botones, menús y formularios alcanzables con `Tab` y activables con `Enter` o `Espacio` | 2.1.1 |
| **Foco visible** | Siempre se ve qué elemento está seleccionado; nunca `outline: none` sin reemplazo | 2.4.7 |
| Orden lógico | El orden de `Tab` sigue el orden visual | 2.4.3 |
| Sin trampas de teclado | Se puede salir de un modal con `Esc` | 2.1.2 |
| Enlace para saltar al contenido | Un "Saltar al contenido principal" al inicio | 2.4.1 |
| **Alternativa al arrastre** | El tablero de tareas ofrece botones para mover una tarea sin arrastrarla | 2.5.7 (WCAG 2.2) |
| Objetivos táctiles de al menos 24 × 24 px | Botones y menús de tres puntos no demasiado pequeños | 2.5.8 (WCAG 2.2) |

---

## 4. HTML semántico y ARIA

> **Primera regla de ARIA: si existe un elemento HTML nativo con ese comportamiento, úsalo.** Un `<button>` ya es accesible; un `<div onClick>` no lo es sin trabajo extra.

| Necesidad | Haz esto | Evita |
|---|---|---|
| Acción | `<button>` | `<div onClick>` |
| Navegar | `<a href>` o el enlace del router | `<span onClick>` |
| Campo de formulario | `<input id>` con `<label htmlFor>` | Texto suelto junto al campo |
| Estructura | `<header>`, `<nav>`, `<main>`, `<footer>`, encabezados `h1`–`h3` ordenados | Todo en `<div>` |
| Tabla de datos | `<table>` con `<th scope>` | Rejillas de `<div>` |
| Idioma | `<html lang="es">` | Sin declarar |

### Cuándo sí se usa ARIA

| Atributo | Para qué | Ejemplo en ZENDA |
|---|---|---|
| `aria-label` | Nombre para un control sin texto visible | Botón de icono, menú de tres puntos |
| `aria-expanded` | Indica si algo está abierto | Barra lateral colapsable, menú desplegable |
| `aria-haspopup="menu"` | El botón abre un menú | Menú de tres puntos |
| `aria-describedby` | Asocia ayuda o error a un campo | Requisitos de contraseña, mensaje de error |
| `aria-live="polite"` | Anuncia cambios sin interrumpir | Medidor de contraseña, avisos de éxito |
| `role="alert"` | Anuncia un error de inmediato | Error al enviar un formulario |
| `aria-current="page"` | Marca la página activa | Opción actual de la barra lateral |
| `aria-hidden="true"` | Oculta lo decorativo a lectores de pantalla | Iconos que acompañan a un texto |

### Ejemplos

```jsx
// ✅ Botón de icono con nombre accesible y foco visible
<button type="button" aria-label="Eliminar evidencia" className="rounded p-2 focus-visible:ring-2">
  <Trash2 aria-hidden="true" />
</button>

// ✅ Campo con etiqueta, ayuda y error asociados
<label htmlFor="clave">Contraseña</label>
<input id="clave" type="password" aria-describedby="clave-ayuda clave-error" aria-invalid={Boolean(error)} />
<p id="clave-ayuda">Mínimo 8 caracteres y al menos un número.</p>
{error && <p id="clave-error" role="alert">{error}</p>}

// ✅ El medidor de fortaleza se anuncia sin interrumpir
<p aria-live="polite">Fortaleza de la contraseña: {nivel}</p>
```

---

## 5. Cómo se aplica a las pantallas de ZENDA

| Componente | Qué cuidar | Requisito |
|---|---|---|
| **Registro e inicio de sesión** | Etiquetas visibles; errores junto al campo y anunciados; medidor con texto (no solo barra de color); casillas legales con su enlace; botón "Volver al inicio" | [RF-001](../Requisitos/RFs/RF-001_registro_de_aprendiz.md), [RF-002](../Requisitos/RFs/RF-002_inicio_de_sesion.md) |
| **Barra lateral colapsable** | `aria-expanded`; con solo iconos, cada uno con `aria-label` o descripción emergente; el elemento activo con `aria-current` | [RF-040](../Requisitos/RFs/RF-040_tema_e_interfaz_del_panel.md) |
| **Menú de tres puntos** | Botón con `aria-haspopup="menu"` y `aria-expanded`; navegable con flechas; `Esc` lo cierra y devuelve el foco | [RD-003](../Requisitos/restricciones.md#rd-003--menú-de-tres-puntos-para-acciones-secundarias) |
| **Tablero de tareas** | Alternativa por teclado al arrastre (botones "Mover a…"); el estado de cada tarjeta con texto | [RF-029](../Requisitos/RFs/RF-029_avance_de_mis_tareas.md) |
| **Estados de fase y evidencia** | Aprobada, reprobada, pendiente: texto **más** icono **más** color | [RF-025](../Requisitos/RFs/RF-025_estado_y_porcentaje_de_avance.md) |
| **Gráficas (Recharts)** | Resumen en texto o tabla equivalente; colores con 3 : 1 y distinguibles sin color | [RF-032](../Requisitos/RFs/RF-032_paneles_de_resumen_por_rol.md) |
| **Subida de archivos** | Campo con etiqueta; resultado y errores anunciados; progreso con `aria-live` | [RF-020](../Requisitos/RFs/RF-020_subida_de_evidencias.md) |
| **Modales y confirmaciones** | Foco al abrir, foco atrapado dentro, `Esc` para cerrar, devolver el foco | [RN-028](../Requisitos/reglas-de-negocio.md#rn-028--confirmación-con-contraseña) |
| **Avisos y mensajes temporales** | `aria-live`; los errores no desaparecen solos; los informativos, a los 10 s | [RNF-003.12](../Requisitos/RNFs/RNF-003_usabilidad_ux_ui.md) |
| **Cierre por inactividad** | Aviso previo con tiempo suficiente y opción de continuar | [RF-004](../Requisitos/RFs/RF-004_sesion_segura.md) |
| **Aviso de cookies** | No tapa el contenido ni atrapa el foco; se puede cerrar con teclado | [RF-039](../Requisitos/RFs/RF-039_paginas_legales_y_aviso_de_cookies.md) |
| **Animaciones** | Respetan `prefers-reduced-motion`; consistentes entre componentes equivalentes | [RD-002](../Requisitos/restricciones.md#rd-002--animaciones-consistentes) |

---

## 6. Adaptación y tamaño

| Requisito | Detalle | Criterio |
|---|---|---|
| Zoom al 200 % | El texto se amplía sin perder contenido | 1.4.4 |
| Reflujo a 320 px | Sin desplazamiento horizontal en pantallas estrechas | 1.4.10 |
| Espaciado de texto | Aguanta que el usuario aumente interlineado y espacios | 1.4.12 |
| Unidades relativas | `rem` y `%` en lugar de píxeles fijos en textos | — |
| Orientación | Funciona en vertical y horizontal | 1.3.4 |

---

## 7. Cómo se prueba

| Prueba | Herramienta | Qué detecta | Prueba de ZENDA |
|---|---|---|---|
| **Automática** | axe-core con Playwright; Lighthouse | Contrastes, etiquetas faltantes, roles incorrectos (solo una parte de los problemas posibles) | PNF-A01, A02, A04 |
| **Teclado** | Manual: recorrer cada pantalla solo con `Tab` | Foco perdido, trampas, orden incorrecto | PNF-A03 |
| **Lector de pantalla** | NVDA (gratuito, Windows) o VoiceOver | Etiquetas ausentes, anuncios incorrectos | Revisión manual de los 3 recorridos |
| **Zoom y reflujo** | Navegador al 200 % y a 360 px | Contenido cortado | PNF-A07 |
| **Daltonismo** | Simulador de las herramientas del navegador | Información solo en color | PNF-A05 |
| **Contraste** | Función `contraste()` o el inspector del navegador | Pares de color que fallan | PNF-A01, A02 |

> Las pruebas automáticas **no bastan**: encuentran lo medible. Lo que decide si algo es usable —el orden del foco, una etiqueta con sentido— lo revisa una persona.

---

## 8. Lista de verificación para cada pantalla nueva

| # | Pregunta | ✅ |
|:---:|---|:---:|
| 1 | ¿Todo texto cumple 4.5 : 1 (3 : 1 si es grande) en tema claro y oscuro? | ☐ |
| 2 | ¿Iconos y bordes de controles cumplen 3 : 1? | ☐ |
| 3 | ¿Se puede completar todo con teclado y el foco se ve? | ☐ |
| 4 | ¿Cada campo tiene `label` y cada icono sin texto tiene `aria-label`? | ☐ |
| 5 | ¿Los errores dicen qué pasó y cómo corregirlo, y se anuncian? | ☐ |
| 6 | ¿Nada depende solo del color? | ☐ |
| 7 | ¿Funciona a 360 px y con zoom al 200 % sin cortar contenido? | ☐ |
| 8 | ¿Las animaciones respetan `prefers-reduced-motion`? | ☐ |
| 9 | ¿axe-core no reporta violaciones serias ni críticas? | ☐ |

---

## Documentos relacionados

- [RNF-004 Accesibilidad](../Requisitos/RNFs/RNF-004_accesibilidad.md) · [RNF-003 Usabilidad](../Requisitos/RNFs/RNF-003_usabilidad_ux_ui.md)
- [Restricciones de diseño visual](../Requisitos/restricciones.md#3-restricciones-de-diseño-visual) · [Pruebas no funcionales](../Testing/pruebas-no-funcionales.md)
- [Convenciones de código — frontend](../Colaboracion/convenciones-de-codigo.md#6-frontend-react)
