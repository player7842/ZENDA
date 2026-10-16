# Guía de contribución — ZENDA

<!--
  ¿Qué? Guía para que una persona nueva en el equipo pase de "clonar el repositorio" a "mi primer cambio fusionado" sin ayuda.
  ¿Para qué? Reducir el tiempo de arranque y asegurar que todos trabajan con los mismos acuerdos.
  ¿Impacto? Una persona que no sabe cómo contribuir termina subiendo cambios sin revisar, secretos o código fuera de las convenciones.
-->

---

## Identificación

| Campo | Valor |
|---|---|
| **Para quién** | Integrantes nuevos del equipo y cualquier persona que quiera aportar |
| **Tiempo** | 30 minutos para dejar todo funcionando; 1 jornada para el primer PR |
| **Se apoya en** | [Flujo de GitHub](flujo-github.md) · [Convenciones de código](convenciones-de-codigo.md) · [Revisión de código](revision-de-codigo.md) |
| **Fecha** | Octubre 2026 |

---

## 1. Antes de escribir código: qué leer

Lee en este orden. En unas dos horas entenderás qué es ZENDA y cómo está hecho.

| # | Documento | Qué aprendes | Tiempo |
|:---:|---|---|:---:|
| 1 | [README](../../README.md) | Qué es ZENDA y su estado | 10 min |
| 2 | [Modelo de dominio](../diagramas/modelo-dominio.md) | Los conceptos del negocio (ficha, fase, evidencia, líder…) | 15 min |
| 3 | [Reglas de negocio](../requisitos/reglas-de-negocio.md) | Qué reglas no se pueden romper | 20 min |
| 4 | [Matriz de permisos](../requisitos/matriz-permisos.md) | Quién puede hacer qué | 10 min |
| 5 | [Arquitectura](../referencia-tecnica/arquitectura.md) | Cómo está construido y dónde va cada cosa | 25 min |
| 6 | [Restricciones](../requisitos/restricciones.md) | Lo que **no** negociamos (pnpm, Node LTS, español…) | 15 min |
| 7 | [Convenciones de código](convenciones-de-codigo.md) | Cómo escribimos el código | 15 min |

> Si trabajas en un módulo concreto, lee además sus RF en [`docs/requisitos/RFs/`](../requisitos/RFs/) y sus casos en [`docs/testing/casos/`](../testing/casos/).

---

## 2. Preparar tu entorno

