// Controlador de autenticación y gestión de credenciales
//
// Esquema oficial MR_ZENDA: la tabla usuarios usa correo (no email),
// contrasena (no password), el rol es un ENUM en MAYÚSCULAS
// (APRENDIZ/INSTRUCTOR/COORDINADOR/ADMINISTRADOR) y hay un campo estado.
// Todas las fechas (fecha_creacion/fecha_actualizacion) son NOT NULL y
// las ponemos aquí con now().

import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../../config/db.js';
import env from '../../config/env.js';
import { enviarCorreoRecuperacion, enviarCorreoVerificacion } from '../../utils/mailer.js';
import { obtenerOCrearGrupoGeneral } from '../../services/grupos.js';

// Longitud mínima de contraseña, alineada con el restablecimiento y con la
// creación de usuarios desde el panel de administración.
const LONGITUD_MINIMA_PASSWORD = 8;
const LONGITUD_MAXIMA_PASSWORD = 72;

// HU-004 / H-13: el acceso dura 15 minutos y el refresco 7 días, con rotación.
const DIAS_REFRESCO = 7;
const HORAS_VERIFICACION = 24;
const COOKIE_REFRESCO = 'zenda_refresh';

// Campos que se devuelven SIEMPRE en un login/registro (nunca la contraseña)
const CAMPOS_PUBLICOS = `
  usuario_id, nombre, apellido, correo, estado, correo_verificado,
  tipo_documento, numero_documento,
  fecha_creacion, fecha_actualizacion, rol`;

// Toleramos que el frontend mande email aunque el campo en BD es correo
const obtenerCorreo = (body) => (body.correo || body.email || '').trim().toLowerCase();

// Dominio institucional obligatorio para el auto-registro de aprendices.
// La validación es estricta: usuario@soy.sena.edu.co y sin espacios.
const DOMINIO_PERMITIDO = '@soy.sena.edu.co';
const CORREO_INSTITUCIONAL = /^[^\s@]+@soy\.sena\.edu\.co$/i;
const TIPOS_DOCUMENTO = new Set(['CC', 'TI', 'CE', 'PA', 'PPT']);

const firmarSesion = (usuario) =>
  jwt.sign(
    {
      usuario_id: usuario.usuario_id,
      correo: usuario.correo,
      rol: usuario.rol,
      purpose: 'session',
      tv: usuario.token_version ?? 0,
    },
    env.jwtSecret,
    { expiresIn: env.jwtAccessExpires }
  );

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

// --- Cookie HttpOnly del token de refresco (H-13) -------------------------
const opcionesCookieRefresco = () => ({
  httpOnly: true,
  secure: env.isProduction,
  // En producción el frontend y la API están en dominios distintos (Vercel y
  // Render), así que la cookie debe viajar entre sitios.
  sameSite: env.isProduction ? 'none' : 'lax',
  path: '/api/auth',
  maxAge: DIAS_REFRESCO * 24 * 60 * 60 * 1000,
});

const leerCookie = (req, nombre) => {
  const cabecera = req.headers.cookie;
  if (!cabecera) return null;

  for (const parte of cabecera.split(';')) {
    const indice = parte.indexOf('=');
    if (indice === -1) continue;
    if (parte.slice(0, indice).trim() === nombre) {
      return decodeURIComponent(parte.slice(indice + 1).trim());
    }
  }
  return null;
};

const limpiarCookieRefresco = (res) => {
  const { maxAge, ...opciones } = opcionesCookieRefresco();
  res.clearCookie(COOKIE_REFRESCO, opciones);
};

// El token de refresco es opaco y se guarda hasheado: si se filtra la base,
// no se puede reutilizar. La rotación revoca el anterior en cada renovación.
const crearRefresco = async (db, usuarioId) => {
  const token = crypto.randomBytes(48).toString('hex');
  await db.query(
    `INSERT INTO sesiones_refresh (usuario_id, token_hash, expira_en)
     VALUES ($1, $2, now() + ($3 || ' days')::interval)`,
    [usuarioId, hashToken(token), DIAS_REFRESCO]
  );
  return token;
};

