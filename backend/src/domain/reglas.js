/*
  Reglas de negocio puras de ZENDA (sin acceso a base de datos).

  Se concentran aquí para poder probarlas con Vitest y reutilizarlas desde
  los controladores. En particular cubren la Semana 2:
    - RN-009: cupo del grupo.
    - RN-017: la evaluación vigente es la más reciente (la selección de la
      fila vigente se hace en SQL con LATERAL; aquí se interpreta el resultado).
    - RN-018: cascada de estados evidencia -> carpeta -> fase.
    - HU-025: porcentaje de avance.
*/

export const RESULTADO_APROBADO = 'APROBADO';
export const RESULTADO_REPROBADO = 'REPROBADO';

export const ESTADO_PENDIENTE = 'Pendiente';
export const ESTADO_EN_REVISION = 'En revisión';
export const ESTADO_APROBADA = 'Aprobada';
export const ESTADO_DESAPROBADA = 'Desaprobada';

export const CUPO_MINIMO = 1;
export const CUPO_MAXIMO = 50;
export const CUPO_POR_DEFECTO = 6;

/**
 * Valida y normaliza el cupo máximo de un grupo.
 * @returns {{ valido: boolean, cupo: number|null, mensaje: string|null }}
 */
export function validarCupo(valor) {
  if (valor === undefined || valor === null || valor === '') {
    return {
      valido: false,
      cupo: null,
      mensaje: `El cupo de integrantes es obligatorio (entre ${CUPO_MINIMO} y ${CUPO_MAXIMO}).`,
    };
  }

  const cupo = Number(valor);

  if (!Number.isInteger(cupo) || cupo < CUPO_MINIMO || cupo > CUPO_MAXIMO) {
    return {
      valido: false,
      cupo: null,
      mensaje: `El cupo de integrantes debe ser un número entero entre ${CUPO_MINIMO} y ${CUPO_MAXIMO}.`,
    };
  }

  return { valido: true, cupo, mensaje: null };
}

/**
 * RN-009: el grupo admite un integrante más mientras no alcance el cupo.
 * El líder cuenta como integrante.
 */
export function puedeUnirse(cupoMaximo, totalIntegrantes) {
  const cupo = Number(cupoMaximo);
  const actuales = Number(totalIntegrantes);

  if (!Number.isFinite(cupo) || !Number.isFinite(actuales)) return false;

  return actuales < cupo;
}

/**
 * RF-028: la fecha límite de una tarea no puede ser anterior a la de inicio.
 * Las dos fechas son opcionales; si falta una, no hay nada que comparar.
 * @returns {string|null} Mensaje de error o null si son válidas.
 */
export function validarFechasTarea(fechaInicio, fechaLimite) {
  if (!fechaInicio || !fechaLimite) return null;

  const inicio = new Date(fechaInicio);
  const limite = new Date(fechaLimite);

  if (Number.isNaN(inicio.getTime()) || Number.isNaN(limite.getTime())) {
    return 'Las fechas de la tarea no son válidas';
  }

  if (limite < inicio) {
    return 'La fecha límite no puede ser anterior a la fecha de inicio';
  }

  return null;
}

/**
 * Normaliza el resultado de una evaluación.
 * @returns {'APROBADO'|'REPROBADO'|null}
 */
export function normalizarResultado(valor) {
  if (typeof valor !== 'string') return null;

  const normalizado = valor.trim().toUpperCase();

  if (normalizado === RESULTADO_APROBADO) return RESULTADO_APROBADO;
  if (normalizado === RESULTADO_REPROBADO) return RESULTADO_REPROBADO;

  return null;
}

function esAprobado(resultado) {
  return normalizarResultado(resultado) === RESULTADO_APROBADO;
}

function esReprobado(resultado) {
  return normalizarResultado(resultado) === RESULTADO_REPROBADO;
}

/**
 * RN-018: estado de una carpeta a partir del resultado vigente de cada una
 * de sus evidencias (null = todavía sin evaluar).
 *
 * - Sin evidencias -> Pendiente.
 * - Alguna evidencia reprobada -> Desaprobada.
 * - Todas aprobadas -> Aprobada.
 * - Cualquier otro caso (evidencias sin evaluar) -> En revisión.
 */
export function calcularEstadoCarpeta(resultados = []) {
  const lista = Array.isArray(resultados) ? resultados : [];

  if (lista.length === 0) return ESTADO_PENDIENTE;
  if (lista.some(esReprobado)) return ESTADO_DESAPROBADA;
  if (lista.every(esAprobado)) return ESTADO_APROBADA;

  return ESTADO_EN_REVISION;
}

/**
 * RN-018: estado de una fase a partir del resultado vigente de todas sus
 * evidencias. Una carpeta desaprobada contiene una evidencia reprobada, así
 * que evaluar las evidencias cubre la cascada completa.
 *
 * - Sin evidencias -> Pendiente.
 * - Alguna evidencia reprobada -> Desaprobada.
 * - Todas aprobadas -> Aprobada.
 * - Cualquier otro caso -> En revisión.
 */
export function calcularEstadoFase(resultadosEvidencias = []) {
  return calcularEstadoCarpeta(resultadosEvidencias);
}

/**
 * HU-025: progreso sobre una lista de resultados vigentes.
 * @returns {{total:number, aprobadas:number, reprobadas:number, sinEvaluar:number, porcentaje:number}}
 */
export function calcularProgreso(resultados = []) {
  const lista = Array.isArray(resultados) ? resultados : [];
  const total = lista.length;
  const aprobadas = lista.filter(esAprobado).length;
  const reprobadas = lista.filter(esReprobado).length;
  const sinEvaluar = total - aprobadas - reprobadas;

  return {
    total,
    aprobadas,
    reprobadas,
    sinEvaluar,
    porcentaje: total === 0 ? 0 : Math.round((aprobadas / total) * 100),
  };
}
