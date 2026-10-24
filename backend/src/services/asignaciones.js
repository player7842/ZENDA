/*
  Historial de instructor_ficha (H-07, HU-011).

  Una asignación nunca se elimina al reasignar: se cierra con fecha_fin y
  estado 'Inactivo'. La unicidad es parcial (solo una vigente por
  instructor/ficha), de modo que una ficha puede reasignarse más adelante y
  queda el registro anterior.
*/

function normalizarIds(ids) {
  return [
    ...new Set((ids || []).map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0)),
  ];
}

/**
 * Sincroniza las asignaciones vigentes de un instructor.
 *
 * @param {object} db pool o cliente de transacción
 * @param {number} instructorId
 * @param {number[]} fichaIds fichas que deben quedar vigentes
 * @param {{soloPrograma?: number|null}} opciones
 *        soloPrograma limita el cierre/creación al programa indicado y deja
 *        intactas las asignaciones de otros programas (usado por coordinación).
 * @returns {Promise<{cerradas:number, creadas:number}>}
 */
export async function sincronizarFichasInstructor(
  db,
  instructorId,
  fichaIds,
  { soloPrograma = null } = {},
) {
  const deseadas = normalizarIds(fichaIds);

  const { rows: activas } = await db.query(
    `SELECT ifi.instructor_ficha_id, ifi.ficha_id
     FROM instructor_ficha ifi
     JOIN fichas f ON f.ficha_id = ifi.ficha_id
     JOIN programas pr ON pr.programa_id = f.programa_id
     WHERE ifi.instructor_id = $1
       AND ifi.fecha_fin IS NULL
       AND ($2::int IS NULL OR pr.codigo_programa = $2)
     FOR UPDATE OF ifi`,
    [instructorId, soloPrograma],
  );

  const idsActivas = new Set(activas.map((fila) => Number(fila.ficha_id)));
  const deseadasSet = new Set(deseadas);

  const aCerrar = activas
    .filter((fila) => !deseadasSet.has(Number(fila.ficha_id)))
    .map((fila) => fila.instructor_ficha_id);

  if (aCerrar.length > 0) {
    await db.query(
      `UPDATE instructor_ficha
       SET fecha_fin = CURRENT_DATE, estado = 'Inactivo'
       WHERE instructor_ficha_id = ANY($1::int[])`,
      [aCerrar],
    );
  }

  let creadas = 0;

  for (const fichaId of deseadas) {
    if (idsActivas.has(fichaId)) continue;

    const { rowCount } = await db.query(
      `INSERT INTO instructor_ficha
         (instructor_id, ficha_id, fecha_inicio, fecha_fin, estado)
       VALUES ($1, $2, CURRENT_DATE, NULL, 'Activo')
       ON CONFLICT (instructor_id, ficha_id) WHERE fecha_fin IS NULL
       DO NOTHING`,
      [instructorId, fichaId],
    );

    creadas += rowCount;
  }

  return { cerradas: aCerrar.length, creadas };
}

/**
 * Cierra todas las asignaciones vigentes de un instructor (por ejemplo,
 * cuando su rol deja de ser INSTRUCTOR).
 */
export async function cerrarAsignacionesInstructor(db, instructorId) {
  const { rowCount } = await db.query(
    `UPDATE instructor_ficha
     SET fecha_fin = CURRENT_DATE, estado = 'Inactivo'
     WHERE instructor_id = $1 AND fecha_fin IS NULL`,
    [instructorId],
  );

  return rowCount;
}