const crearVerificacion = async (db, usuario) => {
  const token = jwt.sign(
    { usuario_id: usuario.usuario_id, correo: usuario.correo, purpose: 'verify' },
    env.jwtSecret,
    { expiresIn: `${HORAS_VERIFICACION}h` }
  );

  await db.query(
    `DELETE FROM verificacion_correo WHERE usuario_id = $1 AND usado_en IS NULL`,
    [usuario.usuario_id]
  );
  await db.query(
    `INSERT INTO verificacion_correo (usuario_id, token_hash, expira_en)
     VALUES ($1, $2, now() + ($3 || ' hours')::interval)`,
    [usuario.usuario_id, hashToken(token), HORAS_VERIFICACION]
  );

  return token;
};

const validarPassword = (password) => {
  if (typeof password !== 'string' || password.length < LONGITUD_MINIMA_PASSWORD) {
    return `La contraseña debe tener mínimo ${LONGITUD_MINIMA_PASSWORD} caracteres`;
  }
  if (password.length > LONGITUD_MAXIMA_PASSWORD) {
    return `La contraseña no puede superar ${LONGITUD_MAXIMA_PASSWORD} caracteres`;
  }
  return null;
};

// Registrar un nuevo aprendiz: valida correo institucional, documento,
// aceptaciones legales y ficha; crea el usuario y lo vincula de una vez al
// grupo General de su ficha. Ya no se elige sub-rol Scrum: el liderazgo es
// grupos.lider_id.
export const register = async (req, res) => {
  const client = await pool.connect();
  let transaccionAbierta = false;
  try {
    const {
      nombre,
      apellido,
      tipo_documento,
      numero_documento,
      password,
      numero_ficha,
      acepta_terminos,
      acepta_privacidad,
      acepta_cookies,
      acepta_tratamiento_datos,
    } = req.body;
    const correo = obtenerCorreo(req.body);

    // RS-006: campo trampa invisible para humanos. Un bot que rellena todos
    // los campos cae aquí y no se crea ninguna cuenta.
    if (String(req.body.sitio_web || '').trim() !== '') {
      return res.status(400).json({ message: 'No se pudo completar el registro' });
    }

    const nombreLimpio = String(nombre || '').trim();
    const apellidoLimpio = String(apellido || '').trim();
    const documentoLimpio = String(numero_documento || '').replace(/\D/g, '');
    const tipoDocumento = String(tipo_documento || '').trim().toUpperCase();

    if (!nombreLimpio || !apellidoLimpio || !correo || !password) {
      return res.status(400).json({ message: 'Faltan datos obligatorios del usuario' });
    }

    if (nombreLimpio.length > 80 || apellidoLimpio.length > 80) {
      return res.status(400).json({ message: 'Nombre y apellido no pueden superar 80 caracteres' });
    }

    if (!CORREO_INSTITUCIONAL.test(correo)) {
      return res
        .status(400)
        .json({ message: `El correo debe ser institucional (usuario${DOMINIO_PERMITIDO})` });
    }

    const errorPassword = validarPassword(password);
    if (errorPassword) return res.status(400).json({ message: errorPassword });

    if (!TIPOS_DOCUMENTO.has(tipoDocumento)) {
      return res.status(400).json({ message: 'El tipo de documento no es válido' });
    }

    if (documentoLimpio.length < 6 || documentoLimpio.length > 11) {
      return res
        .status(400)
        .json({ message: 'El número de documento debe tener entre 6 y 11 dígitos' });
    }

    const aceptaciones = [
      acepta_terminos,
      acepta_privacidad,
      acepta_cookies,
      acepta_tratamiento_datos,
    ];
    if (aceptaciones.some((valor) => valor !== true)) {
      return res.status(400).json({
        message:
          'Debes aceptar los términos, la política de privacidad, el uso de cookies y el tratamiento de datos personales',
      });
    }

    if (!numero_ficha) {
      return res.status(400).json({ message: 'Selecciona tu ficha' });
    }

    const existingUser = await pool.query('SELECT usuario_id FROM usuarios WHERE correo = $1', [
      correo,
    ]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'Este correo ya está registrado' });
    }

    const ficha = await pool.query(
      'SELECT ficha_id, numero_ficha FROM fichas WHERE numero_ficha = $1',
      [numero_ficha]
    );
    if (ficha.rows.length === 0) {
      return res.status(400).json({ message: 'Esa ficha no existe' });
    }
    const { ficha_id: fichaId } = ficha.rows[0];

    const hashedPassword = await bcrypt.hash(password, 10);

    await client.query('BEGIN');
    transaccionAbierta = true;

    const result = await client.query(
      `INSERT INTO usuarios
         (rol, nombre, apellido, correo, contrasena, estado, fecha_creacion, fecha_actualizacion,
          tipo_documento, numero_documento, acepta_terminos, acepta_privacidad,
          acepta_cookies, acepta_tratamiento_datos, fecha_aceptacion_legal,
          correo_verificado)
       VALUES ('APRENDIZ', $1, $2, $3, $4, 'Activo', now(), now(), $5, $6, true, true, true, true, now(), false)
       RETURNING ${CAMPOS_PUBLICOS}, token_version`,
      [nombreLimpio, apellidoLimpio, correo, hashedPassword, tipoDocumento, documentoLimpio]
    );
    const user = result.rows[0];

    // Auto-vincular al grupo General de la ficha elegida (sin password: es autoservicio)
    const grupoId = await obtenerOCrearGrupoGeneral(client, fichaId, user.usuario_id);
    await client.query(
      `INSERT INTO integrantes_grupo (grupo_id, usuario_id, estado_integrante, fecha_ingreso)
       VALUES ($1, $2, 'Activo', now())`,
      [grupoId, user.usuario_id]
    );

    // RS-006: el enlace de verificación se crea en la misma transacción.
    const tokenVerificacion = await crearVerificacion(client, user);

    await client.query('COMMIT');
    transaccionAbierta = false;

    try {
      await enviarCorreoVerificacion(correo, tokenVerificacion);
    } catch (error) {
      // El registro ya quedó guardado; el usuario puede pedir el reenvío.
      console.error('Error al enviar el correo de verificación:', error.message);
    }

    const { token_version, ...usuarioPublico } = user;

    res.status(201).json({
      message:
        'Registro exitoso. Revisa tu correo institucional y verifica la cuenta antes de iniciar sesión.',
      user: usuarioPublico,
      requiere_verificacion: true,
    });
  } catch (error) {
    if (transaccionAbierta) await client.query('ROLLBACK');
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Este correo ya está registrado' });
    }
    console.error('Error en register:', error);
    res.status(500).json({ message: 'Error del servidor, inténtalo de nuevo' });
  } finally {
    client.release();
  }
};

