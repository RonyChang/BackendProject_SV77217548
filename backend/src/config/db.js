const { Pool } = require('pg');

const rawConnectionString = process.env.DATABASE_URL || '';
const connectionString = rawConnectionString.trim() === '' ? null : rawConnectionString.trim();

const parsedPort = process.env.PGPORT ? Number(process.env.PGPORT) : NaN;
const port = Number.isNaN(parsedPort) ? undefined : parsedPort;

const pool = connectionString
    ? new Pool({ connectionString })
    : new Pool({
        host: process.env.PGHOST,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
        port,
    });

module.exports = pool;
