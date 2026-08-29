// Controlador de autenticación donde las contraseñas van a hacerse hash
//
// Esquema oficial MR_ZENDA: la tabla usuarios usa correo (no email),
// contrasena (no password), el rol es un ENUM en MAYÚSCULAS
// (APRENDIZ/INSTRUCTOR/COORDINADOR/ADMINISTRADOR) y hay un campo estado.
// Todas las fechas (fecha_creacion/fecha_actualizacion) son NOT NULL y
// las ponemos aquí con now().

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

// Campos que se devuelven SIEMPRE en un login/registro (nunca la contraseña)
const CAMPOS_PUBLICOS = `
  usuario_id, nombre, apellido, correo, estado,
  tipo_documento, numero_documento,
  fecha_creacion, fecha_actualizacion, rol`;

// Toleramos que el frontend mande email aunque el campo en BD es correo
const obtenerCorreo = (body) => (body.correo || body.email || '').trim().toLowerCase();

// Registrar un nuevo usuario de mierda (siempre queda como APRENDIZ)
export const register = async (req, res) => {
  try {
    const { nombre, apellido, tipo_documento, numero_documento, password } = req.body;
    const correo = obtenerCorreo(req.body);

    if (!nombre || !apellido || !correo || !password) {
      return res.status(400).json({ message: 'Faltan datos del usuario, pon el formulario completo' });
    }

    // Verificar si el usuario ya existe porque los duplicados no pueden existir
    const existingUser = await pool.query('SELECT usuario_id FROM usuarios WHERE correo = $1', [correo]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Este correo ya está registrado, carajo' });
    }

    // Hashear la contraseña porque no guardamos contraseñas en texto plano
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // La ficha de un aprendiz NO se asigna aquí: en el esquema oficial eso
    // se hace vinculando al usuario a un grupo (lo hace el admin en el panel).
    const result = await pool.query(
      `INSERT INTO usuarios
         (rol, nombre, apellido, correo, contrasena, estado, fecha_creacion, fecha_actualizacion, tipo_documento, numero_documento)
       VALUES ('APRENDIZ', $1, $2, $3, $4, 'Activo', now(), now(), $5, $6)
       RETURNING ${CAMPOS_PUBLICOS}`,
      [nombre, apellido, correo, hashedPassword, tipo_documento || 'CC', numero_documento || '']
    );

    // Generar un token JWT porque necesitamos saber quién putas ingresa
    const user = result.rows[0];
    const token = jwt.sign(
      { usuario_id: user.usuario_id, correo: user.correo, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ message: 'Usuario registrado exitosamente', user, token });
  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ message: 'Error del servidor, inténtalo de nuevo' });
  }
};

// Login - porque necesitamos verificar que no eres un hacker sucio
export const login = async (req, res) => {
  try {
    const { password } = req.body;
    const correo = obtenerCorreo(req.body);

    // Buscar el usuario porque si no existe paila
    const result = await pool.query(`SELECT * FROM usuarios WHERE correo = $1`, [correo]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales incorrectas, intenta de nuevo' });
    }

    const user = result.rows[0];

    // Usuario desactivado no entra, ni con la contraseña correcta
    if (user.estado !== 'Activo') {
      return res.status(403).json({ message: 'Tu cuenta está inactiva, habla con un administrador' });
    }

    // Comparar contraseñas
    const validPassword = await bcrypt.compare(password, user.contrasena);
    if (!validPassword) {
      return res.status(401).json({ message: 'Credenciales incorrectas, intenta de nuevo' });
    }

    // Generar token JWT con el rol en mayúsculas (ENUM de la BD)
    const token = jwt.sign(
      { usuario_id: user.usuario_id, correo: user.correo, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // No enviar la contraseña de vuelta porque eso sería estúpido
    const { contrasena, ...userWithoutPassword } = user;

    res.json({ message: 'Login exitoso', user: userWithoutPassword, token });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error del servidor, inténtalo de nuevo' });
  }
};