const express = require('express');
const authRequired = require('../middlewares/authRequired');
const { createOrder } = require('../controllers/order.controller');

const router = express.Router();

router.post('/api/v1/orders', authRequired, createOrder);

module.exports = router;