// Inicio de sesión y autenticación de credenciales
export const login = async (req, res) => {
  try {
    const { password } = req.body;
    const correo = obtenerCorreo(req.body);

    const result = await pool.query(`SELECT * FROM usuarios WHERE correo = $1`, [correo]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales incorrectas, intenta de nuevo' });
    }

    const user = result.rows[0];

    // Usuario desactivado no entra, ni con la contraseña correcta
    if (user.estado !== 'Activo') {
      return res.status(403).json({ message: 'Tu cuenta está inactiva, habla con un administrador' });
    }

    const validPassword = await bcrypt.compare(password || '', user.contrasena);
    if (!validPassword) {
      return res.status(401).json({ message: 'Credenciales incorrectas, intenta de nuevo' });
    }

    // RS-006: sin correo verificado no se abre sesión.
    if (user.correo_verificado === false) {
      return res.status(403).json({
        message:
          'Debes verificar tu correo institucional antes de iniciar sesión. Revisa el enlace que enviamos a tu correo.',
        codigo: 'CORREO_NO_VERIFICADO',
      });
    }

    const token = firmarSesion(user);
    const refresco = await crearRefresco(pool, user.usuario_id);
    res.cookie(COOKIE_REFRESCO, refresco, opcionesCookieRefresco());

    const { contrasena, token_version, ...userWithoutPassword } = user;

    res.json({ message: 'Login exitoso', user: userWithoutPassword, token });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error del servidor, inténtalo de nuevo' });
  }
};

