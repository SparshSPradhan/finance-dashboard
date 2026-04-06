import rateLimit from 'express-rate-limit';
import type { RequestHandler } from 'express';

const isTest = process.env.NODE_ENV === 'test';

/**
 * Broad limit for all API routes (skipped for `/health` and `/docs`).
 * In `test`, limits are effectively disabled so Jest integration tests do not flake.
 */
export const globalApiLimiter: RequestHandler = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000),
  max: isTest ? 100_000 : Number(process.env.RATE_LIMIT_MAX ?? 300),
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
  skip: (req) => req.path === '/health' || req.path.startsWith('/docs')
});

/**
 * Stricter window for `/auth/*` to slow brute-force login attempts.
 */
export const authRouteLimiter: RequestHandler = rateLimit({
  windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000),
  max: isTest ? 100_000 : Number(process.env.AUTH_RATE_LIMIT_MAX ?? 30),
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts, please try again later.' }
});
