// ====================================================================
// CONTROLADOR DE COORDINADOR — vista de solo lectura de fichas/instructores
// del programa ADSO (codigo_programa 2338) + asignación de instructores
// a esas fichas.
// ====================================================================
// El coordinador NUNCA ve ni toca nada de otros programas. Reutiliza el
// mismo modelo de datos que fichasController/userController, acotado.

import pool from '../../config/db.js';
import { verificarPassword } from '../../utils/confirmarAdmin.js';

const CODIGO_PROGRAMA_ADSO = 2338;

// ==================================================================
// Helper: resolverFichasADSO(db, numeros)
// ==================================================================
const resolverFichasADSO = async (db, numeros) => {
  const limpio = [...new Set((numeros || []).map((n) => String(n).trim()).filter(Boolean))];
  if (limpio.length === 0) return [];

  const result = await db.query(
    `SELECT f.ficha_id, f.numero_ficha
     FROM fichas f
     JOIN programas p ON p.programa_id = f.programa_id
     WHERE f.numero_ficha = ANY($1::int[]) AND p.codigo_programa = $2`,
    [limpio.map(Number), CODIGO_PROGRAMA_ADSO]
  );

  const encontrados = new Set(result.rows.map((r) => String(r.numero_ficha)));
  const faltantes = limpio.filter((n) => !encontrados.has(n));
  if (faltantes.length > 0) {
    const err = new Error(`La ficha ${faltantes.join(', ')} no existe o no pertenece a tu ámbito (ADSO)`);
    err.codigo = 400;
    throw err;
  }
  return result.rows.map((r) => r.ficha_id);
};

// ==================================================================
// GET /api/coordinador/fichas — fichas ADSO con conteos
// ==================================================================
export const getFichasCoordinador = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.ficha_id, f.numero_ficha, f.jornada,
              to_char(f.fecha_inicio, 'YYYY-MM-DD') AS fecha_inicio,
              to_char(f.fecha_fin, 'YYYY-MM-DD')    AS fecha_fin,
              p.programa_id, p.codigo_programa, p.nombre_programa,
              (SELECT count(*)::int
               FROM integrantes_grupo ig
               JOIN grupos g ON g.grupo_id = ig.grupo_id
               WHERE g.ficha_id = f.ficha_id AND ig.estado_integrante = 'Activo') AS cantidad_aprendices,
              (SELECT count(*)::int FROM instructor_ficha inf WHERE inf.ficha_id = f.ficha_id) AS cantidad_instructores
       FROM fichas f
       JOIN programas p ON p.programa_id = f.programa_id
       WHERE p.codigo_programa = $1
       ORDER BY f.numero_ficha`,
      [CODIGO_PROGRAMA_ADSO]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener fichas (coordinador):', error);
    res.status(500).json({ message: 'Error al obtener fichas' });
  }
};

// ==================================================================
// GET /api/coordinador/instructores — instructores + sus fichas ADSO
// ==================================================================
export const getInstructoresCoordinador = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.usuario_id, u.nombre, u.apellido, u.correo, u.estado,
              COALESCE((
                SELECT array_agg(f.numero_ficha ORDER BY f.numero_ficha)
                FROM instructor_ficha inf
                JOIN fichas f ON f.ficha_id = inf.ficha_id
                JOIN programas p ON p.programa_id = f.programa_id
                WHERE inf.instructor_id = u.usuario_id AND p.codigo_programa = $1
              ), ARRAY[]::int[]) AS fichas
       FROM usuarios u
       WHERE u.rol = 'INSTRUCTOR'
       ORDER BY u.usuario_id`,
      [CODIGO_PROGRAMA_ADSO]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener instructores (coordinador):', error);
    res.status(500).json({ message: 'Error al obtener instructores' });
  }
};

// ==================================================================
// PUT /api/coordinador/instructores/:id/fichas — vincular instructor a
// fichas ADSO
// ==================================================================
export const updateFichasInstructorCoordinador = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { fichas, password } = req.body;

    await verificarPassword(req.user.usuario_id, password, ['COORDINADOR']);

    const fichaIdsADSO = await resolverFichasADSO(client, fichas);

    await client.query('BEGIN');

    const target = await client.query('SELECT usuario_id, rol FROM usuarios WHERE usuario_id = $1', [id]);
    if (target.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    if (target.rows[0].rol !== 'INSTRUCTOR') {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Ese usuario no es instructor, no le vincules fichas' });
    }

    await client.query(
      `DELETE FROM instructor_ficha
       WHERE instructor_id = $1
         AND ficha_id IN (
           SELECT f.ficha_id FROM fichas f
           JOIN programas p ON p.programa_id = f.programa_id
           WHERE p.codigo_programa = $2
         )`,
      [id, CODIGO_PROGRAMA_ADSO]
    );
    for (const fichaId of fichaIdsADSO) {
      await client.query(
        'INSERT INTO instructor_ficha (instructor_id, ficha_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [id, fichaId]
      );
    }

    await client.query('COMMIT');
    res.json({ message: 'Fichas ADSO vinculadas actualizadas', fichas: fichaIdsADSO });
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.codigo) return res.status(error.codigo).json({ message: error.message });
    console.error('Error al vincular fichas (coordinador):', error);
    res.status(500).json({ message: 'Error del servidor al vincular fichas' });
  } finally {
    client.release();
  }
};