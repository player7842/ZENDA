import { Navigate } from 'react-router-dom';
import { getToken, getStoredUser } from '../../api.js';

export default function InstructorRoute({ children }) {
  if (!getToken()) return <Navigate to="/login" />;
  const user = getStoredUser();
  if (user?.rol !== 'INSTRUCTOR') return <Navigate to="/dashboard" />;
  return children;
}