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
        avatarUrl: user.avatarUrl || null,
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

function getGoogleConfig() {
    const clientId = process.env.GOOGLE_CLIENT_ID || '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    const callbackUrl = process.env.GOOGLE_CALLBACK_URL || '';

    if (!clientId || !clientSecret || !callbackUrl) {
        throw createError(500, 'Google OAuth no configurado');
    }

    return { clientId, clientSecret, callbackUrl };
}

function buildGoogleAuthUrl() {
    const { clientId, callbackUrl } = getGoogleConfig();
    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: callbackUrl,
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'offline',
        prompt: 'consent',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

async function exchangeGoogleCode(code) {
    const { clientId, clientSecret, callbackUrl } = getGoogleConfig();
    const params = new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: callbackUrl,
        grant_type: 'authorization_code',
    });

    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
    });

    if (!response.ok) {
        throw createError(401, 'No se pudo validar con Google');
    }

    return response.json();
}

async function fetchGoogleProfile(accessToken) {
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw createError(401, 'No se pudo obtener perfil de Google');
    }

    return response.json();
}

function buildNamesFromGoogleProfile(profile) {
    const firstName = (profile.given_name || '').trim();
    const lastName = (profile.family_name || '').trim();

    if (firstName || lastName) {
        return {
            firstName: firstName || 'Usuario',
            lastName: lastName || 'Google',
        };
    }

    const fullName = (profile.name || '').trim();
    if (!fullName) {
        return { firstName: 'Usuario', lastName: 'Google' };
    }

    const parts = fullName.split(' ').filter(Boolean);
    const derivedFirst = parts[0] || 'Usuario';
    const derivedLast = parts.slice(1).join(' ').trim() || 'Google';
    return { firstName: derivedFirst, lastName: derivedLast };
}

async function registerUser({ email, firstName, lastName, password }) {
    const normalizedEmail = normalizeEmail(email);
    const existing = await authRepository.findUserByEmail(normalizedEmail);
    if (existing) {
        throw createError(409, 'El correo ya está registrado');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await authRepository.createUser({
        email: normalizedEmail,
        firstName: normalizeName(firstName),
        lastName: normalizeName(lastName),
        passwordHash,
        role: 'customer',
        googleId: null,
        avatarUrl: null,
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
        throw createError(401, 'Credenciales inválidas');
    }

    if (!user.passwordHash) {
        throw createError(401, 'Credenciales inválidas');
    }

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
        throw createError(401, 'Credenciales inválidas');
    }

    const token = signToken(user);
    return {
        user: buildUserResponse(user),
        token,
    };
}

async function loginWithGoogle(code) {
    const tokens = await exchangeGoogleCode(code);
    const accessToken = tokens.access_token;
    if (!accessToken) {
        throw createError(401, 'Token de Google inválido');
    }

    const profile = await fetchGoogleProfile(accessToken);
    const email = profile.email ? normalizeEmail(profile.email) : '';
    const googleId = profile.sub || '';

    if (!email || !googleId) {
        throw createError(400, 'Datos de Google incompletos');
    }

    const avatarUrl = profile.picture || null;
    let user = await authRepository.findUserByGoogleId(googleId);

    if (!user) {
        const existing = await authRepository.findUserByEmail(email);
        if (existing && existing.googleId && existing.googleId !== googleId) {
            throw createError(409, 'El correo ya está vinculado a otra cuenta Google');
        }

        if (existing) {
            user = await authRepository.linkGoogleAccount({
                userId: existing.id,
                googleId,
                avatarUrl,
            });
        } else {
            const names = buildNamesFromGoogleProfile(profile);
            user = await authRepository.createUser({
                email,
                firstName: normalizeName(names.firstName),
                lastName: normalizeName(names.lastName),
                passwordHash: null,
                role: 'customer',
                googleId,
                avatarUrl,
            });
        }
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
    buildGoogleAuthUrl,
    loginWithGoogle,
};
