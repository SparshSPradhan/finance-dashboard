import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { createRecord, deleteRecord, listRecords, updateRecord } from './record.service';

export async function createRecordController(req: Request, res: Response): Promise<void> {
  const createdById = req.user!.userId;
  const record = await createRecord(createdById, req.body);
  res.status(StatusCodes.CREATED).json(record);
}

export async function listRecordsController(req: Request, res: Response): Promise<void> {
  const result = await listRecords({
    type: req.query.type as 'INCOME' | 'EXPENSE' | undefined,
    category: req.query.category as string | undefined,
    startDate: req.query.startDate as string | undefined,
    endDate: req.query.endDate as string | undefined,
    page: Number(req.query.page ?? 1),
    limit: Number(req.query.limit ?? 10)
  });
  res.status(StatusCodes.OK).json(result);
}

export async function updateRecordController(req: Request, res: Response): Promise<void> {
  const record = await updateRecord(String(req.params.id), req.body);
  res.status(StatusCodes.OK).json(record);
}

export async function deleteRecordController(req: Request, res: Response): Promise<void> {
  await deleteRecord(String(req.params.id));
  res.status(StatusCodes.NO_CONTENT).send();
}
