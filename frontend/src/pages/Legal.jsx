/*
  Páginas legales públicas (HU-039).

  Un solo componente para /terminos, /privacidad y /cookies. El contenido es
  informativo y acompaña las aceptaciones obligatorias del registro (RN-004)
  y la Ley 1581 de 2012 de protección de datos personales.
*/

import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const ACTUALIZADO = new Date().toLocaleDateString('es-CO', {
  year: 'numeric',
  month: 'long',
});

const CONTENIDO = {
  terminos: {
    titulo: 'Términos de uso',
    secciones: [
      {
        titulo: '1. Qué es ZENDA',
        texto:
          'ZENDA es una plataforma académica del SENA para gestionar fichas, grupos, proyectos formativos, evidencias y su evaluación. Su uso es exclusivamente educativo y está limitado a la comunidad institucional.',
      },
      {
        titulo: '2. Aceptación',
        texto:
          'Al registrarte o iniciar sesión aceptas estos términos. Si no estás de acuerdo, no uses la plataforma. El registro exige aceptar también la política de privacidad, el uso de cookies y el tratamiento de datos personales.',
      },
      {
        titulo: '3. Tu cuenta',
        texto:
          'Debes usar tu correo institucional y datos veraces. Eres responsable de custodiar tu contraseña y de toda actividad realizada con tu cuenta. No compartas tus credenciales ni suplantes la identidad de otra persona.',
      },
      {
        titulo: '4. Uso permitido',
        texto:
          'No está permitido subir contenido ilícito, ofensivo o ajeno a la formación; intentar acceder a datos de otros usuarios o programas; alterar la plataforma; ni automatizar el registro o el envío de información.',
      },
      {
        titulo: '5. Contenido académico',
        texto:
          'Las evidencias y proyectos que publiques siguen siendo tuyos y de tu grupo. Autorizas al SENA a revisarlos, evaluarlos y conservarlos con fines formativos y de seguimiento académico.',
      },
      {
        titulo: '6. Disponibilidad y cambios',
        texto:
          'La plataforma puede suspenderse por mantenimiento o por causas técnicas. Estos términos pueden actualizarse; la versión vigente es la publicada en esta página.',
      },
      {
        titulo: '7. Contacto',
        texto:
          'Para dudas sobre estos términos, escribe al instructor o al coordinador del programa ADSO.',
      },
    ],
  },
  privacidad: {
    titulo: 'Política de privacidad',
    secciones: [
      {
        titulo: '1. Responsable del tratamiento',
        texto:
          'El Servicio Nacional de Aprendizaje (SENA), a través del programa de Análisis y Desarrollo de Software (ADSO), es el responsable de los datos personales tratados en ZENDA, conforme a la Ley 1581 de 2012 y sus decretos reglamentarios.',
      },
      {
        titulo: '2. Datos que se recogen',
        texto:
          'Nombre, apellido, correo institucional, tipo y número de documento, rol, ficha, grupo y la actividad académica dentro de la plataforma (proyectos, evidencias, evaluaciones y observaciones).',
      },
      {
        titulo: '3. Finalidad',
        texto:
          'Los datos se usan para crear y administrar la cuenta, conformar fichas y grupos, hacer seguimiento a los proyectos formativos, evaluar evidencias, emitir reportes académicos y atender solicitudes de soporte.',
      },
      {
        titulo: '4. Derechos del titular',
        texto:
          'Puedes conocer, actualizar, rectificar y suprimir tus datos, solicitar prueba de la autorización, revocarla y presentar quejas ante la Superintendencia de Industria y Comercio. Las solicitudes se atienden por los canales del SENA.',
      },
      {
        titulo: '5. Conservación y seguridad',
        texto:
          'Los datos se conservan durante el proceso formativo y el tiempo exigido por la normativa institucional. Se aplican controles de acceso por rol, contraseñas cifradas con bcrypt, sesiones con tokens y comunicación mediante HTTPS en producción.',
      },
      {
        titulo: '6. Transferencias',
        texto:
          'No se venden ni se ceden datos a terceros con fines comerciales. Solo se comparten con el personal autorizado del SENA y con los proveedores técnicos necesarios para operar la plataforma.',
      },
    ],
  },
  cookies: {
    titulo: 'Política de cookies',
    secciones: [
      {
        titulo: '1. Qué usamos',
        texto:
          'ZENDA usa cookies y almacenamiento local estrictamente necesarios para mantener la sesión y recordar tus preferencias de tema. No usa cookies publicitarias ni de seguimiento entre sitios.',
      },
      {
        titulo: '2. Cookies de sesión',
        texto:
          'El token de acceso se guarda en el navegador durante la sesión. El token de refresco viaja en una cookie HttpOnly, que el JavaScript de la página no puede leer, y se revoca al cerrar sesión.',
      },
      {
        titulo: '3. Preferencias',
        texto:
          'El tema claro u oscuro y la aceptación del aviso de cookies se guardan en el almacenamiento local del navegador para no preguntarte en cada visita.',
      },
      {
        titulo: '4. Cómo eliminarlas',
        texto:
          'Puedes borrar las cookies y el almacenamiento local desde la configuración de tu navegador. Si borras las cookies de sesión, deberás iniciar sesión de nuevo.',
      },
    ],
  },
};

function Legal({ tipo }) {
  const pagina = CONTENIDO[tipo] || CONTENIDO.terminos;

  return (
    <div
      style={{ minHeight: '100vh', background: 'var(--color-bg, #f8fafc)', padding: '32px 16px' }}
    >
      <div
        style={{
          maxWidth: 820,
          margin: '0 auto',
          background: 'var(--color-bg-card, #ffffff)',
          color: 'var(--color-text-main, #1e293b)',
          borderRadius: 16,
          padding: '32px clamp(20px, 5vw, 48px)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
        }}
      >
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 20,
            fontSize: '0.9rem',
          }}
        >
          <ArrowLeft size={16} /> Volver al inicio
        </Link>

        <h1 style={{ margin: '0 0 6px', fontSize: '1.9rem' }}>{pagina.titulo}</h1>
        <p style={{ margin: '0 0 28px', opacity: 0.7, fontSize: '0.85rem' }}>
          Última actualización: {ACTUALIZADO}
        </p>

        {pagina.secciones.map((seccion) => (
          <section key={seccion.titulo} style={{ marginBottom: 22 }}>
            <h2 style={{ fontSize: '1.05rem', margin: '0 0 8px' }}>{seccion.titulo}</h2>
            <p style={{ margin: 0, lineHeight: 1.65, fontSize: '0.93rem', opacity: 0.9 }}>
              {seccion.texto}
            </p>
          </section>
        ))}

        <div
          style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 32, fontSize: '0.88rem' }}
        >
          <Link to="/terminos">Términos</Link>
          <Link to="/privacidad">Privacidad</Link>
          <Link to="/cookies">Cookies</Link>
        </div>
      </div>
    </div>
  );
}

export default Legal;
