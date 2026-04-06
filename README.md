# Finance Data Processing and Access Control Backend

## Key Highlights

- Role-Based Access Control (RBAC) with 3 roles
- Soft delete implementation with audit-safe queries
- Dashboard aggregation APIs (summary + monthly trends)
- Rate limiting for API protection
- Fully tested with integration tests (Jest + Supertest)
- Separate test database for safe testing



Built using a modular feature-based architecture with clear separation of concerns (controller → service → data layer).



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
- **Soft delete** via `DELETE` (sets `deletedAt`; hidden from default list and dashboard)

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
- Swagger UI at `/docs` (OpenAPI)
- Dockerized local setup
- JWT-based authentication
- Pagination and filtering for records
- **Soft delete** for financial records (`deletedAt`; excluded from lists and dashboard by default)
- **Rate limiting** via `express-rate-limit` (global API + stricter `/auth` window)
- Integration testing using Jest and Supertest

---

## Folder Structure



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
      rateLimit.middleware.ts
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

OpenAPI documentation is generated using JSDoc and available at `/docs`.



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
> Note: These are sample credentials for local development only.

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
  - `GET /records` (Viewer/Analyst/Admin) — active rows only (`deletedAt IS NULL`)
  - `GET /records?includeDeleted=true` (Admin only) — includes soft-deleted rows (for audit / recovery workflows)
  - `POST /records` (Admin)
  - `PATCH /records/:id` (Admin) — not allowed once soft-deleted
  - `DELETE /records/:id` (Admin) — **soft delete** (sets `deletedAt`; row remains in DB)

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

## Soft delete (records)

- `DELETE /records/:id` does **not** remove the row; it sets `deletedAt` to the current time.
- Default `GET /records` and all **dashboard** aggregations only include rows where `deletedAt` is null, so totals and “recent activity” stay consistent with what users see in the UI.
- **Admin** can pass `includeDeleted=true` on `GET /records` to see soft-deleted entries (and their `deletedAt` timestamp). Other roles receive **403** if they try.
- Calling `DELETE` again on an already soft-deleted id returns **404** (treated as “no active record”).

---

## Rate limiting

Implemented with [`express-rate-limit`](https://github.com/express-rate/express-rate-limit):

| Scope | Default window | Default max requests | Notes |
|--------|----------------|----------------------|--------|
| Whole API (per IP) | 15 minutes | 300 | Skips `GET /health` and `/docs` (Swagger UI + assets) |
| `/auth/*` (per IP) | 15 minutes | 30 | Extra throttle on login to slow password guessing |

Responses use **429 Too Many Requests** with a small JSON body, e.g. `{ "message": "Too many requests..." }`.

**Tests:** When `NODE_ENV=test`, limits are set very high so Jest integration tests do not fail spuriously.

**Optional environment variables** (see `.env.example`):

- `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`
- `AUTH_RATE_LIMIT_WINDOW_MS`, `AUTH_RATE_LIMIT_MAX`

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

### List Including Soft-Deleted (Admin only)
```bash
curl "http://localhost:4000/records?includeDeleted=true" \
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
- `tests/integration/app.integration.test.ts` — auth, users (admin), records CRUD + filters, **soft delete** + `includeDeleted` (admin vs 403 for viewer), dashboard summary/trend (summary excludes deleted rows), RBAC (403/401), validation (400).

Each integration test resets data with `deleteMany` and re-seeds isolated users (emails under `@test.local`).

---

## Design Notes / Assumptions

- Only Admin can mutate records and users.
- Analyst can read records and advanced dashboard trends.
- Viewer can read records and base dashboard summary.
- Inactive users cannot login.
- Monetary values are stored as `Decimal(12,2)` in PostgreSQL.
- Pagination defaults to `page=1`, `limit=10`.
- Record **delete** is soft by design; hard delete was not required for the assignment and keeps an audit trail in the database.
- Rate limits are per IP using in-memory stores; for multiple server instances in production you would switch to a shared store (e.g. Redis).

---

## What this Assignment Demonstrates

- Clean modular backend structure
- RBAC and JWT auth implementation
- Strong data modeling with Prisma
- Aggregation logic for dashboard APIs
- Validation + robust error handling
- Containerized local development workflow

