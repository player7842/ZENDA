// Helper único para el grupo General de una ficha (RN-006, C-05).
//
// El grupo General NO se identifica por su nombre (dato que el aprendiz
// controla) sino por la columna booleana `grupos.es_general`, protegida por
// un índice único parcial: solo puede existir uno por ficha.
//
// El código sigue el formato GEN-<numero_ficha> de RN-006.

/**
 * Busca o crea el grupo General de una ficha.
 *
 * @param {import('pg').Client|import('pg').Pool} db Conexión o cliente de una transacción.
 * @param {number} fichaId Ficha a la que pertenece el grupo.
 * @param {number|null} liderId Usuario que queda como líder si hay que crearlo.
 * @returns {Promise<number>} grupo_id del General.
 */
export async function obtenerOCrearGrupoGeneral(db, fichaId, liderId = null) {
  const ficha = await db.query('SELECT numero_ficha FROM fichas WHERE ficha_id = $1', [fichaId]);
  if (ficha.rows.length === 0) {
    const error = new Error('La ficha indicada no existe');
    error.codigo = 400;
    throw error;
  }

  const codigo = `GEN-${ficha.rows[0].numero_ficha}`;

  // ON CONFLICT sobre el índice único parcial evita los dos Generales que
  // podían crearse cuando dos aprendices se registraban a la vez (C-06).
  const creado = await db.query(
    `INSERT INTO grupos
       (nombre_grupo, codigo_grupo, ficha_id, lider_id, cupo_maximo, estado_grupo, fecha_creacion, es_general)
     VALUES ('General', $1, $2, $3, 50, 'Activo', now(), true)
     ON CONFLICT (ficha_id) WHERE es_general DO NOTHING
     RETURNING grupo_id`,
    [codigo, fichaId, liderId],
  );

  if (creado.rows.length > 0) return creado.rows[0].grupo_id;

  const existente = await db.query(
    'SELECT grupo_id FROM grupos WHERE ficha_id = $1 AND es_general LIMIT 1',
    [fichaId],
  );

  if (existente.rows.length === 0) {
    throw new Error('No se pudo obtener el grupo General de la ficha');
  }

  return existente.rows[0].grupo_id;
}

export default obtenerOCrearGrupoGeneral;
