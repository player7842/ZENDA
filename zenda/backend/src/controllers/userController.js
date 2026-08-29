// Este archivo es el único que sabe cómo:
//   1. Crear usuarios (createUser)                POST   /api/users
//   2. Listarlos (getUsers)                       GET    /api/users
//   3. Ver uno por ID (getUserById)               GET    /api/users/:id
//   4. Editar todo un usuario (updateUser)        PUT    /api/users/:id
//   5. Vincular fichas a un instructor            PUT    /api/users/:id/fichas
//      (updateInstructorFichas)
//   6. Cambiarle el rol (updateUserRol)           PUT    /api/users/:id/rol
//   7. Eliminarlo (deleteUser)                    DELETE /api/users/:id
//
// REGLA DE ORO: toda operación delicada (crear, editar, eliminar, cambiar
// rol, vincular fichas) pide en el body la contraseña del admin LOGUEADO
// para confirmar. Eso lo hace el helper verificarPasswordAdmin().
//
// Roles existentes:
//   aprendiz    -> estudiante (tiene UNA sola ficha en la columna u.ficha)
//   instructor  -> puede estar en VARIAS fichas (tabla instructor_fichas)
//   coordinador -> rol nuevo, NO tiene acceso al panel admin
//   admin       -> el único que entra al panel y ejecuta estas acciones

import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

// Roles permitidos, la única fuente de verdad para validar. Si agregan un rol nuevo a la BD,
// tienen que agregarlo aquí también o el backend lo rechazará.
const ROLES_VALIDOS = ['aprendiz', 'instructor', 'coordinador', 'admin'];

// Verifica que el que está pidiendo
// la acción (el admin logueado, cuyo id viene de req.user.id que puso el
// middleware auth) realmente existe, es admin y mandó su contraseña bien.
//
// Orden de validaciones (y el código HTTP que lanza cada una):
//   1. ¿Vino password en el body?      -> 400 (falta campo)
//   2. ¿El usuario existe en la BD?    -> 401 (no existe)
//   3. ¿Su rol es "admin"?             -> 403 (es otro rol)
//   4. ¿La contraseña coincide (bcrypt)? -> 401 (contraseña mala)
//
// IMPORTANTE: en vez de devolver un res, LANZA un Error con la propiedad
// extra `err.codigo`. Cada función la captura en su catch y responde
// `res.status(err.codigo).json(...)`. Así este helper se reutiliza en
// todas las rutas sin repetir código de respuestas.
// Devuelve el admin (se usa en updateUserRol para saber si es él mismo).
const verificarPasswordAdmin = async (idAdmin, password) => {
  if (!password) {
    const err = new Error('Necesito tu contraseña para confirmar la acción');
    err.codigo = 400;
    throw err;
  }

  // Consulta con parámetro ($1) NUNCA interpolamos strings directo para
  // evitar inyección SQL. idAdmin viene del payload del JWT, no del body.
  const adminResult = await pool.query(
    'SELECT id, password, rol FROM usuarios WHERE id = $1',
    [idAdmin]
  );
  if (adminResult.rows.length === 0) {
    const err = new Error('Tu usuario no existe en la base de datos');
    err.codigo = 401;
    throw err;
  }

  const admin = adminResult.rows[0];
  // Un instructor o coordinador con JWT válido de todas formas NO puede
  // pintar de admin las acciones porque aquí se le corta el paso.
  if (admin.rol !== 'admin') {
    const err = new Error('No eres admin, qué haces aquí');
    err.codigo = 403;
    throw err;
  }

  // bcrypt.compare() hace el hash de la contraseña mandada y lo compara con
  // el hash guardado. Es LENTO a propósito (costo de seguridad). Nunca
  // guardamos/comparemos contraseñas en texto plano
  const passwordValida = await bcrypt.compare(password, admin.password);
  if (!passwordValida) {
    const err = new Error('Contraseña incorrecta, no se hizo nada');
    err.codigo = 401;
    throw err;
  }
  return admin;
};

// Toma lo que mande el frontend (o el JSON del body) y lo deja presentable:
//   - Si no es un array (vino vacío, null o un string) -> devuelve [].
//   - Convierte cada elemento a string, le quita espacios por los lados,
//     descarta vacíos y ELIMINA duplicados (Set) por si mandaron dos iguales.
// Útil porque los códigos de ficha en el frontend son strings (ej. "2724285")
// y el admin podría escribir "2724285 " con espacios de más.
const normalizarFichas = (fichas) => {
  if (!Array.isArray(fichas)) return [];
  return [...new Set(fichas.map((f) => String(f).trim()).filter(Boolean))];
};


