import path from 'node:path';
import dotenv from 'dotenv';

// Align with `tests/globalSetup.cjs` when you use a dedicated test DB URL.
dotenv.config({ path: path.join(__dirname, '..', '.env.test') });

process.env.NODE_ENV = 'test';
process.env.PORT = '4001';
// Prefer TEST_DATABASE_URL so local dev `.env` can keep pointing at `finance_dashboard`.
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/finance_dashboard_test?schema=public';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsupersecretkey';
process.env.JWT_EXPIRES_IN = '1d';
process.env.BCRYPT_SALT_ROUNDS = '10';
