// Pool de conexión a la base de datos PostgreSQL

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../../.env') });

import pg from 'pg';
const { Pool } = pg;

const sslRechazaCertificadosInvalidos =
  process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false';

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: sslRechazaCertificadosInvalidos },
      }
    : {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME,
        ssl:
          process.env.DB_SSL === 'true'
            ? { rejectUnauthorized: sslRechazaCertificadosInvalidos }
            : false,
      }
);

// Verificación de conectividad con la base de datos
export const testConnection = async () => {
  try {
    await pool.query('SELECT NOW()');
    console.info('PostgreSQL conectado exitosamente');
    return true;
  } catch (error) {
    console.error('Error conectando a PostgreSQL:', error.message);
    return false;
  }
};

export default pool;
