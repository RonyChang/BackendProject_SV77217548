const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authRepository = require('../repositories/auth.repository');

function createError(status, message) {
    const error = new Error(message);
    error.status = status;
    return error;
}

function normalizeEmail(email) {
    return email.trim().toLowerCase();
}

function normalizeName(value) {
    return value.trim();
}

function buildUserResponse(user) {
    return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
    };
}

function signToken(user) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw createError(500, 'JWT_SECRET no configurado');
    }

    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
        },
        secret,
        { expiresIn }
    );
}

async function registerUser({ email, firstName, lastName, password }) {
    const normalizedEmail = normalizeEmail(email);
    const existing = await authRepository.findUserByEmail(normalizedEmail);
    if (existing) {
        throw createError(409, 'El correo ya esta registrado');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await authRepository.createUser({
        email: normalizedEmail,
        firstName: normalizeName(firstName),
        lastName: normalizeName(lastName),
        passwordHash,
        role: 'customer',
    });

    const token = signToken(newUser);
    return {
        user: buildUserResponse(newUser),
        token,
    };
}

async function loginUser({ email, password }) {
    const normalizedEmail = normalizeEmail(email);
    const user = await authRepository.findUserByEmail(normalizedEmail);
    if (!user) {
        throw createError(401, 'Credenciales invalidas');
    }

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
        throw createError(401, 'Credenciales invalidas');
    }

    const token = signToken(user);
    return {
        user: buildUserResponse(user),
        token,
    };
}

module.exports = {
    registerUser,
    loginUser,
};