// Solicitar recuperación de contraseña (envía email real).
// La respuesta es SIEMPRE la misma exista o no el correo, para no revelar
// qué cuentas están registradas (H-01). El token se guarda hasheado y solo
// puede usarse una vez (C-01).
export const forgotPassword = async (req, res) => {
  const RESPUESTA_UNIFORME =
    'Si el correo está registrado, recibirás un enlace de recuperación en unos minutos.';

  try {
    const correo = obtenerCorreo(req.body);
    if (!correo) {
      return res.status(400).json({ message: 'Ingresa tu correo electrónico' });
    }

    const result = await pool.query(
      'SELECT usuario_id, correo FROM usuarios WHERE correo = $1 AND estado = $2',
      [correo, 'Activo']
    );
    if (result.rows.length === 0) {
      // No se revela la ausencia del correo.
      return res.json({ message: RESPUESTA_UNIFORME });
    }

    const user = result.rows[0];

    // Token temporal de 15 minutos con propósito explícito de reset.
    const token = jwt.sign(
      { usuario_id: user.usuario_id, correo: user.correo, purpose: 'reset' },
      env.jwtSecret,
      { expiresIn: '15m' }
    );

    // Solo queda vigente el enlace más reciente y se guarda su hash.
    await pool.query(
      `DELETE FROM recuperacion_contrasena
       WHERE usuario_id = $1 AND usado_en IS NULL`,
      [user.usuario_id]
    );
    await pool.query(
      `INSERT INTO recuperacion_contrasena (usuario_id, token_hash, expira_en, creado_en)
       VALUES ($1, $2, now() + interval '15 minutes', now())`,
      [user.usuario_id, hashToken(token)]
    );

    try {
      await enviarCorreoRecuperacion(correo, token);
    } catch (error) {
      // Un fallo del SMTP no debe delatar si el correo existía.
      console.error('Error al enviar el correo de recuperación:', error.message);
    }

    res.json({ message: RESPUESTA_UNIFORME });
  } catch (error) {
    console.error('Error en forgotPassword:', error);
    res.status(500).json({ message: 'Error del servidor al procesar la solicitud de correo' });
  }
};

