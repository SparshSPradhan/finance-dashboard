import { User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
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

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AppError('Invalid credentials', StatusCodes.UNAUTHORIZED);
  }

  if (!user.isActive) {
    throw new AppError('User is inactive', StatusCodes.FORBIDDEN);
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    throw new AppError('Invalid credentials', StatusCodes.UNAUTHORIZED);
  }

  const signOptions: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn']
  };

  const token = jwt.sign({ userId: user.id, role: user.role }, env.JWT_SECRET, signOptions);

  return {
    token,
    user: toPublicUser(user)
  };
}
