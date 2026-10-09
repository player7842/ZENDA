/*
  Login de ZENDA
  Refactor UI/UX: Captcha interactivo adaptativo (se activa al acumular 2 intentos fallidos),
  iconografía de lucide-react y manejo limpio de credenciales.
*/

import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RefreshCw, Mail, Lock, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { login, setToken, getRutaPorRol } from "../../api";
import "../../styles/Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ESTADOS EXCLUSIVOS DEL CAPTCHA
  const [intentosFallidos, setIntentosFallidos] = useState(0);
  const [captchaCode, setCaptchaCode] = useState("");
  const [inputCaptcha, setInputCaptcha] = useState("");
  const [mostrarCaptcha, setMostrarCaptcha] = useState(false);

  const passwordRef = useRef(null);
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Generador de código Captcha aleatorio
  const generarCaptcha = () => {
    const letras = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let codigo = "";
    for (let i = 0; i < 5; i++) {
      codigo += letras.charAt(Math.floor(Math.random() * letras.length));
    }
    setCaptchaCode(codigo);
    setInputCaptcha("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = "El correo institucional es requerido";
    }

    if (!password) {
      newErrors.password = "La contraseña es requerida";
    }

    if (mostrarCaptcha && inputCaptcha.trim().toUpperCase() !== captchaCode) {
      newErrors.captcha = "El código de verificación no coincide";
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
      const data = await login(email, password);

      // Reiniciar seguridad en éxito
      setIntentosFallidos(0);
      setMostrarCaptcha(false);

      setToken(data.token);
      localStorage.setItem("zenda-user", JSON.stringify(data.user));
      navigate(getRutaPorRol(data.user.rol));
    } catch (err) {
      const nuevosFallos = intentosFallidos + 1;
      setIntentosFallidos(nuevosFallos);

      if (nuevosFallos >= 2) {
        setMostrarCaptcha(true);
        generarCaptcha();
      }

      setServerError(err?.message || "Credenciales incorrectas");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      passwordRef.current?.focus();
    }
  };

  return (
    <div className="login-page">
      <div className="auth-card" style={{ maxWidth: 420, width: "100%", margin: "0 auto" }}>
        
        {/* LOGO UNIFICADO */}
        <div className="auth-logo" style={{ textAlign: "center", marginBottom: 16 }}>
          <img
            src={theme === "dark" ? "/logos/logo-dark.png" : "/logos/logo-light.png"}
            alt="ZENDA"
            style={{ maxHeight: 52, width: "auto" }}
          />
        </div>

        <p className="auth-subtitle" style={{ textAlign: "center", marginBottom: 20 }}>
          Inicia sesión para acceder a tu panel
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {/* Campo: Correo */}
          <div className={`form-field ${errors.email ? "has-error" : ""}`}>
            <label htmlFor="email">Correo institucional</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                }}
                onKeyDown={handleEmailKeyDown}
                placeholder="usuario@soy.sena.edu.co"
                autoComplete="email"
              />
            </div>
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          {/* Campo: Contraseña */}
          <div className={`form-field ${errors.password ? "has-error" : ""}`}>
            <label htmlFor="password">Contraseña</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                id="password"
                ref={passwordRef}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                }}
                placeholder="••••••••"
                autoComplete="current-password"
              />

              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label="Mostrar contraseña"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          {/* BLOQUE CAPTCHA (Visibilidad tras 2 fallos) */}
          {mostrarCaptcha && (
            <div className="captcha-wrap show" style={{ marginTop: 14, marginBottom: 14, padding: 12, background: "rgba(255, 152, 0, 0.08)", border: "1px dashed rgba(255, 152, 0, 0.4)", borderRadius: 8 }}>
              <span className="captcha-label" style={{ fontSize: "0.76rem", color: "var(--color-text-muted)", display: "block", marginBottom: 6 }}>
                Verificación de seguridad requerida:
              </span>
              <div className="captcha-row" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div className="captcha-code" style={{ flex: 1, letterSpacing: 4, fontFamily: "monospace", fontWeight: 700, background: "#111", color: "#00b894", padding: "8px 12px", borderRadius: 6, textAlign: "center", fontSize: "1.2rem" }}>
                  {captchaCode.split("").map((c, i) => (
                    <span key={i} style={{ display: "inline-block", transform: `rotate(${i % 2 === 0 ? 5 : -5}deg)` }}>
                      {c}
                    </span>
                  ))}
                </div>
                <button type="button" id="captcha-refresh" onClick={generarCaptcha} title="Generar nuevo código" style={{ padding: 8, background: "none", border: "1px solid rgba(128,128,128,0.3)", borderRadius: 6, cursor: "pointer", color: "var(--color-text-main)" }}>
                  <RefreshCw size={16} />
                </button>
              </div>
              <input
                type="text"
                className="modal-input"
                placeholder="Escribe el código mostrado"
                value={inputCaptcha}
                onChange={(e) => setInputCaptcha(e.target.value)}
              />
              {errors.captcha && <span className="field-error" style={{ display: "block", marginTop: 4 }}>{errors.captcha}</span>}
            </div>
          )}

          <div className="forgot-password" style={{ marginBottom: 14 }}>
            <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
          </div>

          {serverError && (
            <div className="server-error" style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <AlertTriangle size={16} /> {serverError}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={isLoading} style={{ width: "100%" }}>
            {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

        <p className="auth-footer" style={{ textAlign: "center", marginTop: 16 }}>
          ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;