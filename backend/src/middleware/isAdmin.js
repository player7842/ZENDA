// Middleware de autorización: solo deja pasar si el usuario es admin.
// Se usa DESPUÉS del middleware auth (que ya dejó req.user con el JWT).
//
// MR_ZENDA: el rol viene como ENUM en mayúsculas → ADMINISTRADOR (no "admin").

const isAdmin = (req, res, next) => {
  // El JWT ya trae el rol, lo puso el middleware auth en req.user
  if (!req.user || req.user.rol !== 'ADMINISTRADOR') {
    return res.status(403).json({ message: 'No eres admin, no tienes permiso pa entrar aquí' });
  }
  next(); // Dejar pasar al jefe
};

export default isAdmin;
