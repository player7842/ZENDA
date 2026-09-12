import pool from '../../config/db.js';

// Fichas asignadas al instructor que inició sesión
export async function getMisFichas(req, res) {
  try {
    const instructorId = req.user.usuario_id;
    const { rows } = await pool.query(
      `SELECT f.ficha_id, f.numero_ficha, f.fecha_inicio, f.fecha_fin, f.jornada, p.nombre_programa
       FROM instructor_ficha ifi
       JOIN fichas f ON f.ficha_id = ifi.ficha_id
       JOIN programas p ON p.programa_id = f.programa_id
       WHERE ifi.instructor_id = $1
       ORDER BY f.numero_ficha`,
      [instructorId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener fichas del instructor' });
  }
}

// Aprendices activos del grupo "General" de una ficha,
// solo si esa ficha pertenece al instructor
export async function getAprendicesDeFicha(req, res) {
  try {
    const instructorId = req.user.usuario_id;
    const { id } = req.params;

    const pertenece = await pool.query(
      `SELECT 1 FROM instructor_ficha WHERE instructor_id = $1 AND ficha_id = $2`,
      [instructorId, id]
    );
    if (pertenece.rowCount === 0) {
      return res.status(403).json({ message: 'Esta ficha no está a tu cargo' });
    }

    const { rows } = await pool.query(
      `SELECT u.usuario_id, u.nombre, u.apellido, u.correo
       FROM integrantes_grupo ig
       JOIN grupos g ON g.grupo_id = ig.grupo_id
       JOIN usuarios u ON u.usuario_id = ig.usuario_id
       WHERE g.ficha_id = $1 AND g.nombre_grupo = 'General' AND ig.estado_integrante = 'Activo'
       ORDER BY u.apellido`,
      [id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener aprendices' });
  }
}



// Grupos de proyecto (excluye el grupo "General") de una ficha del instructor
export async function getGruposDeFicha(req, res) {
  try {
    const instructorId = req.user.usuario_id;
    const { id } = req.params;

    const pertenece = await pool.query(
      `SELECT 1 FROM instructor_ficha WHERE instructor_id = $1 AND ficha_id = $2`,
      [instructorId, id]
    );
    if (pertenece.rowCount === 0) {
      return res.status(403).json({ message: 'Esta ficha no está a tu cargo' });
    }

    const { rows } = await pool.query(
      `SELECT g.grupo_id, g.nombre_grupo, g.codigo_grupo, p.proyecto_id, p.nombre_proyecto, p.estado_proyecto
       FROM grupos g
       JOIN proyectos p ON p.grupo_id = g.grupo_id
       WHERE g.ficha_id = $1 AND g.nombre_grupo <> 'General' AND g.estado_grupo = 'Activo'
       ORDER BY g.nombre_grupo`,
      [id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener los grupos de la ficha' });
  }
}

// README completo de un proyecto (solo si su ficha es del instructor)
export async function getReadmeProyecto(req, res) {
  try {
    const instructorId = req.user.usuario_id;
    const { proyectoId } = req.params;

    const { rows } = await pool.query(
      `SELECT p.*, g.grupo_id, g.nombre_grupo, g.ficha_id
       FROM proyectos p
       JOIN grupos g ON g.grupo_id = p.grupo_id
       JOIN instructor_ficha ifi ON ifi.ficha_id = g.ficha_id
       WHERE p.proyecto_id = $1 AND ifi.instructor_id = $2`,
      [proyectoId, instructorId]
    );
    if (rows.length === 0) {
      return res.status(403).json({ message: 'Este proyecto no está a tu cargo' });
    }
    const proyecto = rows[0];

    const integrantes = await pool.query(
      `SELECT u.nombre, u.apellido, u.correo, ig.rol_scrum
       FROM integrantes_grupo ig
       JOIN usuarios u ON u.usuario_id = ig.usuario_id
       WHERE ig.grupo_id = $1 AND ig.estado_integrante = 'Activo'`,
      [proyecto.grupo_id]
    );

    const fases = await pool.query(
      `SELECT * FROM fases WHERE proyecto_id = $1 ORDER BY numero_fase`,
      [proyectoId]
    );

    res.json({ proyecto, integrantes: integrantes.rows, fases: fases.rows });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener el README del proyecto' });
  }
}





// Verifica que el instructor logueado tenga a cargo la fase indicada
// (recorre fase → proyecto → grupo → ficha → instructor_ficha)
async function verificarInstructorDueñoDeFase(instructorId, faseId) {
  const { rows } = await pool.query(
    `SELECT f.fase_id
     FROM fases f
     JOIN proyectos p ON p.proyecto_id = f.proyecto_id
     JOIN grupos g ON g.grupo_id = p.grupo_id
     JOIN instructor_ficha ifi ON ifi.ficha_id = g.ficha_id
     WHERE f.fase_id = $1 AND ifi.instructor_id = $2`,
    [faseId, instructorId]
  );
  return rows.length > 0;
}

// GET /api/instructor/fases/:faseId/carpetas — lista de chequeo:
// carpetas de la fase, con sus evidencias y el resultado de evaluación (si ya la evaluaron)
export async function getCarpetasDeFase(req, res) {
  try {
    const instructorId = req.user.usuario_id;
    const { faseId } = req.params;

    const esDueño = await verificarInstructorDueñoDeFase(instructorId, faseId);
    if (!esDueño) return res.status(403).json({ message: 'Esta fase no está a tu cargo' });

    const { rows: carpetas } = await pool.query(
      `SELECT carpeta_id, nombre_carpeta FROM carpetas WHERE fase_id = $1 ORDER BY carpeta_id`,
      [faseId]
    );

    for (const carpeta of carpetas) {
      const { rows: evidencias } = await pool.query(
        `SELECT e.evidencia_id, e.nombre_evidencia, e.tipo_evidencia, e.ubicacion,
                ev.resultado
         FROM evidencias e
         LEFT JOIN evaluaciones ev ON ev.evidencia_id = e.evidencia_id
         WHERE e.carpeta_id = $1
         ORDER BY e.evidencia_id`,
        [carpeta.carpeta_id]
      );
      carpeta.evidencias = evidencias;
    }

    res.json(carpetas);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener la lista de chequeo' });
  }
}

// POST /api/instructor/evidencias/:evidenciaId/evaluar — califica APROBADO/REPROBADO
// y aplica la regla de cascada: 1 evidencia REPROBADA desaprueba toda la fase.
export async function evaluarEvidencia(req, res) {
  const client = await pool.connect();
  try {
    const instructorId = req.user.usuario_id;
    const { evidenciaId } = req.params;
    const { resultado } = req.body;

    if (!['APROBADO', 'REPROBADO'].includes(resultado)) {
      return res.status(400).json({ message: 'Resultado inválido, debe ser APROBADO o REPROBADO' });
    }

    // Encuentra la fase dueña de esta evidencia, y confirma que sea del instructor
    const { rows: cadena } = await pool.query(
      `SELECT f.fase_id, ifi.instructor_id
       FROM evidencias e
       JOIN carpetas c ON c.carpeta_id = e.carpeta_id
       JOIN fases f ON f.fase_id = c.fase_id
       JOIN proyectos p ON p.proyecto_id = f.proyecto_id
       JOIN grupos g ON g.grupo_id = p.grupo_id
       JOIN instructor_ficha ifi ON ifi.ficha_id = g.ficha_id
       WHERE e.evidencia_id = $1 AND ifi.instructor_id = $2`,
      [evidenciaId, instructorId]
    );
    if (cadena.length === 0) {
      return res.status(403).json({ message: 'Esta evidencia no está a tu cargo' });
    }
    const faseId = cadena[0].fase_id;

    await client.query('BEGIN');

    // Guarda o actualiza la evaluación (un instructor puede recalificar)
    const existente = await client.query(
      `SELECT evaluacion_id FROM evaluaciones WHERE evidencia_id = $1`,
      [evidenciaId]
    );
    if (existente.rowCount > 0) {
      await client.query(
        `UPDATE evaluaciones SET resultado = $1, instructor_id = $2, fecha_evaluacion = now() WHERE evidencia_id = $3`,
        [resultado, instructorId, evidenciaId]
      );
    } else {
      await client.query(
        `INSERT INTO evaluaciones (evidencia_id, instructor_id, resultado, fecha_evaluacion)
         VALUES ($1, $2, $3, now())`,
        [evidenciaId, instructorId, resultado]
      );
    }

    // Regla de cascada: revisa TODAS las evidencias de la fase
    const { rows: todas } = await client.query(
      `SELECT ev.resultado
       FROM evidencias e
       JOIN carpetas c ON c.carpeta_id = e.carpeta_id
       LEFT JOIN evaluaciones ev ON ev.evidencia_id = e.evidencia_id
       WHERE c.fase_id = $1`,
      [faseId]
    );

    const hayReprobado = todas.some((t) => t.resultado === 'REPROBADO');
    const todasAprobadas = todas.length > 0 && todas.every((t) => t.resultado === 'APROBADO');

    let nuevoEstadoFase = 'En revisión';
    if (hayReprobado) nuevoEstadoFase = 'Desaprobada';
    else if (todasAprobadas) nuevoEstadoFase = 'Aprobada';

    await client.query(
      `UPDATE fases SET estado_fase = $1 WHERE fase_id = $2`,
      [nuevoEstadoFase, faseId]
    );

    await client.query('COMMIT');
    res.json({ message: 'Evaluación guardada', estado_fase: nuevoEstadoFase });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: 'Error al evaluar la evidencia' });
  } finally {
    client.release();
  }
}




// GET /api/instructor/fichas/:id/evidencias — todas las evidencias reales
// de los proyectos de una ficha (para el resumen en "Mis fichas")
export async function getEvidenciasDeFicha(req, res) {
  try {
    const instructorId = req.user.usuario_id;
    const { id } = req.params;

    const pertenece = await pool.query(
      `SELECT 1 FROM instructor_ficha WHERE instructor_id = $1 AND ficha_id = $2`,
      [instructorId, id]
    );
    if (pertenece.rowCount === 0) {
      return res.status(403).json({ message: 'Esta ficha no está a tu cargo' });
    }

    const { rows } = await pool.query(
      `SELECT e.evidencia_id, e.nombre_evidencia, e.tipo_evidencia, e.ubicacion,
              g.nombre_grupo, f.nombre_fase, ev.resultado
       FROM evidencias e
       JOIN carpetas c ON c.carpeta_id = e.carpeta_id
       JOIN fases f ON f.fase_id = c.fase_id
       JOIN proyectos p ON p.proyecto_id = f.proyecto_id
       JOIN grupos g ON g.grupo_id = p.grupo_id
       LEFT JOIN evaluaciones ev ON ev.evidencia_id = e.evidencia_id
       WHERE g.ficha_id = $1
       ORDER BY e.evidencia_id DESC`,
      [id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener las evidencias de la ficha' });
  }
}



// Verifica que el instructor logueado tenga a cargo el proyecto indicado
async function verificarInstructorDueñoDeProyecto(instructorId, proyectoId) {
  const { rows } = await pool.query(
    `SELECT p.proyecto_id
     FROM proyectos p
     JOIN grupos g ON g.grupo_id = p.grupo_id
     JOIN instructor_ficha ifi ON ifi.ficha_id = g.ficha_id
     WHERE p.proyecto_id = $1 AND ifi.instructor_id = $2`,
    [proyectoId, instructorId]
  );
  return rows.length > 0;
}

// GET /api/instructor/proyectos/:proyectoId/observaciones — historial de observaciones
export async function getObservacionesDeProyecto(req, res) {
  try {
    const instructorId = req.user.usuario_id;
    const { proyectoId } = req.params;

    const esDueño = await verificarInstructorDueñoDeProyecto(instructorId, proyectoId);
    if (!esDueño) return res.status(403).json({ message: 'Este proyecto no está a tu cargo' });

    const { rows } = await pool.query(
      `SELECT o.observacion_id, o.titulo, o.descripcion, o.fecha_observacion,
              u.nombre, u.apellido
       FROM observaciones o
       JOIN usuarios u ON u.usuario_id = o.instructor_id
       WHERE o.proyecto_id = $1
       ORDER BY o.fecha_observacion DESC`,
      [proyectoId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener las observaciones' });
  }
}

// POST /api/instructor/proyectos/:proyectoId/observaciones — crear observación
export async function crearObservacion(req, res) {
  try {
    const instructorId = req.user.usuario_id;
    const { proyectoId } = req.params;
    const { titulo, descripcion } = req.body;

    if (!titulo || !descripcion) {
      return res.status(400).json({ message: 'Faltan el título o la descripción' });
    }

    const esDueño = await verificarInstructorDueñoDeProyecto(instructorId, proyectoId);
    if (!esDueño) return res.status(403).json({ message: 'Este proyecto no está a tu cargo' });

    const { rows } = await pool.query(
      `INSERT INTO observaciones (proyecto_id, instructor_id, titulo, descripcion, fecha_observacion)
       VALUES ($1, $2, $3, $4, now())
       RETURNING observacion_id`,
      [proyectoId, instructorId, titulo, descripcion]
    );
    res.status(201).json({ observacion_id: rows[0].observacion_id });
  } catch (err) {
    res.status(500).json({ message: 'Error al crear la observación' });
  }
}