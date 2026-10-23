import pool from '../../config/db.js';
import {
  calcularEstadoFase,
  calcularProgreso,
  normalizarResultado,
  RESULTADO_APROBADO,
} from '../../domain/reglas.js';
import { recalcularCarpetaYFase, resultadosDeFase } from '../../services/cascada.js';

const FILTRO_ASIGNACION_VIGENTE = `ifi.fecha_fin IS NULL AND ifi.estado = 'Activo'`;

// Fichas asignadas al instructor que inició sesión
export async function getMisFichas(req, res) {
  try {
    const instructorId = req.user.usuario_id;
    const { rows } = await pool.query(
      `SELECT f.ficha_id, f.numero_ficha, f.fecha_inicio, f.fecha_fin, f.jornada, p.nombre_programa,
              ifi.fecha_inicio AS fecha_asignacion
       FROM instructor_ficha ifi
       JOIN fichas f ON f.ficha_id = ifi.ficha_id
       JOIN programas p ON p.programa_id = f.programa_id
       WHERE ifi.instructor_id = $1 AND ${FILTRO_ASIGNACION_VIGENTE}
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
      `SELECT 1 FROM instructor_ficha ifi
       WHERE ifi.instructor_id = $1 AND ifi.ficha_id = $2 AND ${FILTRO_ASIGNACION_VIGENTE}`,
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
      `SELECT 1 FROM instructor_ficha ifi
       WHERE ifi.instructor_id = $1 AND ifi.ficha_id = $2 AND ${FILTRO_ASIGNACION_VIGENTE}`,
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
      `SELECT p.*, g.grupo_id, g.nombre_grupo, g.ficha_id, g.lider_id, g.cupo_maximo
       FROM proyectos p
       JOIN grupos g ON g.grupo_id = p.grupo_id
       JOIN instructor_ficha ifi ON ifi.ficha_id = g.ficha_id
       WHERE p.proyecto_id = $1
         AND ifi.instructor_id = $2
         AND ${FILTRO_ASIGNACION_VIGENTE}`,
      [proyectoId, instructorId]
    );
    if (rows.length === 0) {
      return res.status(403).json({ message: 'Este proyecto no está a tu cargo' });
    }
    const proyecto = rows[0];

    const integrantes = await pool.query(
      `SELECT u.usuario_id, u.nombre, u.apellido, u.correo,
              (ig.usuario_id = g.lider_id) AS es_lider
       FROM integrantes_grupo ig
       JOIN usuarios u ON u.usuario_id = ig.usuario_id
       JOIN grupos g ON g.grupo_id = ig.grupo_id
       WHERE ig.grupo_id = $1 AND ig.estado_integrante = 'Activo'
       ORDER BY (ig.usuario_id = g.lider_id) DESC, u.nombre`,
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
     WHERE f.fase_id = $1
       AND ifi.instructor_id = $2
       AND ${FILTRO_ASIGNACION_VIGENTE}`,
    [faseId, instructorId]
  );
  return rows.length > 0;
}

// GET /api/instructor/fases/:faseId/carpetas — lista de chequeo con la
// evaluación vigente de cada evidencia y el progreso de la fase.
export async function getCarpetasDeFase(req, res) {
  try {
    const instructorId = req.user.usuario_id;
    const { faseId } = req.params;

    const esDueño = await verificarInstructorDueñoDeFase(instructorId, faseId);
    if (!esDueño) return res.status(403).json({ message: 'Esta fase no está a tu cargo' });

    const { rows: carpetas } = await pool.query(
      `SELECT carpeta_id, nombre_carpeta, estado_carpeta
       FROM carpetas
       WHERE fase_id = $1
       ORDER BY carpeta_id`,
      [faseId]
    );

    for (const carpeta of carpetas) {
      const { rows: evidencias } = await pool.query(
        `SELECT ev.evidencia_id, ev.nombre_evidencia, ev.tipo_evidencia, ev.ubicacion,
                ev.fecha_subida,
                au.nombre AS autor_nombre, au.apellido AS autor_apellido,
                ult.resultado, ult.fecha_evaluacion,
                inst.nombre AS evaluador_nombre, inst.apellido AS evaluador_apellido
         FROM evidencias ev
         JOIN usuarios au ON au.usuario_id = ev.usuario_id
         LEFT JOIN LATERAL (
           SELECT e2.resultado, e2.fecha_evaluacion, e2.instructor_id
           FROM evaluaciones e2
           WHERE e2.evidencia_id = ev.evidencia_id
           ORDER BY e2.fecha_evaluacion DESC, e2.evaluacion_id DESC
           LIMIT 1
         ) ult ON true
         LEFT JOIN usuarios inst ON inst.usuario_id = ult.instructor_id
         WHERE ev.carpeta_id = $1
         ORDER BY ev.evidencia_id`,
        [carpeta.carpeta_id]
      );
      carpeta.evidencias = evidencias;
    }

    const filas = await resultadosDeFase(pool, faseId);
    const resultados = filas.map((fila) => fila.resultado);
    const { rows: faseRows } = await pool.query(
      `SELECT fase_id, nombre_fase, estado_fase FROM fases WHERE fase_id = $1`,
      [faseId]
    );

    res.json({
      fase: faseRows[0] || null,
      estado_fase: calcularEstadoFase(resultados),
      progreso: {
        ...calcularProgreso(resultados),
        carpetas_total: carpetas.length,
        carpetas_aprobadas: carpetas.filter((c) => c.estado_carpeta === 'Aprobada').length,
      },
      carpetas,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener la lista de chequeo' });
  }
}

// POST /api/instructor/evidencias/:evidenciaId/evaluar — califica APROBADO/REPROBADO.
// RN-017: siempre se inserta una evaluación nueva; la vigente es la más reciente.
// RN-018: recalcula carpeta y fase completas.
export async function evaluarEvidencia(req, res) {
  const client = await pool.connect();
  try {
    const instructorId = req.user.usuario_id;
    const { evidenciaId } = req.params;
    const resultado = normalizarResultado(req.body.resultado);

    if (!resultado) {
      return res.status(400).json({ message: 'Resultado inválido, debe ser APROBADO o REPROBADO' });
    }

    // Encuentra la carpeta/fase dueña de esta evidencia y confirma que la
    // asignación del instructor siga vigente.
    const { rows: cadena } = await client.query(
      `SELECT f.fase_id, c.carpeta_id
       FROM evidencias e
       JOIN carpetas c ON c.carpeta_id = e.carpeta_id
       JOIN fases f ON f.fase_id = c.fase_id
       JOIN proyectos p ON p.proyecto_id = f.proyecto_id
       JOIN grupos g ON g.grupo_id = p.grupo_id
       JOIN instructor_ficha ifi ON ifi.ficha_id = g.ficha_id
       WHERE e.evidencia_id = $1
         AND ifi.instructor_id = $2
         AND ${FILTRO_ASIGNACION_VIGENTE}`,
      [evidenciaId, instructorId]
    );
    if (cadena.length === 0) {
      return res.status(403).json({ message: 'Esta evidencia no está a tu cargo' });
    }
    const { fase_id: faseId, carpeta_id: carpetaId } = cadena[0];

    await client.query('BEGIN');

    await client.query(
      `INSERT INTO evaluaciones (evidencia_id, instructor_id, resultado, fecha_evaluacion)
       VALUES ($1, $2, $3, now())`,
      [evidenciaId, instructorId, resultado]
    );

    const cascada = await recalcularCarpetaYFase(client, carpetaId);

    await client.query('COMMIT');
    res.json({
      message: 'Evaluación guardada',
      estado_carpeta: cascada.estadoCarpeta,
      estado_fase: cascada.estadoFase,
      progreso: cascada.progreso,
      fase_id: faseId,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: 'Error al evaluar la evidencia' });
  } finally {
    client.release();
  }
}

// POST /api/instructor/carpetas/:carpetaId/aprobar — aprobación en bloque.
// Inserta una evaluación APROBADO para cada evidencia cuya evaluación
// vigente no esté aprobada (conserva el historial, RN-017/RN-019).
export async function aprobarCarpeta(req, res) {
  const client = await pool.connect();
  try {
    const instructorId = req.user.usuario_id;
    const { carpetaId } = req.params;

    const { rows: cadena } = await client.query(
      `SELECT c.carpeta_id, c.fase_id
       FROM carpetas c
       JOIN fases f ON f.fase_id = c.fase_id
       JOIN proyectos p ON p.proyecto_id = f.proyecto_id
       JOIN grupos g ON g.grupo_id = p.grupo_id
       JOIN instructor_ficha ifi ON ifi.ficha_id = g.ficha_id
       WHERE c.carpeta_id = $1
         AND ifi.instructor_id = $2
         AND ${FILTRO_ASIGNACION_VIGENTE}`,
      [carpetaId, instructorId]
    );
    if (cadena.length === 0) {
      return res.status(403).json({ message: 'Esta carpeta no está a tu cargo' });
    }

    const { rows: evidencias } = await client.query(
      `SELECT ev.evidencia_id, ult.resultado
       FROM evidencias ev
       LEFT JOIN LATERAL (
         SELECT e2.resultado
         FROM evaluaciones e2
         WHERE e2.evidencia_id = ev.evidencia_id
         ORDER BY e2.fecha_evaluacion DESC, e2.evaluacion_id DESC
         LIMIT 1
       ) ult ON true
       WHERE ev.carpeta_id = $1
       ORDER BY ev.evidencia_id`,
      [carpetaId]
    );

    if (evidencias.length === 0) {
      return res.status(400).json({ message: 'La carpeta no tiene evidencias para aprobar' });
    }

    await client.query('BEGIN');

    const pendientes = evidencias.filter((e) => e.resultado !== RESULTADO_APROBADO);

    for (const evidencia of pendientes) {
      await client.query(
        `INSERT INTO evaluaciones (evidencia_id, instructor_id, resultado, fecha_evaluacion)
         VALUES ($1, $2, $3, now())`,
        [evidencia.evidencia_id, instructorId, RESULTADO_APROBADO]
      );
    }

    const cascada = await recalcularCarpetaYFase(client, carpetaId);

    await client.query('COMMIT');
    res.json({
      message:
        pendientes.length === 0
          ? 'La carpeta ya estaba aprobada'
          : `Carpeta aprobada (${pendientes.length} evidencia(s))`,
      evidencias_aprobadas: evidencias.length,
      estado_carpeta: cascada.estadoCarpeta,
      estado_fase: cascada.estadoFase,
      progreso: cascada.progreso,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: 'Error al aprobar la carpeta' });
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
      `SELECT 1 FROM instructor_ficha ifi
       WHERE ifi.instructor_id = $1 AND ifi.ficha_id = $2 AND ${FILTRO_ASIGNACION_VIGENTE}`,
      [instructorId, id]
    );
    if (pertenece.rowCount === 0) {
      return res.status(403).json({ message: 'Esta ficha no está a tu cargo' });
    }

    const { rows } = await pool.query(
      `SELECT e.evidencia_id, e.nombre_evidencia, e.tipo_evidencia, e.ubicacion,
              g.nombre_grupo, f.nombre_fase, ult.resultado
       FROM evidencias e
       JOIN carpetas c ON c.carpeta_id = e.carpeta_id
       JOIN fases f ON f.fase_id = c.fase_id
       JOIN proyectos p ON p.proyecto_id = f.proyecto_id
       JOIN grupos g ON g.grupo_id = p.grupo_id
       LEFT JOIN LATERAL (
         SELECT e2.resultado
         FROM evaluaciones e2
         WHERE e2.evidencia_id = e.evidencia_id
         ORDER BY e2.fecha_evaluacion DESC, e2.evaluacion_id DESC
         LIMIT 1
       ) ult ON true
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
     WHERE p.proyecto_id = $1
       AND ifi.instructor_id = $2
       AND ${FILTRO_ASIGNACION_VIGENTE}`,
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

// GET /api/instructor/resumen — dashboard agregado en 3 consultas SQL
// (reemplaza la cascada N fichas × M grupos que hacía el frontend antes)
export async function getResumenInstructor(req, res) {
  try {
    const instructorId = req.user.usuario_id;

    const evidenciasResult = await pool.query(
      `SELECT
         count(*) FILTER (WHERE ult.resultado = 'APROBADO')::int AS aprobado,
         count(*) FILTER (WHERE ult.resultado = 'REPROBADO')::int AS reprobado,
         count(*) FILTER (WHERE ult.resultado IS NULL)::int AS sin_evaluar
       FROM evidencias e
       JOIN carpetas c ON c.carpeta_id = e.carpeta_id
       JOIN fases f ON f.fase_id = c.fase_id
       JOIN proyectos p ON p.proyecto_id = f.proyecto_id
       JOIN grupos g ON g.grupo_id = p.grupo_id
       JOIN instructor_ficha ifi ON ifi.ficha_id = g.ficha_id
       LEFT JOIN LATERAL (
         SELECT e2.resultado
         FROM evaluaciones e2
         WHERE e2.evidencia_id = e.evidencia_id
         ORDER BY e2.fecha_evaluacion DESC, e2.evaluacion_id DESC
         LIMIT 1
       ) ult ON true
       WHERE ifi.instructor_id = $1 AND ${FILTRO_ASIGNACION_VIGENTE}`,
      [instructorId]
    );

    const alertasResult = await pool.query(
      `SELECT f.fase_id, fi.numero_ficha AS ficha, g.nombre_grupo AS grupo, f.nombre_fase AS fase
       FROM fases f
       JOIN proyectos p ON p.proyecto_id = f.proyecto_id
       JOIN grupos g ON g.grupo_id = p.grupo_id
       JOIN fichas fi ON fi.ficha_id = g.ficha_id
       JOIN instructor_ficha ifi ON ifi.ficha_id = fi.ficha_id
       WHERE ifi.instructor_id = $1
         AND ${FILTRO_ASIGNACION_VIGENTE}
         AND f.estado_fase = 'Desaprobada'
       ORDER BY fi.numero_ficha`,
      [instructorId]
    );

    const progresoResult = await pool.query(
      `SELECT fi.numero_ficha,
              count(f.fase_id)::int AS total,
              count(*) FILTER (WHERE f.estado_fase = 'Aprobada')::int AS aprobadas
       FROM fichas fi
       JOIN instructor_ficha ifi ON ifi.ficha_id = fi.ficha_id
       LEFT JOIN grupos g ON g.ficha_id = fi.ficha_id AND g.nombre_grupo <> 'General'
       LEFT JOIN proyectos p ON p.grupo_id = g.grupo_id
       LEFT JOIN fases f ON f.proyecto_id = p.proyecto_id
       WHERE ifi.instructor_id = $1 AND ${FILTRO_ASIGNACION_VIGENTE}
       GROUP BY fi.numero_ficha
       ORDER BY fi.numero_ficha`,
      [instructorId]
    );

    const ev = evidenciasResult.rows[0];

    res.json({
      evidenciasPorResultado: [
        { nombre: 'Aprobado', cantidad: ev.aprobado },
        { nombre: 'Reprobado', cantidad: ev.reprobado },
        { nombre: 'Sin evaluar', cantidad: ev.sin_evaluar },
      ],
      fasesAlerta: alertasResult.rows,
      progresoPorFicha: progresoResult.rows.map((r) => ({
        numero_ficha: r.numero_ficha,
        total: r.total,
        aprobadas: r.aprobadas,
        porcentaje: r.total > 0 ? Math.round((r.aprobadas / r.total) * 100) : 0,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener el resumen del instructor' });
  }
}