// ESTRATEGIA "borra todo y vuelve a insertar": como queremos que la lista
// final sea EXACTAMENTE la que se mandó no andamos calculando qué agregar y
// qué quitar. Borramos los vínculos actuales del instructor y reinsertamos
// los que vienen. Simple y sin estados raros.
//
// `client` (no `pool`) porque este helper se llama DENTRO de una transacción
// (BEGIN/COMMIT/ROLLBACK): todas las queries deben ir por el MIMO cliente
// para que la transacción los cubra a todos.
// ON CONFLICT DO NOTHING: si por casualidad ya existía la fila (no debería,
// porque la acabamos de borrar), no revienta.
const sincronizarFichasInstructor = async (client, instructorId, fichas) => {
  await client.query('DELETE FROM instructor_fichas WHERE instructor_id = $1', [instructorId]);
  for (const ficha of fichas) {
    await client.query(
      'INSERT INTO instructor_fichas (instructor_id, ficha) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [instructorId, ficha]
    );
  }
};

// Query base 
// La subconsulta con COALESCE + array_agg es la clave del feature de
// múltiples fichas:
//   - array_agg(inf.ficha ORDER BY inf.ficha) agrupa TODAS las fichas del
//     instructor en un array de PostgreSQL E IN ORDEN.
//   - El WHERE inf.instructor_id = u.id la conecta fila por fila (por cada
//     usuario se hace su subconsulta).
//   - COALESCE(..., ARRAY[]::varchar[]) -> si el usuario NO es instructor
//     (no tiene filas en instructor_fichas) la subconsulta devuelve NULL,
//     así que lo reemplazamos por un array vacío. Así el frontend SIEMPRE
//     recibe `fichas: []` y no tiene que adivinar si es null o array.
// Nota: a los estudiantes igual les llega [] (no tienen vínculos), la ficha
// única de ellos sigue viviendo en la columna u.ficha.
const SELECT_USUARIOS = `
  SELECT u.id, u.nombre, u.apellido, u.email, u.ficha, u.tipo_documento, u.numero_documento, u.rol, u.created_at,
         COALESCE((
           SELECT array_agg(inf.ficha ORDER BY inf.ficha)
           FROM instructor_fichas inf WHERE inf.instructor_id = u.id
         ), ARRAY[]::varchar[]) AS fichas
  FROM usuarios u`;

