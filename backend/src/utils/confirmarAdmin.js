// ====================================================================
// UTIL COMPARTIDO: verificarPassword / verificarPasswordAdmin
// ====================================================================
// El "guardián" de todas las mutaciones delicadas (admin y ahora también
// coordinador). Verifica que el usuario que pide la acción (usuario_id
// viene del JWT en req.user) existe, tiene uno de los roles permitidos
// para esa acción, y mandó su contraseña bien.
//
// Orden de checks y su HTTP code:
//   1. ¿Vino password?          -> 400
//   2. ¿El usuario existe?      -> 401
//   3. ¿Su rol está permitido?  -> 403
//   4. ¿La contraseña coincide? -> 401
// Lanza un Error con err.codigo; cada controlador lo captura y responde.

import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

// Generalizado: recibe qué roles se aceptan para esta acción en concreto.
export const verificarPassword = async (idUsuario, password, rolesPermitidos = ['ADMINISTRADOR']) => {
  if (!password) {
    const err = new Error('Necesito tu contraseña para confirmar la acción');
    err.codigo = 400;
    throw err;
  }

  const result = await pool.query(
    'SELECT usuario_id, contrasena, rol FROM usuarios WHERE usuario_id = $1',
    [idUsuario]
  );
  if (result.rows.length === 0) {
    const err = new Error('Tu usuario no existe en la base de datos');
    err.codigo = 401;
    throw err;
  }

  const usuario = result.rows[0];
  if (!rolesPermitidos.includes(usuario.rol)) {
    const err = new Error('No tienes permiso para hacer esto');
    err.codigo = 403;
    throw err;
  }

  const passwordValida = await bcrypt.compare(password, usuario.contrasena);
  if (!passwordValida) {
    const err = new Error('Contraseña incorrecta, no se hizo nada');
    err.codigo = 401;
    throw err;
  }
  return usuario;
};

// Retrocompatible: userController.js y fichasController.js siguen
// importando esto EXACTAMENTE igual que antes (import default), sin
// tocar una sola línea de esos archivos. Solo acepta ADMINISTRADOR.
const verificarPasswordAdmin = (idAdmin, password) =>
  verificarPassword(idAdmin, password, ['ADMINISTRADOR']);

export default verificarPasswordAdmin;