/*
  Controller de proyectos de grupo para el rol APRENDIZ.
    - crearProyecto: el aprendiz crea su grupo de trabajo + el "README" del
      proyecto (nombre, descripción, problema, objetivo, alcance, tecnologías,
      cupo y fechas). Queda como líder del grupo (grupos.lider_id). Al
      crearse se generan las 5 fases fijas y un código de invitación único.
    - unirseAProyecto: otro aprendiz entra a un grupo existente usando el
      código de invitación, respetando el cupo máximo (RN-009).
    - getMiProyecto: devuelve el proyecto activo del aprendiz logueado.
    - Carpetas y evidencias: cualquier integrante activo del grupo puede
      crearlas y subir evidencias, con el autor registrado (RN-012).
  Regla de negocio clave: un aprendiz solo puede estar en UN proyecto
  activo a la vez (grupo con nombre_grupo distinto de "General" — el grupo
  "General" es solo de inscripción a la ficha y no cuenta para esta regla).
*/

import pool from '../../config/db.js';
import {
  CUPO_POR_DEFECTO,
  calcularEstadoFase,
  calcularProgreso,
  puedeUnirse,
  validarCupo,
} from '../../domain/reglas.js';
import { recalcularCarpetaYFase, resultadosDeFase } from '../../services/cascada.js';

const FASES_FIJAS = [
  { numero: 1, nombre: 'FASE 1 - ANALISIS' },
  { numero: 2, nombre: 'FASE 2 - DISEÑO' },
  { numero: 3, nombre: 'FASE 3 - DESARROLLO' },
  { numero: 4, nombre: 'FASE 4 - PRUEBAS' },
  { numero: 5, nombre: 'FASE 5 - CIERRE/ENTREGA' },
];

