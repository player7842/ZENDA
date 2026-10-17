export function isAprendiz(req, res, next) {
  if (req.user.rol !== 'APRENDIZ') {
    return res.status(403).json({ message: 'Acceso solo para aprendices' });
  }
  next();
}

export default isAprendiz;