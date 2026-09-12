/*
  Controller de proyectos de grupo para el rol APRENDIZ.
  Cubre la Fase 1 del documento de idea de proyecto:
    - crearProyecto: el aprendiz crea su grupo de trabajo + el "README" del
      proyecto (nombre, descripción, problema, objetivo, alcance, tecnologías,
      fechas). Queda como Scrum Master (líder) automáticamente. Al crearse,
      se generan las 5 fases fijas (Análisis, Diseño, Desarrollo, Pruebas,
      Cierre/Entrega) y un código de invitación único.
    - unirseAProyecto: otro aprendiz entra a un grupo existente usando el
      código de invitación, eligiendo su rol Scrum (Product Owner o Developer).
    - getMiProyecto: devuelve el proyecto activo del aprendiz logueado
      (el "README" + integrantes + fases), para que lo consulten tanto el
      líder como el resto del equipo.
  Regla de negocio clave: un aprendiz solo puede estar en UN proyecto
  activo a la vez (grupo con nombre_grupo distinto de "General" — el grupo
  "General" es solo de inscripción a la ficha y no cuenta para esta regla).
*/

import pool from '../../config/db.js';

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
    } = req.body;

    if (!nombre_grupo || !nombre_proyecto || !descripcion || !problema || !objetivo || !alcance || !fecha_inicio || !fecha_fin_estimada) {
      return res.status(400).json({ message: 'Faltan campos obligatorios del proyecto' });
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
      `INSERT INTO grupos (ficha_id, lider_id, nombre_grupo, codigo_grupo, estado_grupo, fecha_creacion)
       VALUES ($1, $2, $3, $4, 'Activo', now())
       RETURNING grupo_id`,
      [fichaId, usuarioId, nombre_grupo, codigoGrupo]
    );
    const grupoId = grupoResult.rows[0].grupo_id;

    await client.query(
      `INSERT INTO integrantes_grupo (grupo_id, usuario_id, rol_scrum, estado_integrante, fecha_ingreso)
       VALUES ($1, $2, 'Scrum Master', 'Activo', now())`,
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
    res.status(201).json({ grupo_id: grupoId, proyecto_id: proyectoId, codigo_grupo: codigoGrupo });
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
    const { codigo_grupo, rol_scrum } = req.body;

    if (!codigo_grupo || !rol_scrum) {
      return res.status(400).json({ message: 'Falta el código o el rol Scrum' });
    }
    if (!['Product Owner', 'Developer'].includes(rol_scrum)) {
      return res.status(400).json({ message: 'Rol Scrum inválido' });
    }

    await client.query('BEGIN');

    const yaTieneProyecto = await tieneProyectoActivo(client, usuarioId);
    if (yaTieneProyecto) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Ya perteneces a un proyecto activo' });
    }

    const grupoResult = await client.query(
      `SELECT grupo_id FROM grupos WHERE codigo_grupo = $1 AND estado_grupo = 'Activo'`,
      [codigo_grupo]
    );
    if (grupoResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Código de grupo no encontrado' });
    }
    const grupoId = grupoResult.rows[0].grupo_id;

    if (rol_scrum === 'Product Owner') {
      const poExistente = await client.query(
        `SELECT 1 FROM integrantes_grupo WHERE grupo_id = $1 AND rol_scrum = 'Product Owner' AND estado_integrante = 'Activo'`,
        [grupoId]
      );
      if (poExistente.rowCount > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'Este grupo ya tiene un Product Owner' });
      }
    }

    await client.query(
      `INSERT INTO integrantes_grupo (grupo_id, usuario_id, rol_scrum, estado_integrante, fecha_ingreso)
       VALUES ($1, $2, $3, 'Activo', now())`,
      [grupoId, usuarioId, rol_scrum]
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
      `SELECT g.grupo_id, g.nombre_grupo, g.codigo_grupo, g.lider_id
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
      `SELECT u.usuario_id, u.nombre, u.apellido, u.correo, ig.rol_scrum
       FROM integrantes_grupo ig
       JOIN usuarios u ON u.usuario_id = ig.usuario_id
       WHERE ig.grupo_id = $1 AND ig.estado_integrante = 'Activo'`,
      [grupo.grupo_id]
    );

    const fasesResult = proyecto
      ? await pool.query(`SELECT * FROM fases WHERE proyecto_id = $1 ORDER BY numero_fase`, [proyecto.proyecto_id])
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



// Verifica que el usuario sea el líder del proyecto dueño de esa fase, y devuelve el proyecto
async function verificarLiderDeFase(client, usuarioId, faseId) {
  const { rows } = await client.query(
    `SELECT p.proyecto_id, g.lider_id
     FROM fases f
     JOIN proyectos p ON p.proyecto_id = f.proyecto_id
     JOIN grupos g ON g.grupo_id = p.grupo_id
     WHERE f.fase_id = $1`,
    [faseId]
  );
  if (rows.length === 0) return null;
  if (rows[0].lider_id !== usuarioId) return 'NO_LIDER';
  return rows[0];
}

// POST /api/aprendiz/proyectos/fases/:faseId/carpetas — el líder crea una carpeta dentro de una fase
export async function crearCarpeta(req, res) {
  try {
    const usuarioId = req.user.usuario_id;
    const { faseId } = req.params;
    const { nombre_carpeta } = req.body;

    if (!nombre_carpeta) {
      return res.status(400).json({ message: 'El nombre de la carpeta es obligatorio' });
    }

    const check = await verificarLiderDeFase(pool, usuarioId, faseId);
    if (check === null) return res.status(404).json({ message: 'Fase no encontrada' });
    if (check === 'NO_LIDER') return res.status(403).json({ message: 'Solo el líder del grupo puede crear carpetas' });

    const { rows } = await pool.query(
      `INSERT INTO carpetas (fase_id, nombre_carpeta, fecha_creacion)
       VALUES ($1, $2, now())
       RETURNING carpeta_id, nombre_carpeta`,
      [faseId, nombre_carpeta]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear la carpeta' });
  }
}

// POST /api/aprendiz/proyectos/carpetas/:carpetaId/evidencias — el líder sube una evidencia (link/documento)
export async function subirEvidencia(req, res) {
  try {
    const usuarioId = req.user.usuario_id;
    const { carpetaId } = req.params;
    const { nombre_evidencia, tipo_evidencia, ubicacion } = req.body;

    if (!nombre_evidencia || !tipo_evidencia || !ubicacion) {
      return res.status(400).json({ message: 'Faltan datos de la evidencia' });
    }

    const { rows: carpetaRows } = await pool.query(
      `SELECT g.lider_id
       FROM carpetas c
       JOIN fases f ON f.fase_id = c.fase_id
       JOIN proyectos p ON p.proyecto_id = f.proyecto_id
       JOIN grupos g ON g.grupo_id = p.grupo_id
       WHERE c.carpeta_id = $1`,
      [carpetaId]
    );
    if (carpetaRows.length === 0) return res.status(404).json({ message: 'Carpeta no encontrada' });
    if (carpetaRows[0].lider_id !== usuarioId) {
      return res.status(403).json({ message: 'Solo el líder del grupo puede subir evidencias' });
    }

    const { rows } = await pool.query(
      `INSERT INTO evidencias (carpeta_id, usuario_id, nombre_evidencia, tipo_evidencia, ubicacion, fecha_subida)
       VALUES ($1, $2, $3, $4, $5, now())
       RETURNING evidencia_id`,
      [carpetaId, usuarioId, nombre_evidencia, tipo_evidencia, ubicacion]
    );
    res.status(201).json({ evidencia_id: rows[0].evidencia_id });
  } catch (err) {
    res.status(500).json({ message: 'Error al subir la evidencia' });
  }
}

// ==================================================================
// Verifica que el usuario sea integrante ACTIVO del grupo dueño de la fase
// (a diferencia de verificarLiderDeFase, aquí cualquier rol_scrum sirve,
// no solo el líder — esto es para las vistas de solo lectura)
// ===========================================================================================================
async function verificarIntegranteDeFase(usuarioId, faseId) {
  const { rows } = await pool.query(
    `SELECT g.grupo_id
     FROM fases f
     JOIN proyectos p ON p.proyecto_id = f.proyecto_id
     JOIN grupos g ON g.grupo_id = p.grupo_id
     JOIN integrantes_grupo ig ON ig.grupo_id = g.grupo_id
     WHERE f.fase_id = $1 AND ig.usuario_id = $2 AND ig.estado_integrante = 'Activo'`,
    [faseId, usuarioId]
  );
  return rows.length > 0;
}

// GET /api/aprendiz/proyectos/fases/:faseId/carpetas
// Cualquier integrante activo del grupo (líder o no) puede ver la lista de
// chequeo de su fase: carpetas, evidencias y el resultado de evaluación.
export async function getCarpetasDeFaseAprendiz(req, res) {
  try {
    const usuarioId = req.user.usuario_id;
    const { faseId } = req.params;

    const esIntegrante = await verificarIntegranteDeFase(usuarioId, faseId);
    if (!esIntegrante) {
      return res.status(403).json({ message: 'No perteneces al grupo dueño de esta fase' });
    }

    const { rows: carpetas } = await pool.query(
      `SELECT carpeta_id, nombre_carpeta FROM carpetas WHERE fase_id = $1 ORDER BY carpeta_id`,
      [faseId]
    );

    for (const carpeta of carpetas) {
      const { rows: evidencias } = await pool.query(
        `SELECT e.evidencia_id, e.nombre_evidencia, e.tipo_evidencia, e.ubicacion, e.fecha_subida,
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
        `INSERT INTO integrantes_grupo (grupo_id, usuario_id, rol_scrum, estado_integrante, fecha_ingreso)
         VALUES ($1, $2, 'Integrante', 'Activo', now())`,
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
    `INSERT INTO grupos (nombre_grupo, codigo_grupo, ficha_id, lider_id, estado_grupo, fecha_creacion)
     VALUES ('General', $1, $2, $3, 'Activo', now())
     RETURNING grupo_id`,
    [`GRP-GENERAL-${fichaId}`, fichaId, usuarioId]
  );
  return nuevo.rows[0].grupo_id;
}