// Genera un código de invitación único tipo "PRY-4F82A1"
function generarCodigoProyecto() {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PRY-${random}`;
}

// Busca la ficha activa del aprendiz (a través de su grupo "General")
async function obtenerFichaDelAprendiz(client, usuarioId) {
  const { rows } = await client.query(
    `SELECT g.ficha_id
     FROM integrantes_grupo ig
     JOIN grupos g ON g.grupo_id = ig.grupo_id
     WHERE ig.usuario_id = $1 AND ig.estado_integrante = 'Activo' AND g.nombre_grupo = 'General'
     LIMIT 1`,
    [usuarioId]
  );
  return rows[0]?.ficha_id || null;
}

// Revisa si el aprendiz ya pertenece a un proyecto activo (grupo distinto de "General")
async function tieneProyectoActivo(client, usuarioId) {
  const { rows } = await client.query(
    `SELECT 1
     FROM integrantes_grupo ig
     JOIN grupos g ON g.grupo_id = ig.grupo_id
     WHERE ig.usuario_id = $1 AND ig.estado_integrante = 'Activo' AND g.nombre_grupo <> 'General'
     LIMIT 1`,
    [usuarioId]
  );
  return rows.length > 0;
}

// POST /api/aprendiz/proyectos — crear grupo + proyecto + fases automáticas
export async function crearProyecto(req, res) {
  const client = await pool.connect();
  try {
    const usuarioId = req.user.usuario_id;
    const {
      nombre_grupo, nombre_proyecto, descripcion, problema,
      objetivo, alcance, tecnologias, fecha_inicio, fecha_fin_estimada,
      cupo_maximo, cupo_integrantes,
    } = req.body;

    if (!nombre_grupo || !nombre_proyecto || !descripcion || !problema || !objetivo || !alcance || !fecha_inicio || !fecha_fin_estimada) {
      return res.status(400).json({ message: 'Faltan campos obligatorios del proyecto' });
    }

    const cupoRecibido = cupo_maximo ?? cupo_integrantes ?? CUPO_POR_DEFECTO;
    const cupo = validarCupo(cupoRecibido);
    if (!cupo.valido) {
      return res.status(400).json({ message: cupo.mensaje });
    }

    await client.query('BEGIN');

    const yaTieneProyecto = await tieneProyectoActivo(client, usuarioId);
    if (yaTieneProyecto) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Ya perteneces a un proyecto activo' });
    }

    const fichaId = await obtenerFichaDelAprendiz(client, usuarioId);
    if (!fichaId) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'No estás inscrito en ninguna ficha' });
    }

    const codigoGrupo = generarCodigoProyecto();

    const grupoResult = await client.query(
      `INSERT INTO grupos (ficha_id, lider_id, nombre_grupo, codigo_grupo, cupo_maximo, estado_grupo, fecha_creacion)
       VALUES ($1, $2, $3, $4, $5, 'Activo', now())
       RETURNING grupo_id`,
      [fichaId, usuarioId, nombre_grupo, codigoGrupo, cupo.cupo]
    );
    const grupoId = grupoResult.rows[0].grupo_id;

    await client.query(
      `INSERT INTO integrantes_grupo (grupo_id, usuario_id, estado_integrante, fecha_ingreso)
       VALUES ($1, $2, 'Activo', now())`,
      [grupoId, usuarioId]
    );

    const proyectoResult = await client.query(
      `INSERT INTO proyectos (grupo_id, nombre_proyecto, descripcion, problema, objetivo, alcance, tecnologias, fecha_inicio, fecha_fin_estimada, estado_proyecto)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Activo')
       RETURNING proyecto_id`,
      [grupoId, nombre_proyecto, descripcion, problema, objetivo, alcance, tecnologias || null, fecha_inicio, fecha_fin_estimada]
    );
    const proyectoId = proyectoResult.rows[0].proyecto_id;

    for (const fase of FASES_FIJAS) {
      await client.query(
        `INSERT INTO fases (proyecto_id, numero_fase, nombre_fase, estado_fase)
         VALUES ($1, $2, $3, 'Pendiente')`,
        [proyectoId, fase.numero, fase.nombre]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({
      grupo_id: grupoId,
      proyecto_id: proyectoId,
      codigo_grupo: codigoGrupo,
      cupo_maximo: cupo.cupo,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: 'Error al crear el proyecto' });
  } finally {
    client.release();
  }
}

// POST /api/aprendiz/proyectos/unirse — unirse con código de invitación
export async function unirseAProyecto(req, res) {
  const client = await pool.connect();
  try {
    const usuarioId = req.user.usuario_id;
    const { codigo_grupo } = req.body;

    if (!codigo_grupo) {
      return res.status(400).json({ message: 'Falta el código de grupo' });
    }

    await client.query('BEGIN');

    const yaTieneProyecto = await tieneProyectoActivo(client, usuarioId);
    if (yaTieneProyecto) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Ya perteneces a un proyecto activo' });
    }

    // FOR UPDATE serializa las solicitudes concurrentes al mismo grupo: el
    // conteo del cupo y la inserción ocurren bajo el mismo bloqueo.
    const grupoResult = await client.query(
      `SELECT grupo_id, cupo_maximo
       FROM grupos
       WHERE codigo_grupo = $1
         AND estado_grupo = 'Activo'
         AND nombre_grupo <> 'General'
       FOR UPDATE`,
      [codigo_grupo]
    );
    if (grupoResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Código de grupo no encontrado' });
    }
    const grupo = grupoResult.rows[0];

    const conteo = await client.query(
      `SELECT count(*)::int AS total
       FROM integrantes_grupo
       WHERE grupo_id = $1 AND estado_integrante = 'Activo'`,
      [grupo.grupo_id]
    );

    if (!puedeUnirse(grupo.cupo_maximo, conteo.rows[0].total)) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        message: `El grupo está completo (cupo máximo: ${grupo.cupo_maximo})`,
      });
    }

    await client.query(
      `INSERT INTO integrantes_grupo (grupo_id, usuario_id, estado_integrante, fecha_ingreso)
       VALUES ($1, $2, 'Activo', now())
       ON CONFLICT (grupo_id, usuario_id)
       DO UPDATE SET estado_integrante = 'Activo', fecha_salida = NULL, fecha_ingreso = now()`,
      [grupo.grupo_id, usuarioId]
    );

    await client.query('COMMIT');
    res.status(200).json({ message: 'Te uniste al proyecto correctamente' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: 'Error al unirse al proyecto' });
  } finally {
    client.release();
  }
}

// GET /api/aprendiz/proyectos/mio — README del proyecto activo del aprendiz logueado
export async function getMiProyecto(req, res) {
  try {
    const usuarioId = req.user.usuario_id;

    const grupoResult = await pool.query(
      `SELECT g.grupo_id, g.nombre_grupo, g.codigo_grupo, g.lider_id, g.cupo_maximo,
              (SELECT count(*)::int
                 FROM integrantes_grupo ig2
                WHERE ig2.grupo_id = g.grupo_id
                  AND ig2.estado_integrante = 'Activo') AS total_integrantes
       FROM integrantes_grupo ig
       JOIN grupos g ON g.grupo_id = ig.grupo_id
       WHERE ig.usuario_id = $1 AND ig.estado_integrante = 'Activo' AND g.nombre_grupo <> 'General'
       LIMIT 1`,
      [usuarioId]
    );
    if (grupoResult.rowCount === 0) {
      return res.status(404).json({ message: 'No perteneces a ningún proyecto activo' });
    }
    const grupo = grupoResult.rows[0];

    const proyectoResult = await pool.query(
      `SELECT * FROM proyectos WHERE grupo_id = $1`,
      [grupo.grupo_id]
    );
    const proyecto = proyectoResult.rows[0] || null;

    const integrantesResult = await pool.query(
      `SELECT u.usuario_id, u.nombre, u.apellido, u.correo,
              (ig.usuario_id = g.lider_id) AS es_lider
       FROM integrantes_grupo ig
       JOIN usuarios u ON u.usuario_id = ig.usuario_id
       JOIN grupos g ON g.grupo_id = ig.grupo_id
       WHERE ig.grupo_id = $1 AND ig.estado_integrante = 'Activo'
       ORDER BY (ig.usuario_id = g.lider_id) DESC, u.nombre`,
      [grupo.grupo_id]
    );

    // Progreso por fase con la evaluación vigente de cada evidencia.
    const fasesResult = proyecto
      ? await pool.query(
          `SELECT f.fase_id, f.numero_fase, f.nombre_fase, f.estado_fase,
                  count(DISTINCT c.carpeta_id)::int AS carpetas_total,
                  count(DISTINCT c.carpeta_id) FILTER (WHERE c.estado_carpeta = 'Aprobada')::int AS carpetas_aprobadas,
                  count(ev.evidencia_id)::int AS evidencias_total,
                  count(ev.evidencia_id) FILTER (WHERE ult.resultado = 'APROBADO')::int AS evidencias_aprobadas,
                  CASE
                    WHEN count(ev.evidencia_id) = 0 THEN 0
                    ELSE round(
                      100.0 * count(ev.evidencia_id) FILTER (WHERE ult.resultado = 'APROBADO')
                      / count(ev.evidencia_id)
                    )::int
                  END AS porcentaje
           FROM fases f
           LEFT JOIN carpetas c ON c.fase_id = f.fase_id
           LEFT JOIN evidencias ev ON ev.carpeta_id = c.carpeta_id
           LEFT JOIN LATERAL (
             SELECT e2.resultado
             FROM evaluaciones e2
             WHERE e2.evidencia_id = ev.evidencia_id
             ORDER BY e2.fecha_evaluacion DESC, e2.evaluacion_id DESC
             LIMIT 1
           ) ult ON true
           WHERE f.proyecto_id = $1
           GROUP BY f.fase_id
           ORDER BY f.numero_fase`,
          [proyecto.proyecto_id]
        )
      : { rows: [] };

    res.json({
      grupo,
      proyecto,
      integrantes: integrantesResult.rows,
      fases: fasesResult.rows,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener el proyecto' });
  }
}



// Verifica que el usuario sea integrante ACTIVO del grupo dueño de la fase
// (RN-012: cualquier integrante puede crear carpetas y subir evidencias).
async function verificarIntegranteDeFase(client, usuarioId, faseId) {
  const { rows } = await client.query(
    `SELECT p.proyecto_id, g.grupo_id, g.lider_id
     FROM fases f
     JOIN proyectos p ON p.proyecto_id = f.proyecto_id
     JOIN grupos g ON g.grupo_id = p.grupo_id
     JOIN integrantes_grupo ig ON ig.grupo_id = g.grupo_id
     WHERE f.fase_id = $1 AND ig.usuario_id = $2 AND ig.estado_integrante = 'Activo'`,
    [faseId, usuarioId]
  );
  return rows[0] || null;
}

// POST /api/aprendiz/proyectos/fases/:faseId/carpetas
// Cualquier integrante activo crea una carpeta dentro de una fase.
export async function crearCarpeta(req, res) {
  try {
    const usuarioId = req.user.usuario_id;
    const { faseId } = req.params;
    const { nombre_carpeta } = req.body;

    if (!nombre_carpeta || !String(nombre_carpeta).trim()) {
      return res.status(400).json({ message: 'El nombre de la carpeta es obligatorio' });
    }

    const check = await verificarIntegranteDeFase(pool, usuarioId, faseId);
    if (!check) {
      return res.status(403).json({ message: 'No perteneces al grupo dueño de esta fase' });
    }

    const { rows } = await pool.query(
      `INSERT INTO carpetas (fase_id, nombre_carpeta, fecha_creacion)
       VALUES ($1, $2, now())
       RETURNING carpeta_id, nombre_carpeta, estado_carpeta`,
      [faseId, String(nombre_carpeta).trim()]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear la carpeta' });
  }
}

// POST /api/aprendiz/proyectos/carpetas/:carpetaId/evidencias
// Cualquier integrante sube una evidencia; el autor sale del token.
export async function subirEvidencia(req, res) {
  const client = await pool.connect();
  try {
    const usuarioId = req.user.usuario_id;
    const { carpetaId } = req.params;
    const { nombre_evidencia, tipo_evidencia, ubicacion } = req.body;

    if (!nombre_evidencia || !tipo_evidencia || !ubicacion) {
      return res.status(400).json({ message: 'Faltan datos de la evidencia' });
    }

    const { rows: carpetaRows } = await client.query(
      `SELECT c.carpeta_id
       FROM carpetas c
       JOIN fases f ON f.fase_id = c.fase_id
       JOIN proyectos p ON p.proyecto_id = f.proyecto_id
       JOIN grupos g ON g.grupo_id = p.grupo_id
       JOIN integrantes_grupo ig ON ig.grupo_id = g.grupo_id
       WHERE c.carpeta_id = $1
         AND ig.usuario_id = $2
         AND ig.estado_integrante = 'Activo'`,
      [carpetaId, usuarioId]
    );
    if (carpetaRows.length === 0) {
      return res.status(403).json({ message: 'No perteneces al grupo dueño de esta carpeta' });
    }

    await client.query('BEGIN');

    const { rows } = await client.query(
      `INSERT INTO evidencias (carpeta_id, usuario_id, nombre_evidencia, tipo_evidencia, ubicacion, fecha_subida)
       VALUES ($1, $2, $3, $4, $5, now())
       RETURNING evidencia_id`,
      [carpetaId, usuarioId, String(nombre_evidencia).trim(), tipo_evidencia, ubicacion]
    );

    // Una evidencia nueva sin evaluar devuelve la carpeta/fase a "En revisión".
    await recalcularCarpetaYFase(client, carpetaId);

    await client.query('COMMIT');
    res.status(201).json({ evidencia_id: rows[0].evidencia_id });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: 'Error al subir la evidencia' });
  } finally {
    client.release();
  }
}

// GET /api/aprendiz/proyectos/fases/:faseId/carpetas
// Cualquier integrante activo del grupo (líder o no) puede ver la lista de
// chequeo de su fase: carpetas, evidencias y el resultado de evaluación
// vigente (la más reciente), además del progreso de la fase.
export async function getCarpetasDeFaseAprendiz(req, res) {
  try {
    const usuarioId = req.user.usuario_id;
    const { faseId } = req.params;

    const esIntegrante = await verificarIntegranteDeFase(pool, usuarioId, faseId);
    if (!esIntegrante) {
      return res.status(403).json({ message: 'No perteneces al grupo dueño de esta fase' });
    }

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

// GET /api/aprendiz/proyectos/observaciones
// Devuelve las observaciones que el instructor publicó al proyecto activo
// del aprendiz logueado (cualquier integrante las puede ver).
export async function getObservacionesDeMiProyecto(req, res) {
  try {
    const usuarioId = req.user.usuario_id;

    const grupoResult = await pool.query(
      `SELECT g.grupo_id
       FROM integrantes_grupo ig
       JOIN grupos g ON g.grupo_id = ig.grupo_id
       WHERE ig.usuario_id = $1 AND ig.estado_integrante = 'Activo' AND g.nombre_grupo <> 'General'
       LIMIT 1`,
      [usuarioId]
    );
    if (grupoResult.rowCount === 0) {
      return res.status(404).json({ message: 'No perteneces a ningún proyecto activo' });
    }

    const proyectoResult = await pool.query(
      `SELECT proyecto_id FROM proyectos WHERE grupo_id = $1`,
      [grupoResult.rows[0].grupo_id]
    );
    if (proyectoResult.rowCount === 0) {
      return res.status(404).json({ message: 'Tu grupo aún no tiene proyecto' });
    }

    const { rows } = await pool.query(
      `SELECT o.observacion_id, o.titulo, o.descripcion, o.fecha_observacion,
              u.nombre, u.apellido
       FROM observaciones o
       JOIN usuarios u ON u.usuario_id = o.instructor_id
       WHERE o.proyecto_id = $1
       ORDER BY o.fecha_observacion DESC`,
      [proyectoResult.rows[0].proyecto_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener las observaciones' });
  }
}

// PUT /api/aprendiz/proyectos/mi-ficha — el aprendiz corrige su propia ficha,
// SOLO si aún no tiene un proyecto activo (Opción 1: integridad de datos).
export async function cambiarMiFicha(req, res) {
  const client = await pool.connect();
  try {
    const usuarioId = req.user.usuario_id;
    const { numero_ficha } = req.body;

    if (!numero_ficha) {
      return res.status(400).json({ message: 'Selecciona la ficha correcta' });
    }

    await client.query('BEGIN');

    const yaTieneProyecto = await tieneProyectoActivo(client, usuarioId);
    if (yaTieneProyecto) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Ya tienes un proyecto activo, no puedes cambiar de ficha' });
    }

    const ficha = await client.query('SELECT ficha_id FROM fichas WHERE numero_ficha = $1', [numero_ficha]);
    if (ficha.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Esa ficha no existe' });
    }
    const fichaId = ficha.rows[0].ficha_id;

    // Inactiva su ingreso actual en el grupo General de cualquier ficha
    await client.query(
      `UPDATE integrantes_grupo ig
       SET estado_integrante = 'Inactivo', fecha_salida = now()
       FROM grupos g
       WHERE g.grupo_id = ig.grupo_id AND g.nombre_grupo = 'General'
         AND ig.usuario_id = $1 AND ig.estado_integrante = 'Activo'`,
      [usuarioId]
    );

    const grupoId = await obtenerGrupoGeneralAprendiz(client, fichaId, usuarioId);

    const yaExiste = await client.query(
      'SELECT integrante_id FROM integrantes_grupo WHERE grupo_id = $1 AND usuario_id = $2',
      [grupoId, usuarioId]
    );
    if (yaExiste.rows.length > 0) {
      await client.query(
        `UPDATE integrantes_grupo SET estado_integrante = 'Activo', fecha_salida = NULL WHERE integrante_id = $1`,
        [yaExiste.rows[0].integrante_id]
      );
    } else {
      await client.query(
        `INSERT INTO integrantes_grupo (grupo_id, usuario_id, estado_integrante, fecha_ingreso)
         VALUES ($1, $2, 'Activo', now())`,
        [grupoId, usuarioId]
      );
    }

    await client.query('COMMIT');
    res.json({ message: 'Ficha actualizada correctamente' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: 'Error al cambiar de ficha' });
  } finally {
    client.release();
  }
}

// Helper local: busca (o crea) el grupo General de una ficha, con el
// mismo aprendiz como líder de respaldo si el grupo aún no existe.
async function obtenerGrupoGeneralAprendiz(client, fichaId, usuarioId) {
  const existente = await client.query(
    'SELECT grupo_id FROM grupos WHERE ficha_id = $1 AND nombre_grupo = $2 LIMIT 1',
    [fichaId, 'General']
  );
  if (existente.rows.length > 0) return existente.rows[0].grupo_id;

  const nuevo = await client.query(
    `INSERT INTO grupos (nombre_grupo, codigo_grupo, ficha_id, lider_id, cupo_maximo, estado_grupo, fecha_creacion)
     VALUES ('General', $1, $2, $3, 50, 'Activo', now())
     RETURNING grupo_id`,
    [`GRP-GENERAL-${fichaId}`, fichaId, usuarioId]
  );
  return nuevo.rows[0].grupo_id;
}

// GET /api/aprendiz/proyectos/resumen — dashboard agregado en 2 consultas SQL
// (reemplaza las 5+ llamadas en cascada que hacía el frontend antes)
export async function getResumenAprendiz(req, res) {
  try {
    const usuarioId = req.user.usuario_id;

    const proyectoResult = await pool.query(
      `SELECT p.proyecto_id
       FROM integrantes_grupo ig
       JOIN grupos g ON g.grupo_id = ig.grupo_id
       JOIN proyectos p ON p.grupo_id = g.grupo_id
       WHERE ig.usuario_id = $1 AND ig.estado_integrante = 'Activo' AND g.nombre_grupo <> 'General'
       LIMIT 1`,
      [usuarioId]
    );
    if (proyectoResult.rowCount === 0) {
      return res.status(404).json({ message: 'No perteneces a ningún proyecto activo' });
    }
    const proyectoId = proyectoResult.rows[0].proyecto_id;

    const { rows } = await pool.query(
      `SELECT
        (SELECT count(*)::int FROM tareas WHERE proyecto_id = $1) AS tareas_total,
        (SELECT count(*)::int FROM tareas WHERE proyecto_id = $1 AND estado = 'Confirmada') AS tareas_confirmadas,
        (SELECT MIN(fecha_limite) FROM tareas
           WHERE proyecto_id = $1 AND estado <> 'Confirmada' AND fecha_limite IS NOT NULL) AS proxima_fecha_limite,
        (SELECT count(*)::int
           FROM evidencias e
           JOIN carpetas c ON c.carpeta_id = e.carpeta_id
           JOIN fases f ON f.fase_id = c.fase_id
           WHERE f.proyecto_id = $1) AS evidencias_total,
        (SELECT count(*)::int
           FROM evidencias e
           JOIN carpetas c ON c.carpeta_id = e.carpeta_id
           JOIN fases f ON f.fase_id = c.fase_id
           LEFT JOIN LATERAL (
             SELECT e2.resultado
             FROM evaluaciones e2
             WHERE e2.evidencia_id = e.evidencia_id
             ORDER BY e2.fecha_evaluacion DESC, e2.evaluacion_id DESC
             LIMIT 1
           ) ult ON true
           WHERE f.proyecto_id = $1 AND ult.resultado IS NOT NULL) AS evidencias_evaluadas,
        (SELECT count(*)::int
           FROM evidencias e
           JOIN carpetas c ON c.carpeta_id = e.carpeta_id
           JOIN fases f ON f.fase_id = c.fase_id
           LEFT JOIN LATERAL (
             SELECT e2.resultado
             FROM evaluaciones e2
             WHERE e2.evidencia_id = e.evidencia_id
             ORDER BY e2.fecha_evaluacion DESC, e2.evaluacion_id DESC
             LIMIT 1
           ) ult ON true
           WHERE f.proyecto_id = $1 AND ult.resultado = 'APROBADO') AS evidencias_aprobadas
      `,
      [proyectoId]
    );

    const r = rows[0];
    const total = r.tareas_total;
    const confirmadas = r.tareas_confirmadas;
    const porcentaje = total > 0 ? Math.round((confirmadas / total) * 100) : 0;

    res.json({
      progreso: { total, confirmadas, porcentaje },
      proxima_fecha_limite: r.proxima_fecha_limite,
      evidencias: {
        total: r.evidencias_total,
        evaluadas: r.evidencias_evaluadas,
        aprobadas: r.evidencias_aprobadas,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener el resumen' });
  }
}

// GET /api/aprendiz/proyectos/mi-ficha — devuelve el número de la ficha
// vigente del aprendiz (a través de su grupo "General" activo).
export async function getFichaActual(req, res) {
  try {
    const usuarioId = req.user.usuario_id;
    const { rows } = await pool.query(
      `SELECT f.numero_ficha
       FROM integrantes_grupo ig
       JOIN grupos g ON g.grupo_id = ig.grupo_id
       JOIN fichas f ON f.ficha_id = g.ficha_id
       WHERE ig.usuario_id = $1 AND ig.estado_integrante = 'Activo' AND g.nombre_grupo = 'General'
       LIMIT 1`,
      [usuarioId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'No estás inscrito en ninguna ficha' });
    }
    res.json({ numero_ficha: rows[0].numero_ficha });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener tu ficha actual' });
  }
}