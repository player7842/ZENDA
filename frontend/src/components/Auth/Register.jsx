/*
  Formulario de Registro — ZENDA
  UI/UX Pro: Integración visual completa, validación estricta de 6 a 11 dígitos,
  ojo para ver/ocultar contraseña y cumplimiento de Ley 1581 de 2012 (Habeas Data).
*/

import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  User, 
  Mail, 
  CreditCard, 
  Hash, 
  BookOpen, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  AlertCircle 
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { register, getFichasPublicas } from "../../api";
import "../../styles/Register.css";

const CORREO_INSTITUCIONAL = /^[^\s@]+@soy\.sena\.edu\.co$/i;

function calcularFuerzaPassword(password) {
  let puntaje = 0;
  if (password.length >= 8) puntaje += 1;
  if (password.length >= 12) puntaje += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) puntaje += 1;
  if (/\d/.test(password)) puntaje += 1;
  if (/[^A-Za-z0-9]/.test(password)) puntaje += 1;
  return Math.min(puntaje, 5);
}

const ETIQUETAS_FUERZA = ["Muy débil", "Débil", "Aceptable", "Buena", "Fuerte", "Muy fuerte"];

function Register() {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    tipoDocumento: "CC",
    numeroDocumento: "",
    password: "",
    confirmPassword: "",
    numeroFicha: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);
  const [aceptaCookies, setAceptaCookies] = useState(false);
  const [aceptaTratamientoDatos, setAceptaTratamientoDatos] = useState(false);
  const [mostrarModalLey, setMostrarModalLey] = useState(false);

  const [fichas, setFichas] = useState([]);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fuerzaPassword = calcularFuerzaPassword(formData.password);
  
  const navigate = useNavigate();
  const { theme } = useTheme();

  const refs = {
    apellido: useRef(null),
    email: useRef(null),
    tipoDocumento: useRef(null),
    numeroDocumento: useRef(null),
    numeroFicha: useRef(null),
    password: useRef(null),
    confirmPassword: useRef(null),
  };

  useEffect(() => {
    getFichasPublicas().then(setFichas).catch(() => setFichas([]));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Filtro estricto: Solo números y máximo 11 dígitos para el documento
    if (name === "numeroDocumento") {
      const soloNumeros = value.replace(/\D/g, "").slice(0, 11);
      setFormData((prev) => ({ ...prev, [name]: soloNumeros }));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleKeyDown = (nextRef) => (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      nextRef.current?.focus();
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es requerido";
    if (!formData.apellido.trim()) newErrors.apellido = "El apellido es requerido";
    
    if (!formData.email.trim()) {
      newErrors.email = "El correo es requerido";
    } else if (!CORREO_INSTITUCIONAL.test(formData.email.trim().toLowerCase())) {
      newErrors.email = "Usa tu correo institucional usuario@soy.sena.edu.co";
    }

    if (!formData.tipoDocumento) newErrors.tipoDocumento = "Seleccione un tipo";
    
    if (!formData.numeroDocumento) {
      newErrors.numeroDocumento = "El número es requerido";
    } else if (formData.numeroDocumento.length < 6) {
      newErrors.numeroDocumento = "Mínimo 6 dígitos";
    } else if (formData.numeroDocumento.length > 11) {
      newErrors.numeroDocumento = "Máximo 11 dígitos";
    }

    if (!formData.numeroFicha) newErrors.numeroFicha = "Seleccione su ficha";

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 8) {
      newErrors.password = "Mínimo 8 caracteres";
    } else if (fuerzaPassword < 2) {
      newErrors.password = "Usa una contraseña más segura (letras y números)";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirme su contraseña";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    if (!aceptaTratamientoDatos) {
      newErrors.habeasData = "Debes autorizar el tratamiento de datos (Ley 1581 de 2012)";
    }
    if (!aceptaTerminos) newErrors.terminos = "Debes aceptar los términos de uso";
    if (!aceptaPrivacidad) newErrors.privacidad = "Debes aceptar la política de privacidad";
    if (!aceptaCookies) newErrors.cookies = "Debes aceptar el uso de cookies";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setServerError("");

    try {
      await register({
        nombre: formData.nombre,
        apellido: formData.apellido,
        correo: formData.email,
        tipo_documento: formData.tipoDocumento,
        numero_documento: formData.numeroDocumento,
        password: formData.password,
        numero_ficha: formData.numeroFicha,
        acepta_terminos: aceptaTerminos,
        acepta_privacidad: aceptaPrivacidad,
        acepta_cookies: aceptaCookies,
        acepta_tratamiento_datos: aceptaTratamientoDatos,
      });

      alert("Registro exitoso. Por favor inicia sesión.");
      navigate("/login");
    } catch (err) {
      setServerError(err.message || "Error al registrar usuario");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div 
        className="auth-card register-card" 
        style={{ 
          maxWidth: 540, 
          width: "100%", 
          margin: "24px auto", 
          padding: 32,
          borderRadius: 16,
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
        }}
      >
        <div className="auth-logo" style={{ textAlign: "center", marginBottom: 16 }}>
          <img
            src={theme === "dark" ? "/logos/logo-dark.png" : "/logos/logo-light.png"}
            alt="ZENDA"
            style={{ maxHeight: 52, width: "auto" }}
          />
        </div>
        <h1 className="auth-title" style={{ textAlign: "center", fontSize: "1.6rem", fontWeight: 700, margin: "0 0 6px" }}>Crear cuenta</h1>
        <p className="auth-subtitle" style={{ textAlign: "center", fontSize: "0.9rem", opacity: 0.8, marginBottom: 24 }}>Ingresa tus datos para registrarte en el sistema</p>

        <form onSubmit={handleSubmit} noValidate>
          {/* Nombres y Apellidos */}
          <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className={`form-field ${errors.nombre ? "has-error" : ""}`}>
              <label style={{ fontSize: "0.82rem", fontWeight: 600, marginBottom: 6, display: "block" }}>Nombre</label>
              <div className="input-wrapper" style={{ position: "relative" }}>
                <User className="input-icon" size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.6 }} />
                <input
                  type="text" name="nombre" value={formData.nombre}
                  onChange={handleChange} onKeyDown={handleKeyDown(refs.apellido)}
                  placeholder="Tu nombre"
                  style={{ width: "100%", paddingLeft: 38, height: 42, borderRadius: 8 }}
                />
              </div>
              {errors.nombre && <span className="field-error" style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: 4, display: "block" }}>{errors.nombre}</span>}
            </div>

            <div className={`form-field ${errors.apellido ? "has-error" : ""}`}>
              <label style={{ fontSize: "0.82rem", fontWeight: 600, marginBottom: 6, display: "block" }}>Apellido</label>
              <div className="input-wrapper" style={{ position: "relative" }}>
                <User className="input-icon" size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.6 }} />
                <input
                  ref={refs.apellido} type="text" name="apellido" value={formData.apellido}
                  onChange={handleChange} onKeyDown={handleKeyDown(refs.email)}
                  placeholder="Tu apellido"
                  style={{ width: "100%", paddingLeft: 38, height: 42, borderRadius: 8 }}
                />
              </div>
              {errors.apellido && <span className="field-error" style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: 4, display: "block" }}>{errors.apellido}</span>}
            </div>
          </div>

          {/* Correo Electrónico */}
          <div className={`form-field ${errors.email ? "has-error" : ""}`} style={{ marginTop: 14 }}>
            <label style={{ fontSize: "0.82rem", fontWeight: 600, marginBottom: 6, display: "block" }}>Correo electrónico</label>
            <div className="input-wrapper" style={{ position: "relative" }}>
              <Mail className="input-icon" size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.6 }} />
              <input
                ref={refs.email} type="email" name="email" value={formData.email}
                onChange={handleChange} onKeyDown={handleKeyDown(refs.tipoDocumento)}
                placeholder="usuario@dominio.com"
                style={{ width: "100%", paddingLeft: 38, height: 42, borderRadius: 8 }}
              />
            </div>
            {errors.email && <span className="field-error" style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: 4, display: "block" }}>{errors.email}</span>}
          </div>

          {/* Tipo y Número de Documento */}
          <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 14 }}>
            <div className={`form-field ${errors.tipoDocumento ? "has-error" : ""}`}>
              <label style={{ fontSize: "0.82rem", fontWeight: 600, marginBottom: 6, display: "block" }}>Tipo documento</label>
              <div className="input-wrapper" style={{ position: "relative" }}>
                <CreditCard className="input-icon" size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.6 }} />
                <select
                  ref={refs.tipoDocumento} 
                  name="tipoDocumento" 
                  value={formData.tipoDocumento}
                  onChange={handleChange} 
                  onKeyDown={handleKeyDown(refs.numeroDocumento)}
                  style={{ width: "100%", paddingLeft: 38, height: 42, borderRadius: 8, cursor: "pointer" }}
                >
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="TI">Tarjeta de Identidad</option>
                  <option value="CE">Cédula de Extranjería</option>
                  <option value="PA">Pasaporte</option>
                  <option value="PPT">Permiso por Protección Temporal (PPT)</option>
                </select>
              </div>
              {errors.tipoDocumento && <span className="field-error" style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: 4, display: "block" }}>{errors.tipoDocumento}</span>}
            </div>

            <div className={`form-field ${errors.numeroDocumento ? "has-error" : ""}`}>
              <label style={{ fontSize: "0.82rem", fontWeight: 600, marginBottom: 6, display: "block" }}>N° documento</label>
              <div className="input-wrapper" style={{ position: "relative" }}>
                <Hash className="input-icon" size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.6 }} />
                <input
                  ref={refs.numeroDocumento} 
                  type="text" 
                  name="numeroDocumento" 
                  value={formData.numeroDocumento}
                  onChange={handleChange} 
                  onKeyDown={handleKeyDown(refs.numeroFicha)}
                  placeholder="6 a 11 dígitos" 
                  maxLength={11}
                  style={{ width: "100%", paddingLeft: 38, height: 42, borderRadius: 8 }}
                />
              </div>
              {errors.numeroDocumento && <span className="field-error" style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: 4, display: "block" }}>{errors.numeroDocumento}</span>}
            </div>
          </div>

          {/* Ficha ADSO */}
          <div className={`form-field ${errors.numeroFicha ? "has-error" : ""}`} style={{ marginTop: 14 }}>
            <label style={{ fontSize: "0.82rem", fontWeight: 600, marginBottom: 6, display: "block" }}>Ficha (ADSO)</label>
            <div className="input-wrapper" style={{ position: "relative" }}>
              <BookOpen className="input-icon" size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.6 }} />
              <select
                ref={refs.numeroFicha} 
                name="numeroFicha" 
                value={formData.numeroFicha}
                onChange={handleChange} 
                onKeyDown={handleKeyDown(refs.password)}
                style={{ width: "100%", paddingLeft: 38, height: 42, borderRadius: 8, cursor: "pointer" }}
              >
                <option value="">Seleccione su ficha</option>
                {fichas.map((f) => (
                  <option key={f.ficha_id} value={f.numero_ficha}>
                    Ficha {f.numero_ficha} — {f.jornada}
                  </option>
                ))}
              </select>
            </div>
            {errors.numeroFicha && <span className="field-error" style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: 4, display: "block" }}>{errors.numeroFicha}</span>}
          </div>

          {/* Contraseña con visualizador */}
          <div className={`form-field ${errors.password ? "has-error" : ""}`} style={{ marginTop: 14 }}>
            <label style={{ fontSize: "0.82rem", fontWeight: 600, marginBottom: 6, display: "block" }}>Contraseña</label>
            <div className="input-wrapper" style={{ position: "relative" }}>
              <Lock className="input-icon" size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.6 }} />
              <input
                ref={refs.password} 
                type={showPassword ? "text" : "password"} 
                name="password" 
                value={formData.password}
                onChange={handleChange} 
                onKeyDown={handleKeyDown(refs.confirmPassword)}
                placeholder="Mínimo 8 caracteres"
                onPaste={(e) => {
                  e.preventDefault();
                  setErrors((prev) => ({
                    ...prev,
                    password: "Por seguridad, escribe la contraseña manualmente",
                  }));
                }}
                style={{ width: "100%", paddingLeft: 38, paddingRight: 40, height: 42, borderRadius: 8 }}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label="Mostrar contraseña"
                style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", opacity: 0.6 }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div style={{ marginTop: 6 }}>
              <div style={{ display: "flex", gap: 4 }} aria-hidden="true">
                {[1, 2, 3, 4, 5].map((nivel) => (
                  <span
                    key={nivel}
                    style={{
                      height: 5,
                      flex: 1,
                      borderRadius: 999,
                      backgroundColor:
                        formData.password && fuerzaPassword >= nivel
                          ? ["#ef4444", "#f97316", "#eab308", "#22c55e", "#15803d"][fuerzaPassword - 1]
                          : "rgba(148, 163, 184, 0.25)",
                    }}
                  />
                ))}
              </div>
              {formData.password && (
                <span style={{ fontSize: "0.72rem", opacity: 0.8 }}>
                  Seguridad: {ETIQUETAS_FUERZA[fuerzaPassword]}
                </span>
              )}
            </div>
            {errors.password && <span className="field-error" style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: 4, display: "block" }}>{errors.password}</span>}
          </div>

          {/* Confirmar Contraseña con visualizador */}
          <div className={`form-field ${errors.confirmPassword ? "has-error" : ""}`} style={{ marginTop: 14 }}>
            <label style={{ fontSize: "0.82rem", fontWeight: 600, marginBottom: 6, display: "block" }}>Confirmar contraseña</label>
            <div className="input-wrapper" style={{ position: "relative" }}>
              <Lock className="input-icon" size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.6 }} />
              <input
                ref={refs.confirmPassword} 
                type={showConfirmPassword ? "text" : "password"} 
                name="confirmPassword" 
                value={formData.confirmPassword}
                onChange={handleChange} 
                onPaste={(e) => {
                  e.preventDefault();
                  setErrors((prev) => ({
                    ...prev,
                    confirmPassword: "Por seguridad, escribe la contraseña manualmente",
                  }));
                }}
                placeholder="Repita su contraseña"
                style={{ width: "100%", paddingLeft: 38, paddingRight: 40, height: 42, borderRadius: 8 }}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label="Mostrar contraseña"
                style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", opacity: 0.6 }}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && <span className="field-error" style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: 4, display: "block" }}>{errors.confirmPassword}</span>}
          </div>

          {/* Aceptaciones legales obligatorias (RN-004) */}
          <div style={{ margin: "18px 0 4px", fontSize: "0.8rem", display: "grid", gap: 8 }}>
            <label style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={aceptaTerminos}
                onChange={(e) => {
                  setAceptaTerminos(e.target.checked);
                  if (errors.terminos) setErrors((prev) => ({ ...prev, terminos: "" }));
                }}
                style={{ marginTop: 3, width: "auto", cursor: "pointer" }}
              />
              <span style={{ opacity: 0.9, lineHeight: 1.4 }}>Acepto los términos de uso de ZENDA.</span>
            </label>
            {errors.terminos && <span style={{ fontSize: "0.75rem", color: "#ef4444" }}>{errors.terminos}</span>}

            <label style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={aceptaPrivacidad}
                onChange={(e) => {
                  setAceptaPrivacidad(e.target.checked);
                  if (errors.privacidad) setErrors((prev) => ({ ...prev, privacidad: "" }));
                }}
                style={{ marginTop: 3, width: "auto", cursor: "pointer" }}
              />
              <span style={{ opacity: 0.9, lineHeight: 1.4 }}>Acepto la política de privacidad.</span>
            </label>
            {errors.privacidad && <span style={{ fontSize: "0.75rem", color: "#ef4444" }}>{errors.privacidad}</span>}

            <label style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={aceptaCookies}
                onChange={(e) => {
                  setAceptaCookies(e.target.checked);
                  if (errors.cookies) setErrors((prev) => ({ ...prev, cookies: "" }));
                }}
                style={{ marginTop: 3, width: "auto", cursor: "pointer" }}
              />
              <span style={{ opacity: 0.9, lineHeight: 1.4 }}>Acepto el uso de cookies necesarias para la sesión.</span>
            </label>
            {errors.cookies && <span style={{ fontSize: "0.75rem", color: "#ef4444" }}>{errors.cookies}</span>}
          </div>

          {/* Casilla de Habeas Data Ley 1581 */}
          <div style={{ margin: "18px 0 14px", fontSize: "0.8rem" }}>
            <label style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={aceptaTratamientoDatos}
                onChange={(e) => {
                  setAceptaTratamientoDatos(e.target.checked);
                  if (errors.habeasData) setErrors((prev) => ({ ...prev, habeasData: "" }));
                }}
                style={{ marginTop: 3, width: "auto", cursor: "pointer" }}
              />
              <span style={{ opacity: 0.9, lineHeight: 1.4 }}>
                Autorizo el tratamiento de mis datos personales de acuerdo con la{" "}
                <button
                  type="button"
                  onClick={() => setMostrarModalLey(true)}
                  style={{ background: "none", border: "none", color: "var(--color-primary, #1e7e22)", textDecoration: "underline", padding: 0, cursor: "pointer", font: "inherit", fontWeight: 600 }}
                >
                  Ley 1581 de 2012
                </button>.
              </span>
            </label>
            {errors.habeasData && <span className="field-error" style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: 4, display: "block" }}>{errors.habeasData}</span>}
          </div>

          {serverError && (
            <div className="server-error" style={{ marginBottom: 14, padding: "10px 12px", borderRadius: 8, backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#ef4444", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: 8 }}>
              <AlertCircle size={16} /> {serverError}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={isLoading} style={{ width: "100%", height: 44, fontSize: "0.95rem", fontWeight: 600, borderRadius: 8, marginTop: 8, cursor: "pointer" }}>
            {isLoading ? "Creando cuenta..." : "Registrarse"}
          </button>
        </form>

        <p className="auth-footer" style={{ textAlign: "center", marginTop: 18, fontSize: "0.85rem", opacity: 0.9 }}>
          ¿Ya tienes cuenta? <Link to="/login" style={{ color: "var(--color-primary, #1e7e22)", fontWeight: 600, textDecoration: "none" }}>Inicia sesión</Link>
        </p>
      </div>

      {/* MODAL LEY 1581 */}
      {mostrarModalLey && (
        <div className="modal-overlay" onClick={() => setMostrarModalLey(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460, width: "100%", backgroundColor: "var(--color-bg-card, #ffffff)", color: "var(--color-text-main, #1e293b)", padding: 24, borderRadius: 14, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <ShieldCheck size={22} style={{ color: "var(--color-primary, #1e7e22)" }} />
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>Protección de Datos (Ley 1581)</h3>
            </div>
            <p style={{ fontSize: "0.85rem", lineHeight: "1.5", opacity: 0.88, marginBottom: 20 }}>
              De conformidad con la Ley 1581 de 2012 de Habeas Data en Colombia, la plataforma <strong>ZENDA (SENA)</strong> garantiza que la información recolectada se utiliza exclusivamente para fines académicos, gestión de fichas y seguimiento pedagógico de los grupos de proyecto.
            </p>
            <button className="btn-primary" style={{ width: "100%", height: 40, borderRadius: 8, fontWeight: 600, cursor: "pointer" }} onClick={() => setMostrarModalLey(false)}>
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Register;