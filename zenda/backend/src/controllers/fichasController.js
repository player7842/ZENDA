// ====================================================================
// CONTROLADOR DE FICHAS — aquí manejamos las fichas, sus programas y la
// asignación de aprendices e instructores
// ====================================================================
// Esquema oficial MR_ZENDA:
//   programas ──< fichas ──< instructor_ficha >── usuarios (instructores)
//   fichas ──< grupos ──< integrantes_grupo >── usuarios (aprendices)
//
// La relación aprendiz→ficha va SOLO por grupos: cada ficha tiene un grupo
// "General"; agregar un aprendiz a la ficha = agregarlo a ese grupo con
// estado Activo, inactivando sus ingresos anteriores en otras fichas
// (un aprendiz vive en una sola ficha a la vez).

import pool from '../config/db.js';
import verificarPasswordAdmin from '../utils/confirmarAdmin.js';

// ==================================================================
// Helper: leerFichas(db)
// ==================================================================
// Consulta completa de las fichas con su programa y conteos.
// Aprendices = integrantes Activos en el grupo General de la ficha.
const leerFichas = async () => {
  const result = await pool.query(`
    SELECT f.ficha_id, f.numero_ficha, f.jornada,
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
    ORDER BY f.numero_ficha
  `);
  return result.rows;
};

// ==================================================================
// Helper: obtenerGrupoGeneral(db, fichaId, liderId)
// ==================================================================
// Busca (o crea) el grupo "General" de una ficha. Todos los aprendices de
// una ficha viven ahí. La tabla grupos exige lider_id NOT NULL, así que el
// lider del grupo "General" queda como el admin que lo creó.
const obtenerGrupoGeneral = async (db, fichaId, liderId) => {
  const existente = await db.query(
    'SELECT grupo_id FROM grupos WHERE ficha_id = $1 AND nombre_grupo = $2 LIMIT 1',
    [fichaId, 'General']
  );
  if (existente.rows.length > 0) return existente.rows[0].grupo_id;

  const nuevo = await db.query(
    `INSERT INTO grupos (nombre_grupo, codigo_grupo, ficha_id, lider_id, estado_grupo, fecha_creacion)
     VALUES ('General', 'GRP-GENERAL', $1, $2, 'Activo', now())
     RETURNING grupo_id`,
    [fichaId, liderId]
  );
  return nuevo.rows[0].grupo_id;
};

// ==================================================================
// GET /api/fichas — listar todas las fichas con sus programas
// ==================================================================
export const getFichas = async (req, res) => {
  try {
    res.json(await leerFichas());
  } catch (error) {
    console.error('Error al obtener fichas:', error);
    res.status(500).json({ message: 'Error al obtener fichas' });
  }
};

// ==================================================================
// GET /api/fichas/programas — listar los programas para el formulario
// ==================================================================
export const getProgramas = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT programa_id, codigo_programa, nombre_programa FROM programas ORDER BY codigo_programa'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener programas:', error);
    res.status(500).json({ message: 'Error al obtener programas' });
  }
};

