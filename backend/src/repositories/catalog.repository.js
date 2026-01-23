const pool = require('../config/db');

async function fetchActiveCategories() {
    const query = `
        SELECT id, name, slug
        FROM categories
        WHERE is_active = true
        ORDER BY name ASC;
    `;

    const result = await pool.query(query);
    return result.rows;
}

async function fetchActiveProducts() {
    const query = `
        SELECT
            p.id,
            p.name,
            p.slug,
            p.base_price AS "basePrice",
            c.id AS "categoryId",
            c.name AS "categoryName",
            c.slug AS "categorySlug"
        FROM products p
        JOIN categories c ON c.id = p.category_id
        WHERE p.is_active = true
        ORDER BY p.name ASC;
    `;

    const result = await pool.query(query);
    return result.rows;
}

async function fetchProductBySlug(slug) {
    const query = `
        SELECT
            p.id,
            p.name,
            p.slug,
            p.description,
            p.base_price AS "basePrice",
            c.id AS "categoryId",
            c.name AS "categoryName",
            c.slug AS "categorySlug"
        FROM products p
        JOIN categories c ON c.id = p.category_id
        WHERE p.slug = $1
        AND p.is_active = true
        LIMIT 1;
    `;

    const result = await pool.query(query, [slug]);
    return result.rows[0] || null;
}

async function fetchProductVariants(productId) {
    const query = `
        SELECT
            v.id,
            v.sku,
            v.variant_name AS "variantName",
            v.price,
            COALESCE(i.stock, 0) AS stock,
            COALESCE(i.reserved, 0) AS reserved
        FROM product_variants v
        LEFT JOIN inventory i ON i.product_variant_id = v.id
        WHERE v.product_id = $1
        ORDER BY v.id ASC;
    `;

    const result = await pool.query(query, [productId]);
    return result.rows;
}

module.exports = {
    fetchActiveCategories,
    fetchActiveProducts,
    fetchProductBySlug,
    fetchProductVariants,
};
