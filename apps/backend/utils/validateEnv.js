/**
 * Validates required environment variables at startup.
 * Always required: JWT_SECRET, DATABASE_URL
 * Production-only: CSRF_SECRET, GMAIL_USER, GMAIL_APP_PASSWORD
 */

const PRISMA_LINK =
    '\u001b]8;;https://console.prisma.io\u0007console.prisma.io\u001b]8;;\u0007';

const VAR_GUIDANCE = {
    JWT_SECRET:
        "Run: node -e \"console.log(" +
        "require('crypto').randomBytes(64).toString('hex'))\"",
    DATABASE_URL:
        `Login at ${PRISMA_LINK} → your project → Connect`,
    CSRF_SECRET:
        "Run: node -e \"console.log(" +
        "require('crypto').randomBytes(32).toString('hex'))\"",
    GMAIL_USER:
        'Your sending Gmail address, e.g. yourapp@gmail.com',
    GMAIL_APP_PASSWORD:
        'myaccount.google.com → Security → ' +
        '2-Step Verification → App passwords',
};

export const validateEnv = () => {
    const alwaysRequired = ['JWT_SECRET', 'DATABASE_URL'];
    const productionOnly = [
        'CSRF_SECRET', 'GMAIL_USER', 'GMAIL_APP_PASSWORD',
    ];

    const isProduction = process.env.NODE_ENV === 'production';
    const required = isProduction
        ? [...alwaysRequired, ...productionOnly]
        : alwaysRequired;

    const missing = required.filter((k) => !process.env[k]);

    if (missing.length > 0) {
        const details = missing
            .map((k) => `  ❌ ${k}\n     → ${VAR_GUIDANCE[k]}`)
            .join('\n\n');
        console.error(
            `\n[env] Startup diagnostics — ` +
            `${missing.length} missing variable(s):\n\n` +
            `${details}\n\n`
        );
        process.exit(1);
    }
};
