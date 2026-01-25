const express = require('express');
const authRequired = require('../middlewares/authRequired');
const { createOrder, cancelOrder } = require('../controllers/order.controller');

const router = express.Router();

router.post('/api/v1/orders', authRequired, createOrder);
router.post('/api/v1/orders/:id/cancel', authRequired, cancelOrder);

module.exports = router;
