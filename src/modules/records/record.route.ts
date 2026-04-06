import { Router } from 'express';
import { authorize } from '../../middlewares/rbac.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { asyncHandler } from '../common/asyncHandler';
import {
  createRecordController,
  deleteRecordController,
  listRecordsController,
  updateRecordController
} from './record.controller';
import { createRecordSchema, listRecordsSchema, updateRecordSchema } from './record.schema';

/**
 * @openapi
 * /records:
 *   get:
 *     tags: [Records]
 *     summary: List financial records (filters + pagination)
 *     description: VIEWER, ANALYST, or ADMIN
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         description: ISO date string
 *         schema:
 *           type: string
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: includeDeleted
 *         description: If `true`, ADMIN may list soft-deleted rows as well (default lists active only)
 *         schema:
 *           type: string
 *           enum: [true, false]
 *     responses:
 *       200:
 *         description: Paginated records
 *       403:
 *         description: includeDeleted not allowed for this role
 *   post:
 *     tags: [Records]
 *     summary: Create a record
 *     description: ADMIN only
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, type, category, date]
 *             properties:
 *               amount:
 *                 type: number
 *                 format: float
 *                 example: 100.5
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *               category:
 *                 type: string
 *               date:
 *                 type: string
 *                 description: ISO date
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Record created
 * /records/{id}:
 *   patch:
 *     tags: [Records]
 *     summary: Update a record
 *     description: ADMIN only
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *               category:
 *                 type: string
 *               date:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated record
 *       404:
 *         description: Not found
 *   delete:
 *     tags: [Records]
 *     summary: Soft-delete a record
 *     description: ADMIN only — sets `deletedAt` (row kept for audit). Excluded from list/dashboard unless `includeDeleted=true` (ADMIN list only).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Deleted
 *       404:
 *         description: Not found
 */
const recordRouter = Router();

recordRouter.get(
  '/',
  authorize('VIEWER', 'ANALYST', 'ADMIN'),
  validate(listRecordsSchema),
  asyncHandler(listRecordsController)
);

recordRouter.post(
  '/',
  authorize('ADMIN'),
  validate(createRecordSchema),
  asyncHandler(createRecordController)
);

recordRouter.patch(
  '/:id',
  authorize('ADMIN'),
  validate(updateRecordSchema),
  asyncHandler(updateRecordController)
);

recordRouter.delete('/:id', authorize('ADMIN'), asyncHandler(deleteRecordController));

export { recordRouter };
