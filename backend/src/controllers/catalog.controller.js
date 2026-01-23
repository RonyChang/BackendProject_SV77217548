const catalogService = require('../services/catalog.service');

async function listCategories(req, res, next) {
    try {
        const categories = await catalogService.listCategories();
        res.status(200).json({
            data: categories,
            message: 'OK',
            errors: [],
            meta: { total: categories.length },
        });
    } catch (error) {
        next(error);
    }
}

async function listProducts(req, res, next) {
    try {
        // Normaliza query params y aplica valores por defecto.
        const rawPage = Array.isArray(req.query.page) ? req.query.page[0] : req.query.page;
        const rawPageSize = Array.isArray(req.query.pageSize) ? req.query.pageSize[0] : req.query.pageSize;

        const parsedPage = rawPage ? Number(rawPage) : NaN;
        const parsedPageSize = rawPageSize ? Number(rawPageSize) : NaN;

        const page = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
        const pageSize = Number.isNaN(parsedPageSize) || parsedPageSize < 1 ? 12 : parsedPageSize;

        const rawCategory = Array.isArray(req.query.category) ? req.query.category[0] : req.query.category;
        const rawQuery = Array.isArray(req.query.q) ? req.query.q[0] : req.query.q;
        const rawMinPrice = Array.isArray(req.query.minPrice) ? req.query.minPrice[0] : req.query.minPrice;
        const rawMaxPrice = Array.isArray(req.query.maxPrice) ? req.query.maxPrice[0] : req.query.maxPrice;

        const category = typeof rawCategory === 'string' ? rawCategory.trim() : '';
        const q = typeof rawQuery === 'string' ? rawQuery.trim() : '';

        const parsedMinPrice = rawMinPrice ? Number(rawMinPrice) : NaN;
        const parsedMaxPrice = rawMaxPrice ? Number(rawMaxPrice) : NaN;

        const filters = {
            category: category ? category : null,
            q: q ? q : null,
            minPrice: Number.isNaN(parsedMinPrice) ? null : parsedMinPrice,
            maxPrice: Number.isNaN(parsedMaxPrice) ? null : parsedMaxPrice,
        };

        const { items, meta } = await catalogService.listProducts(filters, { page, pageSize });
        res.status(200).json({
            data: items,
            message: 'OK',
            errors: [],
            meta,
        });
    } catch (error) {
        next(error);
    }
}

async function getProductDetail(req, res, next) {
    try {
        const { slug } = req.params;
        const product = await catalogService.getProductBySlug(slug);
        if (!product) {
            return res.status(404).json({
                data: null,
                message: 'Producto no encontrado',
                errors: [{ message: 'Producto no encontrado' }],
                meta: {},
            });
        }

        res.status(200).json({
            data: product,
            message: 'OK',
            errors: [],
            meta: {},
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    listCategories,
    listProducts,
    getProductDetail,
};
