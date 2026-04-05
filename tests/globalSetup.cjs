'use strict';

/**
 * Runs once before all tests. Ensures `finance_dashboard_test` (or TEST_DATABASE_URL) has the latest schema.
 */
const { execSync } = require('node:child_process');
const path = require('node:path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.test') });

const dbUrl =
  process.env.TEST_DATABASE_URL ||
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/finance_dashboard_test?schema=public';

module.exports = async function globalSetup() {
  execSync('npx prisma migrate deploy', {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: dbUrl
    }
  });
};
