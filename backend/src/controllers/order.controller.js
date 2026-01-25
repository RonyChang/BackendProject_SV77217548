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

        const discountCode = req.body && typeof req.body.discountCode === 'string'
            ? req.body.discountCode
            : '';
        const result = await orderService.createOrder(userId, discountCode);
        if (result.error === 'address') {
            return res.status(400).json({
                data: null,
                message: 'Dirección requerida',
                errors: [{ message: 'Dirección requerida' }],
                meta: {},
            });
        }

        if (result.error === 'empty') {
            return res.status(400).json({
                data: null,
                message: 'Carrito vacío',
                errors: [{ message: 'Carrito vacío' }],
                meta: {},
            });
        }

        if (result.error === 'stock') {
            return res.status(409).json({
                data: null,
                message: 'Stock insuficiente',
                errors: [{ message: 'Stock insuficiente' }],
                meta: { sku: result.sku, available: result.available },
            });
        }

        if (result.error === 'discount') {
            return res.status(400).json({
                data: null,
                message: result.message || 'Código inválido',
                errors: [{ message: result.message || 'Código inválido' }],
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

async function cancelOrder(req, res, next) {
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

        const orderId = Number(req.params.id);
        if (!Number.isFinite(orderId)) {
            return res.status(400).json({
                data: null,
                message: 'Orden inválida',
                errors: [{ message: 'Orden inválida' }],
                meta: {},
            });
        }

        const result = await orderService.cancelOrder(userId, orderId);
        if (result.error === 'not_found') {
            return res.status(404).json({
                data: null,
                message: 'Orden no encontrada',
                errors: [{ message: 'Orden no encontrada' }],
                meta: {},
            });
        }

        if (result.error === 'status') {
            return res.status(409).json({
                data: null,
                message: 'Orden no cancelable',
                errors: [{ message: 'Orden no cancelable' }],
                meta: {},
            });
        }

        return res.status(200).json({
            data: result,
            message: 'Orden cancelada',
            errors: [],
            meta: {},
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    createOrder,
    cancelOrder,
};
