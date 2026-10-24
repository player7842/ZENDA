/*
  Controller de proyectos de grupo para el rol APRENDIZ.
    - crearProyecto: el aprendiz crea su grupo de trabajo + el "README" del
      proyecto (nombre, descripción, problema, objetivo, alcance, tecnologías,
      cupo y fechas). Queda como líder del grupo (grupos.lider_id). Al
      crearse se generan las 5 fases fijas y un código de invitación único.
    - unirseAProyecto: otro aprendiz entra a un grupo existente usando el
      código de invitación, respetando el cupo máximo (RN-009) y la ficha.
    - getMiProyecto: devuelve el proyecto activo del aprendiz logueado.
    - Carpetas y evidencias: cualquier integrante activo del grupo puede
      crearlas y subir evidencias, con el autor registrado (RN-012).
  Regla de negocio clave: un aprendiz solo puede estar en UN proyecto
  activo a la vez (grupo con `es_general = false`; el grupo General es solo
  de inscripción a la ficha y no cuenta para esta regla, C-05).
*/

import crypto from 'node:crypto';
import pool from '../../config/db.js';
import {
  CUPO_POR_DEFECTO,
  calcularProgreso,
  puedeUnirse,
  validarCupo,
} from '../../domain/reglas.js';
import {
  bloquearCarpeta,
  recalcularCarpetaYFase,
} from '../../services/cascada.js';
import { obtenerOCrearGrupoGeneral } from '../../services/grupos.js';

const FASES_FIJAS = [
  { numero: 1, nombre: 'FASE 1 - ANALISIS' },
  { numero: 2, nombre: 'FASE 2 - DISEÑO' },
  { numero: 3, nombre: 'FASE 3 - DESARROLLO' },
  { numero: 4, nombre: 'FASE 4 - PRUEBAS' },
  { numero: 5, nombre: 'FASE 5 - CIERRE/ENTREGA' },
];

const TIPOS_EVIDENCIA = new Set(['Documento', 'Imagen', 'Video', 'Enlace']);

const MAXIMOS = {
  nombre_grupo: 50,
  nombre_proyecto: 150,
  descripcion: 500,
  problema: 500,
  objetivo: 500,
  alcance: 500,
  tecnologias: 500,
  nombre_carpeta: 150,
  nombre_evidencia: 200,
  ubicacion: 500,
};

const texto = (valor) => String(valor ?? '').trim();

// C-07 / Q-01: solo se aceptan URLs http(s) y con longitud razonable.
function esUrlSegura(valor) {
  const url = texto(valor);
  if (!url || url.length > MAXIMOS.ubicacion) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function fechaValida(valor) {
  const cadena = texto(valor);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(cadena)) return null;
  const fecha = new Date(`${cadena}T00:00:00Z`);
  if (Number.isNaN(fecha.getTime())) return null;
  // Rechaza fechas que JavaScript normaliza (por ejemplo, 2026-02-31).
  return fecha.toISOString().slice(0, 10) === cadena ? fecha : null;
}

function errorDeValidacion(campo, valor, obligatorio = true) {
  const contenido = texto(valor);
  if (!contenido) return obligatorio ? `El campo ${campo} es obligatorio` : null;
  if (contenido.length > MAXIMOS[campo]) {
    return `El campo ${campo} no puede superar ${MAXIMOS[campo]} caracteres`;
  }
  return null;
}

