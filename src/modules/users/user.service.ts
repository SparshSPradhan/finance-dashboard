import { Role, User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';
import { env } from '../../config/env';
import { prisma } from '../../lib/prisma';
import { AppError } from '../common/errors';

function toPublicUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  role?: Role;
  isActive?: boolean;
}) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });

  if (existing) {
    throw new AppError('Email already in use', StatusCodes.CONFLICT);
  }

  const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role ?? Role.VIEWER,
      isActive: input.isActive ?? true
    }
  });

  return toPublicUser(user);
}

export async function listUsers() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  return users.map(toPublicUser);
}

export async function updateUser(
  userId: string,
  input: { name?: string; role?: Role; isActive?: boolean }
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError('User not found', StatusCodes.NOT_FOUND);
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      name: input.name,
      role: input.role,
      isActive: input.isActive
    }
  });

  return toPublicUser(updated);
}
