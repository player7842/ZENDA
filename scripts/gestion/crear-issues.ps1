#Requires -Version 5.1
<#
.SYNOPSIS
    Crea en GitHub las etiquetas, los hitos y los issues del backlog de ZENDA.

.DESCRIPTION
    Lee docs/gestion/backlog.csv y, con GitHub CLI autenticado, crea:
      - las etiquetas de tipo, prioridad y módulo que falten;
      - los hitos Semana 1 a Semana 6;
      - un issue por historia de usuario, con su cuerpo, etiquetas e hito.
    Es idempotente: omite los issues cuyo título ya existe.
    Las HU marcadas como "Implementado" se crean cerradas, para conservar
    la trazabilidad sin ensuciar el trabajo pendiente.

.PARAMETER Owner
    Dueño del repositorio. Por defecto: player7842.

.PARAMETER Repo
    Nombre del repositorio. Por defecto: ZENDA.

.PARAMETER Csv
    Ruta del backlog. Por defecto: docs/gestion/backlog.csv.

.PARAMETER Project
    Número del Project al que se agregan los issues. 0 = no agregar.

.PARAMETER SoloEtiquetas
    Crea solo las etiquetas.

.PARAMETER SoloHitos
    Crea solo los hitos.

.PARAMETER DryRun
    Muestra lo que haría, sin llamar a GitHub.

.EXAMPLE
    pwsh ./scripts/gestion/crear-issues.ps1 -Owner player7842 -Repo ZENDA -Project 1
#>
[CmdletBinding()]
param(
    [string]$Owner = "player7842",
    [string]$Repo = "ZENDA",
    [string]$Csv = "",
    [int]$Project = 0,
    [switch]$SoloEtiquetas,
    [switch]$SoloHitos,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$repoCompleto = "$Owner/$Repo"
$raizRepo = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path))
if ([string]::IsNullOrWhiteSpace($Csv)) {
    $Csv = Join-Path (Join-Path $raizRepo "docs") "gestion\backlog.csv"
}

# ---------------------------------------------------------------------------
# Utilidades
# ---------------------------------------------------------------------------
function Invoke-Gh {
    param(
        [Parameter(Mandatory = $true)][string[]]$Argumentos,
        [switch]$PermitirFallo
    )

    $salida = & gh @Argumentos 2>&1
    if ($LASTEXITCODE -ne 0 -and -not $PermitirFallo) {
        throw "Falló 'gh $($Argumentos -join ' ')':`n$salida"
    }
    return $salida
}

function Escribir-Paso {
    param([string]$Mensaje)
    Write-Host "==> $Mensaje" -ForegroundColor Cyan
}

if (-not (Get-Command gh -ErrorAction SilentlyContinue) -and -not $DryRun) {
    throw "GitHub CLI (gh) no está instalado. Instálalo desde https://cli.github.com/ o ejecuta con -DryRun."
}

if (-not (Test-Path $Csv)) {
    throw "No existe el backlog: $Csv"
}

$backlog = Import-Csv -Path $Csv -Encoding UTF8
if ($backlog.Count -ne 42) {
    Write-Warning "El backlog tiene $($backlog.Count) filas; se esperaban 42."
}

# ---------------------------------------------------------------------------
# Catálogos
# ---------------------------------------------------------------------------
$etiquetas = @(
    @{ Nombre = "funcionalidad"; Color = "1D76DB"; Descripcion = "Historia de usuario del backlog" },
    @{ Nombre = "defecto"; Color = "D73A4A"; Descripcion = "Defecto detectado en pruebas o revision" },
    @{ Nombre = "mejora-tecnica"; Color = "5319E7"; Descripcion = "Refactorizacion o deuda tecnica" },
    @{ Nombre = "documentacion"; Color = "0075CA"; Descripcion = "Solo documentacion" },
    @{ Nombre = "prioridad-alta"; Color = "B60205"; Descripcion = "Prioridad alta" },
    @{ Nombre = "prioridad-media"; Color = "FBCA04"; Descripcion = "Prioridad media" },
    @{ Nombre = "prioridad-baja"; Color = "0E8A16"; Descripcion = "Prioridad baja" },
    @{ Nombre = "listo-para-trabajar"; Color = "C2E0C6"; Descripcion = "Cumple la definicion de listo" },
    @{ Nombre = "en-curso"; Color = "FEF2C0"; Descripcion = "En desarrollo" },
    @{ Nombre = "bloqueado"; Color = "E99695"; Descripcion = "Bloqueado por una dependencia" },
    @{ Nombre = "necesita-informacion"; Color = "D4C5F9"; Descripcion = "Falta informacion para empezar" },
    @{ Nombre = "implementado-v11"; Color = "BFDADC"; Descripcion = "Ya funciona en la version v11" },
    @{ Nombre = "modulo-auth"; Color = "C5DEF5"; Descripcion = "Autenticacion y sesion" },
    @{ Nombre = "modulo-administracion"; Color = "C5DEF5"; Descripcion = "Usuarios, fichas y programas" },
    @{ Nombre = "modulo-proyecto"; Color = "C5DEF5"; Descripcion = "Grupos y proyectos" },
    @{ Nombre = "modulo-evidencias"; Color = "C5DEF5"; Descripcion = "Fases, carpetas y evidencias" },
    @{ Nombre = "modulo-evaluacion"; Color = "C5DEF5"; Descripcion = "Evaluacion y observaciones" },
    @{ Nombre = "modulo-tareas"; Color = "C5DEF5"; Descripcion = "Tareas del grupo" },
    @{ Nombre = "modulo-seguimiento"; Color = "C5DEF5"; Descripcion = "Paneles y seguimiento" },
    @{ Nombre = "modulo-reportes"; Color = "C5DEF5"; Descripcion = "Reportes PDF y Excel" },
    @{ Nombre = "modulo-lista-chequeo"; Color = "C5DEF5"; Descripcion = "Lista de chequeo del instructor" },
    @{ Nombre = "modulo-ui"; Color = "C5DEF5"; Descripcion = "Interfaz, tema y textos legales" },
    @{ Nombre = "modulo-bd"; Color = "C5DEF5"; Descripcion = "Esquema y migraciones" },
    @{ Nombre = "modulo-docker"; Color = "C5DEF5"; Descripcion = "Docker y despliegue" },
    @{ Nombre = "modulo-docs"; Color = "C5DEF5"; Descripcion = "Documentacion" }
)

