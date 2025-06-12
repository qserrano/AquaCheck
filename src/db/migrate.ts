import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

async function runMigrations() {
    try {
        // Crear tabla de migraciones si no existe
        await pool.query(`
            CREATE TABLE IF NOT EXISTS migrations (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Leer archivos de migración
        const migrationsDir = path.join(__dirname, 'migrations');
        const files = fs.readdirSync(migrationsDir).sort();

        // Ejecutar cada migración
        for (const file of files) {
            const migrationName = path.basename(file, '.sql');
            
            // Verificar si la migración ya fue ejecutada
            const { rows } = await pool.query(
                'SELECT * FROM migrations WHERE name = $1',
                [migrationName]
            );

            if (rows.length === 0) {
                console.log(`Ejecutando migración: ${migrationName}`);
                const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
                await pool.query(sql);
                
                // Registrar la migración
                await pool.query(
                    'INSERT INTO migrations (name) VALUES ($1)',
                    [migrationName]
                );
                console.log(`Migración ${migrationName} completada`);
            }
        }

        console.log('Todas las migraciones completadas');
    } catch (error) {
        console.error('Error ejecutando migraciones:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

runMigrations().catch(console.error); 