// ====================================================================
// CONTROLADOR DE USUARIOS — aquí manejamos a todos hp de la base de datos
// ====================================================================
// Esquema oficial MR_ZENDA:
//   - usuarios.pk            = usuario_id
//   - usuarios.correo        (ya no email)
//   - usuarios.contrasena    (hash bcrypt)
//   - usuarios.rol           ENUM en MAYÚSCULAS:
//                             APRENDIZ | INSTRUCTOR | COORDINADOR | ADMINISTRADOR
//   - usuarios.estado        ('Activo'/'Inactivo')
//   - usuarios.fecha_creacion / fecha_actualizacion (NOT NULL)
//   - Extensión única: tipo_documento y numero_documento (la piden los forms)
//
// FICHAS NORMALIZADAS (ya no hay columna ficha varchar):
//   programas ──< fichas ──< instructor_ficha >── usuarios (instructores)
//   fichas ──< grupos ──< integrantes_grupo >── usuarios (aprendices)
//   Un INSTRUCTOR se vincula a fichas mediante instructor_ficha (varias).
//   Un APRENDIZ pertenece a una ficha SOLO a través de un grupo (integrantes).
//
// REGLA DE ORO: toda operación delicada (crear, editar, eliminar, cambiar
// rol, vincular fichas, gestionar fichas/grupos) pide en el body la
// contraseña del admin logueado para confirmar.

import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import verificarPasswordAdmin from '../utils/confirmarAdmin.js';

// Roles permitidos (ENUM en mayúsculas, igual que la BD). Si agregan un rol
// nuevo, tienen que agregarlo aquí también o el backend lo rechazará.
const ROLES_VALIDOS = ['APRENDIZ', 'INSTRUCTOR', 'COORDINADOR', 'ADMINISTRADOR'];

// ==================================================================
// Helper 2: resolverFichas(db, numeros)
// ==================================================================
// Convierte un array de CÓDIGOS de ficha (ej. [2724285, 2724310]) en los
// ficha_id reales de la tabla fichas. Si algún código no existe en la BD,
// no damos el brazo a torcer: tiramos 400 para que nadie vincule humo.
// `db` puede ser el pool o un client dentro de una transacción.
const resolverFichas = async (db, numeros) => {
  const limpio = [...new Set((numeros || []).map((n) => String(n).trim()).filter(Boolean))];
  if (limpio.length === 0) return [];

  const result = await db.query(
    'SELECT ficha_id, numero_ficha FROM fichas WHERE numero_ficha = ANY($1::int[])',
    [limpio.map(Number)]
  );

  const encontrados = new Set(result.rows.map((r) => String(r.numero_ficha)));
  const faltantes = limpio.filter((n) => !encontrados.has(n));
  if (faltantes.length > 0) {
    const err = new Error(`La ficha ${faltantes.join(', ')} no existe en la base de datos`);
    err.codigo = 400;
    throw err;
  }
  return result.rows.map((r) => r.ficha_id);
};

// ==================================================================
// Helper 3: sincronizarFichasInstructor(client, instructorId, fichaIds)
// ==================================================================
// Borra los vínculos actuales del instructor en instructor_ficha y
// reinserta la lista final de fichaIds. Simple y sin estados raros.
// Cuidado: el código SÍNCRONO mira números, pero acá ya llegan ficha_id.
const sincronizarFichasInstructor = async (client, instructorId, fichaIds) => {
  await client.query('DELETE FROM instructor_ficha WHERE instructor_id = $1', [instructorId]);
  for (const fichaId of fichaIds) {
    await client.query(
      'INSERT INTO instructor_ficha (instructor_id, ficha_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [instructorId, fichaId]
    );
  }
};

