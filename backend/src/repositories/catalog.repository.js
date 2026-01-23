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

// Construye filtros dinamicos para el listado de productos.
function buildProductFilters(filters) {
    const clauses = ['p.is_active = true'];
    const values = [];

    if (filters.category) {
        values.push(filters.category);
        clauses.push(`c.slug = $${values.length}`);
    }

    if (filters.q) {
        values.push(`%${filters.q}%`);
        clauses.push(`p.name ILIKE $${values.length}`);
    }

    if (typeof filters.minPrice === 'number') {
        values.push(filters.minPrice);
        clauses.push(`p.base_price >= $${values.length}`);
    }

    if (typeof filters.maxPrice === 'number') {
        values.push(filters.maxPrice);
        clauses.push(`p.base_price <= $${values.length}`);
    }

    return {
        whereSql: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '',
        values,
    };
}

async function fetchActiveProducts(filters, pagination) {
    const { whereSql, values } = buildProductFilters(filters);
    const params = [...values];

    params.push(pagination.pageSize);
    const limitIndex = params.length;
    params.push((pagination.page - 1) * pagination.pageSize);
    const offsetIndex = params.length;

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
        ${whereSql}
        ORDER BY p.name ASC
        LIMIT $${limitIndex} OFFSET $${offsetIndex};
    `;

    const result = await pool.query(query, params);
    return result.rows;
}

async function fetchActiveProductsCount(filters) {
    const { whereSql, values } = buildProductFilters(filters);
    const query = `
        SELECT COUNT(*)::int AS total
        FROM products p
        JOIN categories c ON c.id = p.category_id
        ${whereSql};
    `;

    const result = await pool.query(query, values);
    return result.rows[0] ? result.rows[0].total : 0;
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
    fetchActiveProductsCount,
    fetchProductBySlug,
    fetchProductVariants,
};
