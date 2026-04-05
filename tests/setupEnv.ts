process.env.NODE_ENV = 'test';
process.env.PORT = '4001';
process.env.DATABASE_URL =
  process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/finance_dashboard_test?schema=public';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsupersecretkey';
process.env.JWT_EXPIRES_IN = '1d';
process.env.BCRYPT_SALT_ROUNDS = '10';
