import { StatusCodes } from 'http-status-codes';

export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = StatusCodes.BAD_REQUEST) {
    super(message);
    this.statusCode = statusCode;
  }
}
