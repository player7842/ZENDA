// Controlador de usuarios donde manejamos a todos hp de la base de datos
// Operaciones CRUD

import pool from '../config/db.js';

// Obtener todos los usuarios - porque necesitamos saber quién es quién en el zoológico
export const getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nombre, apellido, email, ficha, tipo_documento, numero_documento, created_at FROM usuarios ORDER BY id'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};

// Obtener usuario por ID 
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, nombre, apellido, email, ficha, tipo_documento, numero_documento, created_at FROM usuarios WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado, ese güey no existe' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ message: 'Error al obtener usuario' });
  }
};

// Actualizar usuario 
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, email, ficha, tipo_documento, numero_documento } = req.body;
    const result = await pool.query(
      `UPDATE usuarios SET nombre = $1, apellido = $2, email = $3, ficha = $4, tipo_documento = $5, numero_documento = $6
       WHERE id = $7 RETURNING id, nombre, apellido, email, ficha, tipo_documento, numero_documento`,
      [nombre, apellido, email, ficha, tipo_documento, numero_documento, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario actualizado', user: result.rows[0] } );
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ message: 'Error al actualizar usuario' });
  }
};

// Eliminar usuario
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM usuarios WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario eliminado, adiós pendejo' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ message: 'Error al eliminar usuario' });
  }
};
