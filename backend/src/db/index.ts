import { PGlite } from '@electric-sql/pglite';
import { Pool, PoolClient } from 'pg';
import { DDL_SCHEMA } from './schema.js';

let pgLiteInstance: PGlite | null = null;
let pgPoolInstance: Pool | null = null;

export interface DbQueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

export interface DbAdapter {
  query<T = any>(sql: string, params?: any[]): Promise<DbQueryResult<T>>;
  exec(sql: string): Promise<void>;
  withTransaction<T>(callback: (client: DbAdapter) => Promise<T>): Promise<T>;
}

class PGLiteAdapter implements DbAdapter {
  constructor(private pglite: PGlite) {}

  async query<T = any>(sql: string, params: any[] = []): Promise<DbQueryResult<T>> {
    const res = await this.pglite.query<T>(sql, params);
    return {
      rows: res.rows || [],
      rowCount: res.rows ? res.rows.length : 0,
    };
  }

  async exec(sql: string): Promise<void> {
    await this.pglite.exec(sql);
  }

  async withTransaction<T>(callback: (client: DbAdapter) => Promise<T>): Promise<T> {
    await this.pglite.query('BEGIN');
    try {
      const result = await callback(this);
      await this.pglite.query('COMMIT');
      return result;
    } catch (err) {
      await this.pglite.query('ROLLBACK');
      throw err;
    }
  }
}

class PgPoolClientAdapter implements DbAdapter {
  constructor(private client: PoolClient) {}

  async query<T = any>(sql: string, params: any[] = []): Promise<DbQueryResult<T>> {
    const res = await this.client.query(sql, params);
    return {
      rows: res.rows,
      rowCount: res.rowCount || 0,
    };
  }

  async exec(sql: string): Promise<void> {
    await this.client.query(sql);
  }

  async withTransaction<T>(callback: (client: DbAdapter) => Promise<T>): Promise<T> {
    return callback(this);
  }
}

class PgPoolAdapter implements DbAdapter {
  constructor(private pool: Pool) {}

  async query<T = any>(sql: string, params: any[] = []): Promise<DbQueryResult<T>> {
    const res = await this.pool.query(sql, params);
    return {
      rows: res.rows,
      rowCount: res.rowCount || 0,
    };
  }

  async exec(sql: string): Promise<void> {
    await this.pool.query(sql);
  }

  async withTransaction<T>(callback: (client: DbAdapter) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const adapter = new PgPoolClientAdapter(client);
      const result = await callback(adapter);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

let dbInstance: DbAdapter | null = null;

export async function getDb(): Promise<DbAdapter> {
  if (dbInstance) return dbInstance;

  const connectionString = process.env.DATABASE_URL;

  if (connectionString) {
    console.log('[DB] Connecting to PostgreSQL pool via DATABASE_URL...');
    pgPoolInstance = new Pool({ connectionString });
    dbInstance = new PgPoolAdapter(pgPoolInstance);
  } else {
    console.log('[DB] Initializing embedded PostgreSQL engine (PGlite WASM)...');
    pgLiteInstance = new PGlite();
    dbInstance = new PGLiteAdapter(pgLiteInstance);
  }

  // Execute multi-statement DDL migration schema
  await dbInstance.exec(DDL_SCHEMA);
  console.log('[DB] PostgreSQL schema initialized successfully.');

  return dbInstance;
}
