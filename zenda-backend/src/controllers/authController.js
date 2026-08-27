// Controlador de autenticación donde las contraseñas van a hacerse hash

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

// Registrar un nuevo usuario de mierda
export const register = async (req, res) => {
  try {
    const { nombre, apellido, email, ficha, tipo_documento, numero_documento, password } = req.body;

    // Verificar si el usuario ya existe porque los duplicados no pueden existir
    const existingUser = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Este correo ya está registrado, carajo' });
    }

    // Hashear la contraseña porque no somos venecos que guardan contraseñas en texto plano
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insertar el nuevo usuario en la base de datos 
    const result = await pool.query(
      `INSERT INTO usuarios (nombre, apellido, email, ficha, tipo_documento, numero_documento, password)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, nombre, apellido, email`,
      [nombre, apellido, email, ficha, tipo_documento, numero_documento, hashedPassword]
    );

    // Generar un token JWT  porque necesitamos saber quién putas ingresa
    const token = jwt.sign(
      { id: result.rows[0].id, email: result.rows[0].email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: result.rows[0],
      token
    });
  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ message: 'Error del servidor, inténtalo de nuevo' });
  }
};

// Login - porque necesitamos verificar que no eres un hacker sucio
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar el usuario  porque si no existe paila
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales incorrectas, intenta de nuevo' });
    }

    const user = result.rows[0];

    // Comparar contraseñas
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Credenciales incorrectas, intenta de nuevo' });
    }

    // Generar token JWT 
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // No enviar la contraseña de vuelta porque eso sería estúpido
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login exitoso',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error del servidor, inténtalo de nuevo' });
  }
};
