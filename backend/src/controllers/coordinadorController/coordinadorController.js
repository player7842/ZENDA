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

// ==================================================================
// GET /api/coordinador/dashboard — totales generales de ADSO
// ==================================================================
export const getDashboardCoordinador = async (req, res) => {
  try {
    const totalesResult = await pool.query(
      `SELECT
        (SELECT count(*)::int FROM fichas f
           JOIN programas p ON p.programa_id = f.programa_id
           WHERE p.codigo_programa = $1) AS total_fichas,
        (SELECT count(DISTINCT inf.instructor_id)::int FROM instructor_ficha inf
           JOIN fichas f ON f.ficha_id = inf.ficha_id
           JOIN programas p ON p.programa_id = f.programa_id
           WHERE p.codigo_programa = $1) AS total_instructores,
        (SELECT count(*)::int FROM grupos g
           JOIN fichas f ON f.ficha_id = g.ficha_id
           JOIN programas p ON p.programa_id = f.programa_id
           WHERE p.codigo_programa = $1 AND g.nombre_grupo <> 'General' AND g.estado_grupo = 'Activo') AS total_grupos`,
      [CODIGO_PROGRAMA_ADSO]
    );

    const proyectosPorEstado = await pool.query(
      `SELECT pr.estado_proyecto, count(*)::int AS cantidad
       FROM proyectos pr
       JOIN grupos g ON g.grupo_id = pr.grupo_id
       JOIN fichas f ON f.ficha_id = g.ficha_id
       JOIN programas p ON p.programa_id = f.programa_id
       WHERE p.codigo_programa = $1
       GROUP BY pr.estado_proyecto`,
      [CODIGO_PROGRAMA_ADSO]
    );

    res.json({
      totales: totalesResult.rows[0],
      proyectosPorEstado: proyectosPorEstado.rows,
    });
  } catch (error) {
    console.error('Error al obtener dashboard (coordinador):', error);
    res.status(500).json({ message: 'Error al obtener el dashboard' });
  }
};

// ==================================================================
// GET /api/coordinador/grupos — grupos de proyecto (excluye "General") de ADSO
// ==================================================================
export const getGruposCoordinador = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT g.grupo_id, g.nombre_grupo, g.codigo_grupo, g.estado_grupo,
              f.numero_ficha,
              p.proyecto_id, p.nombre_proyecto, p.estado_proyecto,
              lu.nombre AS lider_nombre, lu.apellido AS lider_apellido,
              (SELECT count(*)::int FROM integrantes_grupo ig
                 WHERE ig.grupo_id = g.grupo_id AND ig.estado_integrante = 'Activo') AS cantidad_integrantes
       FROM grupos g
       JOIN fichas f ON f.ficha_id = g.ficha_id
       JOIN programas prg ON prg.programa_id = f.programa_id
       LEFT JOIN proyectos p ON p.grupo_id = g.grupo_id
       LEFT JOIN usuarios lu ON lu.usuario_id = g.lider_id
       WHERE prg.codigo_programa = $1 AND g.nombre_grupo <> 'General'
       ORDER BY f.numero_ficha, g.nombre_grupo`,
      [CODIGO_PROGRAMA_ADSO]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener grupos (coordinador):', error);
    res.status(500).json({ message: 'Error al obtener los grupos' });
  }
};

// ==================================================================
// GET /api/coordinador/proyectos — proyectos ADSO con % de progreso
// ==================================================================
export const getProyectosCoordinador = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.proyecto_id, p.nombre_proyecto, p.estado_proyecto,
              p.fecha_inicio, p.fecha_fin_estimada,
              f.numero_ficha, g.nombre_grupo, g.codigo_grupo,
              (SELECT count(*)::int FROM fases fa
                 WHERE fa.proyecto_id = p.proyecto_id AND fa.estado_fase = 'Aprobada') AS fases_aprobadas,
              5 AS total_fases
       FROM proyectos p
       JOIN grupos g ON g.grupo_id = p.grupo_id
       JOIN fichas f ON f.ficha_id = g.ficha_id
       JOIN programas prg ON prg.programa_id = f.programa_id
       WHERE prg.codigo_programa = $1
       ORDER BY p.proyecto_id DESC`,
      [CODIGO_PROGRAMA_ADSO]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener proyectos (coordinador):', error);
    res.status(500).json({ message: 'Error al obtener los proyectos' });
  }
};

