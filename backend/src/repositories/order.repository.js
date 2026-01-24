const { Order, OrderItem } = require('../models');

async function createOrder({ userId, subtotalCents, totalCents, items }, transaction) {
    const order = await Order.create(
        {
            userId,
            orderStatus: 'pendingPayment',
            paymentStatus: 'pending',
            subtotalCents,
            totalCents,
        },
        { transaction }
    );

    const orderItems = items.map((item) => ({
        orderId: order.id,
        productVariantId: item.productVariantId,
        sku: item.sku,
        productName: item.productName,
        variantName: item.variantName,
        priceCents: item.priceCents,
        quantity: item.quantity,
    }));

    await OrderItem.bulkCreate(orderItems, { transaction });
    return order.get({ plain: true });
}

module.exports = {
    createOrder,
};
