/*
  Verificación de correo (RS-006).

  Dos modos:
  - Con `?token=...` verifica la cuenta al abrir el enlace del correo.
  - Con `?pendiente=1&correo=...` muestra el aviso posterior al registro y
    permite reenviar el enlace si no llegó.
*/

import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, AlertTriangle, Mail, Loader2 } from "lucide-react";
import { verifyEmail, resendVerification } from "../../api";
import { useTheme } from "../../context/ThemeContext";
import "../../styles/Login.css";

function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const correo = params.get("correo") || "";

  const [estado, setEstado] = useState(token ? "verificando" : "pendiente");
  const [mensaje, setMensaje] = useState("");
  const [reenvio, setReenvio] = useState({ cargando: false, ok: "", error: "" });
  const { theme } = useTheme();

  useEffect(() => {
    if (!token) return;

    let activo = true;
    verifyEmail(token)
      .then((data) => {
        if (!activo) return;
        setEstado("ok");
        setMensaje(data.message || "Correo verificado correctamente.");
      })
      .catch((err) => {
        if (!activo) return;
        setEstado("error");
        setMensaje(err?.message || "No se pudo verificar el correo.");
      });

    return () => {
      activo = false;
    };
  }, [token]);

  const handleReenviar = async () => {
    if (!correo) return;
    setReenvio({ cargando: true, ok: "", error: "" });
    try {
      const data = await resendVerification(correo);
      setReenvio({
        cargando: false,
        ok: data.message || "Si el correo está registrado, recibirás un nuevo enlace.",
        error: "",
      });
    } catch (err) {
      setReenvio({
        cargando: false,
        ok: "",
        error: err?.message || "No se pudo reenviar la verificación.",
      });
    }
  };

  return (
    <div className="login-page">
      <div className="auth-card" style={{ maxWidth: 440, width: "100%", margin: "0 auto" }}>
        <div className="auth-logo" style={{ textAlign: "center", marginBottom: 16 }}>
          <img
            src={theme === "dark" ? "/logos/logo-dark.png" : "/logos/logo-light.png"}
            alt="ZENDA"
            style={{ maxHeight: 52, width: "auto" }}
          />
        </div>

        {estado === "verificando" && (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <Loader2 size={34} className="spin" style={{ marginBottom: 12 }} />
            <h1 className="auth-title" style={{ fontSize: "1.25rem" }}>Verificando tu correo…</h1>
            <p className="auth-subtitle">Esto toma solo un momento.</p>
          </div>
        )}

        {estado === "ok" && (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <CheckCircle2 size={38} color="#00b894" style={{ marginBottom: 12 }} />
            <h1 className="auth-title" style={{ fontSize: "1.25rem" }}>Correo verificado</h1>
            <p className="auth-subtitle" style={{ marginBottom: 20 }}>{mensaje}</p>
            <Link to="/login" className="btn-primary" style={{ display: "inline-block", textDecoration: "none" }}>
              Iniciar sesión
            </Link>
          </div>
        )}

        {estado === "error" && (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <AlertTriangle size={38} color="#e74c3c" style={{ marginBottom: 12 }} />
            <h1 className="auth-title" style={{ fontSize: "1.25rem" }}>No pudimos verificar el correo</h1>
            <p className="auth-subtitle" style={{ marginBottom: 20 }}>{mensaje}</p>
            <Link to="/login" className="btn-primary" style={{ display: "inline-block", textDecoration: "none" }}>
              Volver al inicio de sesión
            </Link>
          </div>
        )}

        {estado === "pendiente" && (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <Mail size={38} color="#1e7e22" style={{ marginBottom: 12 }} />
            <h1 className="auth-title" style={{ fontSize: "1.25rem" }}>Revisa tu correo</h1>
            <p className="auth-subtitle" style={{ marginBottom: 8 }}>
              Enviamos un enlace de verificación{correo ? ` a ${correo}` : ""}. Ábrelo para activar tu cuenta.
            </p>
            <p className="auth-subtitle" style={{ fontSize: "0.8rem", marginBottom: 18 }}>
              Si no lo encuentras, revisa la carpeta de spam.
            </p>

            {reenvio.ok && (
              <p style={{ color: "#00b894", fontSize: "0.85rem", marginBottom: 12 }}>{reenvio.ok}</p>
            )}
            {reenvio.error && (
              <p style={{ color: "#e74c3c", fontSize: "0.85rem", marginBottom: 12 }}>{reenvio.error}</p>
            )}

            {correo && (
              <button
                type="button"
                className="btn-primary"
                onClick={handleReenviar}
                disabled={reenvio.cargando}
                style={{ width: "100%", marginBottom: 12 }}
              >
                {reenvio.cargando ? "Reenviando…" : "Reenviar enlace"}
              </button>
            )}

            <Link to="/login" style={{ fontSize: "0.85rem" }}>
              Volver al inicio de sesión
            </Link>
          </div>
        )}

        <p style={{ textAlign: "center", marginTop: 20 }}>
          <Link to="/" className="back-home-link">Volver al inicio</Link>
        </p>
      </div>
    </div>
  );
}

export default VerifyEmail;
