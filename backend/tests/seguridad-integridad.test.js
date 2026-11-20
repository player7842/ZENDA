import crypto from 'node:crypto';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import app from '../src/app.js';
import pool from '../src/config/db.js';

let dbDisponible = false;
try {
  const { rows } = await pool.query(
    `SELECT to_regclass('public.usuarios') IS NOT NULL AS usuarios,
            (SELECT count(*)::int FROM usuarios) AS total`,
  );
  dbDisponible = rows[0].usuarios && rows[0].total > 0;
} catch {
  dbDisponible = false;
}

if (!dbDisponible && process.env.REQUIRE_DB === '1') {
  throw new Error('REQUIRE_DB=1 pero PostgreSQL no está disponible.');
}

const api = request(app);
const sufijo = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
let contador = 0;

async function login(correo, password) {
  const respuesta = await api.post('/api/auth/login').send({ correo, password });
  expect(respuesta.status).toBe(200);
  return respuesta.body;
}

async function registrarAprendiz() {
  contador += 1;
  const correo = `seguridad${sufijo}${contador}@soy.sena.edu.co`;
  const registro = await api.post('/api/auth/register').send({
    nombre: 'Seguridad',
    apellido: `Prueba ${contador}`,
    correo,
    tipo_documento: 'CC',
    numero_documento: String(2100000000 + contador),
    password: 'Prueba123!',
    numero_ficha: '2724285',
    acepta_terminos: true,
    acepta_privacidad: true,
    acepta_cookies: true,
    acepta_tratamiento_datos: true,
  });
  expect(registro.status).toBe(201);
  await pool.query('UPDATE usuarios SET correo_verificado = true WHERE correo = $1', [correo]);
  return login(correo, 'Prueba123!');
}

describe.skipIf(!dbDisponible)('seguridad e integridad administrativa', () => {
  let admin;
  let instructor;
  let lider;
  let integrante;
  let grupoId;
  let fichaId;

  beforeAll(async () => {
    admin = await login(process.env.ADMIN_EMAIL || 'admin@zenda.com', process.env.ADMIN_PASSWORD || 'Admin123!');
    instructor = await login('felipe@zenda.com', 'Prueba123!');
    lider = await registrarAprendiz();
    integrante = await registrarAprendiz();

    const creacion = await api
      .post('/api/aprendiz/proyectos')
      .set('Authorization', `Bearer ${lider.token}`)
      .send({
        nombre_grupo: `Grupo seguridad ${sufijo}`,
        nombre_proyecto: `Proyecto seguridad ${sufijo}`,
        descripcion: 'Proyecto para validar integridad administrativa.',
        problema: 'Validar protecciones de borrado.',
        objetivo: 'Conservar el historial asociado.',
        alcance: 'Prueba de integración aislada.',
        tecnologias: 'Node.js',
        fecha_inicio: '2026-01-10',
        fecha_fin_estimada: '2026-06-10',
        cupo_maximo: 2,
      });
    expect(creacion.status).toBe(201);
    grupoId = creacion.body.grupo_id;

    const union = await api
      .post('/api/aprendiz/proyectos/unirse')
      .set('Authorization', `Bearer ${integrante.token}`)
      .send({ codigo_grupo: creacion.body.codigo_grupo });
    expect(union.status).toBe(200);

    const ficha = await pool.query('SELECT ficha_id FROM grupos WHERE grupo_id = $1', [grupoId]);
    fichaId = ficha.rows[0].ficha_id;
  });

  afterAll(async () => {
    await pool.end();
  });

  it('rechaza accesos de roles no autorizados', async () => {
    const aprendizAdmin = await api
      .get('/api/users')
      .set('Authorization', `Bearer ${lider.token}`);
    expect(aprendizAdmin.status).toBe(403);

    const instructorProyecto = await api
      .post('/api/aprendiz/proyectos')
      .set('Authorization', `Bearer ${instructor.token}`)
      .send({});
    expect(instructorProyecto.status).toBe(403);

    const adminProyecto = await api
      .post('/api/aprendiz/proyectos/tareas')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({});
    expect(adminProyecto.status).toBe(403);
  });

  it('mantiene respuesta uniforme al solicitar recuperación', async () => {
    const existente = await api.post('/api/auth/forgot-password').send({ correo: admin.user.correo });
    const inexistente = await api
      .post('/api/auth/forgot-password')
      .send({ correo: `ausente${crypto.randomBytes(4).toString('hex')}@soy.sena.edu.co` });

    expect(existente.status).toBe(200);
    expect(inexistente.status).toBe(200);
    expect(existente.body).toEqual(inexistente.body);
  });

  it('protege un líder y su ficha contra eliminación destructiva', async () => {
    const usuario = await api
      .delete(`/api/users/${lider.user.usuario_id}`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ password: process.env.ADMIN_PASSWORD || 'Admin123!' });
    expect(usuario.status).toBe(409);
    expect(usuario.body.codigo).toBe('USUARIO_CON_HISTORIAL');
    expect(Number(usuario.body.dependencias.liderazgos)).toBeGreaterThan(0);

    const ficha = await api
      .delete(`/api/fichas/${fichaId}`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ password: process.env.ADMIN_PASSWORD || 'Admin123!' });
    expect(ficha.status).toBe(409);
    expect(ficha.body.codigo).toBe('FICHA_CON_HISTORIAL');
    expect(Number(ficha.body.dependencias.proyectos)).toBeGreaterThan(0);
  });

  it('reasigna liderazgo solamente a un integrante activo del grupo', async () => {
    const ajeno = await registrarAprendiz();
    const externo = await api
      .put(`/api/grupos/${grupoId}/lider`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ nuevo_lider_id: ajeno.user.usuario_id, password: process.env.ADMIN_PASSWORD || 'Admin123!' });
    expect(externo.status).toBe(400);

    const reasignado = await api
      .put(`/api/grupos/${grupoId}/lider`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ nuevo_lider_id: integrante.user.usuario_id, password: process.env.ADMIN_PASSWORD || 'Admin123!' });
    expect(reasignado.status).toBe(200);
    expect(reasignado.body.lider_id).toBe(integrante.user.usuario_id);

    const confirmacion = await pool.query('SELECT lider_id FROM grupos WHERE grupo_id = $1', [grupoId]);
    expect(confirmacion.rows[0].lider_id).toBe(integrante.user.usuario_id);
  });

  it('exige confirmación administrativa para reasignar liderazgo', async () => {
    const sinPassword = await api
      .put(`/api/grupos/${grupoId}/lider`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ nuevo_lider_id: integrante.user.usuario_id });
    expect(sinPassword.status).toBe(400);
  });
});
