/*
  Pruebas de integración de Semana 2 (C-03).

  Usan Supertest contra la app real y PostgreSQL. Si no hay base de datos o
  no está cargado el esquema actual, la suite se omite: así `pnpm test`
  sigue funcionando en un equipo sin PostgreSQL, mientras que el CI (que sí
  carga `Database/zenda_bd.sql`) ejecuta todas las pruebas.

  Fuera del alcance: archivos binarios de HU-020.
*/

import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import app from '../src/app.js';
import pool from '../src/config/db.js';
import env from '../src/config/env.js';

let dbDisponible = false;
try {
  const { rows } = await pool.query(
    `SELECT
       to_regclass('public.usuarios') IS NOT NULL AS usuarios,
       to_regclass('public.recuperacion_contrasena') IS NOT NULL AS recuperacion,
       (SELECT count(*)::int FROM usuarios) AS total`
  );
  dbDisponible = rows[0].usuarios && rows[0].recuperacion && rows[0].total > 0;
} catch {
  dbDisponible = false;
}

// En CI (REQUIRE_DB=1) la suite no puede omitirse: si la base no está lista,
// el pipeline debe fallar en vez de reportar verde sin ejecutar integración.
if (!dbDisponible && process.env.REQUIRE_DB === '1') {
  throw new Error(
    'REQUIRE_DB=1 pero PostgreSQL no está disponible: las pruebas de integración no pueden omitirse.'
  );
}

// Credenciales de administración para las pruebas de integración.
// Se leen de variables de entorno para no tener credenciales hardcodeadas.
// En desarrollo local se pueden usar valores por defecto; en CI/Render/Neon
// deben definirse ADMIN_EMAIL y ADMIN_PASSWORD con credenciales reales del seed.
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@zenda.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!';

if (process.env.REQUIRE_DB === '1' && (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD)) {
  throw new Error(
    'REQUIRE_DB=1 pero faltan ADMIN_EMAIL o ADMIN_PASSWORD. Define ambas variables de entorno antes de ejecutar las pruebas de integración en CI.'
  );
}

const api = request(app);
const sufijo = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
let contador = 0;

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

async function login(correo, password) {
  const respuesta = await api.post('/api/auth/login').send({ correo, password });
  expect(respuesta.status).toBe(200);
  return respuesta.body;
}

async function registrarAprendiz({ ficha = '2724285' } = {}) {
  contador += 1;
  const correo = `integracion${sufijo}${contador}@soy.sena.edu.co`;
  const respuesta = await api.post('/api/auth/register').send({
    nombre: 'Prueba',
    apellido: `Integración ${contador}`,
    correo,
    tipo_documento: 'CC',
    numero_documento: String(2000000000 + contador),
    password: 'Prueba123!',
    numero_ficha: ficha,
    acepta_terminos: true,
    acepta_privacidad: true,
    acepta_cookies: true,
    acepta_tratamiento_datos: true,
  });
  expect(respuesta.status).toBe(201);
  expect(respuesta.body.requiere_verificacion).toBe(true);

  // La verificación real llega por correo. En pruebas se marca en la base y
  // se inicia sesión para obtener el token de acceso.
  await pool.query('UPDATE usuarios SET correo_verificado = true WHERE correo = $1', [correo]);
  const sesion = await login(correo, 'Prueba123!');

  return { ...respuesta.body, ...sesion };
}