| Paso | Qué hacer | Comprobación |
|:---:|---|---|
| 1 | Instalar **Node.js LTS**, **pnpm**, **PostgreSQL 14+** y **Git** | `node -v`, `pnpm -v`, `psql --version`, `git --version` |
| 2 | Clonar el repositorio y cambiar a `develop` | `git branch` muestra `develop` |
| 3 | Crear la base de datos y cargar el esquema | [Instalación sin Docker, sección 3](../setup/sin-docker.md#3-base-de-datos) |
| 4 | Crear tus archivos `.env` desde los `.env.example` | [Variables de entorno](../setup/variables-de-entorno.md) |
| 5 | Instalar dependencias y arrancar backend y frontend | `pnpm install` y `pnpm dev` en cada carpeta |
| 6 | Ejecutar la **lista de humo** | [Lista de humo](../setup/sin-docker.md#8-lista-de-humo-comprobación-rápida) |

Si prefieres contenedores: [Instalación con Docker](../setup/con-docker.md).

> **Solo `pnpm`.** Nunca `npm install` ni `yarn`: generan otro archivo de bloqueo y el CI falla ([RH-001](../requisitos/restricciones.md#rh-001--gestor-de-paquetes)).

---

## 3. Tu primer cambio, en 10 pasos

| # | Paso | Detalle |
|:---:|---|---|
| 1 | **Elige un issue** | Busca uno con la etiqueta `listo-para-trabajar` o crea uno con la plantilla. Asígnatelo. |
| 2 | **Lee su contexto** | El requisito (`RF-…`), las reglas (`RN-…`) y los casos de prueba (`CP-…`) que cita. |
| 3 | **Crea la rama** | `git checkout develop && git pull && git checkout -b feat/42-descripcion` |
| 4 | **Escribe primero la prueba** | Si el cambio toca una regla de negocio, empieza por el caso que falla ([TDD](../testing/pruebas-unitarias.md#1-cómo-se-escribe-una-prueba-tdd)). |
| 5 | **Programa** | Siguiendo las [convenciones](convenciones-de-codigo.md). Commits pequeños y claros. |
| 6 | **Verifica en local** | `pnpm lint`, `pnpm build` (frontend), pruebas y la lista de humo. |
| 7 | **Actualiza la documentación** | Qué documento quedaría desactualizado: [tabla](flujo-github.md#12-documentación-dentro-del-pr). |
| 8 | **Abre el PR hacia `develop`** | Completa la plantilla y vincula el issue con `Cierra #42`. |
| 9 | **Atiende la revisión** | Responde cada comentario; corrige y vuelve a hacer push. |
| 10 | **Cuando se fusione** | Borra tu rama y pasa al siguiente issue. |

---

## 4. Definición de "listo" y de "hecho"

### Un issue está **listo para trabajar** cuando…

| Criterio | Detalle |
|---|---|
| Tiene un título claro | Dice qué se quiere, no cómo |
| Cita su origen | `RF-…`, `RN-…`, `H-…` o la observación del instructor |
| Tiene criterios de aceptación | Dado / Cuando / Entonces, tomados de la HU |
| Es pequeño | Se puede terminar en pocos días |
| No está bloqueado | Sus dependencias ya están resueltas |

### Un cambio está **hecho** cuando…

| Criterio | Comprobación |
|---|---|
| Cumple los criterios de aceptación | Los casos `CP-…` pasan |
| Tiene pruebas | Unitarias o de integración, según el cambio |
| El código sigue las convenciones | `pnpm lint` sin errores |
| La CI está en verde | Check `CI` del PR |
| La documentación está al día | Ningún documento queda mentiroso |
| No hay secretos ni archivos sobrantes | `git status` y el `.gitignore` |
| Fue revisado y aprobado | Al menos 1 aprobación de otra persona |
| Está en `develop` | Fusión con *squash* |

---

## 5. Acuerdos del equipo

| Acuerdo | Detalle |
|---|---|
| **Nadie sube directo** a `main` ni a `develop` | Siempre PR |
| **Revisión en 24 horas** | Quien reciba una solicitud responde dentro de un día hábil, aunque sea para decir cuándo podrá |
| **PR pequeños** | Menos de 400 líneas; mejor dos PR que uno gigante |
| **Se pregunta antes de reescribir** | Si vas a cambiar algo grande de otra persona, hablen primero |
| **Los errores no se esconden** | Un defecto encontrado se reporta como issue aunque lo corrijas tú |
| **Idioma** | Español profesional en código, comentarios, commits, issues y documentación |
| **Sin groserías ni bromas en el código** | Los mensajes de error los lee el usuario ([RI-002](../requisitos/restricciones.md#ri-002--documentación-y-comentarios-profesionales-en-español)) |
| **Los secretos jamás se comparten** por chat ni se suben | Cada quien tiene su `.env` |
| **No se modifican los datos de otras personas** | Las pruebas usan su propia base `zenda_test` |

---

## 6. Qué no hacer

| ❌ No | ✅ En su lugar |
|---|---|
| `git push --force` en `develop` o `main` | Está bloqueado; usa una rama propia |
| `git add .` sin mirar | `git status` y agrega archivos concretos |
| Cambiar el esquema de la base de datos editando `zenda_bd.sql` | Nueva migración numerada ([flujo](flujo-github.md#8-versiones-y-publicación)) |
| Instalar una librería con `^` o `latest` | Versión exacta con `pnpm add <paquete>@<versión>` |
| Dejar `console.log` con datos de usuarios | Quitarlo o usar un registro sin datos sensibles |
| Probar contra la base de datos real | Usar `zenda_test` |
| Aprobar tu propio PR | Pedir revisión a un compañero |

---

## 7. Preguntas frecuentes

| Pregunta | Respuesta |
|---|---|
| ¿Qué hago si no sé qué issue tomar? | Empieza por los de `prioridad-alta` y por los [hallazgos](../testing/hallazgos.md) marcados como Alta. |
| ¿Puedo trabajar en dos issues a la vez? | Mejor no: termina uno y fusiónalo. Si te bloqueas, deja el primero en `Draft` y cambia. |
| ¿Mi cambio toca la base de datos? | Entonces va con una migración y con la actualización del [esquema](../referencia-tecnica/esquema-bd.md). Avísalo en el PR. |
| ¿Cuánto debe durar una rama? | Menos de una semana. |
| ¿Qué hago si el CI falla y no entiendo por qué? | Abre el detalle del trabajo en la pestaña *Checks*; si no se aclara, pide ayuda con el enlace. |
| ¿Dónde pregunto dudas del negocio? | En el issue, mencionando al instructor o al responsable del requisito. |
| ¿Cómo agrego una dependencia? | `pnpm add paquete@x.y.z`; confirma versión exacta, licencia y `pnpm audit`. |

---

## Documentos relacionados

- [Flujo de GitHub](flujo-github.md) · [Convenciones de código](convenciones-de-codigo.md) · [Revisión de código](revision-de-codigo.md)
- [Plan de pruebas](../testing/plan-de-pruebas.md) · [Arquitectura](../referencia-tecnica/arquitectura.md) · [README](../../README.md)
