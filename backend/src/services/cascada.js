/*
  Cascada de estados (RN-017, RN-018, HU-024, HU-025).

  La evaluación vigente de una evidencia es la fila más reciente de
  `evaluaciones` por (fecha_evaluacion, evaluacion_id). Se selecciona con
  LATERAL para no duplicar evidencias cuando hay historial.

  Este módulo no decide permisos: recibe una conexión (pool o cliente de una
  transacción) y recalcula lo que ya cambió.
*/

import {
  calcularEstadoCarpeta,
  calcularEstadoFase,
  calcularProgreso,
} from '../domain/reglas.js';

const SQL_EVALUACION_VIGENTE = `
  LEFT JOIN LATERAL (
    SELECT e2.resultado
    FROM evaluaciones e2
    WHERE e2.evidencia_id = ev.evidencia_id
    ORDER BY e2.fecha_evaluacion DESC, e2.evaluacion_id DESC
    LIMIT 1
  ) ult ON true`;

/**
 * Resultados vigentes de todas las evidencias de una carpeta.
 * @returns {Promise<Array<{evidencia_id:number, resultado:string|null}>>}
 */
export async function resultadosDeCarpeta(db, carpetaId) {
  const { rows } = await db.query(
    `SELECT ev.evidencia_id, ult.resultado
     FROM evidencias ev
     ${SQL_EVALUACION_VIGENTE}
     WHERE ev.carpeta_id = $1
     ORDER BY ev.evidencia_id`,
    [carpetaId]
  );

  return rows;
}

/**
 * Resultados vigentes de todas las evidencias de una fase.
 */
export async function resultadosDeFase(db, faseId) {
  const { rows } = await db.query(
    `SELECT ev.evidencia_id, ult.resultado
     FROM fases f
     JOIN carpetas c ON c.fase_id = f.fase_id
     LEFT JOIN evidencias ev ON ev.carpeta_id = c.carpeta_id
     ${SQL_EVALUACION_VIGENTE}
     WHERE f.fase_id = $1
     ORDER BY ev.evidencia_id`,
    [faseId]
  );

  return rows.filter((fila) => fila.evidencia_id !== null);
}

/**
 * Recalcula y persiste el estado de una carpeta.
 * @returns {Promise<{faseId:number, estadoCarpeta:string, progreso:object}>}
 */
export async function recalcularCarpeta(db, carpetaId) {
  const filas = await resultadosDeCarpeta(db, carpetaId);
  const resultados = filas.map((fila) => fila.resultado);
  const estadoCarpeta = calcularEstadoCarpeta(resultados);

  const { rows } = await db.query(
    `UPDATE carpetas
     SET estado_carpeta = $2
     WHERE carpeta_id = $1
     RETURNING fase_id`,
    [carpetaId, estadoCarpeta]
  );

  if (rows.length === 0) {
    return { faseId: null, estadoCarpeta: null, progreso: calcularProgreso([]) };
  }

  return {
    faseId: rows[0].fase_id,
    estadoCarpeta,
    progreso: calcularProgreso(resultados),
  };
}

/**
 * Recalcula y persiste el estado de una fase a partir de sus evidencias.
 */
export async function recalcularFase(db, faseId) {
  const filas = await resultadosDeFase(db, faseId);
  const resultados = filas.map((fila) => fila.resultado);
  const estadoFase = calcularEstadoFase(resultados);
  const progreso = calcularProgreso(resultados);

  await db.query(
    `UPDATE fases SET estado_fase = $2 WHERE fase_id = $1`,
    [faseId, estadoFase]
  );

  return { estadoFase, progreso };
}

/**
 * Conveniencia: recalcula la carpeta y su fase. Debe ejecutarse después de
 * insertar una evaluación o una evidencia nueva.
 */
export async function recalcularCarpetaYFase(db, carpetaId) {
  const carpeta = await recalcularCarpeta(db, carpetaId);
  const fase = carpeta.faseId
    ? await recalcularFase(db, carpeta.faseId)
    : { estadoFase: null, progreso: calcularProgreso([]) };

  return {
    estadoCarpeta: carpeta.estadoCarpeta,
    estadoFase: fase.estadoFase,
    progreso: fase.progreso,
  };
}
