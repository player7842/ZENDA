import { Navigate } from "react-router-dom";
import { getToken, getStoredUser } from "../../api.js";

export default function AprendizRoute({ children }) {
  if (!getToken()) return <Navigate to="/login" />;
  const user = getStoredUser();
  if (user?.rol !== "APRENDIZ") return <Navigate to="/dashboard" />;
  return children;
}