// ==================================================================
// POST /api/fichas — crear una ficha
// ==================================================================
// El programa debe existir (lo eliges por codigo_programa en el form).
// Autocrea el grupo "General" para que el panel pueda vincular aprendices.
export const createFicha = async (req, res) => {
  const client = await pool.connect();
  try {
    const { codigo_programa, numero_ficha, fecha_inicio, fecha_fin, jornada, password } = req.body;

    await verificarPasswordAdmin(req.user.usuario_id, password);

    if (!codigo_programa || !numero_ficha || !jornada) {
      return res.status(400).json({ message: 'Faltan datos de la ficha (programa, número, jornada)' });
    }
    if (!fecha_inicio || !fecha_fin || new Date(fecha_fin) <= new Date(fecha_inicio)) {
      return res.status(400).json({ message: 'La ficha necesita fechas válidas (inicio antes del fin)' });
    }

    const programa = await client.query(
      'SELECT programa_id FROM programas WHERE codigo_programa = $1',
      [codigo_programa]
    );
    if (programa.rows.length === 0) {
      return res.status(400).json({ message: 'Ese programa no existe en la base de datos' });
    }

    await client.query('BEGIN');

    const existe = await client.query('SELECT ficha_id FROM fichas WHERE numero_ficha = $1', [numero_ficha]);
    if (existe.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Ese número de ficha ya existe, no dupliques' });
    }

    const nueva = await client.query(
      `INSERT INTO fichas (numero_ficha, programa_id, fecha_inicio, fecha_fin, jornada)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ficha_id`,
      [numero_ficha, programa.rows[0].programa_id, fecha_inicio, fecha_fin, jornada]
    );

    // Crear el grupo "General" de la ficha desde ya
    await obtenerGrupoGeneral(client, nueva.rows[0].ficha_id, req.user.usuario_id);

    await client.query('COMMIT');
    res.status(201).json({ message: 'Ficha creada exitosamente', fichas: await leerFichas() });
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.codigo) return res.status(error.codigo).json({ message: error.message });
    console.error('Error al crear ficha:', error);
    res.status(500).json({ message: 'Error del servidor al crear la ficha' });
  } finally {
    client.release();
  }
};

// ==================================================================
// PUT /api/fichas/:id — editar una ficha
// ==================================================================
export const updateFicha = async (req, res) => {
  try {
    const { id } = req.params;
    const { numero_ficha, fecha_inicio, fecha_fin, jornada, password } = req.body;

    await verificarPasswordAdmin(req.user.usuario_id, password);

    if (!numero_ficha || !jornada || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({ message: 'Faltan datos de la ficha' });
    }

    const existe = await pool.query('SELECT ficha_id FROM fichas WHERE numero_ficha = $1 AND ficha_id <> $2', [numero_ficha, id]);
    if (existe.rows.length > 0) {
      return res.status(400).json({ message: 'Ese número de ficha ya lo tiene otra ficha' });
    }

    const result = await pool.query(
      `UPDATE fichas
       SET numero_ficha = $1, fecha_inicio = $2, fecha_fin = $3, jornada = $4, fecha_actualizacion = now()
       WHERE ficha_id = $5
       RETURNING ficha_id`,
      [numero_ficha, fecha_inicio, fecha_fin, jornada, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Ficha no encontrada' });
    }

    res.json({ message: 'Ficha actualizada', fichas: await leerFichas() });
  } catch (error) {
    if (error.codigo) return res.status(error.codigo).json({ message: error.message });
    console.error('Error al actualizar ficha:', error);
    res.status(500).json({ message: 'Error del servidor al actualizar la ficha' });
  }
};

// ==================================================================
// DELETE /api/fichas/:id — eliminar una ficha (y sus dependientes)
// ==================================================================
// El esquema no trae ON DELETE CASCADE: limpiamos a mano instructor_ficha,
// los integrantes del grupo General, el grupo mismo y los anuncios/eventos.
export const deleteFicha = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { password } = req.body || {};

    await verificarPasswordAdmin(req.user.usuario_id, password);

    await client.query('BEGIN');

    await client.query('DELETE FROM instructor_ficha WHERE ficha_id = $1', [id]);
    await client.query('DELETE FROM integrantes_grupo WHERE grupo_id IN (SELECT grupo_id FROM grupos WHERE ficha_id = $1)', [id]);
    await client.query('DELETE FROM anuncio_grupo WHERE grupo_id IN (SELECT grupo_id FROM grupos WHERE ficha_id = $1)', [id]);
    await client.query('DELETE FROM grupos WHERE ficha_id = $1', [id]);
    await client.query('DELETE FROM anuncio_ficha WHERE ficha_id = $1', [id]);
    await client.query('DELETE FROM eventos WHERE ficha_id = $1', [id]);

    const result = await client.query('DELETE FROM fichas WHERE ficha_id = $1 RETURNING ficha_id', [id]);
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Ficha no encontrada' });
    }

    await client.query('COMMIT');
    res.json({ message: 'Ficha eliminada', fichas: await leerFichas() });
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.codigo) return res.status(error.codigo).json({ message: error.message });
    console.error('Error al eliminar ficha:', error);
    res.status(500).json({ message: 'Error del servidor al eliminar la ficha' });
  } finally {
    client.release();
  }
};

