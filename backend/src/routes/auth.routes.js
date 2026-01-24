const express = require('express');
const { register, login } = require('../controllers/auth.controller');

const router = express.Router();

router.post('/api/v1/auth/register', register);
router.post('/api/v1/auth/login', login);

module.exports = router;
