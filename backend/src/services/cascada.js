/*
  Cascada de estados (RN-017, RN-018, HU-024, HU-025).

  La evaluación vigente de una evidencia es la fila de mayor evaluacion_id.
  Se eligió el identificador y no la fecha para que dos evaluaciones creadas
  dentro de la misma transacción no queden empatadas por now() (C-06).

  La persistencia del estado se delega en las funciones SQL
  zenda_recalcular_carpeta / zenda_recalcular_fase, de modo que el seed, la
  migración y la API usan una sola implementación (Q-02).
*/

import { calcularProgreso } from '../domain/reglas.js';

const SQL_EVALUACION_VIGENTE = `
  LEFT JOIN LATERAL (
    SELECT e2.resultado
    FROM evaluaciones e2
    WHERE e2.evidencia_id = ev.evidencia_id
    ORDER BY e2.evaluacion_id DESC
    LIMIT 1
  ) ult ON true`;

/**
 * Bloquea una carpeta dentro de la transacción actual. Todas las escrituras
 * que afectan a su estado (evidencias, evaluaciones, aprobación en bloque)
 * deben llamar primero a esta función para serializarse (C-06).
 */
export async function bloquearCarpeta(db, carpetaId) {
  const { rows } = await db.query(
    'SELECT carpeta_id, fase_id FROM carpetas WHERE carpeta_id = $1 FOR UPDATE',
    [carpetaId]
  );
  return rows[0] || null;
}

export async function bloquearFase(db, faseId) {
  const { rows } = await db.query(
    'SELECT fase_id FROM fases WHERE fase_id = $1 FOR UPDATE',
    [faseId]
  );
  return rows[0] || null;
}

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
  const carpeta = await bloquearCarpeta(db, carpetaId);
  if (!carpeta) {
    return { faseId: null, estadoCarpeta: null, progreso: calcularProgreso([]) };
  }

  const filas = await resultadosDeCarpeta(db, carpetaId);
  const resultados = filas.map((fila) => fila.resultado);

  const { rows } = await db.query(
    'SELECT zenda_recalcular_carpeta($1) AS estado_carpeta',
    [carpetaId]
  );

  return {
    faseId: carpeta.fase_id,
    estadoCarpeta: rows[0].estado_carpeta,
    progreso: calcularProgreso(resultados),
  };
}

/**
 * Recalcula y persiste el estado de una fase a partir de sus evidencias.
 */
export async function recalcularFase(db, faseId) {
  await bloquearFase(db, faseId);

  const filas = await resultadosDeFase(db, faseId);
  const resultados = filas.map((fila) => fila.resultado);

  const { rows } = await db.query('SELECT zenda_recalcular_fase($1) AS estado_fase', [faseId]);

  return {
    estadoFase: rows[0]?.estado_fase || null,
    progreso: calcularProgreso(resultados),
  };
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