describe.skipIf(!dbDisponible)('Integración Semana 2', () => {
  let admin;
  let instructor;
  let lider;
  let segundo;
  let ajeno;
  let proyecto;
  let fase;
  let carpetaId;
  let evidenciaIds = [];

  beforeAll(async () => {
    admin = await login(ADMIN_EMAIL, ADMIN_PASSWORD);
    instructor = await login('felipe@zenda.com', 'Prueba123!');
  });

  afterAll(async () => {
    await pool.end();
  });

  it('HU-001: registro con correo institucional, documento y cuatro aceptaciones', async () => {
    const base = {
      nombre: 'Ana',
      apellido: 'Legal',
      correo: `legal${sufijo}@soy.sena.edu.co`,
      tipo_documento: 'CC',
      numero_documento: '2011111111',
      password: 'Prueba123!',
      numero_ficha: '2724285',
    };

    const sinAceptaciones = await api.post('/api/auth/register').send(base);
    expect(sinAceptaciones.status).toBe(400);

    const correoInvalido = await api.post('/api/auth/register').send({
      ...base,
      correo: '@soy.sena.edu.co',
      acepta_terminos: true,
      acepta_privacidad: true,
      acepta_cookies: true,
      acepta_tratamiento_datos: true,
    });
    expect(correoInvalido.status).toBe(400);

    const tipoInvalido = await api.post('/api/auth/register').send({
      ...base,
      correo: `legal${sufijo}b@soy.sena.edu.co`,
      tipo_documento: 'OTRO',
      acepta_terminos: true,
      acepta_privacidad: true,
      acepta_cookies: true,
      acepta_tratamiento_datos: true,
    });
    expect(tipoInvalido.status).toBe(400);

    lider = await registrarAprendiz();
    expect(lider.token).toBeTruthy();
    expect(lider.user.rol).toBe('APRENDIZ');
  });

  it('RS-006: honeypot, verificación de correo y bloqueo de login sin verificar', async () => {
    contador += 1;
    const correo = `verifica${sufijo}${contador}@soy.sena.edu.co`;
    const base = {
      nombre: 'Vera',
      apellido: 'Verificación',
      correo,
      tipo_documento: 'CC',
      numero_documento: String(2020000000 + contador),
      password: 'Prueba123!',
      numero_ficha: '2724285',
      acepta_terminos: true,
      acepta_privacidad: true,
      acepta_cookies: true,
      acepta_tratamiento_datos: true,
    };

    // El campo trampa rechaza al bot y no deja ninguna cuenta creada.
    const bot = await api
      .post('/api/auth/register')
      .send({ ...base, sitio_web: 'https://spam.example' });
    expect(bot.status).toBe(400);
    const cuentaBot = await pool.query('SELECT 1 FROM usuarios WHERE correo = $1', [correo]);
    expect(cuentaBot.rowCount).toBe(0);

    // Registro real: sin token de sesión y pendiente de verificación.
    const registro = await api.post('/api/auth/register').send(base);
    expect(registro.status).toBe(201);
    expect(registro.body.token).toBeUndefined();
    expect(registro.body.requiere_verificacion).toBe(true);
    expect(registro.body.user.correo_verificado).toBe(false);

    const usuarioId = registro.body.user.usuario_id;

    const bloqueado = await api
      .post('/api/auth/login')
      .send({ correo, password: 'Prueba123!' });
    expect(bloqueado.status).toBe(403);
    expect(bloqueado.body.codigo).toBe('CORREO_NO_VERIFICADO');

    // No hay correo saliente en pruebas: se inserta un token conocido.
    const token = jwt.sign(
      { usuario_id: usuarioId, correo, purpose: 'verify' },
      env.jwtSecret,
      { expiresIn: '24h' }
    );
    await pool.query('DELETE FROM verificacion_correo WHERE usuario_id = $1', [usuarioId]);
    await pool.query(
      `INSERT INTO verificacion_correo (usuario_id, token_hash, expira_en)
       VALUES ($1, $2, now() + interval '24 hours')`,
      [usuarioId, hashToken(token)]
    );

    // Un token de sesión no sirve para verificar el correo.
    const sesionComoToken = await api.post('/api/auth/verify-email').send({ token: lider.token });
    expect(sesionComoToken.status).toBe(400);

    const verificado = await api.post('/api/auth/verify-email').send({ token });
    expect(verificado.status).toBe(200);

    const segundoUso = await api.post('/api/auth/verify-email').send({ token });
    expect(segundoUso.status).toBe(400);

    const sesion = await login(correo, 'Prueba123!');
    expect(sesion.user.correo_verificado).toBe(true);
  });

  it('HU-014/HU-015: cupo, unión por código y ficha del aprendiz', async () => {
    const creacion = await api
      .post('/api/aprendiz/proyectos')
      .set('Authorization', `Bearer ${lider.token}`)
      .send({
        nombre_grupo: 'Equipo Integración',
        nombre_proyecto: 'Proyecto de integración',
        descripcion: 'Descripción del proyecto de integración',
        problema: 'Problema de integración',
        objetivo: 'Objetivo de integración',
        alcance: 'Alcance de integración',
        tecnologias: 'Node.js, PostgreSQL',
        fecha_inicio: '2026-01-10',
        fecha_fin_estimada: '2026-06-10',
        cupo_maximo: 1,
      });

    expect(creacion.status).toBe(201);
    expect(creacion.body.codigo_grupo).toMatch(/^PRY-[A-F0-9]{10}$/);
    proyecto = creacion.body;

    const segundoRegistro = await registrarAprendiz();
    segundo = segundoRegistro;

    const lleno = await api
      .post('/api/aprendiz/proyectos/unirse')
      .set('Authorization', `Bearer ${segundo.token}`)
      .send({ codigo_grupo: proyecto.codigo_grupo });
    expect(lleno.status).toBe(400);

    const cambiaCupo = await api
      .put('/api/aprendiz/proyectos/mio/cupo')
      .set('Authorization', `Bearer ${lider.token}`)
      .send({ cupo_maximo: 2 });
    expect(cambiaCupo.status).toBe(200);
    expect(cambiaCupo.body.cupo_maximo).toBe(2);

    const unido = await api
      .post('/api/aprendiz/proyectos/unirse')
      .set('Authorization', `Bearer ${segundo.token}`)
      .send({ codigo_grupo: proyecto.codigo_grupo });
    expect(unido.status).toBe(200);

    ajeno = await registrarAprendiz({ ficha: '2724310' });
    const otraFicha = await api
      .post('/api/aprendiz/proyectos/unirse')
      .set('Authorization', `Bearer ${ajeno.token}`)
      .send({ codigo_grupo: proyecto.codigo_grupo });
    expect(otraFicha.status).toBe(403);
  });

  it('HU-023/HU-024/HU-025: cascada, aprobación en bloque, historial y progreso', async () => {
    const mio = await api
      .get('/api/aprendiz/proyectos/mio')
      .set('Authorization', `Bearer ${lider.token}`);
    expect(mio.status).toBe(200);
    fase = mio.body.fases.find((f) => f.numero_fase === 1);
    expect(fase).toBeTruthy();

    const carpeta = await api
      .post(`/api/aprendiz/proyectos/fases/${fase.fase_id}/carpetas`)
      .set('Authorization', `Bearer ${lider.token}`)
      .send({ nombre_carpeta: 'Carpeta de integración' });
    expect(carpeta.status).toBe(201);
    carpetaId = carpeta.body.carpeta_id;

    evidenciaIds = [];
    for (let i = 1; i <= 2; i += 1) {
      const evidencia = await api
        .post(`/api/aprendiz/proyectos/carpetas/${carpetaId}/evidencias`)
        .set('Authorization', `Bearer ${segundo.token}`)
        .send({
          nombre_evidencia: `Evidencia ${i}`,
          tipo_evidencia: 'Enlace',
          ubicacion: `https://example.com/evidencia-${i}`,
        });
      expect(evidencia.status).toBe(201);
      evidenciaIds.push(evidencia.body.evidencia_id);
    }

    const listadoInicial = await api
      .get(`/api/instructor/fases/${fase.fase_id}/carpetas`)
      .set('Authorization', `Bearer ${instructor.token}`);
    expect(listadoInicial.status).toBe(200);
    expect(listadoInicial.body.estado_fase).toBe('En revisión');
    expect(listadoInicial.body.progreso.total).toBe(2);
    expect(listadoInicial.body.progreso.aprobadas).toBe(0);
    expect(listadoInicial.body.progreso.carpetas_total).toBe(1);

    const aprobacion = await api
      .post(`/api/instructor/carpetas/${carpetaId}/aprobar`)
      .set('Authorization', `Bearer ${instructor.token}`)
      .send({});
    expect(aprobacion.status).toBe(200);
    expect(aprobacion.body.evidencias_aprobadas).toBe(2);
    expect(aprobacion.body.estado_carpeta).toBe('Aprobada');
    expect(aprobacion.body.estado_fase).toBe('Aprobada');

    const reprobacion = await api
      .post(`/api/instructor/evidencias/${evidenciaIds[0]}/evaluar`)
      .set('Authorization', `Bearer ${instructor.token}`)
      .send({ resultado: 'REPROBADO' });
    expect(reprobacion.status).toBe(200);
    expect(reprobacion.body.estado_carpeta).toBe('Desaprobada');
    expect(reprobacion.body.estado_fase).toBe('Desaprobada');

    const reAprobacion = await api
      .post(`/api/instructor/carpetas/${carpetaId}/aprobar`)
      .set('Authorization', `Bearer ${instructor.token}`)
      .send({});
    expect(reAprobacion.status).toBe(200);
    expect(reAprobacion.body.evidencias_aprobadas).toBe(1);
    expect(reAprobacion.body.estado_carpeta).toBe('Aprobada');

    // Se conserva todo el historial: 2 de la primera aprobación, 1 reprobado
    // y 1 de la re-aprobación.
    const historial = await pool.query(
      `SELECT count(*)::int AS total
       FROM evaluaciones
       WHERE evidencia_id = ANY($1::int[])`,
      [evidenciaIds]
    );
    expect(historial.rows[0].total).toBe(4);

    const listadoFinal = await api
      .get(`/api/aprendiz/proyectos/fases/${fase.fase_id}/carpetas`)
      .set('Authorization', `Bearer ${segundo.token}`);
    expect(listadoFinal.status).toBe(200);
    expect(listadoFinal.body.estado_fase).toBe('Aprobada');
    expect(listadoFinal.body.progreso.porcentaje).toBe(100);
    expect(listadoFinal.body.progreso.carpetas_aprobadas).toBe(1);
    expect(listadoFinal.body.progreso.carpetas_total).toBe(1);
  });

  it('RN-018: una carpeta con evidencia mixta queda En revisión, no Aprobada', async () => {
    const carpeta = await api
      .post(`/api/aprendiz/proyectos/fases/${fase.fase_id}/carpetas`)
      .set('Authorization', `Bearer ${lider.token}`)
      .send({ nombre_carpeta: 'Carpeta mixta' });
    expect(carpeta.status).toBe(201);

    const ids = [];
    for (let i = 1; i <= 2; i += 1) {
      const evidencia = await api
        .post(`/api/aprendiz/proyectos/carpetas/${carpeta.body.carpeta_id}/evidencias`)
        .set('Authorization', `Bearer ${segundo.token}`)
        .send({
          nombre_evidencia: `Evidencia mixta ${i}`,
          tipo_evidencia: 'Enlace',
          ubicacion: `https://example.com/mixta-${i}`,
        });
      expect(evidencia.status).toBe(201);
      ids.push(evidencia.body.evidencia_id);
    }

    // Se aprueba solo una de las dos: la otra sigue sin evaluar.
    const aprobada = await api
      .post(`/api/instructor/evidencias/${ids[0]}/evaluar`)
      .set('Authorization', `Bearer ${instructor.token}`)
      .send({ resultado: 'APROBADO' });
    expect(aprobada.status).toBe(200);
    expect(aprobada.body.estado_carpeta).toBe('En revisión');
    expect(aprobada.body.estado_fase).toBe('En revisión');

    const listado = await api
      .get(`/api/instructor/fases/${fase.fase_id}/carpetas`)
      .set('Authorization', `Bearer ${instructor.token}`);
    expect(listado.status).toBe(200);

    const mixta = listado.body.carpetas.find((c) => c.carpeta_id === carpeta.body.carpeta_id);
    expect(mixta.estado_carpeta).toBe('En revisión');
    expect(listado.body.estado_fase).toBe('En revisión');

    // Fase: 3 de 4 evidencias aprobadas y 1 de 2 carpetas aprobadas.
    expect(listado.body.progreso.total).toBe(4);
    expect(listado.body.progreso.aprobadas).toBe(3);
    expect(listado.body.progreso.sinEvaluar).toBe(1);
    expect(listado.body.progreso.porcentaje).toBe(75);
    expect(listado.body.progreso.carpetas_aprobadas).toBe(1);
    expect(listado.body.progreso.carpetas_total).toBe(2);
  });

  it('HU-019: carpetas de una fase con validación de nombre, fase y pertenencia', async () => {
    const mio = await api
      .get('/api/aprendiz/proyectos/mio')
      .set('Authorization', `Bearer ${segundo.token}`);
    expect(mio.status).toBe(200);
    const faseDos = mio.body.fases.find((f) => f.numero_fase === 2);
    expect(faseDos).toBeTruthy();

    // CA-019.2: el nombre es obligatorio y tiene un máximo de 150 caracteres.
    const sinNombre = await api
      .post(`/api/aprendiz/proyectos/fases/${faseDos.fase_id}/carpetas`)
      .set('Authorization', `Bearer ${lider.token}`)
      .send({ nombre_carpeta: '   ' });
    expect(sinNombre.status).toBe(400);
    expect(sinNombre.body.message).toBe('El nombre de la carpeta es obligatorio');

    const nombreLargo = await api
      .post(`/api/aprendiz/proyectos/fases/${faseDos.fase_id}/carpetas`)
      .set('Authorization', `Bearer ${lider.token}`)
      .send({ nombre_carpeta: 'x'.repeat(151) });
    expect(nombreLargo.status).toBe(400);
    expect(nombreLargo.body.message).toContain('150 caracteres');

    // RF-019: una fase inexistente responde 404, no 403.
    const faseInexistente = await api
      .post('/api/aprendiz/proyectos/fases/99999999/carpetas')
      .set('Authorization', `Bearer ${lider.token}`)
      .send({ nombre_carpeta: 'Carpeta fantasma' });
    expect(faseInexistente.status).toBe(404);
    expect(faseInexistente.body.message).toBe('Fase no encontrada');

    // CA-019.4: una fase de otro grupo responde 403.
    const faseAjena = await api
      .post(`/api/aprendiz/proyectos/fases/${faseDos.fase_id}/carpetas`)
      .set('Authorization', `Bearer ${ajeno.token}`)
      .send({ nombre_carpeta: 'Carpeta ajena' });
    expect(faseAjena.status).toBe(403);

    // CA-019.3: cualquier integrante activo puede crear la carpeta, no solo el líder.
    const creada = await api
      .post(`/api/aprendiz/proyectos/fases/${faseDos.fase_id}/carpetas`)
      .set('Authorization', `Bearer ${segundo.token}`)
      .send({ nombre_carpeta: 'Carpeta del integrante' });
    expect(creada.status).toBe(201);
    expect(creada.body.nombre_carpeta).toBe('Carpeta del integrante');

    const listado = await api
      .get(`/api/aprendiz/proyectos/fases/${faseDos.fase_id}/carpetas`)
      .set('Authorization', `Bearer ${lider.token}`);
    expect(listado.status).toBe(200);
    expect(listado.body.carpetas.some((c) => c.carpeta_id === creada.body.carpeta_id)).toBe(true);
  });

  it('HU-026: una observación puede asociarse a una evidencia del proyecto', async () => {
    const creacion = await api
      .post(`/api/instructor/proyectos/${proyecto.proyecto_id}/observaciones`)
      .set('Authorization', `Bearer ${instructor.token}`)
      .send({
        titulo: 'Revisar esta evidencia',
        descripcion: 'La evidencia requiere un ajuste antes de la entrega final.',
        evidencia_id: evidenciaIds[0],
      });
    expect(creacion.status).toBe(201);

    const consulta = await api
      .get('/api/aprendiz/proyectos/observaciones')
      .set('Authorization', `Bearer ${segundo.token}`);
    expect(consulta.status).toBe(200);
    const observacion = consulta.body.find(
      (o) => o.observacion_id === creacion.body.observacion_id
    );
    expect(observacion).toBeTruthy();
    expect(observacion.evidencia_id).toBe(evidenciaIds[0]);
    expect(observacion.nombre_evidencia).toBe('Evidencia 1');
  });

  it('HU-011: reasignar fichas conserva el historial del instructor', async () => {
    contador += 1;
    const correo = `instructor${sufijo}@zenda.com`;
    const creado = await api
      .post('/api/users')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        nombre: 'Instructor',
        apellido: 'Integración',
        correo,
        tipo_documento: 'CC',
        numero_documento: String(3000000000 + contador),
        rol: 'INSTRUCTOR',
        fichas: ['2724285', '2724310'],
        userPassword: 'Instructor123!',
        password: 'Admin123!',
      });
    expect(creado.status).toBe(201);
    const instructorId = creado.body.user.usuario_id;

    const cambio = await api
      .put(`/api/users/${instructorId}/fichas`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ fichas: ['2724285'], password: 'Admin123!' });
    expect(cambio.status).toBe(200);

    const historial = await pool.query(
      `SELECT ficha_id, fecha_fin, estado
       FROM instructor_ficha
       WHERE instructor_id = $1
       ORDER BY instructor_ficha_id`,
      [instructorId]
    );
    expect(historial.rows).toHaveLength(2);
    expect(historial.rows.filter((fila) => fila.fecha_fin === null)).toHaveLength(1);
    expect(historial.rows.filter((fila) => fila.estado === 'Inactivo')).toHaveLength(1);
  });

  it('RF-028: la fecha límite de una tarea no puede ser anterior al inicio', async () => {
    const invalida = await api
      .post('/api/aprendiz/proyectos/tareas')
      .set('Authorization', `Bearer ${lider.token}`)
      .send({
        titulo: 'Tarea con fechas invertidas',
        responsable_id: segundo.user.usuario_id,
        fecha_inicio: '2026-05-10',
        fecha_limite: '2026-05-01',
      });
    expect(invalida.status).toBe(400);
    expect(invalida.body.message).toBe(
      'La fecha límite no puede ser anterior a la fecha de inicio'
    );

    const valida = await api
      .post('/api/aprendiz/proyectos/tareas')
      .set('Authorization', `Bearer ${lider.token}`)
      .send({
        titulo: 'Tarea con fechas correctas',
        responsable_id: segundo.user.usuario_id,
        fecha_inicio: '2026-05-01',
        fecha_limite: '2026-05-10',
      });
    expect(valida.status).toBe(201);
    expect(valida.body.tarea_id).toBeTruthy();
  });

  it('HU-033: la alerta de 15 días usa actividad real, no un porcentaje', async () => {
    const coordinador = await login('maria@zenda.com', 'Prueba123!');

    const base = await api
      .get('/api/coordinador/dashboard')
      .set('Authorization', `Bearer ${coordinador.token}`);
    expect(base.status).toBe(200);
    const inicial = base.body.totales.proyectos_sin_actividad;
    expect(Number.isInteger(inicial)).toBe(true);

    // Proyecto nuevo con fecha de inicio antigua y sin evidencias: debe alertar.
    const nuevo = await registrarAprendiz();
    const inicio = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const fin = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const creacion = await api
      .post('/api/aprendiz/proyectos')
      .set('Authorization', `Bearer ${nuevo.token}`)
      .send({
        nombre_grupo: 'Grupo alerta 15 días',
        nombre_proyecto: 'Proyecto sin actividad reciente',
        descripcion: 'Proyecto para probar la alerta de 15 días',
        problema: 'Problema de prueba',
        objetivo: 'Objetivo de prueba',
        alcance: 'Alcance de prueba',
        tecnologias: 'Node.js, PostgreSQL',
        fecha_inicio: inicio,
        fecha_fin_estimada: fin,
        cupo_maximo: 2,
      });
    expect(creacion.status).toBe(201);

    const conAlerta = await api
      .get('/api/coordinador/dashboard')
      .set('Authorization', `Bearer ${coordinador.token}`);
    expect(conAlerta.body.totales.proyectos_sin_actividad).toBe(inicial + 1);

    // Con una evidencia reciente, el proyecto sale de la alerta.
    const mio = await api
      .get('/api/aprendiz/proyectos/mio')
      .set('Authorization', `Bearer ${nuevo.token}`);
    const faseUno = mio.body.fases.find((f) => f.numero_fase === 1);

    const carpeta = await api
      .post(`/api/aprendiz/proyectos/fases/${faseUno.fase_id}/carpetas`)
      .set('Authorization', `Bearer ${nuevo.token}`)
      .send({ nombre_carpeta: 'Evidencia reciente' });
    expect(carpeta.status).toBe(201);

    const evidencia = await api
      .post(`/api/aprendiz/proyectos/carpetas/${carpeta.body.carpeta_id}/evidencias`)
      .set('Authorization', `Bearer ${nuevo.token}`)
      .send({
        nombre_evidencia: 'Evidencia reciente',
        tipo_evidencia: 'Enlace',
        ubicacion: 'https://example.com/alerta-15-dias',
      });
    expect(evidencia.status).toBe(201);

    const sinAlerta = await api
      .get('/api/coordinador/dashboard')
      .set('Authorization', `Bearer ${coordinador.token}`);
    expect(sinAlerta.body.totales.proyectos_sin_actividad).toBe(inicial);
  });

  it('HU-004: refresco rotativo en cookie HttpOnly y revocación al cerrar sesión', async () => {
    const agente = request.agent(app);
    const entrada = await agente
      .post('/api/auth/login')
      .send({ correo: lider.user.correo, password: 'Prueba123!' });
    expect(entrada.status).toBe(200);

    const cookies = entrada.headers['set-cookie']?.join(';') || '';
    expect(cookies).toContain('zenda_refresh=');
    expect(cookies.toLowerCase()).toContain('httponly');

    const renovado = await agente.post('/api/auth/refresh');
    expect(renovado.status).toBe(200);
    expect(renovado.body.token).toBeTruthy();

    const salida = await agente.post('/api/auth/logout');
    expect(salida.status).toBe(200);

    // El refresco revocado ya no sirve, aunque el navegador conserve la cookie.
    const despues = await agente.post('/api/auth/refresh');
    expect(despues.status).toBe(401);
  });

  it('C-01: el token de sesión no sirve para reset y el token de reset es de un solo uso', async () => {
    const sessionToken = segundo.token;
    const usuarioId = segundo.user.usuario_id;

    const intentoConSesion = await api.post('/api/auth/reset-password').send({
      token: sessionToken,
      contrasena: 'NuevaClave123!',
    });
    expect(intentoConSesion.status).toBe(400);

    const resetToken = jwt.sign(
      {
        usuario_id: usuarioId,
        correo: segundo.user.correo,
        purpose: 'reset',
      },
      env.jwtSecret,
      { expiresIn: '15m' }
    );

    await pool.query(
      `INSERT INTO recuperacion_contrasena (usuario_id, token_hash, expira_en, creado_en)
       VALUES ($1, $2, now() + interval '15 minutes', now())`,
      [usuarioId, hashToken(resetToken)]
    );

    const primero = await api.post('/api/auth/reset-password').send({
      token: resetToken,
      contrasena: 'NuevaClave123!',
    });
    expect(primero.status).toBe(200);

    const segundoIntento = await api.post('/api/auth/reset-password').send({
      token: resetToken,
      contrasena: 'OtraClave123!',
    });
    expect(segundoIntento.status).toBe(400);

    // La sesión anterior queda invalidada por token_version.
    const sesionVieja = await api
      .get('/api/aprendiz/proyectos/mi-ficha')
      .set('Authorization', `Bearer ${sessionToken}`);
    expect(sesionVieja.status).toBe(401);

    const loginNuevo = await api.post('/api/auth/login').send({
      correo: segundo.user.correo,
      password: 'NuevaClave123!',
    });
    expect(loginNuevo.status).toBe(200);
  });
});
