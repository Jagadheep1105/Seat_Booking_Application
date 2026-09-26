"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDb = getDb;
const pglite_1 = require("@electric-sql/pglite");
const pg_1 = require("pg");
const schema_js_1 = require("./schema.js");
let pgLiteInstance = null;
let pgPoolInstance = null;
class PGLiteAdapter {
    pglite;
    constructor(pglite) {
        this.pglite = pglite;
    }
    async query(sql, params = []) {
        const res = await this.pglite.query(sql, params);
        return {
            rows: res.rows || [],
            rowCount: res.rows ? res.rows.length : 0,
        };
    }
    async exec(sql) {
        await this.pglite.exec(sql);
    }
    async withTransaction(callback) {
        await this.pglite.query('BEGIN');
        try {
            const result = await callback(this);
            await this.pglite.query('COMMIT');
            return result;
        }
        catch (err) {
            await this.pglite.query('ROLLBACK');
            throw err;
        }
    }
}
class PgPoolClientAdapter {
    client;
    constructor(client) {
        this.client = client;
    }
    async query(sql, params = []) {
        const res = await this.client.query(sql, params);
        return {
            rows: res.rows,
            rowCount: res.rowCount || 0,
        };
    }
    async exec(sql) {
        await this.client.query(sql);
    }
    async withTransaction(callback) {
        return callback(this);
    }
}
class PgPoolAdapter {
    pool;
    constructor(pool) {
        this.pool = pool;
    }
    async query(sql, params = []) {
        const res = await this.pool.query(sql, params);
        return {
            rows: res.rows,
            rowCount: res.rowCount || 0,
        };
    }
    async exec(sql) {
        await this.pool.query(sql);
    }
    async withTransaction(callback) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const adapter = new PgPoolClientAdapter(client);
            const result = await callback(adapter);
            await client.query('COMMIT');
            return result;
        }
        catch (err) {
            await client.query('ROLLBACK');
            throw err;
        }
        finally {
            client.release();
        }
    }
}
let dbInstance = null;
async function getDb() {
    if (dbInstance)
        return dbInstance;
    const connectionString = process.env.DATABASE_URL;
    if (connectionString) {
        console.log('[DB] Connecting to PostgreSQL pool via DATABASE_URL...');
        pgPoolInstance = new pg_1.Pool({ connectionString });
        dbInstance = new PgPoolAdapter(pgPoolInstance);
    }
    else {
        console.log('[DB] Initializing embedded PostgreSQL engine (PGlite WASM)...');
        pgLiteInstance = new pglite_1.PGlite();
        dbInstance = new PGLiteAdapter(pgLiteInstance);
    }
    // Execute multi-statement DDL migration schema
    await dbInstance.exec(schema_js_1.DDL_SCHEMA);
    console.log('[DB] PostgreSQL schema initialized successfully.');
    return dbInstance;
}
