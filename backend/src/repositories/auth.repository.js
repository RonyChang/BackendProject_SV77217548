const pool = require('../config/db');

async function findUserByEmail(email) {
    const query = `
        SELECT
            id,
            email,
            first_name AS "firstName",
            last_name AS "lastName",
            password_hash AS "passwordHash",
            role
        FROM users
        WHERE email = $1
        LIMIT 1;
    `;

    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
}

async function createUser({ email, firstName, lastName, passwordHash, role }) {
    const query = `
        INSERT INTO users (email, first_name, last_name, password_hash, role)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
            id,
            email,
            first_name AS "firstName",
            last_name AS "lastName",
            role;
    `;

    const result = await pool.query(query, [email, firstName, lastName, passwordHash, role]);
    return result.rows[0];
}

module.exports = {
    findUserByEmail,
    createUser,
};
