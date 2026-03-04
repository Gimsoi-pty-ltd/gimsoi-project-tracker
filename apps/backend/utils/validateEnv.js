/**
 * Validates required environment variables in a single pass.
 * Throws a single error listing every missing var — not one-at-a-time.
 *
 * Always required: JWT_SECRET, DATABASE_URL
 * Production-only: CSRF_SECRET, GMAIL_USER, GMAIL_APP_PASSWORD
 *   (not required in test/development where email is stubbed and CSRF is dev-mode)
 */
export const validateEnv = () => {
    const alwaysRequired = ['JWT_SECRET', 'DATABASE_URL'];
    const productionOnly = ['CSRF_SECRET', 'GMAIL_USER', 'GMAIL_APP_PASSWORD'];

    const isProduction = process.env.NODE_ENV === 'production';
    const required = isProduction
        ? [...alwaysRequired, ...productionOnly]
        : alwaysRequired;

    const missing = required.filter((k) => !process.env[k]);

    if (missing.length > 0) {
        throw new Error(
            `Server startup aborted. Missing required environment variables:\n  ${missing.join('\n  ')}`
        );
    }
};
