// Controlador de autenticación donde las contraseñas van a hacerse hash
//
// Esquema oficial MR_ZENDA: la tabla usuarios usa correo (no email),
// contrasena (no password), el rol es un ENUM en MAYÚSCULAS
// (APRENDIZ/INSTRUCTOR/COORDINADOR/ADMINISTRADOR) y hay un campo estado.
// Todas las fechas (fecha_creacion/fecha_actualizacion) son NOT NULL y
// las ponemos aquí con now().

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../../config/db.js';

// Campos que se devuelven SIEMPRE en un login/registro (nunca la contraseña)
const CAMPOS_PUBLICOS = `
  usuario_id, nombre, apellido, correo, estado,
  tipo_documento, numero_documento,
  fecha_creacion, fecha_actualizacion, rol`;

// Toleramos que el frontend mande email aunque el campo en BD es correo
const obtenerCorreo = (body) => (body.correo || body.email || '').trim().toLowerCase();

// Registrar un nuevo usuario de mierda (siempre queda como APRENDIZ)
// Dominio institucional obligatorio para el auto-registro de aprendices
const DOMINIO_PERMITIDO = '@soy.sena.edu.co';
const SUB_ROLES_VALIDOS = ['Scrum Master', 'Product Owner', 'Developer'];

// Busca (o crea) el grupo "General" de una ficha — mismo patrón que usa
// fichasController, pero aquí no hay admin de por medio: es autoservicio.
// El lider del grupo General queda como el PRIMER aprendiz que se registra
// en esa ficha (si el grupo no existe todavía); si ya existe, no se toca.
async function obtenerOCrearGrupoGeneral(client, fichaId, liderFallbackId) {
  const existente = await client.query(
    'SELECT grupo_id FROM grupos WHERE ficha_id = $1 AND nombre_grupo = $2 LIMIT 1',
    [fichaId, 'General']
  );
  if (existente.rows.length > 0) return existente.rows[0].grupo_id;

  const nuevo = await client.query(
    `INSERT INTO grupos (nombre_grupo, codigo_grupo, ficha_id, lider_id, estado_grupo, fecha_creacion)
     VALUES ('General', $1, $2, $3, 'Activo', now())
     RETURNING grupo_id`,
    [`GRP-GENERAL-${fichaId}`, fichaId, liderFallbackId]
  );
  return nuevo.rows[0].grupo_id;
}

// Registrar un nuevo aprendiz: valida correo institucional, ficha y sub-rol,
// crea el usuario y lo vincula de una vez al grupo General de su ficha.
export const register = async (req, res) => {
  const client = await pool.connect();
  try {
    const { nombre, apellido, tipo_documento, numero_documento, password, numero_ficha, sub_rol } = req.body;
    const correo = obtenerCorreo(req.body);

    if (!nombre || !apellido || !correo || !password) {
      return res.status(400).json({ message: 'Faltan datos del usuario, pon el formulario completo' });
    }

    if (!correo.endsWith(DOMINIO_PERMITIDO)) {
      return res.status(400).json({ message: `El correo debe ser institucional (${DOMINIO_PERMITIDO})` });
    }

    if (!numero_ficha) {
      return res.status(400).json({ message: 'Selecciona tu ficha' });
    }

    if (!sub_rol || !SUB_ROLES_VALIDOS.includes(sub_rol)) {
      return res.status(400).json({ message: 'Selecciona un rol Scrum válido' });
    }

    const existingUser = await pool.query('SELECT usuario_id FROM usuarios WHERE correo = $1', [correo]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Este correo ya está registrado' });
    }

    const ficha = await pool.query('SELECT ficha_id FROM fichas WHERE numero_ficha = $1', [numero_ficha]);
    if (ficha.rows.length === 0) {
      return res.status(400).json({ message: 'Esa ficha no existe' });
    }
    const fichaId = ficha.rows[0].ficha_id;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO usuarios
         (rol, nombre, apellido, correo, contrasena, estado, fecha_creacion, fecha_actualizacion, tipo_documento, numero_documento, sub_rol_intencion)
       VALUES ('APRENDIZ', $1, $2, $3, $4, 'Activo', now(), now(), $5, $6, $7)
       RETURNING ${CAMPOS_PUBLICOS}, sub_rol_intencion`,
      [nombre, apellido, correo, hashedPassword, tipo_documento || 'CC', numero_documento || '', sub_rol]
    );
    const user = result.rows[0];

    // Auto-vincular al grupo General de la ficha elegida (sin password: es autoservicio)
    const grupoId = await obtenerOCrearGrupoGeneral(client, fichaId, user.usuario_id);
    await client.query(
      `INSERT INTO integrantes_grupo (grupo_id, usuario_id, rol_scrum, estado_integrante, fecha_ingreso)
       VALUES ($1, $2, 'Integrante', 'Activo', now())`,
      [grupoId, user.usuario_id]
    );

    await client.query('COMMIT');

    const token = jwt.sign(
      { usuario_id: user.usuario_id, correo: user.correo, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ message: 'Usuario registrado exitosamente', user, token });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en register:', error);
    res.status(500).json({ message: 'Error del servidor, inténtalo de nuevo' });
  } finally {
    client.release();
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