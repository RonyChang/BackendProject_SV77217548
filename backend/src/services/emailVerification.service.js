const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const emailVerificationRepository = require('../repositories/emailVerification.repository');

function getVerificationTtlMinutes() {
    const raw = Number(process.env.EMAIL_VERIFICATION_TTL_MINUTES);
    if (Number.isFinite(raw) && raw > 0) {
        return Math.floor(raw);
    }

    return 10;
}

function buildTransport() {
    const host = process.env.SMTP_HOST || '';
    const port = Number(process.env.SMTP_PORT);
    const user = process.env.SMTP_USER || '';
    const pass = process.env.SMTP_PASS || '';

    if (!host || !port || !user || !pass) {
        const error = new Error('SMTP no configurado');
        error.status = 500;
        throw error;
    }

    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
    });
}

function buildFromAddress() {
    return process.env.EMAIL_FROM || process.env.SMTP_USER || 'no-reply@spacegurumis.lat';
}

function generateCode() {
    return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendVerificationCode(user) {
    if (!user || !user.id || !user.email) {
        const error = new Error('Usuario invalido para verificacion');
        error.status = 500;
        throw error;
    }

    const ttlMinutes = getVerificationTtlMinutes();
    const code = generateCode();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    await emailVerificationRepository.deleteByUserId(user.id);
    await emailVerificationRepository.createVerification({
        userId: user.id,
        codeHash,
        expiresAt,
    });

    const transporter = buildTransport();
    await transporter.sendMail({
        from: buildFromAddress(),
        to: user.email,
        subject: 'Codigo de verificacion',
        text: `Tu codigo de verificacion es ${code}. Expira en ${ttlMinutes} minutos.`,
    });

    return { expiresAt };
}

async function verifyCode(userId, code) {
    if (!userId || !code) {
        return { ok: false, reason: 'invalid' };
    }

    const latest = await emailVerificationRepository.findLatestByUserId(userId);
    if (!latest) {
        return { ok: false, reason: 'missing' };
    }

    const now = new Date();
    const expiresAt = new Date(latest.expiresAt);
    if (Number.isNaN(expiresAt.getTime()) || expiresAt <= now) {
        return { ok: false, reason: 'expired' };
    }

    const matches = await bcrypt.compare(code, latest.codeHash);
    if (!matches) {
        return { ok: false, reason: 'invalid' };
    }

    await emailVerificationRepository.deleteByUserId(userId);
    return { ok: true };
}

module.exports = {
    sendVerificationCode,
    verifyCode,
};
