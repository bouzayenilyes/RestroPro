exports.CONFIG = {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRY: process.env.JWT_EXPIRY,
    JWT_EXPIRY_REFRESH: process.env.JWT_EXPIRY_REFRESH,
    COOKIE_EXPIRY: process.env.COOKIE_EXPIRY,
    COOKIE_EXPIRY_REFRESH: process.env.COOKIE_EXPIRY_REFRESH,
    FRONTEND_DOMAIN: process.env.FRONTEND_DOMAIN,
    FRONTEND_DOMAIN_COOKIE: process.env.FRONTEND_DOMAIN_COOKIE ,
    PASSWORD_SALT: parseInt(process.env.PASSWORD_SALT) || 10,
    STRIPE_SECRET: process.env.STRIPE_SECRET,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_EMAIL: process.env.SMTP_EMAIL,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY
};

exports.LANGUAGES = [
    'ar',
    'en',
    'es',
    'fr',
    'hi',
    'ja',
    'ko'
]
