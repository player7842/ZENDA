//1. Usuario ingresa su correo
//2. Se envía un enlace de recuperación (simulado)
//3. Muestra mensaje de confirmación

import { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import "../../styles/ForgotPassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("El correo es requerido");
      return;
    }

    setIsLoading(true);

    // Simula envío de correo
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
    }, 1500);
  };

  // Pantalla de confirmación después de enviar
  if (isSent) {
    return (
      <div className="login-page">
        <div className="auth-card forgot-card">
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

          <div className="forgot-icon">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          </div>

          <h1 className="auth-title">Correo enviado</h1>
          <p className="forgot-sent-text">
            Revisa tu bandeja de entrada y sigue las instrucciones para
            restablecer tu contraseña.
          </p>

          <Link to="/login" className="btn-primary">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="auth-card forgot-card">
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

        <h1 className="auth-title">Recuperar contraseña</h1>
        <p className="auth-subtitle">
          Ingresa tu correo institucional y te enviaremos un enlace para
          restablecer tu contraseña.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className={`form-field ${error ? "has-error" : ""}`}>
            <label htmlFor="email">Correo institucional</label>
            <div className="input-wrapper">
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
                  if (error) setError("");
                }}
                placeholder="usuario@dominio.edu.co"
                autoFocus
              />
            </div>
            {error && <span className="field-error">{error}</span>}
          </div>

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? "Enviando..." : "Enviar enlace"}
          </button>
        </form>

        <p className="auth-footer">
          <Link to="/login">Volver al inicio de sesión</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
