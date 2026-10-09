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
app.use(cors());
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


