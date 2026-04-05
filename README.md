# Finance Data Processing and Access Control Backend

A complete backend assignment solution for a finance dashboard system using:

- Backend: Express + TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Auth: JWT
- Validation: Zod
- Docs: Swagger
- DevOps: Docker + Docker Compose
- Testing: Jest + Supertest

## Features Implemented

### 1) User and Role Management
- Create and manage users
- Roles: `VIEWER`, `ANALYST`, `ADMIN`
- User active/inactive support
- Role-based restrictions on endpoints

### 2) Financial Records Management
- CRUD for finance records
- Record fields:
  - `amount`
  - `type` (`INCOME` / `EXPENSE`)
  - `category`
  - `date`
  - `notes`
- Filtering support:
  - by type
  - by category
  - by date range
- Pagination support

### 3) Dashboard Summary APIs
- Total income
- Total expenses
- Net balance
- Category-wise totals
- Recent activity
- Monthly trend endpoint

### 4) Access Control Logic
- JWT authentication middleware
- RBAC middleware
- Endpoint-level authorization rules

### 5) Validation and Error Handling
- Zod validation for body/query/params
- Consistent error responses
- Proper HTTP status codes

### 6) Persistence
- PostgreSQL + Prisma schema/migrations

### Optional Enhancements Added
- Seed script for sample users and records
- Swagger UI at `/docs`
- Dockerized local setup
- Basic integration test

---

## Folder Structure

HTTP handlers live next to their routes and services as `*.controller.ts` inside each feature folder under `src/modules/`. There is no separate top-level `controllers/` directory.

```text
finance-dashboard/
  prisma/
    schema.prisma
    seed.ts
  src/
    config/
      env.ts
    docs/
      swagger.ts
    lib/
      prisma.ts
    middlewares/
      auth.middleware.ts
      error.middleware.ts
      rbac.middleware.ts
      validate.middleware.ts
    modules/
      auth/
        auth.controller.ts
        auth.route.ts
        auth.schema.ts
        auth.service.ts
      users/
        user.controller.ts
        user.route.ts
        user.schema.ts
        user.service.ts
      records/
        record.controller.ts
        record.route.ts
        record.schema.ts
        record.service.ts
      dashboard/
        dashboard.controller.ts
        dashboard.route.ts
        dashboard.service.ts
      common/
        asyncHandler.ts
        errors.ts
    routes/
      index.ts
    types/
      express.d.ts
    app.ts
    server.ts
  tests/
    globalSetup.cjs
    setupEnv.ts
    health.test.ts
    helpers/
      resetTestData.ts
    integration/
      app.integration.test.ts
  .env.example
  .gitignore
  Dockerfile
  docker-compose.yml
  jest.config.ts
  package.json
  tsconfig.json
  README.md
```

---

## Local Setup (Without Docker)

### Prerequisites
- Node.js 20+
- npm
- PostgreSQL running locally

### 1. Install dependencies
```bash
npm install
```

### 2. Setup environment
```bash
cp .env.example .env
```

Update `.env` if needed.

### 3. Generate Prisma client
```bash
npm run prisma:generate
```

### 4. Run migrations
```bash
npm run prisma:migrate -- --name init
```

### 5. Seed data
```bash
npm run prisma:seed
```

### 6. Start dev server
```bash
npm run dev
```

App runs at: `http://localhost:4000`

Swagger docs: `http://localhost:4000/docs`

OpenAPI is generated from JSDoc on `src/routes/index.ts` and each `src/modules/**/*.route.ts` file, so **all 11 HTTP operations** from the API overview appear (as **8 paths**: some paths define multiple methods, for example `GET` and `POST` on `/records`).

For interview-style Q&A about this project, see `INTERVIEW_QA.md`.

---

## Docker Setup

### 1. Prepare env
```bash
cp .env.example .env
```

### 2. Start all services
```bash
docker compose up --build
```

This starts:
- Postgres on `5432`
- API on `4000`

---

## Default Seed Users

After seeding, use:

- Admin
  - Email: `admin@finance.local`
  - Password: `Admin@123`
- Analyst
  - Email: `analyst@finance.local`
  - Password: `Analyst@123`
- Viewer
  - Email: `viewer@finance.local`
  - Password: `Viewer@123`

---

## API Overview

### Public
- `GET /health`
- `POST /auth/login`

### Authenticated (JWT)
- Users (Admin only)
  - `GET /users`
  - `POST /users`
  - `PATCH /users/:id`

- Records
  - `GET /records` (Viewer/Analyst/Admin)
  - `POST /records` (Admin)
  - `PATCH /records/:id` (Admin)
  - `DELETE /records/:id` (Admin)

- Dashboard
  - `GET /dashboard/summary` (Viewer/Analyst/Admin)
  - `GET /dashboard/trend/monthly` (Analyst/Admin)

### Login Response
`POST /auth/login` returns:
- `token` (Bearer token)
- user object

Use header:
```text
Authorization: Bearer <token>
```

---

## Example cURL Commands

### Login (Admin)
```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@finance.local","password":"Admin@123"}'
```

### List Records
```bash
curl "http://localhost:4000/records?page=1&limit=10&type=EXPENSE" \
  -H "Authorization: Bearer <token>"
```

### Create Record (Admin)
```bash
curl -X POST http://localhost:4000/records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "amount": 450.75,
    "type": "EXPENSE",
    "category": "Utilities",
    "date": "2026-04-01",
    "notes": "Electricity bill"
  }'
```

### Dashboard Summary
```bash
curl http://localhost:4000/dashboard/summary \
  -H "Authorization: Bearer <token>"
```

---

## Run Tests

Integration tests use PostgreSQL database **`finance_dashboard_test`** (create it once if it does not exist). They run **`prisma migrate deploy`** automatically via Jest `globalSetup` before any tests.

1. Optional: copy `.env.test.example` → `.env.test` and set `TEST_DATABASE_URL` if your Postgres user/password/host differs from the default.

   ```bash
   cp .env.test.example .env.test
   ```

   Example:

   ```text
   TEST_DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/finance_dashboard_test?schema=public
   ```

2. Run tests (uses `TEST_DATABASE_URL` from `.env.test` when present; otherwise the same default URL as in `tests/setupEnv.ts`):

   ```bash
   npm test
   ```

What is covered:

- `tests/health.test.ts` — smoke test for `GET /health` (no DB writes).
- `tests/integration/app.integration.test.ts` — auth, users (admin), records CRUD + filters, dashboard summary/trend, RBAC (403/401), validation (400).

Each integration test resets data with `deleteMany` and re-seeds isolated users (emails under `@test.local`).

---

## Design Notes / Assumptions

- Only Admin can mutate records and users.
- Analyst can read records and advanced dashboard trends.
- Viewer can read records and base dashboard summary.
- Inactive users cannot login.
- Monetary values are stored as `Decimal(12,2)` in PostgreSQL.
- Pagination defaults to `page=1`, `limit=10`.

---

## What this Assignment Demonstrates

- Clean modular backend structure
- RBAC and JWT auth implementation
- Strong data modeling with Prisma
- Aggregation logic for dashboard APIs
- Validation + robust error handling
- Containerized local development workflow

