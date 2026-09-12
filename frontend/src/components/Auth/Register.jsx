/*
  Formulario de registro de aprendices — auto-servicio completo:
  el correo debe ser institucional (@soy.sena.edu.co), el aprendiz elige
  su ficha (solo ADSO por ahora) y su rol Scrum. Queda vinculado a la
  ficha automáticamente al registrarse, sin esperar a un admin.
*/
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { register, getFichasPublicas } from "../../api";
import "../../styles/Register.css";

const DOMINIO = "@soy.sena.edu.co";

function Register() {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    tipoDocumento: "",
    numeroDocumento: "",
    password: "",
    confirmPassword: "",
    numeroFicha: "",
    subRol: "",
  });

  const [fichas, setFichas] = useState([]);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();

  const refs = {
    apellido: useRef(null),
    email: useRef(null),
    tipoDocumento: useRef(null),
    numeroDocumento: useRef(null),
    numeroFicha: useRef(null),
    subRol: useRef(null),
    password: useRef(null),
    confirmPassword: useRef(null),
  };

  useEffect(() => {
    getFichasPublicas().then(setFichas).catch(() => setFichas([]));
  }, []);

  const subRolesDisponibles = [
    { value: "", label: "Seleccione su rol Scrum" },
    { value: "Scrum Master", label: "Scrum Master" },
    { value: "Product Owner", label: "Product Owner" },
    { value: "Developer", label: "Developer" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
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
    if (!formData.email) {
      newErrors.email = "El correo es requerido";
    } else if (!formData.email.toLowerCase().endsWith(DOMINIO)) {
      newErrors.email = `Debe usar tu correo institucional (${DOMINIO})`;
    }
    if (!formData.tipoDocumento) newErrors.tipoDocumento = "Seleccione un tipo";
    if (!formData.numeroDocumento) newErrors.numeroDocumento = "El número es requerido";
    if (!formData.numeroFicha) newErrors.numeroFicha = "Seleccione su ficha";
    if (!formData.subRol) newErrors.subRol = "Seleccione su rol Scrum";

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
      await register({
        nombre: formData.nombre,
        apellido: formData.apellido,
        correo: formData.email,
        tipo_documento: formData.tipoDocumento,
        numero_documento: formData.numeroDocumento,
        password: formData.password,
        numero_ficha: formData.numeroFicha,
        sub_rol: formData.subRol,
      });

      alert("Registro exitoso. Por favor inicia sesión.");
      navigate("/login");
    } catch (err) {
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
            src={theme === "dark" ? "/logos/logo-dark.png" : "/logos/logo-light.png"}
            alt="ZENDA"
          />
        </div>
        <h1 className="auth-title">Crear cuenta</h1>
        <p className="auth-subtitle">Regístrate con tu correo institucional</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className={`form-field ${errors.nombre ? "has-error" : ""}`}>
              <label>Nombre</label>
              <input
                type="text" name="nombre" value={formData.nombre}
                onChange={handleChange} onKeyDown={handleKeyDown(refs.apellido)}
                placeholder="Tu nombre"
              />
              {errors.nombre && <span className="field-error">{errors.nombre}</span>}
            </div>
            <div className={`form-field ${errors.apellido ? "has-error" : ""}`}>
              <label>Apellido</label>
              <input
                ref={refs.apellido} type="text" name="apellido" value={formData.apellido}
                onChange={handleChange} onKeyDown={handleKeyDown(refs.email)}
                placeholder="Tu apellido"
              />
              {errors.apellido && <span className="field-error">{errors.apellido}</span>}
            </div>
          </div>

          <div className={`form-field ${errors.email ? "has-error" : ""}`}>
            <label>Correo institucional</label>
            <input
              ref={refs.email} type="email" name="email" value={formData.email}
              onChange={handleChange} onKeyDown={handleKeyDown(refs.tipoDocumento)}
              placeholder={`usuario${DOMINIO}`}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-row">
            <div className={`form-field ${errors.tipoDocumento ? "has-error" : ""}`}>
              <label>Tipo documento</label>
              <select
                ref={refs.tipoDocumento} name="tipoDocumento" value={formData.tipoDocumento}
                onChange={handleChange} onKeyDown={handleKeyDown(refs.numeroDocumento)}
              >
                <option value="">Seleccione tipo</option>
                <option value="CC">Cédula de Ciudadanía</option>
                <option value="TI">Tarjeta de Identidad</option>
                <option value="CE">Cédula de Extranjería</option>
                <option value="PA">Pasaporte</option>
              </select>
              {errors.tipoDocumento && <span className="field-error">{errors.tipoDocumento}</span>}
            </div>
            <div className={`form-field ${errors.numeroDocumento ? "has-error" : ""}`}>
              <label>N° documento</label>
              <input
                ref={refs.numeroDocumento} type="text" name="numeroDocumento" value={formData.numeroDocumento}
                onChange={handleChange} onKeyDown={handleKeyDown(refs.numeroFicha)}
                placeholder="Número"
              />
              {errors.numeroDocumento && <span className="field-error">{errors.numeroDocumento}</span>}
            </div>
          </div>

          <div className={`form-field ${errors.numeroFicha ? "has-error" : ""}`}>
            <label>Ficha (ADSO)</label>
            <select
              ref={refs.numeroFicha} name="numeroFicha" value={formData.numeroFicha}
              onChange={handleChange} onKeyDown={handleKeyDown(refs.subRol)}
            >
              <option value="">Seleccione su ficha</option>
              {fichas.map((f) => (
                <option key={f.ficha_id} value={f.numero_ficha}>
                  {f.numero_ficha} — {f.jornada}
                </option>
              ))}
            </select>
            {errors.numeroFicha && <span className="field-error">{errors.numeroFicha}</span>}
          </div>

          <div className={`form-field ${errors.subRol ? "has-error" : ""}`}>
            <label>Rol Scrum</label>
            <select
              ref={refs.subRol} name="subRol" value={formData.subRol}
              onChange={handleChange} onKeyDown={handleKeyDown(refs.password)}
            >
              {subRolesDisponibles.map((sr) => (
                <option key={sr.value} value={sr.value}>{sr.label}</option>
              ))}
            </select>
            {errors.subRol && <span className="field-error">{errors.subRol}</span>}
          </div>

          <div className={`form-field ${errors.password ? "has-error" : ""}`}>
            <label>Contraseña</label>
            <input
              ref={refs.password} type="password" name="password" value={formData.password}
              onChange={handleChange} onKeyDown={handleKeyDown(refs.confirmPassword)}
              placeholder="Mínimo 8 caracteres"
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <div className={`form-field ${errors.confirmPassword ? "has-error" : ""}`}>
            <label>Confirmar contraseña</label>
            <input
              ref={refs.confirmPassword} type="password" name="confirmPassword" value={formData.confirmPassword}
              onChange={handleChange} placeholder="Repita su contraseña"
            />
            {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
          </div>

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