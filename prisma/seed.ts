import bcrypt from 'bcryptjs';
import { PrismaClient, RecordType, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);

  const adminPasswordHash = await bcrypt.hash('Admin@123', saltRounds);
  const analystPasswordHash = await bcrypt.hash('Analyst@123', saltRounds);
  const viewerPasswordHash = await bcrypt.hash('Viewer@123', saltRounds);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@finance.local' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@finance.local',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN
    }
  });

  await prisma.user.upsert({
    where: { email: 'analyst@finance.local' },
    update: {},
    create: {
      name: 'Analyst User',
      email: 'analyst@finance.local',
      passwordHash: analystPasswordHash,
      role: Role.ANALYST
    }
  });

  await prisma.user.upsert({
    where: { email: 'viewer@finance.local' },
    update: {},
    create: {
      name: 'Viewer User',
      email: 'viewer@finance.local',
      passwordHash: viewerPasswordHash,
      role: Role.VIEWER
    }
  });

  const existing = await prisma.record.count();

  if (existing === 0) {
    await prisma.record.createMany({
      data: [
        {
          amount: 2500,
          type: RecordType.INCOME,
          category: 'Salary',
          date: new Date('2026-03-01'),
          notes: 'Monthly salary',
          createdById: admin.id
        },
        {
          amount: 200,
          type: RecordType.EXPENSE,
          category: 'Groceries',
          date: new Date('2026-03-03'),
          notes: 'Weekly groceries',
          createdById: admin.id
        },
        {
          amount: 120,
          type: RecordType.EXPENSE,
          category: 'Transport',
          date: new Date('2026-03-05'),
          notes: 'Fuel',
          createdById: admin.id
        }
      ]
    });
  }

  console.log('Seed completed.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
