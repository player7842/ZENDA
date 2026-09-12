/*
  AdminRoute envuelve rutas que SOLO pueden ver los administradores
  Primero verifica que haya sesión (ProtectedRoute) y luego que el rol sea admin.
  Si no es admin, lo manda al dashboard.
*/

import { Navigate } from "react-router-dom";
import { getToken, isAdmin } from "../../api";

function AdminRoute({ children }) {
  const authenticated = getToken() !== null;

  // Sin sesión => al login
  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  // Con sesión pero sin rol admin => al dashboard
  if (!isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default AdminRoute;
