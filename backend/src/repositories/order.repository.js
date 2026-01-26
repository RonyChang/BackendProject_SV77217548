const { Op } = require('sequelize');
const { Order, OrderItem, User } = require('../models');

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

async function updateOrderStatusById(orderId, payload, transaction) {
    const order = await Order.findOne({
        where: { id: orderId },
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

async function findOrderById(orderId) {
    const order = await Order.findOne({
        where: { id: orderId },
    });

    return order ? order.get({ plain: true }) : null;
}

async function updateOrderStripeData(orderId, payload, transaction) {
    const order = await Order.findOne({
        where: { id: orderId },
        transaction,
        lock: transaction ? transaction.LOCK.UPDATE : undefined,
    });

    if (!order) {
        return null;
    }

    if (payload.stripeSessionId) {
        order.stripeSessionId = payload.stripeSessionId;
    }

    if (payload.stripePaymentIntentId) {
        order.stripePaymentIntentId = payload.stripePaymentIntentId;
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

async function findExpiredPendingOrders(beforeDate) {
    const orders = await Order.findAll({
        where: {
            orderStatus: 'pendingPayment',
            createdAt: {
                [Op.lt]: beforeDate,
            },
        },
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
        order: [['createdAt', 'ASC']],
    });

    return orders.map((order) => order.get({ plain: true }));
}

async function findOrderForPaymentEmail(orderId) {
    const order = await Order.findOne({
        where: { id: orderId },
        include: [
            {
                model: User,
                as: 'user',
                attributes: ['id', 'email', 'firstName', 'lastName'],
                required: false,
            },
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
                required: false,
            },
        ],
    });

    return order ? order.get({ plain: true }) : null;
}

async function updateOrderPaymentEmailSentAt(orderId, sentAt, transaction) {
    const order = await Order.findOne({
        where: { id: orderId },
        transaction,
        lock: transaction ? transaction.LOCK.UPDATE : undefined,
    });

    if (!order) {
        return null;
    }

    order.paymentEmailSentAt = sentAt;
    await order.save({ transaction });
    return order.get({ plain: true });
}

async function updateOrderStatusEmails(orderId, payload, transaction) {
    const order = await Order.findOne({
        where: { id: orderId },
        transaction,
        lock: transaction ? transaction.LOCK.UPDATE : undefined,
    });

    if (!order) {
        return null;
    }

    if (payload.shippedEmailSentAt) {
        order.shippedEmailSentAt = payload.shippedEmailSentAt;
    }

    if (payload.deliveredEmailSentAt) {
        order.deliveredEmailSentAt = payload.deliveredEmailSentAt;
    }

    await order.save({ transaction });
    return order.get({ plain: true });
}

module.exports = {
    createOrder,
    findOrderWithItems,
    updateOrderStatus,
    updateOrderStatusById,
    findOrderById,
    updateOrderStripeData,
    findExpiredPendingOrders,
    findOrderForPaymentEmail,
    updateOrderPaymentEmailSentAt,
    updateOrderStatusEmails,
};
