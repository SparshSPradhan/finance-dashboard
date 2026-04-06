import { RecordType } from '@prisma/client';
import { z } from 'zod';

const dateString = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid date format');

export const createRecordSchema = z.object({
  body: z.object({
    amount: z.coerce.number().positive(),
    type: z.nativeEnum(RecordType),
    category: z.string().min(2),
    date: dateString,
    notes: z.string().max(500).optional()
  })
});

export const updateRecordSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  }),
  body: z.object({
    amount: z.coerce.number().positive().optional(),
    type: z.nativeEnum(RecordType).optional(),
    category: z.string().min(2).optional(),
    date: dateString.optional(),
    notes: z.string().max(500).optional()
  })
});

export const listRecordsSchema = z.object({
  query: z.object({
    type: z.nativeEnum(RecordType).optional(),
    category: z.string().optional(),
    startDate: dateString.optional(),
    endDate: dateString.optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    includeDeleted: z.enum(['true', 'false']).optional()
  })
});