// Genera un código de invitación con entropía criptográfica (Q-09).
function generarCodigoProyecto() {
  return `PRY-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
}

async function codigoProyectoDisponible(client) {
  for (let intento = 0; intento < 8; intento += 1) {
    const codigo = generarCodigoProyecto();
    const { rowCount } = await client.query(
      'SELECT 1 FROM grupos WHERE codigo_grupo = $1',
      [codigo]
    );
    if (rowCount === 0) return codigo;
  }
  throw new Error('No se pudo generar un código de grupo único');
}

// Busca la ficha activa del aprendiz (a través de su grupo General).
async function obtenerFichaDelAprendiz(client, usuarioId) {
  const { rows } = await client.query(
    `SELECT g.ficha_id
     FROM integrantes_grupo ig
     JOIN grupos g ON g.grupo_id = ig.grupo_id
     WHERE ig.usuario_id = $1
       AND ig.estado_integrante = 'Activo'
       AND g.es_general
     ORDER BY ig.fecha_ingreso DESC, g.grupo_id DESC
     LIMIT 1`,
    [usuarioId]
  );
  return rows[0]?.ficha_id || null;
}

// Revisa si el aprendiz ya pertenece a un proyecto activo.
async function tieneProyectoActivo(client, usuarioId) {
  const { rows } = await client.query(
    `SELECT 1
     FROM integrantes_grupo ig
     JOIN grupos g ON g.grupo_id = ig.grupo_id
     WHERE ig.usuario_id = $1
       AND ig.estado_integrante = 'Activo'
       AND NOT g.es_general
     LIMIT 1`,
    [usuarioId]
  );
  return rows.length > 0;
}

// Bloquea la fila del usuario para serializar creación/unión (RN-007, C-06).
async function bloquearUsuario(client, usuarioId) {
  await client.query('SELECT usuario_id FROM usuarios WHERE usuario_id = $1 FOR UPDATE', [
    usuarioId,
  ]);
}

// POST /api/aprendiz/proyectos — crear grupo + proyecto + fases automáticas
export async function crearProyecto(req, res) {
  const client = await pool.connect();
  let transaccionAbierta = false;
  try {
    const usuarioId = req.user.usuario_id;
    const {
      nombre_grupo,
      nombre_proyecto,
      descripcion,
      problema,
      objetivo,
      alcance,
      tecnologias,
      fecha_inicio,
      fecha_fin_estimada,
      cupo_maximo,
    } = req.body;

    const nombreGrupo = texto(nombre_grupo);
    if (nombreGrupo.toLowerCase() === 'general') {
      return res.status(400).json({ message: 'El nombre "General" está reservado por el sistema' });
    }

    const camposObligatorios = {
      nombre_grupo: nombreGrupo,
      nombre_proyecto,
      descripcion,
      problema,
      objetivo,
      alcance,
    };
    for (const [campo, valor] of Object.entries(camposObligatorios)) {
      const error = errorDeValidacion(campo, valor);
      if (error) return res.status(400).json({ message: error });
    }

    const errorTecnologias = errorDeValidacion('tecnologias', tecnologias, false);
    if (errorTecnologias) return res.status(400).json({ message: errorTecnologias });

    const inicio = fechaValida(fecha_inicio);
    const fin = fechaValida(fecha_fin_estimada);
    if (!inicio || !fin) {
      return res.status(400).json({ message: 'Las fechas del proyecto no son válidas' });
    }
    if (fin <= inicio) {
      return res
        .status(400)
        .json({ message: 'La fecha fin estimada debe ser posterior a la fecha de inicio' });
    }

    const cupoRecibido = cupo_maximo ?? CUPO_POR_DEFECTO;
    const cupo = validarCupo(cupoRecibido);
    if (!cupo.valido) {
      return res.status(400).json({ message: cupo.mensaje });
    }

    await client.query('BEGIN');
    transaccionAbierta = true;

    await bloquearUsuario(client, usuarioId);

    const yaTieneProyecto = await tieneProyectoActivo(client, usuarioId);
    if (yaTieneProyecto) {
      await client.query('ROLLBACK');
      transaccionAbierta = false;
      return res.status(400).json({ message: 'Ya perteneces a un proyecto activo' });
    }

    const fichaId = await obtenerFichaDelAprendiz(client, usuarioId);
    if (!fichaId) {
      await client.query('ROLLBACK');
      transaccionAbierta = false;
      return res.status(400).json({ message: 'No estás inscrito en ninguna ficha' });
    }

    const codigoGrupo = await codigoProyectoDisponible(client);

    let grupoId;
    try {
      const grupoResult = await client.query(
        `INSERT INTO grupos
           (ficha_id, lider_id, nombre_grupo, codigo_grupo, cupo_maximo, estado_grupo, fecha_creacion, es_general)
         VALUES ($1, $2, $3, $4, $5, 'Activo', now(), false)
         RETURNING grupo_id`,
        [fichaId, usuarioId, nombreGrupo, codigoGrupo, cupo.cupo]
      );
      grupoId = grupoResult.rows[0].grupo_id;
    } catch (error) {
      if (error.code === '23505') {
        await client.query('ROLLBACK');
        transaccionAbierta = false;
        return res
          .status(409)
          .json({ message: 'No se pudo generar un código de grupo único, intenta de nuevo' });
      }
      throw error;
    }

    await client.query(
      `INSERT INTO integrantes_grupo (grupo_id, usuario_id, estado_integrante, fecha_ingreso)
       VALUES ($1, $2, 'Activo', now())`,
      [grupoId, usuarioId]
    );

    const proyectoResult = await client.query(
      `INSERT INTO proyectos
         (grupo_id, nombre_proyecto, descripcion, problema, objetivo, alcance,
          tecnologias, fecha_inicio, fecha_fin_estimada, estado_proyecto)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Activo')
       RETURNING proyecto_id`,
      [
        grupoId,
        texto(nombre_proyecto),
        texto(descripcion),
        texto(problema),
        texto(objetivo),
        texto(alcance),
        texto(tecnologias) || null,
        texto(fecha_inicio),
        texto(fecha_fin_estimada),
      ]
    );
    const proyectoId = proyectoResult.rows[0].proyecto_id;

    const valoresFases = FASES_FIJAS.map(
      (fase) => `(${proyectoId}, ${fase.numero}, '${fase.nombre}', 'Pendiente')`
    ).join(', ');
    await client.query(
      `INSERT INTO fases (proyecto_id, numero_fase, nombre_fase, estado_fase)
       VALUES ${valoresFases}`
    );

    await client.query('COMMIT');
    transaccionAbierta = false;

    res.status(201).json({
      grupo_id: grupoId,
      proyecto_id: proyectoId,
      codigo_grupo: codigoGrupo,
      cupo_maximo: cupo.cupo,
    });
  } catch (err) {
    if (transaccionAbierta) await client.query('ROLLBACK');
    console.error('Error al crear el proyecto:', err);
    res.status(500).json({ message: 'Error al crear el proyecto' });
  } finally {
    client.release();
  }
}

// POST /api/aprendiz/proyectos/unirse — unirse con código de invitación
export async function unirseAProyecto(req, res) {
  const client = await pool.connect();
  let transaccionAbierta = false;
  try {
    const usuarioId = req.user.usuario_id;
    const codigo = texto(req.body.codigo_grupo).toUpperCase();

    if (!codigo) {
      return res.status(400).json({ message: 'Falta el código de grupo' });
    }

    await client.query('BEGIN');
    transaccionAbierta = true;

    await bloquearUsuario(client, usuarioId);

    const yaTieneProyecto = await tieneProyectoActivo(client, usuarioId);
    if (yaTieneProyecto) {
      await client.query('ROLLBACK');
      transaccionAbierta = false;
      return res.status(400).json({ message: 'Ya perteneces a un proyecto activo' });
    }

    const fichaId = await obtenerFichaDelAprendiz(client, usuarioId);
    if (!fichaId) {
      await client.query('ROLLBACK');
      transaccionAbierta = false;
      return res.status(400).json({ message: 'No estás inscrito en ninguna ficha' });
    }

    // FOR UPDATE serializa las solicitudes concurrentes al mismo grupo: el
    // conteo del cupo y la inserción ocurren bajo el mismo bloqueo.
    const grupoResult = await client.query(
      `SELECT grupo_id, ficha_id, cupo_maximo
       FROM grupos
       WHERE codigo_grupo = $1
         AND estado_grupo = 'Activo'
         AND NOT es_general
       FOR UPDATE`,
      [codigo]
    );
    if (grupoResult.rowCount === 0) {
      await client.query('ROLLBACK');
      transaccionAbierta = false;
      return res.status(404).json({ message: 'Código de grupo no encontrado' });
    }
    const grupo = grupoResult.rows[0];

    // Decisión de Semana 2: solo se puede unir a un grupo de la propia ficha.
    if (grupo.ficha_id !== fichaId) {
      await client.query('ROLLBACK');
      transaccionAbierta = false;
      return res
        .status(403)
        .json({ message: 'El grupo pertenece a otra ficha; no puedes unirte' });
    }

    const conteo = await client.query(
      `SELECT count(*)::int AS total
       FROM integrantes_grupo
       WHERE grupo_id = $1 AND estado_integrante = 'Activo'`,
      [grupo.grupo_id]
    );

    if (!puedeUnirse(grupo.cupo_maximo, conteo.rows[0].total)) {
      await client.query('ROLLBACK');
      transaccionAbierta = false;
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
    transaccionAbierta = false;
    res.status(200).json({ message: 'Te uniste al proyecto correctamente' });
  } catch (err) {
    if (transaccionAbierta) await client.query('ROLLBACK');
    console.error('Error al unirse al proyecto:', err);
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
       WHERE ig.usuario_id = $1
         AND ig.estado_integrante = 'Activo'
         AND NOT g.es_general
       ORDER BY ig.fecha_ingreso DESC, g.grupo_id DESC
       LIMIT 1`,
      [usuarioId]
    );
    if (grupoResult.rowCount === 0) {
      return res.status(404).json({ message: 'No perteneces a ningún proyecto activo' });
    }
    const grupo = grupoResult.rows[0];

    const proyectoResult = await pool.query(`SELECT * FROM proyectos WHERE grupo_id = $1`, [
      grupo.grupo_id,
    ]);
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
             ORDER BY e2.evaluacion_id DESC
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
    console.error('Error al obtener el proyecto:', err);
    res.status(500).json({ message: 'Error al obtener el proyecto' });
  }
}

