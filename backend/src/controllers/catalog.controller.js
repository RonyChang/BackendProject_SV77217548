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
        const { items, total } = await catalogService.listProducts();
        res.status(200).json({
            data: items,
            message: 'OK',
            errors: [],
            meta: { total },
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
