/*
  Rutas del app.
  - El panel de admin (/admin) ES el dashboard principal. La raíz / manda ahí.
  - /dashboard es una landing simple SOLO para usuarios no-admin (aprendiz/
    instructor), que no tienen acceso al panel de administración.
  - Todo lo demás que no exista → al login.
*/

import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import ForgotPassword from "./components/Auth/ForgotPassword";
import ResetPassword from "./components/Auth/ResetPassword";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import AdminRoute from "./components/Auth/AdminRoute";
import DashboardLite from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Aprendiz from './pages/aprendiz.jsx';
import AprendizRoute from './components/Auth/AprendizRoute.jsx';

//INSTRUCTOR
import Instructor from './pages/instructor.jsx';
import InstructorRoute from './components/Auth/InstructorRoute.jsx';

// COORDINADOR
import Coordinador from './pages/coordinador.jsx';
import CoordinadorRoute from './components/Auth/CoordinadorRoute.jsx';
// HOMEPAGE
import Home from "./pages/Home.jsx";
import { getToken, getStoredUser, getRutaPorRol } from "./api";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* ANTES: <Route path="/" element={<Navigate to="/admin" replace />} /> */}
      <Route
        path="/"
        element={
          getToken()
            ? <Navigate to={getRutaPorRol(getStoredUser()?.rol)} replace />
            : <Home />
        }
      />
      {/* La raíz va directo al panel admin (que es el dashboard) */}
      <Route path="/" element={<Navigate to="/admin" replace />} />

      {/* Landing simple para usuarios sin rol admin */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLite />
          </ProtectedRoute>
        }
      />

      {/* El panel de administración: solo admins */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <Admin />
          </AdminRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />

      <Route path="/instructor" element={
        <InstructorRoute><Instructor /></InstructorRoute>
      } />

      <Route path="/aprendiz" element={
        <AprendizRoute><Aprendiz /></AprendizRoute>
      } />
      <Route path="/coordinador" element={
        <CoordinadorRoute><Coordinador /></CoordinadorRoute>
      } />
    </Routes>
  );
}

export default App;