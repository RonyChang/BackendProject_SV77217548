const { sequelize } = require('../models');
const cartRepository = require('../repositories/cart.repository');
const orderRepository = require('../repositories/order.repository');

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
    const totalCents = subtotalCents;

    const order = await sequelize.transaction(async (transaction) => {
        const createdOrder = await orderRepository.createOrder(
            {
                userId,
                subtotalCents,
                totalCents,
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
        total: centsToSoles(order.totalCents),
        items: mapOrderItems(items),
    };
}

module.exports = {
    createOrder,
};