// Restablecer la contraseña usando el token de un solo uso.
export const resetPassword = async (req, res) => {
  const client = await pool.connect();
  let transaccionAbierta = false;
  try {
    const { token, contrasena } = req.body;

    if (!token || !contrasena) {
      return res.status(400).json({ message: 'Token y nueva contraseña son obligatorios' });
    }

    const errorPassword = validarPassword(contrasena);
    if (errorPassword) return res.status(400).json({ message: errorPassword });

    let decoded;
    try {
      decoded = jwt.verify(token, env.jwtSecret);
    } catch {
      return res.status(400).json({ message: 'El token es inválido o ha expirado' });
    }

    // Un JWT de sesión NO sirve para cambiar la contraseña (C-01).
    if (decoded.purpose !== 'reset' || !decoded.usuario_id) {
      return res.status(400).json({ message: 'El token es inválido o ha expirado' });
    }

    await client.query('BEGIN');
    transaccionAbierta = true;

    const tokenValido = await client.query(
      `SELECT recuperacion_id
       FROM recuperacion_contrasena
       WHERE token_hash = $1
         AND usuario_id = $2
         AND usado_en IS NULL
         AND expira_en > now()
       FOR UPDATE`,
      [hashToken(token), decoded.usuario_id]
    );

    if (tokenValido.rows.length === 0) {
      await client.query('ROLLBACK');
      transaccionAbierta = false;
      return res.status(400).json({ message: 'El token es inválido, ya fue usado o ha expirado' });
    }

    const hashedPassword = await bcrypt.hash(contrasena, 10);

    await client.query(
      `UPDATE recuperacion_contrasena
       SET usado_en = now()
       WHERE recuperacion_id = $1`,
      [tokenValido.rows[0].recuperacion_id]
    );

    // token_version invalida las sesiones emitidas antes del cambio (C-01).
    // Quien abre el enlace de recuperación demuestra ser dueño del correo,
    // así que también se marca como verificado (RS-006).
    await client.query(
      `UPDATE usuarios
       SET contrasena = $1,
           token_version = token_version + 1,
           correo_verificado = true,
           fecha_actualizacion = now()
       WHERE usuario_id = $2`,
      [hashedPassword, decoded.usuario_id]
    );

    // HU-004: cambiar la contraseña revoca también los refrescos vigentes.
    await client.query(
      `UPDATE sesiones_refresh
       SET revocado_en = now()
       WHERE usuario_id = $1 AND revocado_en IS NULL`,
      [decoded.usuario_id]
    );

    await client.query('COMMIT');
    transaccionAbierta = false;

    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    if (transaccionAbierta) await client.query('ROLLBACK');
    console.error('Error en resetPassword:', error);
    res.status(500).json({ message: 'Error del servidor al restablecer la contraseña' });
  } finally {
    client.release();
  }
};

// RS-006: confirmar el correo con el enlace enviado al registrarse.
export const verifyEmail = async (req, res) => {
  const client = await pool.connect();
  let transaccionAbierta = false;
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'El enlace de verificación no es válido' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, env.jwtSecret);
    } catch {
      return res.status(400).json({ message: 'El enlace es inválido o ha expirado' });
    }

    if (decoded.purpose !== 'verify' || !decoded.usuario_id) {
      return res.status(400).json({ message: 'El enlace es inválido o ha expirado' });
    }

    await client.query('BEGIN');
    transaccionAbierta = true;

    const verificacion = await client.query(
      `SELECT verificacion_id
       FROM verificacion_correo
       WHERE token_hash = $1
         AND usuario_id = $2
         AND usado_en IS NULL
         AND expira_en > now()
       FOR UPDATE`,
      [hashToken(token), decoded.usuario_id]
    );

    if (verificacion.rows.length === 0) {
      await client.query('ROLLBACK');
      transaccionAbierta = false;
      return res.status(400).json({ message: 'El enlace es inválido, ya fue usado o ha expirado' });
    }

    await client.query(
      `UPDATE verificacion_correo SET usado_en = now() WHERE verificacion_id = $1`,
      [verificacion.rows[0].verificacion_id]
    );
    await client.query(
      `UPDATE usuarios
       SET correo_verificado = true, fecha_actualizacion = now()
       WHERE usuario_id = $1`,
      [decoded.usuario_id]
    );

    await client.query('COMMIT');
    transaccionAbierta = false;

    res.json({ message: 'Correo verificado correctamente. Ya puedes iniciar sesión.' });
  } catch (error) {
    if (transaccionAbierta) await client.query('ROLLBACK');
    console.error('Error en verifyEmail:', error);
    res.status(500).json({ message: 'Error del servidor al verificar el correo' });
  } finally {
    client.release();
  }
};

