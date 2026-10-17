# Dependencias, pnpm y cadena de suministro — ZENDA

<!--
  ¿Qué? Cómo se gestionan las librerías de terceros de ZENDA: pnpm, versiones exactas, Node.js LTS y auditoría de seguridad.
  ¿Para qué? Entender por qué el instructor pidió pnpm, versiones fijas y una versión LTS, y cómo cumplirlo sin romper nada.
  ¿Impacto? Cada librería es código ajeno que corre con los permisos de nuestro sistema: un paquete comprometido compromete a ZENDA.
-->

---

## Identificación

| Campo | Valor |
|---|---|
| **Origen** | Observaciones del instructor: usar **pnpm**, quitar los comodines de los `.json`, usar una versión **LTS** de Node.js |
| **Restricciones** | [RH-001](../requisitos/restricciones.md#rh-001--gestor-de-paquetes), [RH-002](../requisitos/restricciones.md#rh-002--versión-lts-de-nodejs-fija), [RH-003](../requisitos/restricciones.md#rh-003--versiones-exactas-de-dependencias) |
| **Riesgo OWASP** | [A03:2025 — Fallas en la cadena de suministro de software](seguridad-owasp.md#a03--fallas-en-la-cadena-de-suministro-de-software) |
| **Hallazgos** | [H-14](../testing/hallazgos.md), [H-16](../testing/hallazgos.md) |
| **Fecha** | Octubre 2026 |

---

## 1. Qué es una dependencia

Una **dependencia** es una librería que el proyecto usa en lugar de escribirla (Express, React, `pg`, `bcryptjs`…).

| Tipo | Significado | Ejemplo |
|---|---|---|
| **Directa** | La declaras tú en `package.json` | `express` |
| **Transitiva** | Es dependencia de una dependencia | Lo que `express` necesita para funcionar |
| **De ejecución** (`dependencies`) | Se necesita en producción | `pg` |
| **De desarrollo** (`devDependencies`) | Solo para construir o probar | `oxlint`, `vitest` |

> Un proyecto pequeño puede tener **cientos** de dependencias transitivas. Aunque tú declares 15, instalas el código de cientos de personas que no conoces. De ahí el riesgo.

---

## 2. Archivos y versiones

| Archivo | Para qué | Se sube a Git |
|---|---|:---:|
| `package.json` | Lista qué paquetes y qué versiones aceptas | ✅ |
| `pnpm-lock.yaml` | Fija la versión **exacta** de cada paquete, directo o transitivo | ✅ (obligatorio) |
| `node_modules/` | Los paquetes instalados | ❌ |

### Versionado semántico

`MAYOR.MENOR.PARCHE` — por ejemplo, `4.21.2`.

| Parte | Sube cuando… | Riesgo al actualizar |
|---|---|---|
| **MAYOR** | Hay cambios incompatibles | Alto: puede romper el código |
| **MENOR** | Se agrega algo compatible | Bajo |
| **PARCHE** | Se corrige un error | Muy bajo |

### Rangos y comodines

| Escritura | Qué acepta | ¿Se permite en ZENDA? |
|---|---|:---:|
| `"4.21.2"` | Exactamente esa versión | ✅ |
| `"^4.21.2"` | Cualquier `4.x.y` posterior | ❌ |
| `"~4.21.2"` | Cualquier `4.21.x` posterior | ❌ |
| `"*"`, `"latest"` | Cualquier versión | ❌ |

**Por qué se prohíben:** con un rango, dos personas (o un servidor) pueden instalar versiones distintas el mismo día, y una versión nueva —con un error o con código malicioso— entra **sin que nadie la haya revisado**. Con versiones exactas, el código que se prueba es el que se despliega ([RH-003](../requisitos/restricciones.md#rh-003--versiones-exactas-de-dependencias)). Hoy hay **21 dependencias con `^`** ([H-16](../testing/hallazgos.md)).

---

## 3. Por qué pnpm

| Aspecto | `npm` | `pnpm` |
|---|---|---|
| **Almacenamiento** | Copia cada paquete en cada proyecto | Un **almacén global** y enlaces: ahorra disco y tiempo |
| **Dependencias fantasma** | Permite importar paquetes que **no declaraste** (porque otro los trajo) | Estructura estricta: solo ves lo que declaraste |
| **Scripts de instalación de terceros** | Se ejecutan por defecto | Desde pnpm 10, **no se ejecutan por defecto**; hay que autorizarlos |
| **Reproducibilidad** | Con `npm ci` | Con `--frozen-lockfile` |
| **Velocidad** | Buena | Generalmente mayor |

> **Matiz honesto:** pnpm y npm descargan del **mismo registro público**. pnpm no vuelve seguro a un paquete malicioso; reduce la superficie (sin dependencias fantasma, sin scripts automáticos de terceros) y mejora la reproducibilidad. La seguridad real viene del **conjunto**: versiones exactas, lockfile, auditoría y poca cantidad de paquetes.

### Reglas del proyecto

| Regla | Detalle |
|---|---|
| **Solo pnpm** | Nada de `npm install` ni `yarn`: crean otros archivos de bloqueo ([RH-001](../requisitos/restricciones.md#rh-001--gestor-de-paquetes)) |
| **Lockfile siempre en Git** | `pnpm-lock.yaml` de `backend/` y de `frontend/` |
| **Instalación reproducible** | `pnpm install --frozen-lockfile` en CI y Docker: falla si el lockfile no coincide con `package.json` |
| **Declarar el gestor** | Campo `packageManager` en cada `package.json` |
| **Fijar versiones por defecto** | `.npmrc` con `save-exact=true` |

```ini
# .npmrc  (en backend/ y en frontend/)
save-exact=true
engine-strict=true
```

```json
{
  "packageManager": "pnpm@<versión exacta>",
  "engines": { "node": ">=22 <23" }
}
```

---

## 4. Node.js y las versiones LTS

Las versiones mayores de Node.js de número par pasan a **LTS** (*Long Term Support*). El calendario de lanzamientos cambia con el tiempo: se consulta siempre en [nodejs.org](https://nodejs.org/en/about/previous-releases).

| Fase | Qué significa | ¿Para producción? |
|---|---|:---:|
| **Current** | Recién publicada; todavía cambia | ❌ |
| **Active LTS** | Estable, con correcciones y mejoras frecuentes | ✅ |
| **Maintenance LTS** | Solo correcciones críticas y de seguridad | ✅ (con fecha de fin) |
| **End-of-Life** | Sin correcciones | ❌ |

| Pregunta | Respuesta |
|---|---|
| **¿Por qué LTS?** | Mantenimiento periódico y estabilidad: es lo que el instructor pidió ([RH-002](../requisitos/restricciones.md#rh-002--versión-lts-de-nodejs-fija)). |
| **¿Qué versión fijar?** | La LTS vigente que indique [nodejs.org](https://nodejs.org/) y que cumpla el instructor. Hay que revisar el calendario: una línea en mantenimiento llega a su fin de vida en una fecha conocida. |
| **¿Dónde se fija?** | `.nvmrc`, `engines` de cada `package.json` y el argumento `NODE_VERSION` de cada `Dockerfile`. **Los tres deben coincidir.** |
| **¿Y los Dockerfiles actuales?** | Usaban `node:20-alpine`; se actualizan a la LTS elegida ([RT-008](../requisitos/restricciones.md#rt-008--contenedores-con-docker)). |

```bash
node -v                    # versión instalada
nvm use                    # lee .nvmrc y cambia a la versión del proyecto
```

---

## 5. Elegir una dependencia nueva

Antes de ejecutar `pnpm add`, responde:

| # | Pregunta | ✅ |
|:---:|---|:---:|
| 1 | ¿Hace falta de verdad? ¿Lo resuelve la plataforma (`fetch`, `crypto`, `Intl`)? | ☐ |
| 2 | ¿Está **mantenida**? (publicaciones recientes, issues atendidos) | ☐ |
| 3 | ¿Es **conocida**? (uso extendido; cuidado con nombres casi iguales a otros) | ☐ |
| 4 | ¿Tiene **pocas dependencias propias**? | ☐ |
| 5 | ¿Su **licencia** permite usarla? | ☐ |
| 6 | ¿`pnpm audit` no reporta vulnerabilidades altas o críticas? | ☐ |
| 7 | ¿Se instalará con **versión exacta** y de **backend** o **frontend** según corresponda? | ☐ |
| 8 | ¿La versión tiene al menos **dos semanas** de publicada? | ☐ |

> **Una librería de servidor no va en el frontend.** `nodemailer` aparece hoy en el `package.json` del frontend: sobra y ensancha la superficie de ataque ([H-14](../testing/hallazgos.md)).

### Señales de alerta

| 🚩 | Por qué |
|---|---|
| El nombre se parece a un paquete famoso con una letra distinta | *Typosquatting*: paquetes falsos que imitan a los populares |
| Publicado hace pocos días con pocas descargas | Sin historial de confianza |
| Pide scripts de instalación (`postinstall`) sin razón clara | Es la vía habitual para ejecutar código al instalar |
| Mantenedor nuevo o repositorio sin actividad | Riesgo de abandono o de traspaso malicioso |
| Muchos paquetes para algo trivial | Cada uno es superficie de ataque |

---

## 6. Mantenerlas al día

Quedarse sin actualizar es un riesgo; actualizar a ciegas, otro. El equilibrio:

| Práctica | Cómo |
|---|---|
| **Revisar vulnerabilidades** | `pnpm audit --prod` en `backend/` y `frontend/`; también en el CI ([plan de pruebas](../testing/plan-de-pruebas.md)) |
| **Ver lo desactualizado** | `pnpm outdated` |
| **Actualizar de a una** | Una rama `chore/…` por dependencia importante, con sus pruebas |
| **Saltos mayores** | Leer las notas de la versión; probar con la lista de humo |
| **Esperar unos días** | No adoptar una versión recién publicada; dejar que la comunidad la pruebe |
| **Automatizar avisos** | Activar Dependabot o similar en GitHub (propuesta) |
| **Buscar secretos** | `gitleaks detect --source .` |

```bash
pnpm add express@4.21.2           # versión exacta (con save-exact queda sin ^)
pnpm update express@4.21.3        # actualizar una dependencia
pnpm why <paquete>                # quién trae este paquete
pnpm audit --prod                 # vulnerabilidades conocidas
```

*(Los números de versión son solo ilustrativos: usa los de tu `package.json`.)*

---

## 7. En contenedores y en el CI

| Medida | Dónde |
|---|---|
| `pnpm install --frozen-lockfile` | `Dockerfile` y `.github/workflows/ci.yml` |
| `--prod` en la imagen del backend | No instalar herramientas de desarrollo en producción |
| Imagen base **LTS** y `alpine` | Menos superficie; versión controlada con `NODE_VERSION` |
| `.dockerignore` excluye `node_modules` y `.env` | No copiar al contenedor lo que se reinstala ni los secretos |
| Un solo lockfile por carpeta | Sin `package-lock.json` ni `yarn.lock` |

Detalle en [Contenedores y Docker](contenedores-docker.md).

---

## 8. Estado actual y pendientes

| Tema | v11 | v12 |
|---|---|---|
| Gestor de paquetes | `pnpm` (hay `pnpm-lock.yaml`) | `pnpm` obligatorio y declarado en `packageManager` |
| Versiones | 21 con `^` | Exactas |
| Node.js | `node:20-alpine` en Docker | LTS vigente fijada en `.nvmrc`, `engines` y Docker |
| `nodemailer` | Declarado en el frontend | Solo en el backend |
| Auditoría | No hay | `pnpm audit` y `gitleaks` en el CI |
| Aviso de actualizaciones | No hay | Dependabot (propuesta) |

---

## Documentos relacionados

- [Seguridad y OWASP](seguridad-owasp.md) · [Contenedores y Docker](contenedores-docker.md)
- [Restricciones de herramientas](../requisitos/restricciones.md#2-restricciones-de-herramientas-y-entorno) · [Guía de contribución](../colaboracion/guia-de-contribucion.md)
- [Hallazgos](../testing/hallazgos.md) · [Revisión de código — dependencias](../colaboracion/revision-de-codigo.md#54-docker-dependencias-y-configuración)
