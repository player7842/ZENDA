// Middleware de autenticación mediante verificación de token JWT

import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  // Obtener el token del header Authorization
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No se proporcionó token de autenticación' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verificación y decodificación del token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Adjuntar info del usuario al request
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido, intenta de nuevo' });
  }
};

export default auth;
