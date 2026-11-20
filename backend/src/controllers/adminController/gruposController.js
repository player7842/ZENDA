import pool from '../../config/db.js';
import verificarPasswordAdmin from '../../utils/confirmarAdmin.js';

export const reasignarLider = async (req, res) => {
  const client = await pool.connect();
  let transaccionAbierta = false;
  try {
    const grupoId = Number(req.params.id);
    const nuevoLiderId = Number(req.body.nuevo_lider_id);

    if (!Number.isInteger(grupoId) || grupoId <= 0 || !Number.isInteger(nuevoLiderId) || nuevoLiderId <= 0) {
      return res.status(400).json({ message: 'El grupo y el nuevo líder deben ser válidos' });
    }

    await verificarPasswordAdmin(req.user.usuario_id, req.body.password);
    await client.query('BEGIN');
    transaccionAbierta = true;

    const grupo = await client.query(
      'SELECT grupo_id, es_general FROM grupos WHERE grupo_id = $1 FOR UPDATE',
      [grupoId],
    );
    if (grupo.rowCount === 0) {
      await client.query('ROLLBACK');
      transaccionAbierta = false;
      return res.status(404).json({ message: 'Grupo no encontrado' });
    }
    if (grupo.rows[0].es_general) {
      await client.query('ROLLBACK');
      transaccionAbierta = false;
      return res.status(400).json({ message: 'No se puede reasignar el liderazgo del grupo General' });
    }

    const integrante = await client.query(
      `SELECT u.usuario_id
       FROM integrantes_grupo ig
       JOIN usuarios u ON u.usuario_id = ig.usuario_id
       WHERE ig.grupo_id = $1 AND ig.usuario_id = $2
         AND ig.estado_integrante = 'Activo' AND u.rol = 'APRENDIZ' AND u.estado = 'Activo'`,
      [grupoId, nuevoLiderId],
    );
    if (integrante.rowCount === 0) {
      await client.query('ROLLBACK');
      transaccionAbierta = false;
      return res.status(400).json({ message: 'El nuevo líder debe ser un aprendiz activo del grupo' });
    }

    await client.query('UPDATE grupos SET lider_id = $1 WHERE grupo_id = $2', [nuevoLiderId, grupoId]);
    await client.query('COMMIT');
    transaccionAbierta = false;
    return res.json({ message: 'Liderazgo reasignado correctamente', grupo_id: grupoId, lider_id: nuevoLiderId });
  } catch (error) {
    if (transaccionAbierta) await client.query('ROLLBACK');
    if (error.codigo) return res.status(error.codigo).json({ message: error.message });
    console.error('Error al reasignar liderazgo:', error);
    return res.status(500).json({ message: 'Error al reasignar liderazgo' });
  } finally {
    client.release();
  }
};
