// ====================================================================
// UTIL COMPARTIDO: verificarPasswordAdmin
// ====================================================================
// El "guardián" de todas las mutaciones del panel admin. Verifica que el
// método que pide la acción (cuyo usuario_id viene en req.user del JWT)
// existe, es ADMINISTRADOR y mandó su contraseña bien.
// Lo usan userController y fichasController para no duplicar código.
// Orden de checks y su HTTP code:
//   1. ¿Vino password?          -> 400
//   2. ¿El usuario existe?      -> 401
//   3. ¿Su rol es ADMINISTRADOR?-> 403
//   4. ¿La contraseña coincide? -> 401
// Lanza un Error con err.codigo; cada controlador lo captura y responde.

import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

const verificarPasswordAdmin = async (idAdmin, password) => {
  if (!password) {
    const err = new Error('Necesito tu contraseña para confirmar la acción');
    err.codigo = 400;
    throw err;
  }

  const adminResult = await pool.query(
    'SELECT usuario_id, contrasena, rol FROM usuarios WHERE usuario_id = $1',
    [idAdmin]
  );
  if (adminResult.rows.length === 0) {
    const err = new Error('Tu usuario no existe en la base de datos');
    err.codigo = 401;
    throw err;
  }

  const admin = adminResult.rows[0];
  if (admin.rol !== 'ADMINISTRADOR') {
    const err = new Error('No eres admin, qué haces aquí');
    err.codigo = 403;
    throw err;
  }

  const passwordValida = await bcrypt.compare(password, admin.contrasena);
  if (!passwordValida) {
    const err = new Error('Contraseña incorrecta, no se hizo nada');
    err.codigo = 401;
    throw err;
  }
  return admin;
};

export default verificarPasswordAdmin;