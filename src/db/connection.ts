/**
 * AVRS Database Connection
 * PostgreSQL connection pooling and initialization
 */

import { Pool, PoolClient } from 'pg';
import fs from 'fs';
import path from 'path';

// Connection pool
let pool: Pool | null = null;

/**
 * Get or create database connection pool
 */
export function getPool(): Pool {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/avrs';
    
    pool = new Pool({
      connectionString: databaseUrl,
      max: parseInt(process.env.DATABASE_POOL_MAX || '20'),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  return pool;
}

/**
 * Initialize database schema
 */
export async function initializeDatabase(): Promise<void> {
  try {
    const client = await getPool().connect();

    try {
      console.log('Initializing database schema...');

      // Read schema file
      const schemaPath = path.join(__dirname, 'schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf-8');

      // Execute schema
      await client.query(schema);

      console.log('Database schema initialized successfully');
    } finally {
      client.release();
    }
  } catch (error) {
    console.warn('Database initialization skipped (using in-memory mode):', error instanceof Error ? error.message : error);
    // Continue without database - use in-memory storage
  }
}

/**
 * Execute a query
 */
export async function query(text: string, params?: any[]): Promise<any> {
  const client = await getPool().connect();

  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

/**
 * Execute a transaction
 */
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getPool().connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Close database connection pool
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

/**
 * Health check
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const result = await query('SELECT 1');
    return result.rows.length > 0;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}