$mapaModulos = @{
    "Autenticación" = "modulo-auth"
    "Administración" = "modulo-administracion"
    "Grupos y proyectos" = "modulo-proyecto"
    "Fases y evidencias" = "modulo-evidencias"
    "Evaluación" = "modulo-evaluacion"
    "Tareas" = "modulo-tareas"
    "Seguimiento" = "modulo-seguimiento"
    "Reportes" = "modulo-reportes"
    "Lista de chequeo" = "modulo-lista-chequeo"
    "Interfaz y legal" = "modulo-ui"
}

$hitos = @(
    @{ Titulo = "Semana 1"; Vence = "2026-10-23T23:59:59Z"; Descripcion = "Gate Docker, CI, backlog y reparto" },
    @{ Titulo = "Semana 2"; Vence = "2026-10-30T23:59:59Z"; Descripcion = "Nucleo: evaluaciones, instructor_ficha, cupo y evidencias" },
    @{ Titulo = "Semana 3"; Vence = "2026-11-06T23:59:59Z"; Descripcion = "Despliegue, backup, archivos y reasignacion" },
    @{ Titulo = "Semana 4"; Vence = "2026-11-13T23:59:59Z"; Descripcion = "Calidad, cobertura y lista de chequeo" },
    @{ Titulo = "Semana 5"; Vence = "2026-11-20T23:59:59Z"; Descripcion = "Documentacion, manuales y congelacion" },
    @{ Titulo = "Semana 6"; Vence = "2026-11-27T23:59:59Z"; Descripcion = "Entrega y sustentacion" }
)

# ---------------------------------------------------------------------------
# Etiquetas
# ---------------------------------------------------------------------------
function Crear-Etiquetas {
    Escribir-Paso "Etiquetas"
    foreach ($etiqueta in $etiquetas) {
        if ($DryRun) {
            Write-Host "  [dry-run] etiqueta $($etiqueta.Nombre)"
            continue
        }
        Invoke-Gh -Argumentos @(
            "label", "create", $etiqueta.Nombre,
            "--repo", $repoCompleto,
            "--color", $etiqueta.Color,
            "--description", $etiqueta.Descripcion,
            "--force"
        ) | Out-Null
        Write-Host "  ok $($etiqueta.Nombre)"
    }
}

# ---------------------------------------------------------------------------
# Hitos
# ---------------------------------------------------------------------------
function Crear-Hitos {
    Escribir-Paso "Hitos"

    $existentes = @()
    if (-not $DryRun) {
        $json = Invoke-Gh -Argumentos @("api", "repos/$repoCompleto/milestones?state=all&per_page=100")
        $existentes = ($json | ConvertFrom-Json) | ForEach-Object { $_.title }
    }

    foreach ($hito in $hitos) {
        if ($DryRun) {
            Write-Host "  [dry-run] hito $($hito.Titulo)"
            continue
        }
        if ($existentes -contains $hito.Titulo) {
            Write-Host "  ya existe $($hito.Titulo)"
            continue
        }
        Invoke-Gh -Argumentos @(
            "api", "repos/$repoCompleto/milestones",
            "-f", "title=$($hito.Titulo)",
            "-f", "due_on=$($hito.Vence)",
            "-f", "description=$($hito.Descripcion)"
        ) | Out-Null
        Write-Host "  creado $($hito.Titulo)"
    }
}

