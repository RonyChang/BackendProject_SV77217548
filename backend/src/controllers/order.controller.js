const orderService = require('../services/order.service');

async function createOrder(req, res, next) {
    try {
        const userId = req.user && req.user.id ? req.user.id : null;
        if (!userId) {
            return res.status(401).json({
                data: null,
                message: 'No autorizado',
                errors: [{ message: 'Token requerido' }],
                meta: {},
            });
        }

        const result = await orderService.createOrder(userId);
        if (result.error === 'empty') {
            return res.status(400).json({
                data: null,
                message: 'Carrito vacio',
                errors: [{ message: 'Carrito vacio' }],
                meta: {},
            });
        }

        return res.status(201).json({
            data: result,
            message: 'Orden creada',
            errors: [],
            meta: {},
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    createOrder,
};
