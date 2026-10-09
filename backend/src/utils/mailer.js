// backend/src/utils/mailer.js
import nodemailer from 'nodemailer';

// Configuración SMTP con Gmail (Contraseña de aplicación de 16 caracteres)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'tu_correo_real@gmail.com',
    pass: process.env.EMAIL_PASS || 'abcd efgh ijkl mnop', // Tu contraseña de app de 16 letras
  },
});

export async function enviarCorreoRecuperacion(correoDestino, token) {
  // Redirige al frontend local
  const urlRestauracion = `http://localhost:5173/reset-password?token=${token}`;

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

  return await transporter.sendMail(mailOptions);
}