// ==================================================================
// GET /api/coordinador/proyectos/:id/seguimiento — detalle completo
// (fases + carpetas + evidencias + evaluación + observaciones), sin
// restricción de instructor_ficha: el coordinador ve todo ADSO.
// ==================================================================
export const getSeguimientoProyecto = async (req, res) => {
  try {
    const { id } = req.params;

    const proyectoResult = await pool.query(
      `SELECT p.*, g.grupo_id, g.nombre_grupo, g.codigo_grupo, f.numero_ficha
       FROM proyectos p
       JOIN grupos g ON g.grupo_id = p.grupo_id
       JOIN fichas f ON f.ficha_id = g.ficha_id
       JOIN programas prg ON prg.programa_id = f.programa_id
       WHERE p.proyecto_id = $1 AND prg.codigo_programa = $2`,
      [id, CODIGO_PROGRAMA_ADSO]
    );
    if (proyectoResult.rows.length === 0) {
      return res.status(404).json({ message: 'Proyecto no encontrado en tu ámbito (ADSO)' });
    }
    const proyecto = proyectoResult.rows[0];

    const integrantes = await pool.query(
      `SELECT u.nombre, u.apellido, u.correo, ig.rol_scrum
       FROM integrantes_grupo ig
       JOIN usuarios u ON u.usuario_id = ig.usuario_id
       WHERE ig.grupo_id = $1 AND ig.estado_integrante = 'Activo'`,
      [proyecto.grupo_id]
    );

    const fases = await pool.query(
      `SELECT fase_id, numero_fase, nombre_fase, estado_fase
       FROM fases WHERE proyecto_id = $1 ORDER BY numero_fase`,
      [id]
    );

    for (const fase of fases.rows) {
      const carpetas = await pool.query(
        `SELECT carpeta_id, nombre_carpeta FROM carpetas WHERE fase_id = $1 ORDER BY carpeta_id`,
        [fase.fase_id]
      );
      for (const carpeta of carpetas.rows) {
        const evidencias = await pool.query(
          `SELECT e.evidencia_id, e.nombre_evidencia, e.tipo_evidencia, e.ubicacion, ev.resultado
           FROM evidencias e
           LEFT JOIN evaluaciones ev ON ev.evidencia_id = e.evidencia_id
           WHERE e.carpeta_id = $1 ORDER BY e.evidencia_id`,
          [carpeta.carpeta_id]
        );
        carpeta.evidencias = evidencias.rows;
      }
      fase.carpetas = carpetas.rows;
    }

    const observaciones = await pool.query(
      `SELECT o.observacion_id, o.titulo, o.descripcion, o.fecha_observacion, u.nombre, u.apellido
       FROM observaciones o
       JOIN usuarios u ON u.usuario_id = o.instructor_id
       WHERE o.proyecto_id = $1 ORDER BY o.fecha_observacion DESC`,
      [id]
    );

    res.json({ proyecto, integrantes: integrantes.rows, fases: fases.rows, observaciones: observaciones.rows });
  } catch (error) {
    console.error('Error al obtener seguimiento (coordinador):', error);
    res.status(500).json({ message: 'Error al obtener el seguimiento del proyecto' });
  }
};

// ==================================================================
// GET /api/coordinador/perfil — datos propios del coordinador logueado
// ==================================================================
export const getPerfilCoordinador = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT usuario_id, nombre, apellido, correo, tipo_documento, numero_documento, estado, fecha_creacion
       FROM usuarios WHERE usuario_id = $1`,
      [req.user.usuario_id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener perfil (coordinador):', error);
    res.status(500).json({ message: 'Error al obtener el perfil' });
  }
};