import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { login } from './auth.service';

export async function loginController(req: Request, res: Response): Promise<void> {
  const result = await login(req.body.email, req.body.password);
  res.status(StatusCodes.OK).json(result);
}
