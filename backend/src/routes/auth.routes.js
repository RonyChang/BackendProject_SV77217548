const express = require('express');
const { register, login, googleStart, googleCallback } = require('../controllers/auth.controller');

const router = express.Router();

router.post('/api/v1/auth/register', register);
router.post('/api/v1/auth/login', login);
router.get('/api/v1/auth/google', googleStart);
router.get('/api/v1/auth/google/callback', googleCallback);

module.exports = router;
