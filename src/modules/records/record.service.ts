import { Prisma, RecordType, Role } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../lib/prisma';
import { AppError } from '../common/errors';

export async function createRecord(
  createdById: string,
  input: {
    amount: number;
    type: RecordType;
    category: string;
    date: string;
    notes?: string;
  }
) {
  return prisma.record.create({
    data: {
      amount: new Prisma.Decimal(input.amount),
      type: input.type,
      category: input.category,
      date: new Date(input.date),
      notes: input.notes,
      createdById
    }
  });
}

export async function listRecords(query: {
  type?: RecordType;
  category?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
  includeDeleted?: boolean;
  requesterRole: Role;
}) {
  if (query.includeDeleted && query.requesterRole !== Role.ADMIN) {
    throw new AppError('Only admins can list deleted records', StatusCodes.FORBIDDEN);
  }

  const where: Prisma.RecordWhereInput = {
    ...(query.includeDeleted ? {} : { deletedAt: null }),
    type: query.type,
    category: query.category
      ? {
          contains: query.category,
          mode: 'insensitive'
        }
      : undefined,
    date:
      query.startDate || query.endDate
        ? {
            gte: query.startDate ? new Date(query.startDate) : undefined,
            lte: query.endDate ? new Date(query.endDate) : undefined
          }
        : undefined
  };

  const [items, total] = await Promise.all([
    prisma.record.findMany({
      where,
      orderBy: { date: 'desc' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    }),
    prisma.record.count({ where })
  ]);

  return {
    items,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit)
    }
  };
}

export async function updateRecord(
  id: string,
  input: {
    amount?: number;
    type?: RecordType;
    category?: string;
    date?: string;
    notes?: string;
  }
) {
  const exists = await prisma.record.findFirst({
    where: { id, deletedAt: null }
  });

  if (!exists) {
    throw new AppError('Record not found', StatusCodes.NOT_FOUND);
  }

  return prisma.record.update({
    where: { id },
    data: {
      amount: input.amount ? new Prisma.Decimal(input.amount) : undefined,
      type: input.type,
      category: input.category,
      date: input.date ? new Date(input.date) : undefined,
      notes: input.notes
    }
  });
}

export async function deleteRecord(id: string) {
  const exists = await prisma.record.findFirst({
    where: { id, deletedAt: null }
  });

  if (!exists) {
    throw new AppError('Record not found', StatusCodes.NOT_FOUND);
  }

  await prisma.record.update({
    where: { id },
    data: { deletedAt: new Date() }
  });
}
