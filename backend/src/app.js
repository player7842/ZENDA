// =====================================================================
// ZENDA — Aplicación Express (sin arrancar el servidor)
// =====================================================================
// Se separa de server.js para poder importarla en las pruebas de
// integración con Supertest sin abrir un puerto real.
// =====================================================================

import env from './config/env.js';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/admin/auth.js';
import userRoutes from './routes/admin/users.js';
import fichasRoutes from './routes/admin/fichas.js';
import instructorRoutes from './routes/instructor/instructor.js';
import aprendizProyectoRoutes from './routes/aprendiz/proyecto.js';
import coordinadorRoutes from './routes/coordinador/coordinador.js';

const app = express();

// CORS: solo se aceptan los orígenes declarados en FRONTEND_URL.
// Sin FRONTEND_URL se permite el desarrollo local (sin cabecera para
// orígenes ajenos, que es lo que exige H-04).
app.use(cors({
  origin: (origin, callback) => {
    // Sin origin: Postman, Thunder Client o el health check de Render.
    if (!origin) return callback(null, true);
    if (env.frontendUrls.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
}));

app.use(express.json({ limit: '1mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/fichas', fichasRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/aprendiz/proyectos', aprendizProyectoRoutes);
app.use('/api/coordinador', coordinadorRoutes);

// Endpoint de salud (lo usa Render y el healthcheck de Docker Compose)
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servicio disponible' });
});

// Manejador de errores: evita filtrar trazas internas al cliente.
app.use((err, req, res, _next) => {
  console.error('Error no controlado:', err);
  res.status(500).json({ message: 'Error interno del servidor' });
});

export default app;
