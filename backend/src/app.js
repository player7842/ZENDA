// =====================================================================
// ZENDA — Aplicación Express (sin arrancar el servidor)
// =====================================================================
// Se separa de server.js para poder importarla en las pruebas de
// integración con Supertest sin abrir un puerto real.
// =====================================================================

import env from './config/env.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/admin/auth.js';
import userRoutes from './routes/admin/users.js';
import fichasRoutes from './routes/admin/fichas.js';
import instructorRoutes from './routes/instructor/instructor.js';
import aprendizProyectoRoutes from './routes/aprendiz/proyecto.js';
import coordinadorRoutes from './routes/coordinador/coordinador.js';

const app = express();

// Confiar en el proxy inverso (Render, Vercel, Docker Compose)
app.set('trust proxy', 1);

// Cabeceras de seguridad HTTP con Helmet
app.use(helmet());

// Limitador de tasa general para la API
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 300, // límite de 300 peticiones por ventana
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiadas solicitudes desde esta IP, por favor intenta más tarde.' },
});
app.use('/api/', generalLimiter);

// Limitador más estricto para autenticación y recuperación de contraseñas
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20, // máximo 20 intentos cada 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiados intentos de autenticación, por favor intenta más tarde.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/reset-password', authLimiter);

// CORS: solo se aceptan los orígenes declarados en FRONTEND_URL.
app.use(
  cors({
    origin: (origin, callback) => {
      // Sin origin: Postman, Thunder Client o health checks de infraestructura
      if (!origin) return callback(null, true);
      if (env.frontendUrls.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
  })
);

app.use(express.json({ limit: '1mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/fichas', fichasRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/aprendiz/proyectos', aprendizProyectoRoutes);
app.use('/api/coordinador', coordinadorRoutes);

// Endpoints de salud (usados por Render, Docker Compose y monitores de uptime)
const healthHandler = (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Servicio disponible' });
};
app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// Manejador de errores: evita filtrar trazas internas al cliente.
app.use((err, req, res, _next) => {
  console.error('Error no controlado:', err);
  res.status(500).json({ message: 'Error interno del servidor' });
});

export default app;
