const { Order, OrderItem } = require('../models');

async function createOrder(
    {
        userId,
        subtotalCents,
        totalCents,
        shippingCostCents,
        discountCode,
        discountPercentage,
        discountAmountCents,
        items,
    },
    transaction
) {
    const order = await Order.create(
        {
            userId,
            orderStatus: 'pendingPayment',
            paymentStatus: 'pending',
            subtotalCents,
            totalCents,
            shippingCostCents,
            discountCode,
            discountPercentage,
            discountAmountCents,
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

async function findOrderWithItems(orderId, userId) {
    const order = await Order.findOne({
        where: { id: orderId, userId },
        include: [
            {
                model: OrderItem,
                as: 'items',
                attributes: [
                    'id',
                    'productVariantId',
                    'sku',
                    'productName',
                    'variantName',
                    'priceCents',
                    'quantity',
                ],
            },
        ],
    });

    return order ? order.get({ plain: true }) : null;
}

async function updateOrderStatus(orderId, userId, payload, transaction) {
    const order = await Order.findOne({
        where: { id: orderId, userId },
        transaction,
        lock: transaction ? transaction.LOCK.UPDATE : undefined,
    });

    if (!order) {
        return null;
    }

    if (payload.orderStatus) {
        order.orderStatus = payload.orderStatus;
    }

    if (payload.paymentStatus) {
        order.paymentStatus = payload.paymentStatus;
    }

    await order.save({ transaction });
    return order.get({ plain: true });
}

module.exports = {
    createOrder,
    findOrderWithItems,
    updateOrderStatus,
};
