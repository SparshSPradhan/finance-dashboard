import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { getDashboardSummary, getMonthlyTrend } from './dashboard.service';

export async function getSummaryController(_req: Request, res: Response): Promise<void> {
  const summary = await getDashboardSummary();
  res.status(StatusCodes.OK).json(summary);
}

export async function getMonthlyTrendController(_req: Request, res: Response): Promise<void> {
  const trend = await getMonthlyTrend();
  res.status(StatusCodes.OK).json(trend);
}