// Crea un usuario de CUALQUIER rol. El frontend lo usa desde:
//   - Panel Fichas      -> rol "aprendiz" con su ficha única
//   - Panel Instructores-> rol "instructor" (+ fichas vacías, se vinculan luego)
//   - Panel Usuarios    -> el rol que tenga activo en el mini menú
//
// Body esperado (además del JWT del admin en el header):
//   { nombre, apellido, email, ficha, tipo_documento, numero_documento,
//     rol, fichas?, userPassword, password }
//     - fichas       (OPCIONAL, array) solo se usa si rol = instructor
//     - userPassword (obligatoria) contraseña del usuario NUEVO
//     - password     (obligatoria) contraseña del admin que CONFIRMA
//
// Orden de la función:
//   1. Valida campos obligatorios del usuario (400).
//   2. Valida el rol contra ROLES_VALIDOS (400).
//   3. Decide y limpia las fichas según el rol.
//   4. Verifica al admin con su contraseña (los 4 checks del helper).
//   5. Valida que la contraseña del nuevo tenga mínimo 8 caracteres (400).
//   6. Revisa que el email no exista ya (400).
//   7. Hashea la contraseña del nuevo con bcrypt (NUNCA se guarda plana).
//   8. Dentro de TRANSACCIÓN: inserta el usuario y, si es instructor con
//      fichas, sincroniza instructor_fichas con el MISMO client.
//   9. COMMIT y responde 201. Si algo falla, ROLLBACK revierte todo
//      (por eso el hash previo no deja huella ni el usuario ni sus fichas).
export const createUser = async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      nombre, apellido, email, ficha, tipo_documento, numero_documento,
      rol, fichas, userPassword, password
    } = req.body;

    if (!nombre || !apellido || !email || !numero_documento) {
      return res.status(400).json({ message: 'Faltan datos del usuario, pon el formulario completo' });
    }

    // Si no mandan rol, asumimos aprendiz (el caso más común)
    const rolFinal = rol || 'aprendiz';
    if (!ROLES_VALIDOS.includes(rolFinal)) {
      return res.status(400).json({ message: 'Ese rol no existe, pon uno de verdad' });
    }

    // Solo los instructores manejan array de fichas; a los demás les ponemos [].
    // Así aunque manden fichas por error en un aprendiz, no se crea nada raro.
    const fichasLimpio = rolFinal === 'instructor' ? normalizarFichas(fichas) : [];

    await verificarPasswordAdmin(req.user.id, password);

    if (!userPassword || userPassword.length < 8) {
      return res.status(400).json({ message: 'La contraseña del nuevo usuario debe tener mínimo 8 caracteres' });
    }

    const existing = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Ese correo ya está registrado, carajo' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userPassword, salt);

    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO usuarios (nombre, apellido, email, ficha, tipo_documento, numero_documento, password, rol)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, nombre, apellido, email, ficha, tipo_documento, numero_documento, rol`,
      // ficha y tipo_documento van con fallback ('', 'CC') por si no los mandaron
      [nombre, apellido, email, ficha || '', tipo_documento || 'CC', numero_documento, hashedPassword, rolFinal]
    );

    const user = result.rows[0];
    if (rolFinal === 'instructor' && fichasLimpio.length > 0) {
      await sincronizarFichasInstructor(client, user.id, fichasLimpio);
    }

    await client.query('COMMIT');

    // Formamos la respuesta con los campos del INSERT + el array fichas,
    // así el frontend lo puede pintar directo sin otra consulta.
    res.status(201).json({ message: 'Usuario creado exitosamente', user: { ...user, fichas: fichasLimpio } });
  } catch (error) {
    await client.query('ROLLBACK');
    // Los errores "amistosos" traen err.codigo (los lanzó el helper o los 400s
    // de arriba). Todo lo demás es un error real del servidor: 500.
    if (error.codigo) return res.status(error.codigo).json({ message: error.message });
    console.error('Error al crear usuario:', error);
    res.status(500).json({ message: 'Error del servidor al crear usuario' });
  } finally {
    // SIEMPRE devolvemos el cliente al pool, pase lo que pase.
    // Si no, se acaban las conexiones y el server muere lento.
    client.release();
  }
};

//los benditos gets
// Lista TODOS los usuarios del sistema con los mismos campos + el array
// `fichas` (para instructores) que calcula SELECT_USUARIOS.
// Es solo lectura: NO pide contraseña (no modifica nada), solo el JWT del
// admin para poder entrar (auth + isAdmin ya lo validaron en la ruta).
// Respuesta: un ARRAY de objetos, no uno solo como las demás.
export const getUsers = async (req, res) => {
  try {
    // SELECT_USUARIOS no termina en ";" a propósito para poder concatenarle
    // el ORDER BY aquí (y el WHERE en getUserById).
    const result = await pool.query(`${SELECT_USUARIOS} ORDER BY u.id`);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};


// Igual que getUsers pero filtra por el ID que va en la URL (req.params.id).
// <- El parámetro se pasa como $1, de nuevo anti-inyección SQL.
// Si no encuentra nada responde 404 para que el frontend no reviente.
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`${SELECT_USUARIOS} WHERE u.id = $1`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado, ese güey no existe' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ message: 'Error al obtener usuario' });
  }
};
//los benditos puts
// Edita TODOS los datos de un usuario (nombre, apellido, email, ficha,
// documento y rol). El frontend lo usa desde "Editar usuario" del panel
// Usuarios y desde "Editar" del panel Instructores.
//
// IMPORTANTE: este endpoint NO modifica la contraseña del usuario editado
// (ese hash es intocable por seguridad; si hay que cambiarla se habla aparte).
// Solo requiere `password` = la del admin que está confirmando.
//
// Detalle de fichas aquí (el caso complicado):
//   - Si el rol final es "instructor" -> se sincronizan las fichas recibidas.
//   - Si el rol final es OTRO (aprendiz/coordinador/admin) -> se BORRAN los
//     vínculos de instructor_fichas de ese usuario, porque ya no es
//     instructor y no debería tener fichas vinculadas. No dejar huellas.
export const updateUser = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { nombre, apellido, email, ficha, tipo_documento, numero_documento, rol, fichas, password } = req.body;

    await verificarPasswordAdmin(req.user.id, password);

    const rolFinal = rol || 'aprendiz';
    if (!ROLES_VALIDOS.includes(rolFinal)) {
      return res.status(400).json({ message: 'Ese rol no existe, pon uno válido' });
    }

    const fichasLimpio = rolFinal === 'instructor' ? normalizarFichas(fichas) : [];

    await client.query('BEGIN');

    const result = await client.query(
      `UPDATE usuarios
       SET nombre = $1, apellido = $2, email = $3, ficha = $4, tipo_documento = $5, numero_documento = $6, rol = $7
       WHERE id = $8
       RETURNING id, nombre, apellido, email, ficha, tipo_documento, numero_documento, rol`,
      [nombre, apellido, email, ficha, tipo_documento, numero_documento, rolFinal, id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Si quedó como instructor, sincronizamos sus fichas; si dejó de serlo, las limpiamos
    if (rolFinal === 'instructor') {
      await sincronizarFichasInstructor(client, id, fichasLimpio);
    } else {
      await client.query('DELETE FROM instructor_fichas WHERE instructor_id = $1', [id]);
    }

    await client.query('COMMIT');

    res.json({ message: 'Usuario actualizado', user: { ...result.rows[0], fichas: fichasLimpio } });
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.codigo) return res.status(error.codigo).json({ message: error.message });
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ message: 'Error al actualizar usuario' });
  } finally {
    client.release();
  }
};


// El endpoint SOLO del panel Instructores: reemplaza la lista completa de
// fichas a las que está vinculado un instructor.
//
// Body: { fichas: ['2724285', '2724320', ...], password }
//
// A diferencia de updateUser (que toca todo el usuario), aquí SOLO tocamos
// la tabla instructor_fichas. Flujo:
//   1. Verifica al admin con su contraseña.
//   2. Normaliza el array de fichas.
//   3. DENTRO de transacción: verifica que el objetivo EXISTA y sea
//      instructor (si no, 404 o 400 — no le vamos a poner fichas a un
//      aprendiz ni a un admin).
//   4. Reemplaza los vínculos (borra + inserta) con el mismo client.
//   5. Vuelve a leer el usuario para responderlo completo.
export const updateInstructorFichas = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { fichas, password } = req.body;

    await verificarPasswordAdmin(req.user.id, password);

    const fichasLimpio = normalizarFichas(fichas);

    await client.query('BEGIN');

    // El objetivo debe existir y ser instructor
    const target = await client.query('SELECT id, rol FROM usuarios WHERE id = $1', [id]);
    if (target.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    if (target.rows[0].rol !== 'instructor') {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Ese güey no es instructor, no le vincules fichas' });
    }

    await sincronizarFichasInstructor(client, id, fichasLimpio);

    const updated = await client.query(
      'SELECT id, nombre, apellido, email, ficha, rol FROM usuarios WHERE id = $1',
      [id]
    );

    await client.query('COMMIT');

    res.json({ message: 'Fichas vinculadas actualizadas', user: { ...updated.rows[0], fichas: fichasLimpio } });
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.codigo) return res.status(error.codigo).json({ message: error.message });
    console.error('Error al vincular fichas:', error);
    res.status(500).json({ message: 'Error del servidor al vincular fichas' });
  } finally {
    client.release();
  }
};

//el bendito delete
// Borra un usuario. Body: { password } (la del admin).
// No necesita transacción propia porque es UN solo DELETE, y como la tabla
// instructor_fichas tiene la FK con ON DELETE CASCADE, PostgreSQL se
// encarga SOLO de borrar los vínculos de fichas si el que se borra era
// instructor. El `RETURNING id` nos dice cuántas filas tocó: si no borró
// nada, el usuario no existía y respondemos 404.
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    // req.body puede venir vacío según el cliente, por eso el `|| {}`
    const { password } = req.body || {};

    await verificarPasswordAdmin(req.user.id, password);

    const result = await pool.query('DELETE FROM usuarios WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario eliminado, adiós pendejo' });
  } catch (error) {
    if (error.codigo) return res.status(error.codigo).json({ message: error.message });
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ message: 'Error al eliminar usuario' });
  }
};

//El put del rol de users
// El "viejo" panel Roles: solo cambia el rol de un usuario.
// Body: { rol, password }
//
// Protecciones especiales:
//   - Si deja de ser instructor, se limpian sus fichas vinculadas (ya no
//     las necesita, no puede conservar vínculos que su rol no soporta).
//   - NO te deja quitarte tu propio rol de admin: un sistema con cero
//     admins después del cambiazo sería un desastre. Si el id de la ruta es
//     el DEL ADMIN LOGUEADO y mandan un rol distinto a "admin" -> 400.
export const updateUserRol = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { rol, password } = req.body;

    if (!ROLES_VALIDOS.includes(rol)) {
      return res.status(400).json({ message: 'Ese rol no existe, pon uno válido' });
    }

    // Sacamos `admin` del helper para comparar ids abajo
    const admin = await verificarPasswordAdmin(req.user.id, password);

    // parseInt porque el id de la ruta llega como string ("2") y admin.id es número (2)
    if (admin.id === parseInt(id, 10) && rol !== 'admin') {
      return res.status(400).json({ message: 'No puedes quitarte tu propio rol de admin, desconfianza' });
    }

    await client.query('BEGIN');

    // Si deja de ser instructor, limpiamos sus fichas vinculadas
    if (rol !== 'instructor') {
      await client.query('DELETE FROM instructor_fichas WHERE instructor_id = $1', [id]);
    }

    const result = await client.query(
      'UPDATE usuarios SET rol = $1 WHERE id = $2 RETURNING id, nombre, apellido, email, ficha, rol',
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