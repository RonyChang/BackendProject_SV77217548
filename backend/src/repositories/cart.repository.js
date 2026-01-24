const {
    Cart,
    CartItem,
    Product,
    ProductVariant,
} = require('../models');

async function fetchCartIdByUserId(userId) {
    const cart = await Cart.findOne({
        where: { userId },
        attributes: ['id'],
    });

    return cart ? cart.id : null;
}

async function createCart(userId) {
    const cart = await Cart.create({ userId });
    return cart.id;
}

async function ensureCart(userId) {
    const existingId = await fetchCartIdByUserId(userId);
    if (existingId) {
        return existingId;
    }

    return createCart(userId);
}

async function fetchVariantBySku(sku) {
    const variant = await ProductVariant.findOne({
        where: { sku },
        attributes: ['id', 'sku', 'variantName', 'priceCents'],
        include: [
            {
                model: Product,
                as: 'product',
                attributes: ['name'],
            },
        ],
    });

    if (!variant) {
        return null;
    }

    const plain = variant.get({ plain: true });
    return {
        id: plain.id,
        sku: plain.sku,
        variantName: plain.variantName,
        priceCents: plain.priceCents,
        productName: plain.product ? plain.product.name : null,
    };
}

async function fetchCartItems(cartId) {
    const items = await CartItem.findAll({
        where: { cartId },
        attributes: ['quantity'],
        include: [
            {
                model: ProductVariant,
                as: 'variant',
                attributes: ['sku', 'variantName', 'priceCents'],
                include: [
                    {
                        model: Product,
                        as: 'product',
                        attributes: ['name'],
                    },
                ],
            },
        ],
        order: [['id', 'ASC']],
    });

    return items.map((item) => {
        const plain = item.get({ plain: true });
        const variant = plain.variant || {};
        const product = variant.product || {};
        return {
            sku: variant.sku,
            variantName: variant.variantName,
            priceCents: variant.priceCents,
            productName: product.name,
            quantity: plain.quantity,
        };
    });
}

async function upsertCartItem(cartId, variantId, quantity) {
    const item = await CartItem.findOne({
        where: { cartId, productVariantId: variantId },
    });

    if (item) {
        item.quantity = item.quantity + quantity;
        await item.save();
        return;
    }

    await CartItem.create({
        cartId,
        productVariantId: variantId,
        quantity,
    });
}

async function updateCartItemQuantity(cartId, variantId, quantity) {
    const item = await CartItem.findOne({
        where: { cartId, productVariantId: variantId },
        attributes: ['id', 'quantity'],
    });

    if (!item) {
        return null;
    }

    item.quantity = quantity;
    await item.save();
    return item.get({ plain: true });
}

async function deleteCartItem(cartId, variantId) {
    const item = await CartItem.findOne({
        where: { cartId, productVariantId: variantId },
        attributes: ['id'],
    });

    if (!item) {
        return null;
    }

    await item.destroy();
    return item.get({ plain: true });
}

async function clearCartItems(cartId) {
    await CartItem.destroy({ where: { cartId } });
}

module.exports = {
    fetchCartIdByUserId,
    ensureCart,
    fetchVariantBySku,
    fetchCartItems,
    upsertCartItem,
    updateCartItemQuantity,
    deleteCartItem,
    clearCartItems,
};
