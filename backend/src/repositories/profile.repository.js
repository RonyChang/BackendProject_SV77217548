const pool = require('../config/db');

async function findUserById(userId) {
    const query = `
        SELECT id,
               email,
               first_name AS "firstName",
               last_name AS "lastName",
               role
        FROM users
        WHERE id = $1
          AND is_active = TRUE
          AND is_active = TRUE
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
}

async function updateUserNames(userId, firstName, lastName) {
    const query = `
        UPDATE users
        SET first_name = COALESCE($2, first_name),
            last_name = COALESCE($3, last_name),
            updated_at = NOW()
        WHERE id = $1
        RETURNING id,
                  email,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  role
    `;
    const result = await pool.query(query, [userId, firstName, lastName]);
    return result.rows[0] || null;
}

async function findAddressByUserId(userId) {
    const query = `
        SELECT receiver_name AS "receiverName",
               phone,
               address_line1 AS "addressLine1",
               address_line2 AS "addressLine2",
               country,
               city,
               district,
               postal_code AS "postalCode",
               reference
        FROM user_addresses
        WHERE user_id = $1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
}

async function upsertAddress(userId, address) {
    const query = `
        INSERT INTO user_addresses (
            user_id,
            receiver_name,
            phone,
            address_line1,
            address_line2,
            country,
            city,
            district,
            postal_code,
            reference
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (user_id)
        DO UPDATE SET
            receiver_name = EXCLUDED.receiver_name,
            phone = EXCLUDED.phone,
            address_line1 = EXCLUDED.address_line1,
            address_line2 = EXCLUDED.address_line2,
            country = EXCLUDED.country,
            city = EXCLUDED.city,
            district = EXCLUDED.district,
            postal_code = EXCLUDED.postal_code,
            reference = EXCLUDED.reference,
            updated_at = NOW()
        RETURNING receiver_name AS "receiverName",
                  phone,
                  address_line1 AS "addressLine1",
                  address_line2 AS "addressLine2",
                  country,
                  city,
                  district,
                  postal_code AS "postalCode",
                  reference
    `;
    const result = await pool.query(query, [
        userId,
        address.receiverName,
        address.phone,
        address.addressLine1,
        address.addressLine2,
        address.country,
        address.city,
        address.district,
        address.postalCode,
        address.reference,
    ]);
    return result.rows[0] || null;
}

module.exports = {
    findUserById,
    updateUserNames,
    findAddressByUserId,
    upsertAddress,
};
