export function isInstructor(req, res, next) {
  if (req.user.rol !== 'INSTRUCTOR') {
    return res.status(403).json({ message: 'Acceso solo para instructores' });
  }
  next();
}

export default isInstructor;