// RS-006: reenviar el enlace sin revelar si la cuenta existe o ya está verificada.
export const resendVerification = async (req, res) => {
  const RESPUESTA_UNIFORME =
    'Si el correo está registrado y aún no está verificado, recibirás un nuevo enlace en unos minutos.';

  try {
    const correo = obtenerCorreo(req.body);
    if (!correo) {
      return res.status(400).json({ message: 'Ingresa tu correo electrónico' });
    }

    const result = await pool.query(
      `SELECT usuario_id, correo
       FROM usuarios
       WHERE correo = $1 AND estado = 'Activo' AND correo_verificado = false`,
      [correo]
    );
    if (result.rows.length === 0) {
      return res.json({ message: RESPUESTA_UNIFORME });
    }

    const usuario = result.rows[0];
    const token = await crearVerificacion(pool, usuario);

    try {
      await enviarCorreoVerificacion(correo, token);
    } catch (error) {
      console.error('Error al reenviar el correo de verificación:', error.message);
    }

    res.json({ message: RESPUESTA_UNIFORME });
  } catch (error) {
    console.error('Error en resendVerification:', error);
    res.status(500).json({ message: 'Error del servidor al reenviar la verificación' });
  }
};

// HU-004: renovar el acceso con la cookie HttpOnly de refresco.
// El token usado se revoca y se emite uno nuevo (rotación).
export const refresh = async (req, res) => {
  const client = await pool.connect();
  let transaccionAbierta = false;
  try {
    const token = leerCookie(req, COOKIE_REFRESCO);
    if (!token) {
      limpiarCookieRefresco(res);
      return res.status(401).json({ message: 'La sesión expiró, inicia sesión de nuevo' });
    }

    await client.query('BEGIN');
    transaccionAbierta = true;

    const { rows } = await client.query(
      `SELECT s.sesion_id, u.usuario_id, u.correo, u.rol, u.estado, u.token_version
       FROM sesiones_refresh s
       JOIN usuarios u ON u.usuario_id = s.usuario_id
       WHERE s.token_hash = $1
         AND s.revocado_en IS NULL
         AND s.expira_en > now()
       FOR UPDATE OF s`,
      [hashToken(token)]
    );

    if (rows.length === 0) {
      await client.query('ROLLBACK');
      transaccionAbierta = false;
      limpiarCookieRefresco(res);
      return res.status(401).json({ message: 'La sesión expiró, inicia sesión de nuevo' });
    }

    const usuario = rows[0];
    if (usuario.estado !== 'Activo') {
      await client.query('ROLLBACK');
      transaccionAbierta = false;
      limpiarCookieRefresco(res);
      return res.status(401).json({ message: 'La sesión ya no es válida' });
    }

    await client.query(
      `UPDATE sesiones_refresh SET revocado_en = now() WHERE sesion_id = $1`,
      [usuario.sesion_id]
    );
    const nuevoRefresco = await crearRefresco(client, usuario.usuario_id);

    await client.query('COMMIT');
    transaccionAbierta = false;

    res.cookie(COOKIE_REFRESCO, nuevoRefresco, opcionesCookieRefresco());
    res.json({ message: 'Sesión renovada', token: firmarSesion(usuario) });
  } catch (error) {
    if (transaccionAbierta) await client.query('ROLLBACK');
    console.error('Error en refresh:', error);
    res.status(500).json({ message: 'Error del servidor al renovar la sesión' });
  } finally {
    client.release();
  }
};

// HU-004: cerrar sesión revoca el refresco en el servidor, no solo en el navegador.
export const logout = async (req, res) => {
  try {
    const token = leerCookie(req, COOKIE_REFRESCO);
    if (token) {
      await pool.query(
        `UPDATE sesiones_refresh
         SET revocado_en = now()
         WHERE token_hash = $1 AND revocado_en IS NULL`,
        [hashToken(token)]
      );
    }

    limpiarCookieRefresco(res);
    res.json({ message: 'Sesión cerrada correctamente' });
  } catch (error) {
    console.error('Error en logout:', error);
    limpiarCookieRefresco(res);
    res.status(500).json({ message: 'Error del servidor al cerrar la sesión' });
  }
};
