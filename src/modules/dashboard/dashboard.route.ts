import { Router } from 'express';
import { authorize } from '../../middlewares/rbac.middleware';
import { asyncHandler } from '../common/asyncHandler';
import { getMonthlyTrendController, getSummaryController } from './dashboard.controller';

/**
 * @openapi
 * /dashboard/summary:
 *   get:
 *     tags: [Dashboard]
 *     summary: Dashboard summary (totals, categories, recent activity)
 *     description: VIEWER, ANALYST, or ADMIN
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Aggregated summary
 * /dashboard/trend/monthly:
 *   get:
 *     tags: [Dashboard]
 *     summary: Monthly income/expense/net trend
 *     description: ANALYST or ADMIN (not VIEWER)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of monthly buckets
 */
const dashboardRouter = Router();

dashboardRouter.get('/summary', authorize('VIEWER', 'ANALYST', 'ADMIN'), asyncHandler(getSummaryController));
dashboardRouter.get('/trend/monthly', authorize('ANALYST', 'ADMIN'), asyncHandler(getMonthlyTrendController));

export { dashboardRouter };
