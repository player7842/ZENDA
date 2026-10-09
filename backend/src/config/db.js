// Pool de conexión a la base de datos - porque conectarse a PostgreSQL es una porqueria
// Esta mierda maneja las conexiones 

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../../.env') });

import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
});

// Prueba la conexión. porque si esto falla no se que hacer 
export const testConnection = async () => {
  try {
    const client = await pool.query('SELECT NOW()');
    console.log('PostgreSQL conectado - "¡Conectado, carajo!"');
    return true;
  } catch (error) {
    console.error('Error conectando a PostgreSQL:', error.message);
    return false;
  }
};

export default pool;
