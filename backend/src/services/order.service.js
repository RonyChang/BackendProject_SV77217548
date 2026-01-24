const { sequelize } = require('../models');
const cartRepository = require('../repositories/cart.repository');
const orderRepository = require('../repositories/order.repository');
const profileRepository = require('../repositories/profile.repository');

function centsToSoles(value) {
    if (value === null || value === undefined) {
        return null;
    }

    const cents = Number(value);
    if (Number.isNaN(cents)) {
        return null;
    }

    return Number((cents / 100).toFixed(2));
}

function parseSoles(value, fallback) {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
        return fallback;
    }

    return parsed;
}

function solesToCents(value) {
    return Math.round(Number(value) * 100);
}

function normalizeDistrict(value) {
    return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function resolveShippingCostCents(address) {
    const district = normalizeDistrict(address && address.district);
    if (!district) {
        return null;
    }

    const defaultSoles = parseSoles(process.env.DEFAULT_SHIPPING_COST, 10);
    const highSoles = parseSoles(process.env.HIGH_SHIPPING_COST, 15);
    const highDistricts = (process.env.HIGH_SHIPPING_DISTRICTS || '')
        .split(',')
        .map(normalizeDistrict)
        .filter(Boolean);
    const isHigh = highDistricts.includes(district);
    const costSoles = isHigh ? highSoles : defaultSoles;

    return Math.max(solesToCents(costSoles), 0);
}

function mapOrderItems(items) {
    return items.map((item) => ({
        sku: item.sku,
        productName: item.productName,
        variantName: item.variantName,
        price: centsToSoles(item.priceCents),
        quantity: item.quantity,
    }));
}

async function createOrder(userId) {
    const address = await profileRepository.findAddressByUserId(userId);
    if (!address || !address.district) {
        return { error: 'address' };
    }

    const shippingCostCents = resolveShippingCostCents(address);
    if (shippingCostCents === null) {
        return { error: 'address' };
    }

    const cartId = await cartRepository.fetchCartIdByUserId(userId);
    if (!cartId) {
        return { error: 'empty' };
    }

    const items = await cartRepository.fetchCartItems(cartId);
    if (!items.length) {
        return { error: 'empty' };
    }

    const subtotalCents = items.reduce(
        (total, item) => total + (Number(item.priceCents) || 0) * item.quantity,
        0
    );
    const totalCents = subtotalCents + shippingCostCents;

    const order = await sequelize.transaction(async (transaction) => {
        const createdOrder = await orderRepository.createOrder(
            {
                userId,
                subtotalCents,
                totalCents,
                shippingCostCents,
                items,
            },
            transaction
        );

        await cartRepository.clearCartItems(cartId, transaction);
        return createdOrder;
    });

    return {
        id: order.id,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        subtotal: centsToSoles(order.subtotalCents),
        shippingCost: centsToSoles(order.shippingCostCents),
        total: centsToSoles(order.totalCents),
        items: mapOrderItems(items),
    };
}

module.exports = {
    createOrder,
};