# ---------------------------------------------------------------------------
# Issues
# ---------------------------------------------------------------------------
function Obtener-DocumentoHu {
    param([string]$Id)
    $carpeta = Join-Path (Join-Path $raizRepo "docs\Requisitos") "HUs"
    $archivo = Get-ChildItem -Path $carpeta -Filter "$Id`_*.md" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($null -eq $archivo) { return $null }
    return "docs/Requisitos/HUs/$($archivo.Name)"
}

function Crear-Issues {
    Escribir-Paso "Issues"

    $titulosExistentes = @()
    if (-not $DryRun) {
        $json = Invoke-Gh -Argumentos @(
            "issue", "list", "--repo", $repoCompleto,
            "--state", "all", "--limit", "1000", "--json", "title"
        )
        $titulosExistentes = ($json | ConvertFrom-Json) | ForEach-Object { $_.title }
    }

    $creados = 0
    $omitidos = 0

    foreach ($hu in $backlog) {
        $titulo = $hu.Title
        if ($titulosExistentes -contains $titulo) {
            Write-Host "  ya existe $($hu.ID)"
            $omitidos++
            continue
        }

        $etiquetasIssue = @("funcionalidad")
        if ($hu.Prioridad) {
            $etiquetasIssue += "prioridad-$($hu.Prioridad.ToLower())"
        }
        if ($mapaModulos.ContainsKey($hu.'Módulo')) {
            $etiquetasIssue += $mapaModulos[$hu.'Módulo']
        }
        if ($hu.Estado -eq "Implementado") {
            $etiquetasIssue += "implementado-v11"
        }

        $documento = Obtener-DocumentoHu -Id $hu.ID
        $rutaDocumento = if ($documento) { "[$($hu.ID)]($documento)" } else { $hu.ID }

        $cuerpo = @"
## Historia de usuario

**$($hu.ID) — $($hu.Title)**

| Campo | Valor |
|---|---|
| Módulo | $($hu.'Módulo') |
| Rol | $($hu.Rol) |
| Prioridad | $($hu.Prioridad) |
| Estado en la matriz | $($hu.Estado) |
| Requisito funcional | $($hu.RF) |
| Reglas de negocio | $($hu.RN) |
| Semana objetivo | $($hu.Semana) |
| Responsable | $($hu.Responsable) |
| Revisor | $($hu.Revisor) |
| Tamaño | $($hu.Tamaño) |

Especificación completa: $rutaDocumento

## Criterios de aceptación

Los de la historia enlazada. El issue se cierra con el PR que implementa, prueba y documenta la HU.

## Definición de terminado

- [ ] Código implementado y probado.
- [ ] Pruebas automatizadas que cubren la regla.
- [ ] Documentación y matriz de trazabilidad actualizadas.
- [ ] PR revisado y aprobado por $($hu.Revisor).
"@

        $argumentos = @(
            "issue", "create",
            "--repo", $repoCompleto,
            "--title", $titulo,
            "--body", $cuerpo
        )
        foreach ($etiqueta in $etiquetasIssue) {
            $argumentos += @("--label", $etiqueta)
        }
        if ($hu.Semana -like "Semana *") {
            $argumentos += @("--milestone", $hu.Semana)
        }

        if ($DryRun) {
            $hitoTexto = if ($hu.Semana -like "Semana *") { $hu.Semana } else { "sin hito" }
            Write-Host "  [dry-run] issue $($hu.ID) [$($etiquetasIssue -join ', ')] hito=$hitoTexto"
            $creados++
            continue
        }

        $url = (Invoke-Gh -Argumentos $argumentos | Select-Object -Last 1).ToString().Trim()
        Write-Host "  creado $($hu.ID) -> $url"

        if ($hu.Estado -eq "Implementado") {
            Invoke-Gh -Argumentos @(
                "issue", "close", $url,
                "--repo", $repoCompleto,
                "--reason", "completed",
                "--comment", "Implementado en la versión v11. Se conserva para trazabilidad y verificación en el entorno limpio."
            ) | Out-Null
        }

        if ($Project -gt 0) {
            Invoke-Gh -Argumentos @(
                "project", "item-add", "$Project",
                "--owner", $Owner,
                "--url", $url
            ) | Out-Null
        }

        $creados++
    }

    Write-Host ""
    Write-Host "Issues creados: $creados · omitidos: $omitidos" -ForegroundColor Green
}

# ---------------------------------------------------------------------------
# Ejecución
# ---------------------------------------------------------------------------
Write-Host "Repositorio: $repoCompleto" -ForegroundColor Yellow
Write-Host "Backlog: $Csv ($($backlog.Count) filas)" -ForegroundColor Yellow
if ($DryRun) { Write-Host "Modo dry-run: no se llama a GitHub" -ForegroundColor Yellow }

if ($SoloEtiquetas) {
    Crear-Etiquetas
    Write-Host "Listo." -ForegroundColor Green
    return
}

if ($SoloHitos) {
    Crear-Hitos
    Write-Host "Listo." -ForegroundColor Green
    return
}

Crear-Etiquetas
Crear-Hitos
Crear-Issues

Write-Host "Listo." -ForegroundColor Green
