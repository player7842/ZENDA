/*
  Controller de TAREAS — trabajo interno del proyecto (NO académico tipo Classroom).
  Flujo de estados (fijo, según especificación):
    Pendiente -> En proceso -> Finalizada -> Confirmada
                                          -> Incompleta -> En proceso (reintento)
  Reglas:
    - Solo el Scrum Master (líder del grupo) crea y asigna tareas.
    - El responsable asignado mueve: Pendiente->En proceso->Finalizada.
    - Solo el líder confirma o marca incompleta una tarea Finalizada.
    - Las tareas viven a nivel de PROYECTO (no de fase), según decisión del equipo.
*/

import pool from '../../config/db.js';

const PRIORIDADES_VALIDAS = ['Alta', 'Media', 'Baja'];

// Transiciones permitidas: estado_actual -> { estado_nuevo: 'lider' | 'responsable' }
const TRANSICIONES = {
    'Pendiente': { 'En proceso': 'responsable' },
    'En proceso': { 'Finalizada': 'responsable' },
    'Finalizada': { 'Confirmada': 'lider', 'Incompleta': 'lider' },
    'Incompleta': { 'En proceso': 'responsable' },
};

// Busca el proyecto activo del usuario (a través de su grupo distinto de "General")
async function obtenerProyectoDelUsuario(usuarioId) {
    const { rows } = await pool.query(
        `SELECT g.grupo_id, g.lider_id, p.proyecto_id
     FROM integrantes_grupo ig
     JOIN grupos g ON g.grupo_id = ig.grupo_id
     JOIN proyectos p ON p.grupo_id = g.grupo_id
     WHERE ig.usuario_id = $1 AND ig.estado_integrante = 'Activo' AND g.nombre_grupo <> 'General'
     LIMIT 1`,
        [usuarioId]
    );
    return rows[0] || null;
}

// POST /api/aprendiz/proyectos/tareas — el líder crea y asigna una tarea
export async function crearTarea(req, res) {
    try {
        const usuarioId = req.user.usuario_id;
        const { titulo, descripcion, prioridad, responsable_id, fecha_inicio, fecha_limite } = req.body;

        if (!titulo || !responsable_id) {
            return res.status(400).json({ message: 'Faltan el título o el responsable de la tarea' });
        }
        if (prioridad && !PRIORIDADES_VALIDAS.includes(prioridad)) {
            return res.status(400).json({ message: 'Prioridad inválida' });
        }

        const proyecto = await obtenerProyectoDelUsuario(usuarioId);
        if (!proyecto) {
            return res.status(404).json({ message: 'No perteneces a ningún proyecto activo' });
        }
        if (proyecto.lider_id !== usuarioId) {
            return res.status(403).json({ message: 'Solo el Scrum Master puede crear y asignar tareas' });
        }

        // El responsable debe ser integrante activo del mismo grupo
        const esIntegrante = await pool.query(
            `SELECT 1 FROM integrantes_grupo WHERE grupo_id = $1 AND usuario_id = $2 AND estado_integrante = 'Activo'`,
            [proyecto.grupo_id, responsable_id]
        );
        if (esIntegrante.rowCount === 0) {
            return res.status(400).json({ message: 'El responsable no pertenece a tu grupo' });
        }

        const { rows } = await pool.query(
            `INSERT INTO tareas (proyecto_id, responsable_id, titulo, descripcion, prioridad, estado, fecha_inicio, fecha_limite)
       VALUES ($1, $2, $3, $4, $5, 'Pendiente', $6, $7)
       RETURNING tarea_id`,
            [proyecto.proyecto_id, responsable_id, titulo, descripcion || null, prioridad || 'Media', fecha_inicio || null, fecha_limite || null]
        );

        res.status(201).json({ tarea_id: rows[0].tarea_id });
    } catch (err) {
        res.status(500).json({ message: 'Error al crear la tarea' });
    }
}

