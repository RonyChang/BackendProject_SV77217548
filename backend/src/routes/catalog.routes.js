const express = require('express');
const {
    listCategories,
    listProducts,
    getProductDetail,
} = require('../controllers/catalog.controller');

const router = express.Router();

router.get('/api/v1/catalog/categories', listCategories);
router.get('/api/v1/catalog/products', listProducts);
router.get('/api/v1/catalog/products/:slug', getProductDetail);

module.exports = router;