// ==================================================================
// SELECT_USUARIOS: el template que usan getUsers/getUserById
// ==================================================================
// Field derivados clave (por eso las subconsultas):
//   - fichas: array de CÓDIGOS de ficha (instructor_ficha JOIN fichas).
//     Para simplificarle la vida al frontend guardamos y devolvemos el
//     numero_ficha (no el ficha_id interno). COALESCE => siempre array.
//   - ficha (singular): la ficha de un APRENDIZ, calculada por su grupo.
//     Un aprendiz pasó por integrantes_grupo -> grupos -> fichas; tomamos la
//     más reciente con estado Activo. A instructores/admins esto les da NULL.
const SELECT_USUARIOS = `
  SELECT u.usuario_id, u.nombre, u.apellido, u.correo, u.rol, u.estado,
         u.tipo_documento, u.numero_documento,
         u.fecha_creacion, u.fecha_actualizacion,
         COALESCE((
           SELECT array_agg(f.numero_ficha ORDER BY f.numero_ficha)
           FROM instructor_ficha inf
           JOIN fichas f ON f.ficha_id = inf.ficha_id
           WHERE inf.instructor_id = u.usuario_id
         ), ARRAY[]::int[]) AS fichas,
         (
           SELECT f.numero_ficha
           FROM integrantes_grupo ig
           JOIN grupos g ON g.grupo_id = ig.grupo_id
           JOIN fichas f ON f.ficha_id = g.ficha_id
           WHERE ig.usuario_id = u.usuario_id
             AND ig.estado_integrante = 'Activo'
             AND g.estado_grupo = 'Activo'
           ORDER BY ig.fecha_ingreso DESC
           LIMIT 1
         ) AS ficha
  FROM usuarios u`;