// ==================================================================
// PUT /api/fichas/:id/aprendiz — vincular un aprendiz a la ficha
// ==================================================================
// Body: { usuario_id, password }. Une al aprendiz al grupo General de la
// ficha y desactiva sus ingresos activos en otras fichas (una ficha a la vez).
export const addAprendizAFicha = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { usuario_id, password } = req.body;

    await verificarPasswordAdmin(req.user.usuario_id, password);

    await client.query('BEGIN');

    const aprendiz = await client.query(
      'SELECT usuario_id, nombre, apellido FROM usuarios WHERE usuario_id = $1',
      [usuario_id]
    );
    if (aprendiz.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Ese usuario no existe' });
    }

    // Inactivar ingresos activos del aprendiz en CUALQUIER ficha
    await client.query(
      `UPDATE integrantes_grupo
       SET estado_integrante = 'Inactivo', fecha_salida = now()
       WHERE usuario_id = $1 AND estado_integrante = 'Activo'`,
      [usuario_id]
    );

    const grupoId = await obtenerGrupoGeneral(client, id, req.user.usuario_id);

    // Si ya es integrante (inactivo) de este grupo, lo reactivamos
    const yaExiste = await client.query(
      'SELECT integrante_id FROM integrantes_grupo WHERE grupo_id = $1 AND usuario_id = $2',
      [grupoId, usuario_id]
    );
    if (yaExiste.rows.length > 0) {
      await client.query(
        `UPDATE integrantes_grupo
         SET estado_integrante = 'Activo', fecha_salida = NULL
         WHERE integrante_id = $1`,
        [yaExiste.rows[0].integrante_id]
      );
    } else {
      await client.query(
        `INSERT INTO integrantes_grupo (grupo_id, usuario_id, rol_scrum, fecha_ingreso, estado_integrante)
         VALUES ($1, $2, 'Integrante', now(), 'Activo')`,
        [grupoId, usuario_id]
      );
    }

    await client.query('COMMIT');
    res.json({ message: 'Aprendiz vinculado a la ficha', fichas: await leerFichas() });
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.codigo) return res.status(error.codigo).json({ message: error.message });
    console.error('Error al vincular aprendiz:', error);
    res.status(500).json({ message: 'Error del servidor al vincular aprendiz' });
  } finally {
    client.release();
  }
};

// ==================================================================
// DELETE /api/fichas/:id/aprendiz/:usuario_id — desvincular un aprendiz
// ==================================================================
// Lo inactiva (no lo borra de la historia) en el grupo General de la ficha.
export const removeAprendizDeFicha = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id, usuario_id } = req.params;
    const { password } = req.body || {};

    await verificarPasswordAdmin(req.user.usuario_id, password);

    await client.query('BEGIN');

    const result = await client.query(
      `UPDATE integrantes_grupo ig
       SET estado_integrante = 'Inactivo', fecha_salida = now()
       FROM grupos g
       WHERE g.grupo_id = ig.grupo_id AND g.ficha_id = $1
         AND ig.usuario_id = $2 AND ig.estado_integrante = 'Activo'
       RETURNING ig.integrante_id`,
      [id, usuario_id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Ese aprendiz no está en esa ficha o ya estaba inactivo' });
    }

    await client.query('COMMIT');
    res.json({ message: 'Aprendiz desvinculado de la ficha', fichas: await leerFichas() });
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.codigo) return res.status(error.codigo).json({ message: error.message });
    console.error('Error al desvincular aprendiz:', error);
    res.status(500).json({ message: 'Error del servidor al desvincular aprendiz' });
  } finally {
    client.release();
  }
};