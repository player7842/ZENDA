// Middleware de autorización: solo deja pasar si el usuario es coordinador.
// Se usa DESPUÉS del middleware auth. Mismo patrón que isInstructor.js.

const isCoordinador = (req, res, next) => {
  if (!req.user || req.user.rol !== 'COORDINADOR') {
    return res.status(403).json({ message: 'Acceso solo para coordinadores' });
  }
  next();
};

export default isCoordinador;