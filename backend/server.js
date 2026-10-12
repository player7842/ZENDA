// Este mierda es el archivo principal
// Configura Express, CORS, rutas y arranca el servidor.
// Si esto se jode paila

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import authRoutes from './src/routes/admin/auth.js';
import userRoutes from './src/routes/admin/users.js';
import fichasRoutes from './src/routes/admin/fichas.js';
import instructorRoutes from './src/routes/instructor/instructor.js';
import { testConnection } from './src/config/db.js';

import aprendizProyectoRoutes from './src/routes/aprendiz/proyecto.js';
import coordinadorRoutes from './src/routes/coordinador/coordinador.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware que nos permite parsear JSON y manejar CORS
// CORS: en producción solo se permiten los dominios de FRONTEND_URL (separados por coma)
const origenesPermitidos = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Sin origin = Thunder Client, Postman o el monitor de salud; sin FRONTEND_URL = desarrollo
    if (!origin || origenesPermitidos.length === 0 || origenesPermitidos.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origen no permitido por CORS'));
  },
}));

app.use(express.json());

// Rutas el alma de esta porquería
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/fichas', fichasRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/aprendiz/proyectos', aprendizProyectoRoutes);
app.use('/api/coordinador', coordinadorRoutes);

// Endpoint de salud 
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'El servidor está funcionando como una máquina bien aceitada' });
});

// Arrancar el servidor y probar la conexión a la base de datos
app.listen(PORT, async () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  await testConnection();
});