// GET /api/aprendiz/proyectos/tareas — lista las tareas del proyecto propio
export async function getTareasDeMiProyecto(req, res) {
    try {
        const usuarioId = req.user.usuario_id;
        const proyecto = await obtenerProyectoDelUsuario(usuarioId);
        if (!proyecto) {
            return res.status(404).json({ message: 'No perteneces a ningún proyecto activo' });
        }

        const { rows } = await pool.query(
            `SELECT t.tarea_id, t.titulo, t.descripcion, t.prioridad, t.estado,
              t.fecha_inicio, t.fecha_limite, t.fecha_finalizacion,
              u.usuario_id AS responsable_id, u.nombre AS responsable_nombre, u.apellido AS responsable_apellido
       FROM tareas t
       JOIN usuarios u ON u.usuario_id = t.responsable_id
       WHERE t.proyecto_id = $1
       ORDER BY
         CASE t.estado
           WHEN 'En proceso' THEN 1
           WHEN 'Pendiente' THEN 2
           WHEN 'Incompleta' THEN 3
           WHEN 'Finalizada' THEN 4
           WHEN 'Confirmada' THEN 5
         END,
         t.fecha_limite NULLS LAST`,
            [proyecto.proyecto_id]
        );

        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener las tareas' });
    }
}

// PUT /api/aprendiz/proyectos/tareas/:id/estado — mover una tarea en su flujo
export async function cambiarEstadoTarea(req, res) {
    try {
        const usuarioId = req.user.usuario_id;
        const { id } = req.params;
        const { estado: nuevoEstado } = req.body;

        const { rows } = await pool.query(
            `SELECT t.tarea_id, t.estado, t.responsable_id, g.lider_id
       FROM tareas t
       JOIN proyectos p ON p.proyecto_id = t.proyecto_id
       JOIN grupos g ON g.grupo_id = p.grupo_id
       WHERE t.tarea_id = $1`,
            [id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Tarea no encontrada' });
        }
        const tarea = rows[0];

        const esLider = tarea.lider_id === usuarioId;
        const esResponsable = tarea.responsable_id === usuarioId;
        if (!esLider && !esResponsable) {
            return res.status(403).json({ message: 'No tienes relación con esta tarea' });
        }

        const permitido = TRANSICIONES[tarea.estado]?.[nuevoEstado];
        if (!permitido) {
            return res.status(400).json({ message: `No se puede pasar de "${tarea.estado}" a "${nuevoEstado}"` });
        }
        if (permitido === 'lider' && !esLider) {
            return res.status(403).json({ message: 'Solo el Scrum Master puede confirmar o rechazar esta tarea' });
        }
        if (permitido === 'responsable' && !esResponsable) {
            return res.status(403).json({ message: 'Solo el responsable puede mover esta tarea' });
        }

        // Al finalizar se registra la fecha; al reintentar desde Incompleta se limpia
        let setFecha = '';
        if (nuevoEstado === 'Finalizada') setFecha = ', fecha_finalizacion = now()';
        if (nuevoEstado === 'En proceso' && tarea.estado === 'Incompleta') setFecha = ', fecha_finalizacion = NULL';

        await pool.query(
            `UPDATE tareas SET estado = $1 ${setFecha} WHERE tarea_id = $2`,
            [nuevoEstado, id]
        );

        res.json({ message: 'Tarea actualizada', estado: nuevoEstado });
    } catch (err) {
        res.status(500).json({ message: 'Error al actualizar la tarea' });
    }
}

// GET /api/aprendiz/proyectos/tareas/progreso — % de tareas confirmadas
export async function getProgresoTareas(req, res) {
    try {
        const usuarioId = req.user.usuario_id;
        const proyecto = await obtenerProyectoDelUsuario(usuarioId);
        if (!proyecto) {
            return res.status(404).json({ message: 'No perteneces a ningún proyecto activo' });
        }

        const { rows } = await pool.query(
            `SELECT count(*)::int AS total,
              count(*) FILTER (WHERE estado = 'Confirmada')::int AS confirmadas
       FROM tareas WHERE proyecto_id = $1`,
            [proyecto.proyecto_id]
        );
        const { total, confirmadas } = rows[0];
        const porcentaje = total > 0 ? Math.round((confirmadas / total) * 100) : 0;

        res.json({ total, confirmadas, porcentaje });
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener el progreso' });
    }
}