// ==================================================================
// createUser — POST /api/users
// ==================================================================
// Body: { nombre, apellido, correo, tipo_documento, numero_documento,
//         rol, fichas?, userPassword, password }
//   - fichas: (OPCIONAL) array de CÓDIGOS de ficha, SOLO si rol=INSTRUCTOR
//   - userPassword: contraseña del usuario nuevo
//   - password: contraseña del admin que confirma
export const createUser = async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      nombre, apellido, correo, tipo_documento, numero_documento,
      rol, fichas, userPassword, password
    } = req.body;

    const emailFinal = (correo || '').trim().toLowerCase();
    if (!nombre || !apellido || !emailFinal || !numero_documento) {
      return res.status(400).json({ message: 'Faltan datos del usuario, pon el formulario completo' });
    }

    const rolFinal = rol || 'APRENDIZ';
    if (!ROLES_VALIDOS.includes(rolFinal)) {
      return res.status(400).json({ message: 'Ese rol no existe, pon uno de verdad' });
    }

    await verificarPasswordAdmin(req.user.usuario_id, password);

    if (!userPassword || userPassword.length < 8) {
      return res.status(400).json({ message: 'La contraseña del nuevo usuario debe tener mínimo 8 caracteres' });
    }

    const existing = await pool.query('SELECT usuario_id FROM usuarios WHERE correo = $1', [emailFinal]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Ese correo ya está registrado, carajo' });
    }

    // Después de verificar al admin resolvemos las fichas (si el rol es instructor)
    const fichaIds = rolFinal === 'INSTRUCTOR' ? await resolverFichas(client, fichas) : [];

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userPassword, salt);

    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO usuarios
         (rol, nombre, apellido, correo, contrasena, estado, fecha_creacion, fecha_actualizacion, tipo_documento, numero_documento)
       VALUES ($1, $2, $3, $4, $5, 'Activo', now(), now(), $6, $7)
       RETURNING usuario_id, nombre, apellido, correo, rol, estado, tipo_documento, numero_documento`,
      [rolFinal, nombre, apellido, emailFinal, hashedPassword, tipo_documento || 'CC', numero_documento]
    );

    const user = result.rows[0];
    if (rolFinal === 'INSTRUCTOR' && fichaIds.length > 0) {
      await sincronizarFichasInstructor(client, user.usuario_id, fichaIds);
    }

    await client.query('COMMIT');

    res.status(201).json({ message: 'Usuario creado exitosamente', user: { ...user, fichas: fichaIds } });
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.codigo) return res.status(error.codigo).json({ message: error.message });
    console.error('Error al crear usuario:', error);
    res.status(500).json({ message: 'Error del servidor al crear usuario' });
  } finally {
    client.release();
  }
};

// ==================================================================
// getUsers — GET /api/users
// ==================================================================
// Lista TODOS los usuarios con sus campos derivados (fichas / ficha).
// Es solo lectura: no pide contraseña (no modifica nada).
export const getUsers = async (req, res) => {
  try {
    const result = await pool.query(`${SELECT_USUARIOS} ORDER BY u.usuario_id`);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};

// ==================================================================
// getUserById — GET /api/users/:usuario_id
// ==================================================================
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`${SELECT_USUARIOS} WHERE u.usuario_id = $1`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado, ese güey no existe' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ message: 'Error al obtener usuario' });
  }
};

// ==================================================================
// updateUser — PUT /api/users/:id
// ==================================================================
// Edita TODOS los datos del usuario (nombre, apellido, correo, documento,
// rol y opcionalmente estado). NO toca la contraseña del usuario. Sí toca
// las fichas si el rol queda como INSTRUCTOR (las sincroniza) o las limpia
// si deja de serlo. La ficha de un aprendiz NO se toca aquí (se asigna en
// el panel Fichas vía grupos).
export const updateUser = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { nombre, apellido, correo, tipo_documento, numero_documento, rol, fichas, estado, password } = req.body;

    await verificarPasswordAdmin(req.user.usuario_id, password);

    const rolFinal = rol || 'APRENDIZ';
    if (!ROLES_VALIDOS.includes(rolFinal)) {
      return res.status(400).json({ message: 'Ese rol no existe, pon uno válido' });
    }

    const fichaIds = rolFinal === 'INSTRUCTOR' ? await resolverFichas(client, fichas) : [];

    await client.query('BEGIN');

    // El UPDATE anterior no tiene rol/password a la vista: aquí sí manejamos
    // el cambio de rol + la sincronización de fichas dentro de la transacción.
    const result = await client.query(
      `UPDATE usuarios
       SET nombre = $1, apellido = $2, correo = $3, tipo_documento = $4, numero_documento = $5,
           rol = $6, estado = $7, fecha_actualizacion = now()
       WHERE usuario_id = $8
       RETURNING usuario_id, nombre, apellido, correo, rol, estado, tipo_documento, numero_documento`,
      [nombre, apellido, correo, tipo_documento, numero_documento, rolFinal, estado || 'Activo', id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (rolFinal === 'INSTRUCTOR') {
      await sincronizarFichasInstructor(client, id, fichaIds);
    } else {
      await client.query('DELETE FROM instructor_ficha WHERE instructor_id = $1', [id]);
    }

    await client.query('COMMIT');

    res.json({ message: 'Usuario actualizado', user: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.codigo) return res.status(error.codigo).json({ message: error.message });
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ message: 'Error al actualizar usuario' });
  } finally {
    client.release();
  }
};

// ==================================================================
// updateInstructorFichas — PUT /api/users/:id/fichas
// ==================================================================
// SOLO panel Instructores: reemplaza las fichas vinculadas de un instructor.
// Body: { fichas: [numeros...], password }. Resuelve numeros→ficha_id.
export const updateInstructorFichas = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { fichas, password } = req.body;

    await verificarPasswordAdmin(req.user.usuario_id, password);

    const fichaIds = await resolverFichas(client, fichas);

    await client.query('BEGIN');

    const target = await client.query('SELECT usuario_id, rol FROM usuarios WHERE usuario_id = $1', [id]);
    if (target.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    if (target.rows[0].rol !== 'INSTRUCTOR') {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Ese güey no es instructor, no le vincules fichas' });
    }

    await sincronizarFichasInstructor(client, id, fichaIds);

    const updated = await client.query(
      'SELECT usuario_id, nombre, apellido, correo, rol FROM usuarios WHERE usuario_id = $1',
      [id]
    );

    await client.query('COMMIT');

    res.json({ message: 'Fichas vinculadas actualizadas', user: { ...updated.rows[0], fichas: fichaIds } });
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.codigo) return res.status(error.codigo).json({ message: error.message });
    console.error('Error al vincular fichas:', error);
    res.status(500).json({ message: 'Error del servidor al vincular fichas' });
  } finally {
    client.release();
  }
};

// ==================================================================
// deleteUser — DELETE /api/users/:id
// ==================================================================
// Borra un usuario y TODOS sus dependientes a mano, porque el esquema
// MR_ZENDA NO trae ON DELETE CASCADE (las FK son DEFERRABLE INITIALLY
// IMMEDIATE). Si el usuario era lider de grupos, también los borra.
export const deleteUser = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { password } = req.body || {};

    await verificarPasswordAdmin(req.user.usuario_id, password);

    await client.query('BEGIN');

    // 1) Integrantes donde el usuario es miembro
    await client.query('DELETE FROM integrantes_grupo WHERE usuario_id = $1', [id]);
    // 2) Si era lider de algún grupo, limpiamos ese grupo entero (y sus anuncios)
    await client.query('DELETE FROM integrantes_grupo WHERE grupo_id IN (SELECT grupo_id FROM grupos WHERE lider_id = $1)', [id]);
    await client.query('DELETE FROM anuncio_grupo WHERE grupo_id IN (SELECT grupo_id FROM grupos WHERE lider_id = $1)', [id]);
    await client.query('DELETE FROM grupos WHERE lider_id = $1', [id]);
    // 3) Vínculos de instructor
    await client.query('DELETE FROM instructor_ficha WHERE instructor_id = $1', [id]);
    // 4) Referencias en el resto de tablas del esquema
    await client.query('DELETE FROM tareas WHERE responsable_id = $1', [id]);
    await client.query('DELETE FROM eventos WHERE creador_id = $1', [id]);
    await client.query('DELETE FROM anuncios WHERE creador_id = $1', [id]);
    await client.query('DELETE FROM observaciones WHERE instructor_id = $1', [id]);
    await client.query('DELETE FROM evaluaciones WHERE instructor_id = $1', [id]);
    await client.query('DELETE FROM evidencias WHERE usuario_id = $1', [id]);
    // 5) Por fin, el usuario
    const result = await client.query('DELETE FROM usuarios WHERE usuario_id = $1 RETURNING usuario_id', [id]);
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    await client.query('COMMIT');
    res.json({ message: 'Usuario eliminado, adiós pendejo' });
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.codigo) return res.status(error.codigo).json({ message: error.message });
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ message: 'Error al eliminar usuario' });
  } finally {
    client.release();
  }
};

// ==================================================================
// updateUserRol — PUT /api/users/:id/rol
// ==================================================================
// Body: { rol, password }. Si deja de ser INSTRUCTOR se limpian sus fichas
// vinculadas. No deja quitarte tu propio rol de ADMINISTRADOR.
export const updateUserRol = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { rol, password } = req.body;

    if (!ROLES_VALIDOS.includes(rol)) {
      return res.status(400).json({ message: 'Ese rol no existe, pon uno válido' });
    }

    const admin = await verificarPasswordAdmin(req.user.usuario_id, password);

    if (admin.usuario_id === parseInt(id, 10) && rol !== 'ADMINISTRADOR') {
      return res.status(400).json({ message: 'No puedes quitarte tu propio rol de admin, desconfianza' });
    }

    await client.query('BEGIN');

    if (rol !== 'INSTRUCTOR') {
      await client.query('DELETE FROM instructor_ficha WHERE instructor_id = $1', [id]);
    }

    const result = await client.query(
      'UPDATE usuarios SET rol = $1, fecha_actualizacion = now() WHERE usuario_id = $2 RETURNING usuario_id, nombre, apellido, correo, rol',
      [rol, id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    await client.query('COMMIT');
    res.json({ message: 'Rol actualizado exitosamente', user: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.codigo) return res.status(error.codigo).json({ message: error.message });
    console.error('Error al cambiar rol:', error);
    res.status(500).json({ message: 'Error del servidor al cambiar el rol' });
  } finally {
    client.release();
  }
};