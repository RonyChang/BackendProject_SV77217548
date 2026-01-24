const { User } = require('../models');

async function findUserByEmail(email) {
    const user = await User.findOne({ where: { email } });
    return user ? user.get({ plain: true }) : null;
}

async function createUser({ email, firstName, lastName, passwordHash, role, googleId, avatarUrl }) {
    const user = await User.create({
        email,
        firstName,
        lastName,
        passwordHash,
        role,
        googleId,
        avatarUrl,
    });
    return user.get({ plain: true });
}

async function findUserByGoogleId(googleId) {
    const user = await User.findOne({ where: { googleId } });
    return user ? user.get({ plain: true }) : null;
}

async function linkGoogleAccount({ userId, googleId, avatarUrl }) {
    const [updatedCount, rows] = await User.update(
        { googleId, avatarUrl },
        { where: { id: userId }, returning: true }
    );

    if (!updatedCount || !rows.length) {
        return null;
    }

    return rows[0].get({ plain: true });
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
