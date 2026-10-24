/*
  HU-004 — Sesión segura en el navegador.

  - Renueva el token de acceso cada 12 minutos con la cookie HttpOnly de
    refresco (el acceso dura 15 minutos).
  - A los 29 minutos de inactividad muestra un aviso y a los 30 cierra la
    sesión, revocando el refresco en el servidor.
*/

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { clearToken, getToken, refreshSession } from '../../api';

const MINUTO = 60 * 1000;
const AVISO_MS = 29 * MINUTO;
const CIERRE_MS = 30 * MINUTO;
const REFRESCO_MS = 12 * MINUTO;

const RUTAS_PUBLICAS = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verificar-correo',
  '/terminos',
  '/privacidad',
  '/cookies',
];

function SessionManager() {
  const navigate = useNavigate();
  const location = useLocation();
  const [aviso, setAviso] = useState(false);
  const [restante, setRestante] = useState(60);

  const ultimaActividad = useRef(Date.now());
  const cerrando = useRef(false);
  const rutaPublica = RUTAS_PUBLICAS.includes(location.pathname);

  const cerrarSesion = useCallback(() => {
    if (cerrando.current) return;
    cerrando.current = true;
    clearToken();
    setAviso(false);
    navigate('/login', { replace: true });
  }, [navigate]);

  // Cada interacción del usuario reinicia el contador de inactividad.
  useEffect(() => {
    if (!getToken() || rutaPublica) return undefined;

    const marcarActividad = () => {
      ultimaActividad.current = Date.now();
    };

    const eventos = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    eventos.forEach((evento) =>
      window.addEventListener(evento, marcarActividad, { passive: true }),
    );

    return () => {
      eventos.forEach((evento) => window.removeEventListener(evento, marcarActividad));
    };
  }, [rutaPublica]);

  // Renovación transparente del acceso mientras la pestaña está abierta.
  useEffect(() => {
    if (!getToken() || rutaPublica) return undefined;

    let activo = true;
    const renovar = async () => {
      try {
        await refreshSession();
      } catch (error) {
        // Solo se cierra si el servidor rechazó el refresco; un fallo de red
        // no debe expulsar al usuario.
        if (activo && error?.status === 401) cerrarSesion();
      }
    };

    renovar();
    const intervalo = setInterval(renovar, REFRESCO_MS);

    return () => {
      activo = false;
      clearInterval(intervalo);
    };
  }, [rutaPublica, cerrarSesion]);

  // Control de inactividad: aviso a los 29 min y cierre a los 30 min.
  useEffect(() => {
    if (!getToken() || rutaPublica) return undefined;

    ultimaActividad.current = Date.now();
    const intervalo = setInterval(() => {
      const inactivo = Date.now() - ultimaActividad.current;
      if (inactivo >= CIERRE_MS) {
        cerrarSesion();
      } else if (inactivo >= AVISO_MS) {
        setAviso(true);
      }
    }, 15000);

    return () => clearInterval(intervalo);
  }, [rutaPublica, cerrarSesion]);

  // Cuenta regresiva visible mientras se muestra el aviso.
  useEffect(() => {
    if (!aviso) return undefined;

    const intervalo = setInterval(() => {
      const restanteMs = CIERRE_MS - (Date.now() - ultimaActividad.current);
      setRestante(Math.max(0, Math.ceil(restanteMs / 1000)));
    }, 1000);

    return () => clearInterval(intervalo);
  }, [aviso]);

  const continuarSesion = async () => {
    ultimaActividad.current = Date.now();
    setAviso(false);
    try {
      await refreshSession();
    } catch {
      // Si el refresco ya no es válido, el siguiente chequeo cierra la sesión.
    }
  };

  if (!aviso) return null;

  return (
    <div
      className="modal-overlay"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="aviso-sesion-titulo"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: 20,
      }}
    >
      <div
        className="modal-card"
        style={{
          maxWidth: 420,
          width: '100%',
          backgroundColor: 'var(--color-bg-card, #ffffff)',
          color: 'var(--color-text-main, #1e293b)',
          padding: 24,
          borderRadius: 14,
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
          textAlign: 'center',
        }}
      >
        <Clock size={34} color="#d97706" style={{ marginBottom: 10 }} />
        <h2 id="aviso-sesion-titulo" style={{ margin: '0 0 8px', fontSize: '1.15rem' }}>
          Tu sesión está por cerrarse
        </h2>
        <p style={{ fontSize: '0.9rem', lineHeight: 1.5, opacity: 0.85, marginBottom: 20 }}>
          Por seguridad, cerraremos tu sesión por inactividad en{' '}
          <strong>
            {restante} segundo{restante === 1 ? '' : 's'}
          </strong>
          .
        </p>
        <button
          className="btn-primary"
          onClick={continuarSesion}
          style={{ width: '100%', marginBottom: 10 }}
        >
          Continuar sesión
        </button>
        <button
          type="button"
          onClick={cerrarSesion}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.85rem',
            opacity: 0.75,
          }}
        >
          Cerrar sesión ahora
        </button>
      </div>
    </div>
  );
}

export default SessionManager;
