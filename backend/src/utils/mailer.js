// backend/src/utils/mailer.js
import nodemailer from 'nodemailer';
import env from '../config/env.js';

// Configuración SMTP con Gmail (contraseña de aplicación de 16 caracteres).
// Sin credenciales, el transporte falla al enviar; el controlador lo registra
// y responde igual para no revelar si el correo existe.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.emailUser,
    pass: env.emailPass,
  },
});

// Sin credenciales SMTP no se intenta conectar: el controlador registra el
// fallo y responde igual, pero las pruebas no se quedan esperando a la red.
async function enviar(mailOptions) {
  if (!env.emailUser || !env.emailPass) {
    throw new Error('SMTP no configurado (EMAIL_USER/EMAIL_PASS)');
  }
  return transporter.sendMail(mailOptions);
}

export async function enviarCorreoVerificacion(correoDestino, token) {
  const urlVerificacion = `${env.frontendUrl}/verificar-correo?token=${token}`;

  const mailOptions = {
    from: '"Plataforma ZENDA" <no-reply@zenda.sena.edu.co>',
    to: correoDestino,
    subject: 'Verifica tu correo — ZENDA SENA',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #1e7e22; margin: 0; font-size: 24px;">ZENDA</h1>
          <p style="color: #64748b; font-size: 13px;">Sistema de Gestión de Proyectos ADSO</p>
        </div>
        <p style="color: #334155; font-size: 15px; line-height: 1.5;">Hola,</p>
        <p style="color: #334155; font-size: 15px; line-height: 1.5;">Gracias por registrarte. Para activar tu cuenta, confirma que este es tu correo institucional.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${urlVerificacion}" style="background-color: #1e7e22; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 14px;">Verificar mi correo</a>
        </div>
        <p style="color: #64748b; font-size: 13px;">El enlace vence en 24 horas. Si no creaste esta cuenta, puedes ignorar este mensaje.</p>
      </div>
    `,
  };

  return enviar(mailOptions);
}

export async function enviarCorreoRecuperacion(correoDestino, token) {
  // El origen sale de FRONTEND_URL: en producción es el dominio de Vercel,
  // en desarrollo puede ser localhost (H-03).
  const urlRestauracion = `${env.frontendUrl}/reset-password?token=${token}`;

  const mailOptions = {
    from: '"Plataforma ZENDA" <no-reply@zenda.sena.edu.co>',
    to: correoDestino,
    subject: 'Restablecimiento de Contraseña — ZENDA SENA',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #1e7e22; margin: 0; font-size: 24px;">ZENDA</h1>
          <p style="color: #64748b; font-size: 13px;">Sistema de Gestión de Proyectos ADSO</p>
        </div>
        <p style="color: #334155; font-size: 15px; line-height: 1.5;">Hola,</p>
        <p style="color: #334155; font-size: 15px; line-height: 1.5;">Has solicitado restablecer tu contraseña para ingresar a la plataforma.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${urlRestauracion}" style="background-color: #1e7e22; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 14px;">Restablecer mi contraseña</a>
        </div>
        <p style="color: #64748b; font-size: 13px;">Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
      </div>
    `,
  };

  return enviar(mailOptions);
}