// PUT /api/aprendiz/proyectos/mio/cupo — el líder ajusta el cupo (RN-009).
export async function actualizarCupoProyecto(req, res) {
  const client = await pool.connect();
  let transaccionAbierta = false;
  try {
    const usuarioId = req.user.usuario_id;
    const cupo = validarCupo(req.body.cupo_maximo);
    if (!cupo.valido) return res.status(400).json({ message: cupo.mensaje });

    await client.query('BEGIN');
    transaccionAbierta = true;
    await bloquearUsuario(client, usuarioId);

    const grupoResult = await client.query(
      `SELECT g.grupo_id, g.cupo_maximo
       FROM grupos g
       WHERE g.lider_id = $1 AND g.estado_grupo = 'Activo' AND NOT g.es_general
       FOR UPDATE`,
      [usuarioId]
    );
    if (grupoResult.rowCount === 0) {
      await client.query('ROLLBACK');
      transaccionAbierta = false;
      return res.status(403).json({ message: 'Solo el líder puede cambiar el cupo del grupo' });
    }

    const grupo = grupoResult.rows[0];
    const { rows } = await client.query(
      `SELECT count(*)::int AS total
       FROM integrantes_grupo
       WHERE grupo_id = $1 AND estado_integrante = 'Activo'`,
      [grupo.grupo_id]
    );

    if (cupo.cupo < rows[0].total) {
      await client.query('ROLLBACK');
      transaccionAbierta = false;
      return res.status(400).json({
        message: `El cupo no puede ser menor que los ${rows[0].total} integrantes activos`,
      });
    }

    await client.query('UPDATE grupos SET cupo_maximo = $1 WHERE grupo_id = $2', [
      cupo.cupo,
      grupo.grupo_id,
    ]);
    await client.query('COMMIT');
    transaccionAbierta = false;

    res.json({ message: 'Cupo actualizado correctamente', cupo_maximo: cupo.cupo });
  } catch (err) {
    if (transaccionAbierta) await client.query('ROLLBACK');
    console.error('Error al actualizar el cupo:', err);
    res.status(500).json({ message: 'Error al actualizar el cupo' });
  } finally {
    client.release();
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
export async function crearCarpeta(req, res) {
  try {
    const usuarioId = req.user.usuario_id;
    const { faseId } = req.params;
    const nombreCarpeta = texto(req.body.nombre_carpeta);
    const idFase = Number(faseId);

    // RF-019: el nombre es obligatorio y tiene un máximo de 150 caracteres.
    if (!nombreCarpeta) {
      return res.status(400).json({ message: 'El nombre de la carpeta es obligatorio' });
    }
    if (nombreCarpeta.length > MAXIMOS.nombre_carpeta) {
      return res.status(400).json({
        message: `El nombre de la carpeta no puede superar ${MAXIMOS.nombre_carpeta} caracteres`,
      });
    }

    if (!Number.isInteger(idFase) || idFase <= 0) {
      return res.status(404).json({ message: 'Fase no encontrada' });
    }

    const check = await verificarIntegranteDeFase(pool, usuarioId, idFase);
    if (!check) {
      // Distingue una fase inexistente (404) de una fase ajena (403).
      const { rowCount } = await pool.query('SELECT 1 FROM fases WHERE fase_id = $1', [idFase]);
      if (rowCount === 0) {
        return res.status(404).json({ message: 'Fase no encontrada' });
      }
      return res.status(403).json({ message: 'No perteneces al grupo dueño de esta fase' });
    }

    const { rows } = await pool.query(
      `INSERT INTO carpetas (fase_id, nombre_carpeta, fecha_creacion)
       VALUES ($1, $2, now())
       RETURNING carpeta_id, nombre_carpeta, estado_carpeta`,
      [faseId, nombreCarpeta]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error al crear la carpeta:', err);
    res.status(500).json({ message: 'Error al crear la carpeta' });
  }
}

// POST /api/aprendiz/proyectos/carpetas/:carpetaId/evidencias
export async function subirEvidencia(req, res) {
  const client = await pool.connect();
  let transaccionAbierta = false;
  try {
    const usuarioId = req.user.usuario_id;
    const { carpetaId } = req.params;
    const { nombre_evidencia, tipo_evidencia, ubicacion } = req.body;
    const nombreEvidencia = texto(nombre_evidencia);
    const tipoEvidencia = texto(tipo_evidencia);
    const ubicacionLimpia = texto(ubicacion);

    const errorNombre = errorDeValidacion('nombre_evidencia', nombreEvidencia);
    if (errorNombre) return res.status(400).json({ message: errorNombre });
    if (!TIPOS_EVIDENCIA.has(tipoEvidencia)) {
      return res
        .status(400)
        .json({ message: 'El tipo de evidencia debe ser Documento, Imagen, Video o Enlace' });
    }
    if (!esUrlSegura(ubicacionLimpia)) {
      return res
        .status(400)
        .json({ message: 'La ubicación debe ser una URL http(s) válida de máximo 500 caracteres' });
    }

    await client.query('BEGIN');
    transaccionAbierta = true;

    // Bloquea la carpeta antes de insertar para que dos entregas o una
    // entrega y una evaluación no calculen el estado a la vez (C-06).
    const carpeta = await bloquearCarpeta(client, carpetaId);
    if (!carpeta) {
      await client.query('ROLLBACK');
      transaccionAbierta = false;
      return res.status(404).json({ message: 'La carpeta no existe' });
    }

    const { rowCount } = await client.query(
      `SELECT 1
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
    if (rowCount === 0) {
      await client.query('ROLLBACK');
      transaccionAbierta = false;
      return res.status(403).json({ message: 'No perteneces al grupo dueño de esta carpeta' });
    }

    const { rows } = await client.query(
      `INSERT INTO evidencias
         (carpeta_id, usuario_id, nombre_evidencia, tipo_evidencia, ubicacion, fecha_subida)
       VALUES ($1, $2, $3, $4, $5, clock_timestamp())
       RETURNING evidencia_id`,
      [carpetaId, usuarioId, nombreEvidencia, tipoEvidencia, ubicacionLimpia]
    );

    // Una evidencia nueva sin evaluar devuelve la carpeta/fase a "En revisión".
    await recalcularCarpetaYFase(client, carpetaId);

    await client.query('COMMIT');
    transaccionAbierta = false;
    res.status(201).json({ evidencia_id: rows[0].evidencia_id });
  } catch (err) {
    if (transaccionAbierta) await client.query('ROLLBACK');
    console.error('Error al subir la evidencia:', err);
    res.status(500).json({ message: 'Error al subir la evidencia' });
  } finally {
    client.release();
  }
}

// GET /api/aprendiz/proyectos/fases/:faseId/carpetas
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

    // Una sola consulta para todas las evidencias de la fase (Q-04), no una
    // consulta por carpeta.
    const { rows: evidencias } = await pool.query(
      `SELECT ev.carpeta_id, ev.evidencia_id, ev.nombre_evidencia, ev.tipo_evidencia,
              ev.ubicacion, ev.fecha_subida,
              au.nombre AS autor_nombre, au.apellido AS autor_apellido,
              ult.resultado, ult.fecha_evaluacion,
              inst.nombre AS evaluador_nombre, inst.apellido AS evaluador_apellido
       FROM evidencias ev
       JOIN carpetas c ON c.carpeta_id = ev.carpeta_id
       JOIN usuarios au ON au.usuario_id = ev.usuario_id
       LEFT JOIN LATERAL (
         SELECT e2.resultado, e2.fecha_evaluacion, e2.instructor_id
         FROM evaluaciones e2
         WHERE e2.evidencia_id = ev.evidencia_id
         ORDER BY e2.evaluacion_id DESC
         LIMIT 1
       ) ult ON true
       LEFT JOIN usuarios inst ON inst.usuario_id = ult.instructor_id
       WHERE c.fase_id = $1
       ORDER BY ev.evidencia_id`,
      [faseId]
    );

    const porCarpeta = new Map();
    for (const evidencia of evidencias) {
      if (!porCarpeta.has(evidencia.carpeta_id)) porCarpeta.set(evidencia.carpeta_id, []);
      porCarpeta.get(evidencia.carpeta_id).push(evidencia);
    }
    for (const carpeta of carpetas) {
      carpeta.evidencias = porCarpeta.get(carpeta.carpeta_id) || [];
    }

    const { rows: faseRows } = await pool.query(
      `SELECT fase_id, nombre_fase, estado_fase FROM fases WHERE fase_id = $1`,
      [faseId]
    );

    const resultados = evidencias.map((evidencia) => evidencia.resultado);
    const progreso = calcularProgreso(resultados);

    res.json({
      fase: faseRows[0] || null,
      estado_fase: faseRows[0]?.estado_fase || 'Pendiente',
      progreso: {
        ...progreso,
        carpetas_total: carpetas.length,
        carpetas_aprobadas: carpetas.filter((c) => c.estado_carpeta === 'Aprobada').length,
      },
      carpetas,
    });
  } catch (err) {
    console.error('Error al obtener la lista de chequeo:', err);
    res.status(500).json({ message: 'Error al obtener la lista de chequeo' });
  }
}

// GET /api/aprendiz/proyectos/observaciones
export async function getObservacionesDeMiProyecto(req, res) {
  try {
    const usuarioId = req.user.usuario_id;

    const grupoResult = await pool.query(
      `SELECT g.grupo_id
       FROM integrantes_grupo ig
       JOIN grupos g ON g.grupo_id = ig.grupo_id
       WHERE ig.usuario_id = $1
         AND ig.estado_integrante = 'Activo'
         AND NOT g.es_general
       ORDER BY ig.fecha_ingreso DESC, g.grupo_id DESC
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
              o.evidencia_id, ev.nombre_evidencia,
              u.nombre, u.apellido
       FROM observaciones o
       JOIN usuarios u ON u.usuario_id = o.instructor_id
       LEFT JOIN evidencias ev ON ev.evidencia_id = o.evidencia_id
       WHERE o.proyecto_id = $1
       ORDER BY o.fecha_observacion DESC`,
      [proyectoResult.rows[0].proyecto_id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener las observaciones:', err);
    res.status(500).json({ message: 'Error al obtener las observaciones' });
  }
}

// PUT /api/aprendiz/proyectos/mi-ficha — el aprendiz corrige su propia ficha,
// SOLO si aún no tiene un proyecto activo.
export async function cambiarMiFicha(req, res) {
  const client = await pool.connect();
  let transaccionAbierta = false;
  try {
    const usuarioId = req.user.usuario_id;
    const { numero_ficha } = req.body;

    if (!numero_ficha) {
      return res.status(400).json({ message: 'Selecciona la ficha correcta' });
    }

    await client.query('BEGIN');
    transaccionAbierta = true;
    await bloquearUsuario(client, usuarioId);

    const yaTieneProyecto = await tieneProyectoActivo(client, usuarioId);
    if (yaTieneProyecto) {
      await client.query('ROLLBACK');
      transaccionAbierta = false;
      return res
        .status(400)
        .json({ message: 'Ya tienes un proyecto activo, no puedes cambiar de ficha' });
    }

    const ficha = await client.query('SELECT ficha_id FROM fichas WHERE numero_ficha = $1', [
      numero_ficha,
    ]);
    if (ficha.rows.length === 0) {
      await client.query('ROLLBACK');
      transaccionAbierta = false;
      return res.status(400).json({ message: 'Esa ficha no existe' });
    }
    const fichaId = ficha.rows[0].ficha_id;

    await client.query(
      `UPDATE integrantes_grupo ig
       SET estado_integrante = 'Inactivo', fecha_salida = now()
       FROM grupos g
       WHERE g.grupo_id = ig.grupo_id
         AND g.es_general
         AND ig.usuario_id = $1
         AND ig.estado_integrante = 'Activo'`,
      [usuarioId]
    );

    const grupoId = await obtenerOCrearGrupoGeneral(client, fichaId, usuarioId);

    await client.query(
      `INSERT INTO integrantes_grupo (grupo_id, usuario_id, estado_integrante, fecha_ingreso)
       VALUES ($1, $2, 'Activo', now())
       ON CONFLICT (grupo_id, usuario_id)
       DO UPDATE SET estado_integrante = 'Activo', fecha_salida = NULL, fecha_ingreso = now()`,
      [grupoId, usuarioId]
    );

    await client.query('COMMIT');
    transaccionAbierta = false;
    res.json({ message: 'Ficha actualizada correctamente' });
  } catch (err) {
    if (transaccionAbierta) await client.query('ROLLBACK');
    console.error('Error al cambiar de ficha:', err);
    res.status(500).json({ message: 'Error al cambiar de ficha' });
  } finally {
    client.release();
  }
}

// GET /api/aprendiz/proyectos/resumen — dashboard agregado en 2 consultas SQL
export async function getResumenAprendiz(req, res) {
  try {
    const usuarioId = req.user.usuario_id;

    const proyectoResult = await pool.query(
      `SELECT p.proyecto_id
       FROM integrantes_grupo ig
       JOIN grupos g ON g.grupo_id = ig.grupo_id
       JOIN proyectos p ON p.grupo_id = g.grupo_id
       WHERE ig.usuario_id = $1
         AND ig.estado_integrante = 'Activo'
         AND NOT g.es_general
       ORDER BY ig.fecha_ingreso DESC, p.proyecto_id DESC
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
             ORDER BY e2.evaluacion_id DESC
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
             ORDER BY e2.evaluacion_id DESC
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
    console.error('Error al obtener el resumen:', err);
    res.status(500).json({ message: 'Error al obtener el resumen' });
  }
}

// GET /api/aprendiz/proyectos/mi-ficha — devuelve el número de la ficha
// vigente del aprendiz (a través de su grupo General activo).
export async function getFichaActual(req, res) {
  try {
    const usuarioId = req.user.usuario_id;
    const { rows } = await pool.query(
      `SELECT f.numero_ficha
       FROM integrantes_grupo ig
       JOIN grupos g ON g.grupo_id = ig.grupo_id
       JOIN fichas f ON f.ficha_id = g.ficha_id
       WHERE ig.usuario_id = $1
         AND ig.estado_integrante = 'Activo'
         AND g.es_general
       ORDER BY ig.fecha_ingreso DESC, g.grupo_id DESC
       LIMIT 1`,
      [usuarioId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'No estás inscrito en ninguna ficha' });
    }
    res.json({ numero_ficha: rows[0].numero_ficha });
  } catch (err) {
    console.error('Error al obtener tu ficha actual:', err);
    res.status(500).json({ message: 'Error al obtener tu ficha actual' });
  }
}
