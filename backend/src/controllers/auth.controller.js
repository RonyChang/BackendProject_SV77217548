const authService = require('../services/auth.service');

function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

function isValidEmail(email) {
    if (!isNonEmptyString(email)) {
        return false;
    }

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function validateRegisterPayload(payload) {
    const errors = [];

    if (!isValidEmail(payload.email)) {
        errors.push('Email invalido');
    }

    if (!isNonEmptyString(payload.firstName)) {
        errors.push('Nombre requerido');
    }

    if (!isNonEmptyString(payload.lastName)) {
        errors.push('Apellido requerido');
    }

    if (!isNonEmptyString(payload.password) || payload.password.trim().length < 6) {
        errors.push('Contraseña minima de 6 caracteres');
    }

    return errors;
}

function validateLoginPayload(payload) {
    const errors = [];

    if (!isValidEmail(payload.email)) {
        errors.push('Email invalido');
    }

    if (!isNonEmptyString(payload.password)) {
        errors.push('Contraseña requerida');
    }

    return errors;
}

async function register(req, res, next) {
    try {
        const { email, firstName, lastName, password } = req.body || {};
        const errors = validateRegisterPayload({ email, firstName, lastName, password });

        if (errors.length) {
            return res.status(400).json({
                data: null,
                message: 'Datos invalidos',
                errors: errors.map((message) => ({ message })),
                meta: {},
            });
        }

        const result = await authService.registerUser({ email, firstName, lastName, password });
        return res.status(201).json({
            data: result,
            message: 'OK',
            errors: [],
            meta: {},
        });
    } catch (error) {
        return next(error);
    }
}

async function login(req, res, next) {
    try {
        const { email, password } = req.body || {};
        const errors = validateLoginPayload({ email, password });

        if (errors.length) {
            return res.status(400).json({
                data: null,
                message: 'Datos invalidos',
                errors: errors.map((message) => ({ message })),
                meta: {},
            });
        }

        const result = await authService.loginUser({ email, password });
        return res.status(200).json({
            data: result,
            message: 'OK',
            errors: [],
            meta: {},
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    register,
    login,
};
