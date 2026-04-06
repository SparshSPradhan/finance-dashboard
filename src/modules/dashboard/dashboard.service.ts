import { RecordType } from '@prisma/client';
import { prisma } from '../../lib/prisma';

function normalizeNumber(value: unknown): number {
  return Number(value ?? 0);
}

/** Exclude soft-deleted rows from dashboard aggregates. */
const notDeleted = { deletedAt: null };

export async function getDashboardSummary() {
  const [incomeAgg, expenseAgg, categoryGroup, recentRecords] = await Promise.all([
    prisma.record.aggregate({
      where: { type: RecordType.INCOME, ...notDeleted },
      _sum: { amount: true }
    }),
    prisma.record.aggregate({
      where: { type: RecordType.EXPENSE, ...notDeleted },
      _sum: { amount: true }
    }),
    prisma.record.groupBy({
      by: ['category'],
      where: notDeleted,
      _sum: { amount: true },
      orderBy: {
        _sum: {
          amount: 'desc'
        }
      }
    }),
    prisma.record.findMany({
      where: notDeleted,
      orderBy: { date: 'desc' },
      take: 5,
      include: {
        createdBy: {
          select: { id: true, name: true, role: true }
        }
      }
    })
  ]);

  const totalIncome = normalizeNumber(incomeAgg._sum.amount);
  const totalExpense = normalizeNumber(expenseAgg._sum.amount);

  return {
    totalIncome,
    totalExpense,
    netBalance: totalIncome - totalExpense,
    categoryTotals: categoryGroup.map((item) => ({
      category: item.category,
      total: normalizeNumber(item._sum.amount)
    })),
    recentActivity: recentRecords
  };
}

export async function getMonthlyTrend(months = 6) {
  const records = await prisma.record.findMany({
    where: {
      ...notDeleted,
      date: {
        gte: new Date(new Date().setMonth(new Date().getMonth() - months + 1))
      }
    },
    select: {
      date: true,
      type: true,
      amount: true
    },
    orderBy: {
      date: 'asc'
    }
  });

  const bucket: Record<
    string,
    {
      month: string;
      income: number;
      expense: number;
    }
  > = {};

  for (const item of records) {
    const monthKey = `${item.date.getFullYear()}-${String(item.date.getMonth() + 1).padStart(2, '0')}`;

    if (!bucket[monthKey]) {
      bucket[monthKey] = {
        month: monthKey,
        income: 0,
        expense: 0
      };
    }

    const amount = Number(item.amount);

    if (item.type === RecordType.INCOME) {
      bucket[monthKey].income += amount;
    } else {
      bucket[monthKey].expense += amount;
    }
  }

  return Object.values(bucket).map((entry) => ({
    ...entry,
    net: entry.income - entry.expense
  }));
}
