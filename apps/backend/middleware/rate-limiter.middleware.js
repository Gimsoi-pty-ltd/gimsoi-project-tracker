import rateLimit from "express-rate-limit";

/**
 * Rate limiters for the Gimsoi Project Tracker API.
 *
 * readLimiter  — GET endpoints (100 req / 15 min)
 * writeLimiter — POST, PUT, DELETE endpoints (30 req / 15 min)
 * authLimiter  — general auth endpoints (20 req / 15 min)
 * loginLimiter — login endpoint only (5 req / 15 min)
 */

const sharedOptions = {
    standardHeaders: true,
    legacyHeaders: false,
};

const isTestEnv = process.env.NODE_ENV === 'test';
const passThrough = (req, res, next) => next();

export const readLimiter = isTestEnv ? passThrough : rateLimit({
    ...sharedOptions,
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, message: "Too many requests. Please try again later." },
});

export const writeLimiter = isTestEnv ? passThrough : rateLimit({
    ...sharedOptions,
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: { success: false, message: "Too many requests. Please try again later." },
});

export const authLimiter = isTestEnv ? passThrough : rateLimit({
    ...sharedOptions,
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: "Too many requests. Please try again later." },
});

export const loginLimiter = isTestEnv ? passThrough : rateLimit({
    ...sharedOptions,
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { success: false, message: "Too many login attempts. Please try again later." },
});
