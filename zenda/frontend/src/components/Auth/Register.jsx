/*
  Formulario de registro de nuevos usuarios CONECTADO AL BACKEND

  Envía POST /api/auth/register con los datos del usuario
  Si el backend acepta, devuelve token + user y nos manda al login
  Si el backend rechaza (ej. correo duplicado), muestra el error

  MR_ZENDA: el backend espera `correo` (no email) y un aprendiz se vincula
  a su ficha desde el panel admin (la relación va por grupos lo nuevo) así que
  aquí ya no hay selector de ficha.

  Diferencia con Login: aquí usamos un solo objeto (formData) en vez de 
  estados separados, porque hay muchos campos. Si usáramos estados sueltos,
  tendríamos 8 useState diferentes — con formData es uno solo
*/

import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { register } from "../../api";
import "../../styles/Register.css";

function Register() {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    tipoDocumento: "",
    numeroDocumento: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();
  // useRef permite acceder directamente a elementos del DOM.
  // Aquí los usamos para mover el foco con Enter de un campo al siguiente
  const refs = {
    apellido: useRef(null),
    email: useRef(null),
    tipoDocumento: useRef(null),
    numeroDocumento: useRef(null),
    password: useRef(null),
    confirmPassword: useRef(null),
  };

  const tiposDocumento = [
    { value: "", label: "Seleccione tipo" },
    { value: "CC", label: "Cédula de Ciudadanía" },
    { value: "TI", label: "Tarjeta de Identidad" },
    { value: "CE", label: "Cédula de Extranjería" },
    { value: "PA", label: "Pasaporte" },
  ];

  // Actualiza el campo que cambió y limpia su error
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Mueve el foco al siguiente campo con Enter
  const handleKeyDown = (nextRef) => (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      nextRef.current?.focus();
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es requerido";
    if (!formData.apellido.trim())
      newErrors.apellido = "El apellido es requerido";
    if (!formData.email) newErrors.email = "El correo es requerido";
    if (!formData.tipoDocumento) newErrors.tipoDocumento = "Seleccione un tipo";
    if (!formData.numeroDocumento)
      newErrors.numeroDocumento = "El número es requerido";

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 8) {
      newErrors.password = "Mínimo 8 caracteres";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirme su contraseña";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
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
      // Mapea los campos del formulario (camelCase) a los que espera el backend (snake_case)
      await register({
        nombre: formData.nombre,
        apellido: formData.apellido,
        correo: formData.email,
        tipo_documento: formData.tipoDocumento,
        numero_documento: formData.numeroDocumento,
        password: formData.password,
      });

      // Registro exitoso → manda al login
      alert("Registro exitoso. Por favor inicia sesión.");
      navigate("/login");
    } catch (err) {
      // El backend dijo NO (correo duplicado, error de servidor, etc.)
      setServerError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="auth-card register-card">
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

        <h1 className="auth-title">Crear cuenta</h1>
        <p className="auth-subtitle">Completa tus datos para registrarte</p>

        <form onSubmit={handleSubmit} noValidate>
          {/* Fila: Nombre + Apellido */}
          <div className="form-row">
            <div className={`form-field ${errors.nombre ? "has-error" : ""}`}>
              <label>Nombre</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                onKeyDown={handleKeyDown(refs.apellido)}
                placeholder="Tu nombre"
              />
              {errors.nombre && (
                <span className="field-error">{errors.nombre}</span>
              )}
            </div>

            <div className={`form-field ${errors.apellido ? "has-error" : ""}`}>
              <label>Apellido</label>
              <input
                ref={refs.apellido}
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                onKeyDown={handleKeyDown(refs.email)}
                placeholder="Tu apellido"
              />
              {errors.apellido && (
                <span className="field-error">{errors.apellido}</span>
              )}
            </div>
          </div>

          {/* Correo */}
          <div className={`form-field ${errors.email ? "has-error" : ""}`}>
            <label>Correo institucional</label>
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
                ref={refs.email}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onKeyDown={handleKeyDown(refs.tipoDocumento)}
                placeholder="usuario@dominio.edu.co"
              />
            </div>
            {errors.email && (
              <span className="field-error">{errors.email}</span>
            )}
          </div>

          {/* Fila: Tipo Documento + N° Documento */}
          <div className="form-row">
            <div
              className={`form-field ${errors.tipoDocumento ? "has-error" : ""}`}
            >
              <label>Tipo documento</label>
              <select
                ref={refs.tipoDocumento}
                name="tipoDocumento"
                value={formData.tipoDocumento}
                onChange={handleChange}
                onKeyDown={handleKeyDown(refs.numeroDocumento)}
              >
                {tiposDocumento.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              {errors.tipoDocumento && (
                <span className="field-error">{errors.tipoDocumento}</span>
              )}
            </div>

            <div
              className={`form-field ${errors.numeroDocumento ? "has-error" : ""}`}
            >
              <label>N° documento</label>
              <input
                ref={refs.numeroDocumento}
                type="text"
                name="numeroDocumento"
                value={formData.numeroDocumento}
                onChange={handleChange}
                onKeyDown={handleKeyDown(refs.password)}
                placeholder="Número"
              />
              {errors.numeroDocumento && (
                <span className="field-error">{errors.numeroDocumento}</span>
              )}
            </div>
          </div>

          {/* Contraseña */}
          <div className={`form-field ${errors.password ? "has-error" : ""}`}>
            <label>Contraseña</label>
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
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                ref={refs.password}
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onKeyDown={handleKeyDown(refs.confirmPassword)}
                placeholder="Mínimo 8 caracteres"
              />
            </div>
            {errors.password && (
              <span className="field-error">{errors.password}</span>
            )}
          </div>

          {/* Confirmar Contraseña */}
          <div
            className={`form-field ${errors.confirmPassword ? "has-error" : ""}`}
          >
            <label>Confirmar contraseña</label>
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
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                ref={refs.confirmPassword}
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repita su contraseña"
              />
            </div>
            {errors.confirmPassword && (
              <span className="field-error">{errors.confirmPassword}</span>
            )}
          </div>

          {/* Error del servidor */}
          {serverError && <div className="server-error">{serverError}</div>}

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? "Creando cuenta..." : "Registrarse"}
          </button>
        </form>

        <p className="auth-footer">
          Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
