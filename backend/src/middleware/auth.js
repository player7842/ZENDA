// Middleware de autenticación para verificar que no sea un tailandes hpta

import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  // Obtener el token del header Authorization
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No se proporcionó token, ¿cómo entraste sin permiso?' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verificar el token porque no confiamos en nadie
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Adjuntar info del usuario al request
    next(); // Dejar pasar al marica
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido, intenta de nuevo' });
  }
};

export default auth;
