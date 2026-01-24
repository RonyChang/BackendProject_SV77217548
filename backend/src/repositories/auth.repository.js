const pool = require('../config/db');

async function findUserByEmail(email) {
    const query = `
        SELECT
            id,
            email,
            first_name AS "firstName",
            last_name AS "lastName",
            password_hash AS "passwordHash",
            google_id AS "googleId",
            avatar_url AS "avatarUrl",
            role
        FROM users
        WHERE email = $1
        LIMIT 1;
    `;

    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
}

async function createUser({ email, firstName, lastName, passwordHash, role, googleId, avatarUrl }) {
    const query = `
        INSERT INTO users (
            email,
            first_name,
            last_name,
            password_hash,
            role,
            google_id,
            avatar_url
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING
            id,
            email,
            first_name AS "firstName",
            last_name AS "lastName",
            google_id AS "googleId",
            avatar_url AS "avatarUrl",
            role;
    `;

    const result = await pool.query(query, [
        email,
        firstName,
        lastName,
        passwordHash,
        role,
        googleId,
        avatarUrl,
    ]);
    return result.rows[0];
}

async function findUserByGoogleId(googleId) {
    const query = `
        SELECT
            id,
            email,
            first_name AS "firstName",
            last_name AS "lastName",
            password_hash AS "passwordHash",
            google_id AS "googleId",
            avatar_url AS "avatarUrl",
            role
        FROM users
        WHERE google_id = $1
        LIMIT 1;
    `;

    const result = await pool.query(query, [googleId]);
    return result.rows[0] || null;
}

async function linkGoogleAccount({ userId, googleId, avatarUrl }) {
    const query = `
        UPDATE users
        SET google_id = $2,
            avatar_url = $3,
            updated_at = NOW()
        WHERE id = $1
        RETURNING
            id,
            email,
            first_name AS "firstName",
            last_name AS "lastName",
            password_hash AS "passwordHash",
            google_id AS "googleId",
            avatar_url AS "avatarUrl",
            role;
    `;

    const result = await pool.query(query, [userId, googleId, avatarUrl]);
    return result.rows[0] || null;
}

module.exports = {
    findUserByEmail,
    createUser,
    findUserByGoogleId,
    linkGoogleAccount,
};
