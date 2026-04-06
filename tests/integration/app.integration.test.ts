import request from 'supertest';
import { app } from '../../src/app';
import { disconnectTestPrisma, resetDatabaseAndSeed, testUsers } from '../helpers/resetTestData';

describe('Integration API', () => {
  beforeEach(async () => {
    await resetDatabaseAndSeed();
  });

  afterAll(async () => {
    await disconnectTestPrisma();
  });

  async function login(email: string, password: string): Promise<string> {
    const res = await request(app).post('/auth/login').send({ email, password });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    return res.body.token as string;
  }

  describe('POST /auth/login', () => {
    it('returns 401 for wrong password', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: testUsers.admin.email, password: 'WrongPassword' });
      expect(res.status).toBe(401);
    });

    it('returns 403 for inactive user', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: testUsers.inactive.email, password: testUsers.inactive.password });
      expect(res.status).toBe(403);
    });

    it('returns 400 for invalid body', async () => {
      const res = await request(app).post('/auth/login').send({ email: 'not-an-email' });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation failed');
    });
  });

  describe('Users (ADMIN)', () => {
    it('lists users for admin', async () => {
      const token = await login(testUsers.admin.email, testUsers.admin.password);
      const res = await request(app).get('/users').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(4);
    });

    it('returns 403 for viewer listing users', async () => {
      const token = await login(testUsers.viewer.email, testUsers.viewer.password);
      const res = await request(app).get('/users').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
    });

    it('creates a user', async () => {
      const token = await login(testUsers.admin.email, testUsers.admin.password);
      const res = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'New User',
          email: 'new-user@test.local',
          password: 'Test@1234',
          role: 'VIEWER'
        });
      expect(res.status).toBe(201);
      expect(res.body.email).toBe('new-user@test.local');
    });

    it('patches user role', async () => {
      const adminToken = await login(testUsers.admin.email, testUsers.admin.password);
      const list = await request(app).get('/users').set('Authorization', `Bearer ${adminToken}`);
      const viewer = list.body.find((u: { email: string }) => u.email === testUsers.viewer.email);
      expect(viewer).toBeDefined();

      const res = await request(app)
        .patch(`/users/${viewer.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'ANALYST' });
      expect(res.status).toBe(200);
      expect(res.body.role).toBe('ANALYST');
    });
  });

  describe('Records + RBAC', () => {
    it('viewer can list records', async () => {
      const token = await login(testUsers.viewer.email, testUsers.viewer.password);
      const res = await request(app).get('/records').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(2);
      expect(res.body.pagination).toMatchObject({ page: 1, limit: 10 });
    });

    it('filters records by type', async () => {
      const token = await login(testUsers.viewer.email, testUsers.viewer.password);
      const res = await request(app)
        .get('/records')
        .query({ type: 'EXPENSE' })
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.items.every((r: { type: string }) => r.type === 'EXPENSE')).toBe(true);
    });

    it('admin can create, patch, and soft-delete a record', async () => {
      const token = await login(testUsers.admin.email, testUsers.admin.password);

      const create = await request(app)
        .post('/records')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 99.5,
          type: 'EXPENSE',
          category: 'Utilities',
          date: '2026-04-01',
          notes: 'Test bill'
        });
      expect(create.status).toBe(201);
      const id = create.body.id as string;

      const patch = await request(app)
        .patch(`/records/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ notes: 'Updated note' });
      expect(patch.status).toBe(200);
      expect(patch.body.notes).toBe('Updated note');

      const del = await request(app).delete(`/records/${id}`).set('Authorization', `Bearer ${token}`);
      expect(del.status).toBe(204);

      const listActive = await request(app).get('/records').set('Authorization', `Bearer ${token}`);
      expect(listActive.status).toBe(200);
      expect(listActive.body.items.some((r: { id: string }) => r.id === id)).toBe(false);

      const listWithDeleted = await request(app)
        .get('/records')
        .query({ includeDeleted: 'true' })
        .set('Authorization', `Bearer ${token}`);
      expect(listWithDeleted.status).toBe(200);
      const soft = listWithDeleted.body.items.find((r: { id: string }) => r.id === id);
      expect(soft).toBeDefined();
      expect(soft.deletedAt).not.toBeNull();

      const delAgain = await request(app).delete(`/records/${id}`).set('Authorization', `Bearer ${token}`);
      expect(delAgain.status).toBe(404);
    });

    it('viewer cannot use includeDeleted query', async () => {
      const token = await login(testUsers.viewer.email, testUsers.viewer.password);
      const res = await request(app)
        .get('/records')
        .query({ includeDeleted: 'true' })
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
    });

    it('viewer cannot create records', async () => {
      const token = await login(testUsers.viewer.email, testUsers.viewer.password);
      const res = await request(app)
        .post('/records')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 10,
          type: 'INCOME',
          category: 'X',
          date: '2026-01-01'
        });
      expect(res.status).toBe(403);
    });
  });

  describe('Dashboard', () => {
    it('viewer can read summary', async () => {
      const token = await login(testUsers.viewer.email, testUsers.viewer.password);
      const res = await request(app).get('/dashboard/summary').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        totalIncome: 500,
        totalExpense: 50,
        netBalance: 450
      });
      expect(Array.isArray(res.body.categoryTotals)).toBe(true);
      expect(Array.isArray(res.body.recentActivity)).toBe(true);
    });

    it('excludes soft-deleted records from summary', async () => {
      const adminToken = await login(testUsers.admin.email, testUsers.admin.password);
      const list = await request(app).get('/records').query({ type: 'EXPENSE' }).set('Authorization', `Bearer ${adminToken}`);
      const expenseId = list.body.items[0].id as string;

      await request(app).delete(`/records/${expenseId}`).set('Authorization', `Bearer ${adminToken}`);

      const viewerToken = await login(testUsers.viewer.email, testUsers.viewer.password);
      const res = await request(app).get('/dashboard/summary').set('Authorization', `Bearer ${viewerToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        totalIncome: 500,
        totalExpense: 0,
        netBalance: 500
      });
    });

    it('viewer cannot read monthly trend', async () => {
      const token = await login(testUsers.viewer.email, testUsers.viewer.password);
      const res = await request(app).get('/dashboard/trend/monthly').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
    });

    it('analyst can read monthly trend', async () => {
      const token = await login(testUsers.analyst.email, testUsers.analyst.password);
      const res = await request(app).get('/dashboard/trend/monthly').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('Auth required', () => {
    it('returns 401 without token for protected route', async () => {
      const res = await request(app).get('/records');
      expect(res.status).toBe(401);
    });
  });
});
