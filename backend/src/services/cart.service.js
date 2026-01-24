const cartRepository = require('../repositories/cart.repository');

// Convierte centimos a soles para las respuestas del API.
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

function mapCartItems(rows) {
    return rows.map((row) => ({
        sku: row.sku,
        productName: row.productName,
        variantName: row.variantName,
        price: centsToSoles(row.priceCents),
        quantity: row.quantity,
    }));
}

async function getCart(userId) {
    const cartId = await cartRepository.fetchCartIdByUserId(userId);
    if (!cartId) {
        return { items: [] };
    }

    const rows = await cartRepository.fetchCartItems(cartId);
    return { items: mapCartItems(rows) };
}

async function addItem(userId, sku, quantity) {
    const variant = await cartRepository.fetchVariantBySku(sku);
    if (!variant) {
        return { error: 'sku' };
    }

    const cartId = await cartRepository.ensureCart(userId);
    await cartRepository.upsertCartItem(cartId, variant.id, quantity);

    const rows = await cartRepository.fetchCartItems(cartId);
    return { items: mapCartItems(rows) };
}

async function updateItem(userId, sku, quantity) {
    const variant = await cartRepository.fetchVariantBySku(sku);
    if (!variant) {
        return { error: 'sku' };
    }

    const cartId = await cartRepository.fetchCartIdByUserId(userId);
    if (!cartId) {
        return { error: 'item' };
    }

    const updated = await cartRepository.updateCartItemQuantity(cartId, variant.id, quantity);
    if (!updated) {
        return { error: 'item' };
    }

    const rows = await cartRepository.fetchCartItems(cartId);
    return { items: mapCartItems(rows) };
}

async function removeItem(userId, sku) {
    const variant = await cartRepository.fetchVariantBySku(sku);
    if (!variant) {
        return { error: 'sku' };
    }

    const cartId = await cartRepository.fetchCartIdByUserId(userId);
    if (!cartId) {
        return { error: 'item' };
    }

    const removed = await cartRepository.deleteCartItem(cartId, variant.id);
    if (!removed) {
        return { error: 'item' };
    }

    const rows = await cartRepository.fetchCartItems(cartId);
    return { items: mapCartItems(rows) };
}

async function clearCart(userId) {
    const cartId = await cartRepository.fetchCartIdByUserId(userId);
    if (!cartId) {
        return { items: [] };
    }

    await cartRepository.clearCartItems(cartId);
    return { items: [] };
}

module.exports = {
    getCart,
    addItem,
    updateItem,
    removeItem,
    clearCart,
};
