import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { createUser, listUsers, updateUser } from './user.service';

export async function createUserController(req: Request, res: Response): Promise<void> {
  const user = await createUser(req.body);
  res.status(StatusCodes.CREATED).json(user);
}

export async function listUsersController(_req: Request, res: Response): Promise<void> {
  const users = await listUsers();
  res.status(StatusCodes.OK).json(users);
}

export async function updateUserController(req: Request, res: Response): Promise<void> {
  const user = await updateUser(String(req.params.id), req.body);
  res.status(StatusCodes.OK).json(user);
}
