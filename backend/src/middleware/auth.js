// Middleware de autenticación mediante verificación de token JWT.
//
// Además de validar la firma se comprueba en base de datos que la cuenta siga
// activa y que el token pertenezca a la versión vigente. Así, al restablecer
// la contraseña se invalidan las sesiones anteriores (C-01).

import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import pool from '../config/db.js';

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No se proporcionó token de autenticación' });
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, env.jwtSecret);
  } catch {
    return res.status(401).json({ message: 'Token inválido, intenta de nuevo' });
  }

  // Los tokens de recuperación tienen otro propósito y nunca abren sesión.
  if (decoded.purpose !== 'session' || !decoded.usuario_id) {
    return res.status(401).json({ message: 'Token inválido, intenta de nuevo' });
  }

  try {
    const { rows } = await pool.query(
      'SELECT usuario_id, correo, rol, estado, token_version FROM usuarios WHERE usuario_id = $1',
      [decoded.usuario_id]
    );

    if (rows.length === 0 || rows[0].estado !== 'Activo') {
      return res.status(401).json({ message: 'La sesión ya no es válida' });
    }

    const usuario = rows[0];
    if (Number(decoded.tv ?? -1) !== Number(usuario.token_version)) {
      return res.status(401).json({ message: 'La sesión expiró, inicia sesión de nuevo' });
    }

    // Se usa el rol actual de la BD, no el que quedó congelado en el token.
    req.user = {
      usuario_id: usuario.usuario_id,
      correo: usuario.correo,
      rol: usuario.rol,
    };
    next();
  } catch (error) {
    console.error('Error al validar la sesión:', error);
    return res.status(503).json({ message: 'No se pudo validar la sesión, intenta más tarde' });
  }
};

export default auth;
