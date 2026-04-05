import { Role } from '@prisma/client';
import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.nativeEnum(Role).optional(),
    isActive: z.boolean().optional()
  })
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    role: z.nativeEnum(Role).optional(),
    isActive: z.boolean().optional()
  })
});
