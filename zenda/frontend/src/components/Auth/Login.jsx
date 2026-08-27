/*
  Maneja el formulario de login CONECTADO AL BACKEND.
  Cuando el usuario inicia sesión, llama a POST /api/auth/login,
  guarda el token JWT en localStorage y redirige al dashboard.
  Flujo del formulario:*/

//1. Usuario llena campos
//2. Enter en correo → pasa foco a contraseña
//3. Enter en contraseña → envía formulario
//4. Si hay errores de validación → borde rojo + mensaje
//5. Si el backend rechaza → muestra el mensaje de error
//6. Si todo está bien → guarda token → redirige a /dashboard

import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { login, setToken } from "../../api";
import "../../styles/Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const passwordRef = useRef(null);
  const navigate = useNavigate();
  const { theme } = useTheme();

  // useRef permite acceder directamente a un elemento del DOM.
  // Aquí lo usamos para mover el foco al input de contraseña con Enter.

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = "El correo es requerido";
    }

    if (!password) {
      newErrors.password = "La contraseña es requerida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setServerError("");

    try {
      // Llama al backend de verdad
      const data = await login(email, password);

      // Guarda el token JWT y los datos del usuario
      setToken(data.token);
      localStorage.setItem("zenda-user", JSON.stringify(data.user));

      navigate("/dashboard");
    } catch (err) {
      // El backend nos dijo NO
      setServerError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Mueve el foco al campo de contraseña
  const handleEmailKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      passwordRef.current.focus();
    }
  };

  return (
    <div className="login-page">
      <div className="auth-card">
        {/* Logo  cambia según el tema */}
        <div className="auth-logo">
          <img
            src={
              theme === "dark"
                ? "/logos/logo-dark.png"
                : "/logos/logo-light.png"
            }
            alt="ZENDA"
          />
        </div>

        <h1 className="auth-title">Bienvenido</h1>
        <p className="auth-subtitle">Inicia sesión para continuar</p>

        <form onSubmit={handleSubmit} noValidate>
          {/* Campo: Correo */}
          <div className={`form-field ${errors.email ? "has-error" : ""}`}>
            <label htmlFor="email">Correo institucional</label>
            <div className="input-wrapper">
              {/* Icono de sobre */}
              <svg
                className="input-icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M22 4L12 13 2 4" />
              </svg>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email)
                    setErrors((prev) => ({ ...prev, email: "" }));
                }}
                onKeyDown={handleEmailKeyDown}
                placeholder="usuario@dominio.edu.co"
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <span className="field-error">{errors.email}</span>
            )}
          </div>

          {/* Campo: Contraseña */}
          <div className={`form-field ${errors.password ? "has-error" : ""}`}>
            <label htmlFor="password">Contraseña</label>
            <div className="input-wrapper">
              {/* Icono de candado */}
              <svg
                className="input-icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                id="password"
                ref={passwordRef}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password)
                    setErrors((prev) => ({ ...prev, password: "" }));
                }}
                placeholder="••••••••"
                autoComplete="current-password"
              />

              {/* Botón ojito — muestra/oculta la contraseña */}
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label="Mostrar contraseña"
              >
                {showPassword ? (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <span className="field-error">{errors.password}</span>
            )}
          </div>

          {/* Link: Olvidaste contraseña */}
          <div className="forgot-password">
            <Link to="/forgot-password">Olvidaste tu contraseña?</Link>
          </div>

          {/* Mensaje de error del servidor */}
          {serverError && <div className="server-error">{serverError}</div>}

          {/* Botón principal */}
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

        {/* Link a registro */}
        <p className="auth-footer">
          No tienes cuenta? <Link to="/register">Regístrate</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
