const catalogRepository = require('../repositories/catalog.repository');

async function listCategories() {
    const rows = await catalogRepository.fetchActiveCategories();
    return rows.map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
    }));
}

async function listProducts(filters, pagination) {
    const [rows, total] = await Promise.all([
        catalogRepository.fetchActiveProducts(filters, pagination),
        catalogRepository.fetchActiveProductsCount(filters),
    ]);
    const items = rows.map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        basePrice: row.basePrice,
        category: {
            id: row.categoryId,
            name: row.categoryName,
            slug: row.categorySlug,
        },
    }));

    const totalPages = total === 0 ? 0 : Math.ceil(total / pagination.pageSize);

    return {
        items,
        meta: {
            total,
            page: pagination.page,
            pageSize: pagination.pageSize,
            totalPages,
        },
    };
}

async function getProductBySlug(slug) {
    const productRow = await catalogRepository.fetchProductBySlug(slug);
    if (!productRow) {
        return null;
    }

    const variantRows = await catalogRepository.fetchProductVariants(productRow.id);
    const variants = variantRows.map((row) => {
        const stockAvailable = Math.max(row.stock - row.reserved, 0);
        const price = row.price === null ? productRow.basePrice : row.price;

        return {
            id: row.id,
            sku: row.sku,
            variantName: row.variantName,
            price,
            stockAvailable,
        };
    });

    return {
        id: productRow.id,
        name: productRow.name,
        slug: productRow.slug,
        description: productRow.description,
        basePrice: productRow.basePrice,
        category: {
            id: productRow.categoryId,
            name: productRow.categoryName,
            slug: productRow.categorySlug,
        },
        variants,
    };
}

module.exports = {
    listCategories,
    listProducts,
    getProductBySlug,
};
