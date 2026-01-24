const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    email: {
        type: DataTypes.STRING(160),
        allowNull: false,
        unique: true,
    },
    firstName: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    lastName: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    passwordHash: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    googleId: {
        type: DataTypes.STRING(200),
        allowNull: true,
        unique: true,
    },
    avatarUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    role: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: 'customer',
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
}, {
    tableName: 'users',
});

const UserAddress = sequelize.define('UserAddress', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        unique: true,
    },
    receiverName: {
        type: DataTypes.STRING(160),
        allowNull: false,
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    addressLine1: {
        type: DataTypes.STRING(200),
        allowNull: false,
    },
    addressLine2: {
        type: DataTypes.STRING(200),
        allowNull: true,
    },
    country: {
        type: DataTypes.STRING(80),
        allowNull: false,
    },
    city: {
        type: DataTypes.STRING(120),
        allowNull: false,
    },
    district: {
        type: DataTypes.STRING(120),
        allowNull: false,
    },
    postalCode: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    reference: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'user_addresses',
});

const Category = sequelize.define('Category', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(120),
        allowNull: false,
    },
    slug: {
        type: DataTypes.STRING(120),
        allowNull: false,
        unique: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
}, {
    tableName: 'categories',
});

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    categoryId: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    name: {
        type: DataTypes.STRING(160),
        allowNull: false,
    },
    slug: {
        type: DataTypes.STRING(160),
        allowNull: false,
        unique: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
}, {
    tableName: 'products',
});

const ProductVariant = sequelize.define('ProductVariant', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    productId: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    sku: {
        type: DataTypes.STRING(80),
        allowNull: false,
        unique: true,
    },
    variantName: {
        type: DataTypes.STRING(120),
        allowNull: true,
    },
    priceCents: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    weightGrams: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    sizeLabel: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
}, {
    tableName: 'product_variants',
});

const Inventory = sequelize.define('Inventory', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    productVariantId: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    reserved: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
}, {
    tableName: 'inventory',
    timestamps: true,
    createdAt: false,
    updatedAt: 'updated_at',
});

const Cart = sequelize.define('Cart', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        unique: true,
    },
}, {
    tableName: 'carts',
});

const CartItem = sequelize.define('CartItem', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    cartId: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    productVariantId: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
}, {
    tableName: 'cart_items',
});

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    orderStatus: {
        type: DataTypes.STRING(40),
        allowNull: false,
        defaultValue: 'pendingPayment',
    },
    paymentStatus: {
        type: DataTypes.STRING(40),
        allowNull: false,
        defaultValue: 'pending',
    },
    subtotalCents: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    totalCents: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
}, {
    tableName: 'orders',
});

const OrderItem = sequelize.define('OrderItem', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    orderId: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    productVariantId: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    sku: {
        type: DataTypes.STRING(80),
        allowNull: false,
    },
    productName: {
        type: DataTypes.STRING(160),
        allowNull: false,
    },
    variantName: {
        type: DataTypes.STRING(120),
        allowNull: true,
    },
    priceCents: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
}, {
    tableName: 'order_items',
});

User.hasOne(UserAddress, { foreignKey: 'userId', as: 'address' });
UserAddress.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(Cart, { foreignKey: 'userId', as: 'cart' });
Cart.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

Product.hasMany(ProductVariant, { foreignKey: 'productId', as: 'variants' });
ProductVariant.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

ProductVariant.hasOne(Inventory, { foreignKey: 'productVariantId', as: 'inventory' });
Inventory.belongsTo(ProductVariant, { foreignKey: 'productVariantId', as: 'variant' });

Cart.hasMany(CartItem, { foreignKey: 'cartId', as: 'items' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId', as: 'cart' });
CartItem.belongsTo(ProductVariant, { foreignKey: 'productVariantId', as: 'variant' });

User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
OrderItem.belongsTo(ProductVariant, { foreignKey: 'productVariantId', as: 'variant' });

module.exports = {
    sequelize,
    User,
    UserAddress,
    Category,
    Product,
    ProductVariant,
    Inventory,
    Cart,
    CartItem,
    Order,
    OrderItem,
};
