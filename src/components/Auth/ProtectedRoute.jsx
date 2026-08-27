/*
  Envuelve componentes que solo deben verse si el usuario inició sesión.
  Si no hay token JWT válido, redirige al login.
*/

import { Navigate } from "react-router-dom";
import { getToken } from "../../api";

function ProtectedRoute({ children }) {
  const isAuthenticated = getToken() !== null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
