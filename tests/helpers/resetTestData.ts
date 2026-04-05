import { PrismaClient, RecordType, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const testUsers = {
  admin: {
    email: 'integration-admin@test.local',
    password: 'Test@1234',
    name: 'Integration Admin',
    role: Role.ADMIN
  },
  analyst: {
    email: 'integration-analyst@test.local',
    password: 'Test@1234',
    name: 'Integration Analyst',
    role: Role.ANALYST
  },
  viewer: {
    email: 'integration-viewer@test.local',
    password: 'Test@1234',
    name: 'Integration Viewer',
    role: Role.VIEWER
  },
  inactive: {
    email: 'integration-inactive@test.local',
    password: 'Test@1234',
    name: 'Inactive User',
    role: Role.VIEWER
  }
} as const;

let seededAdminId: string;

/**
 * Wipes public data and inserts known users + one sample record for integration tests.
 */
export async function resetDatabaseAndSeed(): Promise<{ adminId: string }> {
  await prisma.record.deleteMany();
  await prisma.user.deleteMany();

  const rounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
  const hash = (password: string) => bcrypt.hash(password, rounds);

  const admin = await prisma.user.create({
    data: {
      name: testUsers.admin.name,
      email: testUsers.admin.email,
      passwordHash: await hash(testUsers.admin.password),
      role: testUsers.admin.role,
      isActive: true
    }
  });
  seededAdminId = admin.id;

  await prisma.user.create({
    data: {
      name: testUsers.analyst.name,
      email: testUsers.analyst.email,
      passwordHash: await hash(testUsers.analyst.password),
      role: testUsers.analyst.role,
      isActive: true
    }
  });

  await prisma.user.create({
    data: {
      name: testUsers.viewer.name,
      email: testUsers.viewer.email,
      passwordHash: await hash(testUsers.viewer.password),
      role: testUsers.viewer.role,
      isActive: true
    }
  });

  await prisma.user.create({
    data: {
      name: testUsers.inactive.name,
      email: testUsers.inactive.email,
      passwordHash: await hash(testUsers.inactive.password),
      role: testUsers.inactive.role,
      isActive: false
    }
  });

  const now = new Date();
  await prisma.record.createMany({
    data: [
      {
        amount: 500,
        type: RecordType.INCOME,
        category: 'Salary',
        date: new Date(now.getFullYear(), now.getMonth() - 1, 10),
        notes: 'Seed income',
        createdById: admin.id
      },
      {
        amount: 50,
        type: RecordType.EXPENSE,
        category: 'Food',
        date: new Date(now.getFullYear(), now.getMonth() - 1, 11),
        notes: 'Seed expense',
        createdById: admin.id
      }
    ]
  });

  return { adminId: seededAdminId };
}

export async function disconnectTestPrisma(): Promise<void> {
  await prisma.$disconnect();
}
